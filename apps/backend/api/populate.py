"""Create an idempotent set of local demonstration data."""

from datetime import datetime, time
import os

from . import crud, models
from .db import SessionLocal
from .main import ensure_database_schema


def populate():
    ensure_database_schema()
    db = SessionLocal()
    try:
        roles = ((0, "admin"), (1, "basic"))
        for role_id, name in roles:
            if not db.query(models.UserRole).filter(models.UserRole.id == role_id).first():
                db.add(models.UserRole(id=role_id, name=name))
        db.commit()

        admin_email = os.environ.get("DEMO_ADMIN_EMAIL", "admin@gmail.com")
        admin_password = os.environ.get("DEMO_ADMIN_PASSWORD", "change-me")
        if not crud.get_user(db, admin_email):
            db.add(models.User(
                name="Admin",
                surname="Admin",
                pwd_hash=crud.get_password_hash(admin_password),
                email=admin_email,
                role_id=0,
            ))
            db.commit()

        version = db.query(models.VersionVoie).order_by(models.VersionVoie.date.desc()).first()
        if not version:
            version = models.VersionVoie(date=datetime.combine(datetime.now().date(), time.min))
            db.add(version)
            db.commit()

        route_types = {
            "Plexi + toit": range(1, 4),
            "Vérin gauche": range(4, 9),
            "Dévers": range(9, 20),
            "Vérin droit": range(20, 23),
            "Dalle": range(23, 28),
            "9 m": range(28, 32),
        }
        for name, lanes in route_types.items():
            route_type = db.query(models.CouloirType).filter(models.CouloirType.name == name).first()
            if not route_type:
                route_type = models.CouloirType(name=name)
                db.add(route_type)
                db.commit()
            for lane_id in lanes:
                if not db.query(models.Couloir).filter(models.Couloir.id == lane_id).first():
                    db.add(models.Couloir(id=lane_id, type_id=route_type.id))
        db.commit()

        if db.query(models.Voie).filter(models.Voie.versionvoie_id == version.id).count() == 0:
            colors = ("#E53935", "#FDD835", "#1E88E5", "#43A047", "#8E24AA", "#111111")
            difficulties = (4.25, 4.5, 5.25, 5.5, 5.75, 6.25, 6.5, 6.75, 7.25, 7.5)
            for lane_id in range(1, 32):
                db.add(models.Voie(
                    couloir_id=lane_id,
                    color=colors[(lane_id - 1) % len(colors)],
                    difficulty=difficulties[(lane_id - 1) % len(difficulties)],
                    active=True,
                    versionvoie_id=version.id,
                ))
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    populate()
