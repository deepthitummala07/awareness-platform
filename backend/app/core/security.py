
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models import Role, User


ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 30

bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: int):
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired access token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise credentials_error

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        subject = payload.get("sub")

        if subject is None:
            raise credentials_error

        user_id = int(subject)

    except (JWTError, ValueError, TypeError):
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise credentials_error

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is deactivated",
        )

    return user


def require_role(*allowed_roles: str):
    def role_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        role = (
            db.query(Role)
            .filter(Role.id == current_user.role_id)
            .first()
        )

        if not role or role.name.lower() not in {
            name.lower() for name in allowed_roles
        }:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        return current_user

    return role_checker
