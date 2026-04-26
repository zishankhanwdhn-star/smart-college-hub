from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


class UploadStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class AccessAction(str, enum.Enum):
    view = "view"
    download = "download"


class ContentType(str, enum.Enum):
    notes = "notes"
    pyq = "pyq"
    important_questions = "important_questions"
    syllabus = "syllabus"


# ─── User ────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    enrollment_no = Column(String(50), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)
    branch = Column(String(100), nullable=True)
    semester = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    uploads = relationship("Resource", foreign_keys="Resource.uploader_id", back_populates="uploader")
    access_logs = relationship("AccessLog", back_populates="user")


# ─── Academic Structure ───────────────────────────────────────────────────────
class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    semesters = relationship("Semester", back_populates="branch")


class Semester(Base):
    __tablename__ = "semesters"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)

    branch = relationship("Branch", back_populates="semesters")
    subjects = relationship("Subject", back_populates="semester")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(30), nullable=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    semester = relationship("Semester", back_populates="subjects")
    units = relationship("Unit", back_populates="subject")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)

    subject = relationship("Subject", back_populates="units")
    resources = relationship("Resource", back_populates="unit")


# ─── Resources ────────────────────────────────────────────────────────────────
class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, default=0)          # bytes
    file_type = Column(String(50), nullable=True)      # pdf, jpg, etc.
    content_type = Column(Enum(ContentType), nullable=False)
    status = Column(Enum(UploadStatus), default=UploadStatus.pending)
    rejection_reason = Column(Text, nullable=True)

    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    download_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)

    unit = relationship("Unit", back_populates="resources")
    uploader = relationship("User", foreign_keys=[uploader_id], back_populates="uploads")
    approver = relationship("User", foreign_keys=[approved_by])
    access_logs = relationship("AccessLog", back_populates="resource")

    # Duplicate detection
    file_hash = Column(String(64), nullable=True, index=True)


# ─── Access Logs ─────────────────────────────────────────────────────────────
class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    action = Column(Enum(AccessAction), nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    accessed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="access_logs")
    resource = relationship("Resource", back_populates="access_logs")


# ─── Notifications ────────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String(50), default="info")  # info, success, warning, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
