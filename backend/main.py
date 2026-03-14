from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from database import init_db

# Import routers
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router
from app.routes.disputes import router as disputes_router
from app.routes.tracking import router as tracking_router
from app.routes.ai import router as ai_router

app = FastAPI(
    title="Soko Pay API",
    description="Escrow platform for social commerce in Kenya",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - use FRONTEND_URL env var in production
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads/products")
uploads_dir.mkdir(parents=True, exist_ok=True)

# Mount static files for serving uploaded photos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("🚀 Soko Pay API started successfully!")
    print("📚 API Documentation: http://localhost:8000/docs")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Check API health status"""
    return {
        "status": "healthy",
        "service": "soko-pay-api",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Soko Pay API",
        "docs": "/docs",
        "health": "/health"
    }

# Include routers
app.include_router(orders_router, prefix="/api", tags=["orders"])
app.include_router(payments_router, prefix="/api", tags=["payments"])
app.include_router(disputes_router, prefix="/api", tags=["disputes"])
app.include_router(tracking_router, prefix="/api", tags=["tracking"])
app.include_router(ai_router, prefix="/api", tags=["ai"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
