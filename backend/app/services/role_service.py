
from sqlalchemy.orm import Session

from app.models import Role


DEFAULT_ROLES = {
    "Admin": "Full system administration",
    "Campaign Manager": "Manage awareness campaigns",
    "Communication Team": "Prepare and coordinate communications",
}


def seed_roles(db: Session):
    for role_name, description in DEFAULT_ROLES.items():
        existing_role = (
            db.query(Role)
            .filter(Role.name == role_name)
            .first()
        )

        if not existing_role:
            db.add(Role(name=role_name, description=description))

    db.commit()
