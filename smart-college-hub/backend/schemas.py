from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, UploadStatus, AccessAction, ContentType


# ─── Auth ─────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    enrollment_no: Optional[str] = None
    password: str
    branch: Optional[str] = None
    semester: Optional[int] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    enrollment_no: Optional[str] = None
    role: UserRole
    branch: Optional[str] = None
    semester: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    is_active: Optional[bool] = None


# ─── Academic ─────────────────────────────────────────────────────────────────
class BranchOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class SemesterOut(BaseModel):
    id: int
    number: int
    branch_id: int

    class Config:
        from_attributes = True


class SubjectOut(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    semester_id: int
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UnitOut(BaseModel):
    id: int
    number: int
    title: str
    description: Optional[str] = None
    subject_id: int

    class Config:
        from_attributes = True


class UnitWithResources(UnitOut):
    resource_count: int = 0


class SubjectWithUnits(SubjectOut):
    units: List[UnitOut] = []


# ─── Resources ────────────────────────────────────────────────────────────────
class ResourceOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    file_name: str
    file_size: int
    file_type: Optional[str] = None
    content_type: ContentType
    status: UploadStatus
    rejection_reason: Optional[str] = None
    unit_id: int
    uploader_id: int
    download_count: int
    view_count: int
    created_at: datetime
    approved_at: Optional[datetime] = None
    uploader: Optional[UserOut] = None

    class Config:
        from_attributes = True


class ResourceApprove(BaseModel):
    status: UploadStatus
    rejection_reason: Optional[str] = None


# ─── Access Logs ─────────────────────────────────────────────────────────────
class AccessLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    resource_id: int
    action: AccessAction
    ip_address: Optional[str] = None
    accessed_at: datetime
    user: Optional[UserOut] = None
    resource: Optional[ResourceOut] = None

    class Config:
        from_attributes = True


# ─── Analytics ───────────────────────────────────────────────────────────────
class SubjectStats(BaseModel):
    subject_id: int
    subject_name: str
    branch: str
    semester: int
    total_views: int
    total_downloads: int
    resource_count: int


class UserStats(BaseModel):
    user_id: int
    full_name: str
    email: str
    enrollment_no: Optional[str] = None
    upload_count: int
    approved_count: int
    total_downloads_on_uploads: int


class FileStats(BaseModel):
    resource_id: int
    title: str
    file_name: str
    content_type: ContentType
    download_count: int
    view_count: int
    subject_name: str


class DashboardStats(BaseModel):
    total_users: int
    total_resources: int
    pending_approvals: int
    total_downloads: int
    total_views: int
    resources_today: int
    new_users_today: int


# ─── Notifications ────────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    notification_type: str
    created_at: datetime

    class Config:
        from_attributes = True


Token.model_rebuild()
