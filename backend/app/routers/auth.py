
import bcrypt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Role, User
from app.schemas.auth import RegisterRequest, RegisterResponse
from fastapi import Depends, HTTPException, status
from app.core.security import create_access_token, get_current_user
from app.schemas.auth import LoginRequest, LoginResponse, UserProfile

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

@router.post("/login", response_model=LoginResponse)
def login_user(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).lower()

    user = db.query(User).filter(User.email == email).first()

    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not user:
        raise invalid_credentials

    try:
        password_matches = bcrypt.checkpw(
            data.password.encode("utf-8"),
            user.password_hash.encode("utf-8"),
        )
    except (ValueError, TypeError):
        password_matches = False

    if not password_matches:
        raise invalid_credentials

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is deactivated",
        )

    token = create_access_token(user.id)

    return LoginResponse(access_token=token)


@router.get("/me", response_model=UserProfile)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = db.query(Role).filter(
        Role.id == current_user.role_id
    ).first()

    return UserProfile(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        organization_name=current_user.organization_name,
        role=role.name if role else "Unknown",
        is_active=current_user.is_active,
    )
