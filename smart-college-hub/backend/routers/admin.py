from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, date
from database import get_db
import models, schemas
from auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ─── Dashboard Stats ──────────────────────────────────────────────────────────
@router.get("/stats", response_model=schemas.DashboardStats)
def dashboard_stats(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    today = datetime.utcnow().date()
    return schemas.DashboardStats(
        total_users=db.query(func.count(models.User.id)).filter(models.User.role == "student").scalar(),
        total_resources=db.query(func.count(models.Resource.id)).filter(models.Resource.status == "approved").scalar(),
        pending_approvals=db.query(func.count(models.Resource.id)).filter(models.Resource.status == "pending").scalar(),
        total_downloads=db.query(func.sum(models.Resource.download_count)).scalar() or 0,
        total_views=db.query(func.sum(models.Resource.view_count)).scalar() or 0,
        resources_today=db.query(func.count(models.Resource.id)).filter(
            func.date(models.Resource.created_at) == today
        ).scalar(),
        new_users_today=db.query(func.count(models.User.id)).filter(
            func.date(models.User.created_at) == today
        ).scalar(),
    )


# ─── Approval System ──────────────────────────────────────────────────────────
@router.get("/pending", response_model=List[schemas.ResourceOut])
def get_pending(
    skip: int = 0, limit: int = 50,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.Resource).options(
        joinedload(models.Resource.uploader)
    ).filter(
        models.Resource.status == models.UploadStatus.pending
    ).order_by(models.Resource.created_at.asc()).offset(skip).limit(limit).all()


@router.put("/resources/{resource_id}/approve", response_model=schemas.ResourceOut)
def approve_or_reject(
    resource_id: int,
    action: schemas.ResourceApprove,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    resource.status = action.status
    resource.approved_by = admin.id
    resource.rejection_reason = action.rejection_reason

    if action.status == models.UploadStatus.approved:
        resource.approved_at = datetime.utcnow()
        notif_title = "Upload Approved! ✅"
        notif_msg = f'Your file "{resource.title}" has been approved and is now live.'
        notif_type = "success"
    else:
        notif_title = "Upload Rejected ❌"
        notif_msg = f'Your file "{resource.title}" was rejected. Reason: {action.rejection_reason or "Not specified"}'
        notif_type = "error"

    db.add(models.Notification(
        user_id=resource.uploader_id,
        title=notif_title,
        message=notif_msg,
        notification_type=notif_type
    ))
    db.commit()
    db.refresh(resource)
    return resource


# ─── User Management ──────────────────────────────────────────────────────────
@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    skip: int = 0, limit: int = 100, role: Optional[str] = None,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    q = db.query(models.User)
    if role:
        q = q.filter(models.User.role == role)
    return q.order_by(models.User.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    update: schemas.UserUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for k, v in update.model_dump(exclude_none=True).items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return user


# ─── Analytics ────────────────────────────────────────────────────────────────
@router.get("/analytics/top-subjects", response_model=List[schemas.SubjectStats])
def top_subjects(
    limit: int = 10,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    subjects = db.query(models.Subject).all()
    stats = []
    for subj in subjects:
        sem = db.query(models.Semester).filter(models.Semester.id == subj.semester_id).first()
        branch = db.query(models.Branch).filter(models.Branch.id == sem.branch_id).first()
        unit_ids = [u.id for u in db.query(models.Unit).filter(models.Unit.subject_id == subj.id).all()]
        if not unit_ids:
            continue
        totals = db.query(
            func.sum(models.Resource.view_count),
            func.sum(models.Resource.download_count),
            func.count(models.Resource.id)
        ).filter(
            models.Resource.unit_id.in_(unit_ids),
            models.Resource.status == "approved"
        ).first()
        stats.append(schemas.SubjectStats(
            subject_id=subj.id,
            subject_name=subj.name,
            branch=branch.code,
            semester=sem.number,
            total_views=totals[0] or 0,
            total_downloads=totals[1] or 0,
            resource_count=totals[2] or 0,
        ))
    stats.sort(key=lambda x: x.total_views + x.total_downloads, reverse=True)
    return stats[:limit]


@router.get("/analytics/top-contributors", response_model=List[schemas.UserStats])
def top_contributors(
    limit: int = 10,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).filter(models.User.role == "student").all()
    stats = []
    for user in users:
        uploads = db.query(models.Resource).filter(models.Resource.uploader_id == user.id).all()
        approved = [u for u in uploads if u.status == "approved"]
        total_dl = sum(u.download_count for u in approved)
        stats.append(schemas.UserStats(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            enrollment_no=user.enrollment_no,
            upload_count=len(uploads),
            approved_count=len(approved),
            total_downloads_on_uploads=total_dl,
        ))
    stats.sort(key=lambda x: x.approved_count, reverse=True)
    return stats[:limit]


@router.get("/analytics/top-files", response_model=List[schemas.FileStats])
def top_files(
    limit: int = 10,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    resources = db.query(models.Resource).filter(
        models.Resource.status == "approved"
    ).order_by(desc(models.Resource.download_count)).limit(limit).all()

    result = []
    for r in resources:
        unit = db.query(models.Unit).filter(models.Unit.id == r.unit_id).first()
        subj = db.query(models.Subject).filter(models.Subject.id == unit.subject_id).first() if unit else None
        result.append(schemas.FileStats(
            resource_id=r.id,
            title=r.title,
            file_name=r.file_name,
            content_type=r.content_type,
            download_count=r.download_count,
            view_count=r.view_count,
            subject_name=subj.name if subj else "Unknown",
        ))
    return result


@router.get("/analytics/access-logs")
def access_logs(
    skip: int = 0, limit: int = 100,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(models.AccessLog).options(
        joinedload(models.AccessLog.user),
        joinedload(models.AccessLog.resource)
    ).order_by(desc(models.AccessLog.accessed_at)).offset(skip).limit(limit).all()
    return logs


@router.get("/all-resources", response_model=List[schemas.ResourceOut])
def all_resources(
    status: Optional[str] = None,
    skip: int = 0, limit: int = 100,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    q = db.query(models.Resource).options(joinedload(models.Resource.uploader))
    if status:
        q = q.filter(models.Resource.status == status)
    return q.order_by(desc(models.Resource.created_at)).offset(skip).limit(limit).all()


@router.delete("/resources/{resource_id}")
def delete_resource(
    resource_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    import os
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if os.path.exists(resource.file_path):
        os.remove(resource.file_path)
    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted"}


# ─── Admin: Academic Management ──────────────────────────────────────────────
from pydantic import BaseModel as _Base
from typing import Optional as _Opt

class SubjectCreate(_Base):
    name: str
    code: _Opt[str] = None
    semester_id: int
    description: _Opt[str] = None

class UnitCreate(_Base):
    number: int
    title: str
    description: _Opt[str] = None
    subject_id: int

@router.post("/academic/subjects", status_code=201)
def create_subject(data: SubjectCreate, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    if not db.query(models.Semester).filter(models.Semester.id == data.semester_id).first():
        raise HTTPException(status_code=404, detail="Semester not found")
    existing = db.query(models.Subject).filter(models.Subject.name == data.name, models.Subject.semester_id == data.semester_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject already exists in this semester")
    subj = models.Subject(**data.model_dump())
    db.add(subj)
    db.commit()
    db.refresh(subj)
    return {"id": subj.id, "name": subj.name, "code": subj.code}

@router.post("/academic/units", status_code=201)
def create_unit(data: UnitCreate, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    if not db.query(models.Subject).filter(models.Subject.id == data.subject_id).first():
        raise HTTPException(status_code=404, detail="Subject not found")
    unit = models.Unit(**data.model_dump())
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return {"id": unit.id, "number": unit.number, "title": unit.title}

@router.delete("/academic/subjects/{subject_id}")
def delete_subject(subject_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    subj = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subj)
    db.commit()
    return {"message": "Deleted"}

@router.delete("/academic/units/{unit_id}")
def delete_unit(unit_id: int, admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    db.delete(unit)
    db.commit()
    return {"message": "Deleted"}
