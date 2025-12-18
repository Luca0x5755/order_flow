from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env vars
load_dotenv()

app = FastAPI(title="OrderFlow API", version="0.1.0")

# CORS Configuration
origins = [
    "http://localhost:3000", # Lovable/React default
    "http://localhost:5173", # Vite default
    "*" # Allow all for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to OrderFlow API", "status": "running"}

from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from backend.auth import router as auth_router

# ... existing code ...

# Include routers
app.include_router(auth_router.router)

# Mount static files
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Templates
templates = Jinja2Templates(directory="frontend/templates")

# Simple page routes for testing (can be moved to a frontend router later)
from fastapi import Request
from fastapi.responses import HTMLResponse

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

