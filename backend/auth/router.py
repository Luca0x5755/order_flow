from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.database import get_db
from backend.models import User
from backend.auth import schemas, utils
from backend.auth.utils import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    hashed_password = utils.get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        company_name=user.company_name,
        role="customer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send welcome email (mock)
    # print(f"Sending welcome email to {new_user.email}")
    
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_credentials.username).first()

    # Check if locked
    if user and user.locked_until:
        if datetime.utcnow() < user.locked_until:
            wait_time = (user.locked_until - datetime.utcnow()).seconds // 60
            raise HTTPException(
                status_code=400, 
                detail=f"Account locked. Try again in {wait_time} minutes."
            )
        else:
            # Unlock
            user.locked_until = None
            user.failed_login_attempts = 0
            db.commit()

    if not user:
        # Don't reveal user existence
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if not utils.verify_password(user_credentials.password, user.password_hash):
        # Handle failed attempt
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 3:
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            db.commit()
            raise HTTPException(status_code=400, detail="Account locked for 30 minutes due to too many failed attempts.")
        
        db.commit()
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    # Success
    user.failed_login_attempts = 0
    user.last_login = datetime.utcnow()
    db.commit()

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    
    # Set cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False # Set True in production
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
