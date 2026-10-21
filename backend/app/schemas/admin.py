
from datetime import datetime
from pydantic import BaseModel, EmailStr


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    organization_name: str
    role: str
    is_active: bool
    created_at: datetime | None = None


class ChangeRoleRequest(BaseModel):
    role: str


class ChangeStatusRequest(BaseModel):
    is_active: bool
