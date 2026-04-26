from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
import os, hashlib, aiofiles
from datetime import datetime
from database import get_db
import models, schemas
from auth import get_current_user
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/resources", tags=["Resources"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 10)) * 1024 * 1024
ALLOWED_EXTENSIONS = set(os.getenv("ALLOWED_EXTENSIONS", "pdf,jpg,jpeg,png,doc,docx").split(","))

os.makedirs(UPLOAD_DIR, exist_ok=True)


def compute_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()


def get_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


@router.post("/upload", response_model=schemas.ResourceOut, status_code=201)
async def upload_resource(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    unit_id: int = Form(...),
    content_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate unit exists
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    # Validate content type
    try:
        ct = models.ContentType(content_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid content type")

    # Validate extension
    ext = get_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read and validate size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB")

    # Duplicate check
    file_hash = compute_hash(file_bytes)
    existing = db.query(models.Resource).filter(models.Resource.file_hash == file_hash).first()
    if existing:
        raise HTTPException(status_code=409, detail="This file already exists in the system")

    # Save file
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_name = f"{timestamp}_{current_user.id}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_bytes)

    resource = models.Resource(
        title=title,
        description=description,
        file_name=file.filename,
        file_path=file_path,
        file_size=len(file_bytes),
        file_type=ext,
        content_type=ct,
        unit_id=unit_id,
        uploader_id=current_user.id,
        file_hash=file_hash,
        status=models.UploadStatus.pending,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    # Notify uploader
    notif = models.Notification(
        user_id=current_user.id,
        title="Upload Received",
        message=f'Your file "{title}" has been submitted for admin approval.',
        notification_type="info"
    )
    db.add(notif)
    db.commit()

    return resource



@router.get("/search", response_model=List[schemas.ResourceOut])
def search_resources(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Full-text search across approved resources."""
    term = f"%{q.lower()}%"
    return db.query(models.Resource).options(joinedload(models.Resource.uploader)).filter(
        models.Resource.status == models.UploadStatus.approved,
        or_(models.Resource.title.ilike(term), models.Resource.description.ilike(term), models.Resource.file_name.ilike(term))
    ).order_by(models.Resource.download_count.desc()).limit(50).all()

@router.get("/unit/{unit_id}", response_model=List[schemas.ResourceOut])
def get_unit_resources(
    unit_id: int,
    content_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.Resource).options(joinedload(models.Resource.uploader)).filter(
        models.Resource.unit_id == unit_id,
        models.Resource.status == models.UploadStatus.approved
    )
    if content_type:
        q = q.filter(models.Resource.content_type == content_type)
    return q.order_by(models.Resource.created_at.desc()).all()


@router.get("/{resource_id}", response_model=schemas.ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    r = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return r


@router.get("/{resource_id}/download")
def download_resource(
    resource_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    # Public endpoint — no auth required for downloading approved files
    resource = db.query(models.Resource).filter(
        models.Resource.id == resource_id,
        models.Resource.status == models.UploadStatus.approved
    ).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found or not approved")

    if not os.path.exists(resource.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    # Log access
    log = models.AccessLog(
        user_id=None,  # anonymous download tracking
        resource_id=resource_id,
        action=models.AccessAction.download,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent", "")
    )
    db.add(log)
    resource.download_count += 1
    db.commit()

    return FileResponse(
        path=resource.file_path,
        filename=resource.file_name,
        media_type="application/octet-stream"
    )


@router.post("/{resource_id}/view")
def log_view(
    resource_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    log = models.AccessLog(
        resource_id=resource_id,
        action=models.AccessAction.view,
        ip_address=request.client.host,
    )
    db.add(log)
    resource.view_count += 1
    db.commit()
    return {"message": "View logged"}


@router.get("/my/uploads", response_model=List[schemas.ResourceOut])
def my_uploads(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Resource).filter(
        models.Resource.uploader_id == current_user.id
    ).order_by(models.Resource.created_at.desc()).all()
