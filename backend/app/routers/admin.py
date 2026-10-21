
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models import Role, User
from app.schemas.admin import (
    AdminUserResponse,
    ChangeRoleRequest,
    ChangeStatusRequest,
)


router = APIRouter(prefix="/admin", tags=["Administration"])


def serialize_user(user: User, db: Session):
    role = db.query(Role).filter(Role.id == user.role_id).first()

    return AdminUserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        organization_name=user.organization_name,
        role=role.name if role else "Unknown",
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("Admin")),
):
    users = db.query(User).order_by(User.id).all()
    return [serialize_user(user, db) for user in users]


@router.patch("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    data: ChangeRoleRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("Admin")),
):
    role = db.query(Role).filter(Role.name == data.role).first()

    if not role:
        raise HTTPException(
            status_code=400,
            detail="Role does not exist",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role_id = role.id
    db.commit()

    return {"message": "User role updated successfully"}


@router.patch("/users/{user_id}/status")
def change_user_status(
    user_id: int,
    data: ChangeStatusRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("Admin")),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id and not data.is_active:
        raise HTTPException(
            status_code=400,
            detail="You cannot deactivate your own account",
        )

    user.is_active = data.is_active
    db.commit()

    return {
        "message": "User status updated successfully",
        "is_active": user.is_active,
    }
