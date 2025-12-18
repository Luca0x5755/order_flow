from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from backend.database import get_db
from backend.models import Order, User, Product
from backend.auth import schemas, dependencies

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=schemas.StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.get_current_active_user)
):
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year
    
    # Base query for orders
    query = db.query(Order)
    
    # Filter for customer
    if current_user.role == "customer":
        query = query.filter(Order.user_id == current_user.id)
    
    # Total Stats
    total_orders = query.count()
    total_amount = db.query(func.sum(Order.total_amount)).select_from(Order)
    
    if current_user.role == "customer":
         total_amount = total_amount.filter(Order.user_id == current_user.id)
         
    total_amount_val = total_amount.scalar() or 0.0
    
    # Monthly Stats
    month_query = query.filter(
        extract('month', Order.order_date) == current_month,
        extract('year', Order.order_date) == current_year
    )
    this_month_orders = month_query.count()
    
    month_amount_query = db.query(func.sum(Order.total_amount)).select_from(Order).filter(
        extract('month', Order.order_date) == current_month,
        extract('year', Order.order_date) == current_year
    )
    
    if current_user.role == "customer":
        month_amount_query = month_amount_query.filter(Order.user_id == current_user.id)
        
    this_month_amount = month_amount_query.scalar() or 0.0
    
    # Admin Extras
    total_users = None
    total_products = None
    
    if current_user.role in ["super_admin", "admin"]:
        total_users = db.query(User).count()
        total_products = db.query(Product).count()
        
    return {
        "total_orders": total_orders,
        "total_amount": total_amount_val,
        "this_month_orders": this_month_orders,
        "this_month_amount": this_month_amount,
        "total_users": total_users,
        "total_products": total_products
    }
