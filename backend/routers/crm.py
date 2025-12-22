from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import uuid
from backend.database import get_db
from backend.models import Customer, Interaction
from backend.auth import schemas, dependencies
from backend import crm_engine

router = APIRouter(prefix="/crm", tags=["crm"])

# ==================== 客戶管理 API ====================

@router.post("/customers", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_data: schemas.CustomerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_staff)
):
    """新增客戶（需 staff 權限）"""
    
    # 檢查 email 是否已存在
    if customer_data.email:
        existing = db.query(Customer).filter(Customer.email == customer_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    new_customer = Customer(
        id=str(uuid.uuid4()),
        company_name=customer_data.company_name,
        contact_person=customer_data.contact_person,
        phone=customer_data.phone,
        email=customer_data.email,
        address=customer_data.address,
        industry=customer_data.industry,
        source=customer_data.source,
        grade="C"  # 預設等級
    )
    
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@router.get("/customers", response_model=List[schemas.CustomerResponse])
def list_customers(
    grade: Optional[str] = None,
    industry: Optional[str] = None,
    sort_by: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_staff)
):
    """
    列表查詢客戶
    - 依 grade 篩選
    - 依 industry 篩選
    - 支援排序：sort_by=last_order_date
    """
    query = db.query(Customer)
    
    # 篩選條件
    if grade:
        query = query.filter(Customer.grade == grade)
    if industry:
        query = query.filter(Customer.industry == industry)
    
    # 排序
    if sort_by == "last_order_date":
        query = query.order_by(desc(Customer.last_order_date))
    else:
        query = query.order_by(desc(Customer.created_at))
    
    customers = query.offset(skip).limit(limit).all()
    return customers

@router.get("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_staff)
):
    """查詢單一客戶詳情"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def update_customer(
    customer_id: str,
    customer_data: schemas.CustomerUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_staff)
):
    """修改客戶資料"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # 更新欄位
    update_data = customer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    customer.updated_at = datetime.now()
    db.commit()
    db.refresh(customer)
    return customer

@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_admin)
):
    """刪除客戶（需 admin 權限）"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(customer)
    db.commit()
    return None

# ==================== 互動紀錄 API ====================

@router.post("/customers/{customer_id}/interactions", response_model=schemas.InteractionResponse, status_code=status.HTTP_201_CREATED)
def create_interaction(
    customer_id: str,
    interaction_data: schemas.InteractionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_staff)
):
    """新增互動紀錄"""
    # 確認客戶存在
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    new_interaction = Interaction(
        id=str(uuid.uuid4()),
        customer_id=customer_id,
        interaction_type=interaction_data.interaction_type,
        content=interaction_data.content,
        next_action=interaction_data.next_action,
        recorded_by=current_user.username
    )
    
    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)
    return new_interaction

@router.get("/customers/{customer_id}/interactions", response_model=List[schemas.InteractionResponse])
def list_interactions(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_staff)
):
    """查詢互動歷史（時間倒序）"""
    # 確認客戶存在
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    interactions = db.query(Interaction).filter(
        Interaction.customer_id == customer_id
    ).order_by(desc(Interaction.created_at)).all()
    
    return interactions

@router.put("/interactions/{interaction_id}/complete", response_model=schemas.InteractionResponse)
def complete_action(
    interaction_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_staff)
):
    """標記「下一步行動」為已完成"""
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    interaction.action_completed = True
    db.commit()
    db.refresh(interaction)
    return interaction

# ==================== 待辦提醒 API ====================

@router.get("/reminders", response_model=List[schemas.ReminderResponse])
def get_reminders(
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_staff)
):
    """取得需提醒事項列表"""
    reminders = crm_engine.get_reminders(db)
    return reminders

# ==================== 規則引擎 API ====================

@router.post("/recalculate-grades", response_model=schemas.GradeRecalculateResponse)
def recalculate_grades(
    db: Session = Depends(get_db),
    current_user = Depends(dependencies.require_admin)
):
    """手動觸發客戶等級重新計算（需 admin 權限）"""
    updated_count = crm_engine.recalculate_all_grades(db)
    
    return {
        "updated_count": updated_count,
        "message": f"成功重新計算 {updated_count} 位客戶的等級"
    }
