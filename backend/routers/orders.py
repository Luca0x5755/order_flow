from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import uuid
from backend.database import get_db
from backend.models import Order, OrderItem, Product, User
from backend.auth import schemas, dependencies

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.get_current_active_user)
):
    # 1. Validate items and Calculate Total
    total_amount = 0
    db_items = []
    
    # Check for empty order
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        
        if not product.is_active:
             raise HTTPException(status_code=400, detail=f"Product {product.name} is not available")
             
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        # Deduct stock
        product.stock -= item.quantity
        
        # Create Order Item
        subtotal = product.price * item.quantity
        total_amount += subtotal
        
        db_item = OrderItem(
            id=str(uuid.uuid4()),
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
            subtotal=subtotal
        )
        db_items.append(db_item)
    
    # 2. Create Order
    order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4].upper()}"
    new_order = Order(
        order_number=order_number,
        user_id=current_user.id,
        status="pending",
        total_amount=total_amount,
        delivery_address=order_data.delivery_address,
        notes=order_data.notes
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # 3. Associate items
    for item in db_items:
        item.order_id = new_order.id
        db.add(item)
        
    db.commit()
    # Eager load the product data for the response
    db.refresh(new_order)
    order_with_products = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == new_order.id).first()
    return order_with_products

@router.get("/my-orders", response_model=List[schemas.OrderResponse])
def read_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.get_current_active_user)
):
    orders = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.user_id == current_user.id).order_by(desc(Order.order_date)).all()
    return orders

@router.post("/{order_id}/cancel", response_model=schemas.OrderResponse)
def cancel_my_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.get_current_active_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check permission (own order)
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this order")
        
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Cannot cancel order that is not pending")
        
    order.status = "cancelled"
    
    # Restore stock? (Optional, simplifies logic if we don't, but better if we do)
    # Ideally should restore stock here.
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
            
    db.commit()
    # Eager load the product data for the response
    order_with_products = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order.id).first()
    return order_with_products

# Staff Routes (Admin + Account Manager)

@router.get("/", response_model=List[schemas.OrderResponse])
def read_all_orders(
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.require_staff)
):
    query = db.query(Order).order_by(desc(Order.order_date))
    
    if status:
        query = query.filter(Order.status == status)
        
    if user_id:
        query = query.filter(Order.user_id == user_id)
        
    orders = query.options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.user)
    ).offset(skip).limit(limit).all()
    return orders

# Admin Routes

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: str,
    status_data: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.require_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    valid_statuses = ["pending", "processing", "shipped", "completed", "cancelled"]
    if status_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    # If cancelling by admin, restore stock?
    if status_data.status == "cancelled" and order.status != "cancelled":
         for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock += item.quantity

    order.status = status_data.status
    db.commit()
    # Eager load the product data for the response
    order_with_products = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order.id).first()
    return order_with_products
