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

# TODO: Include routers from submodules
# from backend.auth import router as auth_router
# app.include_router(auth_router)
