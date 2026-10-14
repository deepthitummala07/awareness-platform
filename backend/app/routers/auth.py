
import bcrypt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Role, User
from app.schemas.auth import RegisterRequest, RegisterResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])

PUBLIC_ROLES = {"Campaign Manager", "Communication Team"}


@router.get("/roles")
def get_registration_roles(db: Session = Depends(get_db)):
    roles = (
        db.query(Role)
        .filter(Role.name.in_(PUBLIC_ROLES))
        .order_by(Role.name)
        .all()
    )
    return [{"name": role.name} for role in roles]


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).lower()

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    if data.role not in PUBLIC_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select a valid registration role",
        )

    role = db.query(Role).filter(Role.name == data.role).first()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected role is not available",
        )

    password_hash = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

    user = User(
        name=data.name,
        email=email,
        phone=data.phone,
        organization_name=data.organization_name,
        password_hash=password_hash,
        role_id=role.id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return RegisterResponse(
        message="Registration successful",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=role.name,
    )
