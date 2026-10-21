
import getpass
import re

import bcrypt
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Role, User
from app.services.role_service import seed_roles


def main():
    db: Session = SessionLocal()

    try:
        seed_roles(db)

        name = input("Admin full name: ").strip()
        email = input("Admin email: ").strip().lower()
        phone = input("Admin phone: ").strip()
        organization = input("Organization name: ").strip()
        password = getpass.getpass("Admin password: ")

        if not all([name, email, phone, organization]):
            print("All fields are required.")
            return

        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            print("Enter a valid email address.")
            return

        if (
            len(password) < 8
            or not re.search(r"[A-Z]", password)
            or not re.search(r"[a-z]", password)
            or not re.search(r"\d", password)
            or not re.search(r"[^A-Za-z0-9]", password)
        ):
            print(
                "Password must have 8+ characters, uppercase, "
                "lowercase, a number and a special character."
            )
            return

        if db.query(User).filter(User.email == email).first():
            print("A user with this email already exists.")
            return

        role = db.query(Role).filter(Role.name == "Admin").first()

        user = User(
            name=name,
            email=email,
            phone=phone,
            organization_name=organization,
            password_hash=bcrypt.hashpw(
                password.encode("utf-8"),
                bcrypt.gensalt(),
            ).decode("utf-8"),
            role_id=role.id,
            is_active=True,
        )

        db.add(user)
        db.commit()

        print("Administrator account created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
