"""
CRM Rule Engine
讀取配置檔並執行客戶等級計算和提醒邏輯
"""
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.models import Customer, Interaction

CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "crm_rules.json")

def load_rules() -> Dict[str, Any]:
    """讀取 CRM 規則配置檔"""
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def evaluate_condition(value: Any, operator: str, threshold: Any) -> bool:
    """評估單一條件"""
    if operator == ">":
        return value > threshold
    elif operator == ">=":
        return value >= threshold
    elif operator == "<":
        return value < threshold
    elif operator == "<=":
        return value <= threshold
    elif operator == "==":
        return value == threshold
    return False

def calculate_customer_grade(customer: Customer, rules: Dict[str, Any] = None) -> str:
    """
    根據規則計算單一客戶等級
    
    Args:
        customer: Customer 物件
        rules: 規則配置（如未提供則自動讀取）
    
    Returns:
        計算出的等級 (A/B/C)
    """
    if rules is None:
        rules = load_rules()
    
    grade_rules = rules.get("grade_rules", [])
    
    # 按順序評估規則（A -> B -> C）
    for rule in grade_rules:
        grade = rule.get("grade")
        conditions = rule.get("conditions", [])
        match_type = rule.get("match_type", "any")
        
        # 預設等級（無條件）
        if match_type == "default":
            return grade
        
        # 評估所有條件
        results = []
        for condition in conditions:
            field = condition.get("field")
            operator = condition.get("operator")
            threshold = condition.get("value")
            
            # 取得客戶屬性值
            customer_value = getattr(customer, field, 0)
            
            # 評估條件
            results.append(evaluate_condition(customer_value, operator, threshold))
        
        # 依據 match_type 決定是否符合
        if match_type == "any" and any(results):
            return grade
        elif match_type == "all" and all(results):
            return grade
    
    # 若無規則符合，預設為 C
    return "C"

def recalculate_all_grades(db: Session) -> int:
    """
    重新計算所有客戶的等級
    
    Args:
        db: 資料庫 Session
    
    Returns:
        更新的客戶數量
    """
    from backend.models import User, Order  # Avoid circular import if any
    
    rules = load_rules()
    updated_count = 0
    
    # 0. Sync: Auto-create customers from Users who have completed orders
    users_with_orders = db.query(User).join(Order).filter(Order.status == 'completed').distinct().all()
    for user in users_with_orders:
        if user.email:
            exists = db.query(Customer).filter(Customer.email == user.email).first()
            if not exists:
                new_customer = Customer(
                    company_name=user.company_name,
                    contact_person=user.username,
                    email=user.email,
                    source="System Auto-Import",
                    grade="C"
                )
                db.add(new_customer)
                # Count as "updated" since we added a new customer
                updated_count += 1
    
    db.commit() # Commit to make them available for query
    
    # 1. Process all customers (including newly created ones)
    customers = db.query(Customer).all()
    
    for customer in customers:
        # 1. Update stats from Orders if email matches a User
        if customer.email:
            user = db.query(User).filter(User.email == customer.email).first()
            if user:
                # Get completed orders
                orders = db.query(Order).filter(
                    Order.user_id == user.id,
                    Order.status == 'completed'
                ).all()
                
                if orders:
                    total_amount = sum((o.total_amount or 0) for o in orders)
                    total_count = len(orders)
                    last_order_date = max(o.order_date for o in orders)
                    
                    customer.total_amount = total_amount
                    customer.total_orders = total_count
                    customer.last_order_date = last_order_date
        
        # 2. Calculate Grade
        new_grade = calculate_customer_grade(customer, rules)
        
        # Check if changed
        if customer.grade != new_grade:
            customer.grade = new_grade
            updated_count += 1
            
    db.commit()
    return updated_count

def get_reminders(db: Session) -> List[Dict[str, Any]]:
    """
    取得需提醒的客戶列表
    
    Args:
        db: 資料庫 Session
    
    Returns:
        提醒列表
    """
    rules = load_rules()
    no_order_days = rules.get("reminder_rules", {}).get("no_order_days", 90)
    reminders = []
    
    # 計算截止日期
    cutoff_date = datetime.now() - timedelta(days=no_order_days)
    
    # 1. 找出久未下單的客戶
    customers = db.query(Customer).filter(
        Customer.last_order_date.isnot(None),
        Customer.last_order_date < cutoff_date
    ).all()
    
    for customer in customers:
        days_since = (datetime.now() - customer.last_order_date.replace(tzinfo=None)).days
        reminders.append({
            "customer_id": customer.id,
            "company_name": customer.company_name,
            "reminder_type": "no_order",
            "reason": f"已經 {days_since} 天未下單",
            "days_since_order": days_since,
            "last_order_date": customer.last_order_date
        })
    
    # 2. 找出有未完成「下一步行動」的客戶
    pending_interactions = db.query(Interaction).filter(
        Interaction.action_completed == False,
        Interaction.next_action.isnot(None),
        Interaction.next_action != ""
    ).all()
    
    # 按客戶分組
    customer_ids = set([i.customer_id for i in pending_interactions])
    for customer_id in customer_ids:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if customer:
            pending_actions = [i for i in pending_interactions if i.customer_id == customer_id]
            reminders.append({
                "customer_id": customer.id,
                "company_name": customer.company_name,
                "reminder_type": "pending_action",
                "reason": f"有 {len(pending_actions)} 個待處理的行動項目",
                "days_since_order": None,
                "last_order_date": None
            })
    
    return reminders
