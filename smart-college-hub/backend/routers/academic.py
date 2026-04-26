from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/academic", tags=["Academic Structure"])


@router.get("/branches", response_model=List[schemas.BranchOut])
def get_branches(db: Session = Depends(get_db)):
    return db.query(models.Branch).filter(models.Branch.is_active == True).all()


@router.get("/branches/{branch_id}/semesters", response_model=List[schemas.SemesterOut])
def get_semesters(branch_id: int, db: Session = Depends(get_db)):
    return db.query(models.Semester).filter(models.Semester.branch_id == branch_id).order_by(models.Semester.number).all()


@router.get("/semesters/{semester_id}/subjects", response_model=List[schemas.SubjectOut])
def get_subjects(semester_id: int, db: Session = Depends(get_db)):
    return db.query(models.Subject).filter(
        models.Subject.semester_id == semester_id,
        models.Subject.is_active == True
    ).all()


@router.get("/subjects/{subject_id}", response_model=schemas.SubjectOut)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    subj = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subj:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subj


@router.get("/subjects/{subject_id}/units", response_model=List[schemas.UnitWithResources])
def get_units(subject_id: int, db: Session = Depends(get_db)):
    units = db.query(models.Unit).filter(models.Unit.subject_id == subject_id).order_by(models.Unit.number).all()
    result = []
    for unit in units:
        count = db.query(func.count(models.Resource.id)).filter(
            models.Resource.unit_id == unit.id,
            models.Resource.status == models.UploadStatus.approved
        ).scalar()
        result.append(schemas.UnitWithResources(
            id=unit.id, number=unit.number, title=unit.title,
            description=unit.description, subject_id=unit.subject_id,
            resource_count=count
        ))
    return result


@router.get("/units/{unit_id}", response_model=schemas.UnitOut)
def get_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit
