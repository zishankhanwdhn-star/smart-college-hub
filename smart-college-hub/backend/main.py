from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine
import models
from routers import auth, academic, resources, admin, notifications
from dotenv import load_dotenv

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=engine)

# Create upload dir
os.makedirs(os.getenv("UPLOAD_DIR", "uploads"), exist_ok=True)

app = FastAPI(
    title="Smart College Resource Hub API",
    description="Academic resource management system for GPC Waidhan (RGPV)",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(academic.router)
app.include_router(resources.router)
app.include_router(admin.router)
app.include_router(notifications.router)

# Serve uploaded files
uploads_dir = os.getenv("UPLOAD_DIR", "uploads")
if os.path.exists(uploads_dir):
    app.mount("/files", StaticFiles(directory=uploads_dir), name="files")


@app.get("/")
def root():
    return {
        "message": "Smart College Resource Hub API",
        "college": os.getenv("COLLEGE_NAME", "Government Polytechnic College Waidhan"),
        "university": os.getenv("UNIVERSITY_NAME", "RGPV University"),
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
