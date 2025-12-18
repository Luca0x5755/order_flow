from fastapi import Depends, HTTPException, status, Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.auth.utils import SECRET_KEY, ALGORITHM

def get_token(request: Request) -> str | None:
    # 1. Try cookie
    token = request.cookies.get("access_token")
    if token:
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        return token
    
    # 2. Try Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
        
    return None

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = get_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(allowed_roles: list[str]):
    """
    Factory to create a dependency that checks if the user has one of the allowed roles.
    Always allows 'super_admin'.
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role == "super_admin":
            return current_user
            
        if current_user.role in allowed_roles:
            return current_user
            
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insufficient permissions"
        )
    return role_checker

# Role Dependencies
# 1. Super Admin: full access
require_super_admin = require_role([]) # Only super_admin passes the first check in `role_checker`

# 2. Admin: Super Admin + Admin
require_admin = require_role(["admin"])

# 3. Staff: Super Admin + Admin + Account Manager (Used for CRM etc)
require_staff = require_role(["admin", "account_manager"])

# 4. Customer: Everyone active (basically just get_current_active_user)
