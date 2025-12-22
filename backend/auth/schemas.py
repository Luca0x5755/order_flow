from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    company_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    company_name: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str

class UserStatusUpdate(BaseModel):
    is_active: bool

class ChangePassword(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: str
    notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    product_id: str
    quantity: int
    unit_price: float
    subtotal: float
    product: ProductResponse  # Nested product info

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    order_number: str
    order_date: datetime
    status: str
    total_amount: float
    delivery_address: str
    notes: Optional[str] = None
    items: List[OrderItemResponse]
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

class StatsResponse(BaseModel):
    total_orders: int
    total_amount: float
    this_month_orders: int
    this_month_amount: float
    # Admin fields
    total_users: Optional[int] = None
    total_products: Optional[int] = None

# CRM Schemas

class CustomerBase(BaseModel):
    company_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    source: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    source: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: str
    grade: str
    total_orders: int
    total_amount: float
    last_order_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InteractionBase(BaseModel):
    interaction_type: str
    content: Optional[str] = None
    next_action: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class InteractionResponse(InteractionBase):
    id: str
    customer_id: str
    action_completed: bool
    recorded_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReminderResponse(BaseModel):
    customer_id: str
    company_name: str
    reminder_type: str  # "no_order" or "pending_action"
    reason: str
    days_since_order: Optional[int] = None
    last_order_date: Optional[datetime] = None

class GradeRecalculateResponse(BaseModel):
    updated_count: int
    message: str
