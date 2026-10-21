
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional


class AudienceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, max_length=30)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    language: str = Field(default="English", max_length=50)
    occupation: Optional[str] = Field(None, max_length=100)
    organization_department: Optional[str] = Field(None, max_length=150)
    preferred_channel: Optional[str] = Field(None, max_length=50)
    consent_status: bool = False
    segment_id: Optional[int] = None


class AudienceCreate(AudienceBase):
    pass


class AudienceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, max_length=30)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    language: Optional[str] = Field(None, max_length=50)
    occupation: Optional[str] = Field(None, max_length=100)
    organization_department: Optional[str] = Field(None, max_length=150)
    preferred_channel: Optional[str] = Field(None, max_length=50)
    consent_status: Optional[bool] = None
    segment_id: Optional[int] = None


class AudienceResponse(AudienceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
