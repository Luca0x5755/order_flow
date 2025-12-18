from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import User
from backend.auth import schemas, utils, dependencies

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: User = Depends(dependencies.get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.get_current_active_user)
):
    if user_update.email and user_update.email != current_user.email:
        # Check uniqueness
        if db.query(User).filter(User.email == user_update.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
    
    if user_update.company_name:
        current_user.company_name = user_update.company_name
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    password_data: schemas.ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.get_current_active_user)
):
    if not utils.verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.password_hash = utils.get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

# Super Admin Routes

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.require_super_admin)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.put("/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(
    user_id: str,
    role_data: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.require_super_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: validate role string
    valid_roles = ["super_admin", "admin", "account_manager", "customer"]
    if role_data.role not in valid_roles:
         raise HTTPException(status_code=400, detail="Invalid role")

    user.role = role_data.role
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}/status", response_model=schemas.UserResponse)
def update_user_status(
    user_id: str,
    status_data: schemas.UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(dependencies.require_super_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = status_data.is_active
    # If deactivating, maybe clear sessions? (Not implemented here, handled by token checks usually)
    
    db.commit()
    db.refresh(user)
    return user
