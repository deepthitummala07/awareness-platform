
import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20)
    organization_name: str = Field(min_length=2, max_length=150)
    password: str = Field(min_length=8, max_length=128)
    role: str

    @field_validator("name", "organization_name")
    @classmethod
    def validate_text(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("This field is required")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        value = value.strip()
        if not re.fullmatch(r"[0-9+\-() ]{7,20}", value):
            raise ValueError("Enter a valid phone number")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain a number")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must contain a special character")
        return value


class RegisterResponse(BaseModel):
    message: str
    user_id: int
    name: str
    email: EmailStr
    role: str
