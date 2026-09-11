"""Create an idempotent set of local demonstration data."""

from datetime import date, datetime, time
import os

from . import crud, models
from .db import SessionLocal
from .migrations import run_migrations


# Numeric encoding of the french grades, as used by the frontend and the topo PDF.
TOPO_GRADES = {"a": 0.25, "a+": 0.35, "b": 0.5, "b+": 0.6, "c": 0.75, "c+": 0.85}

# Hold colours, matching the palette proposed in the route management UI.
TOPO_COLORS = {
    "Jaune": "#ffff00",
    "Rouge": "#ff0000",
    "Bleu": "#0000ff",
    "Noir": "#000000",
    "Blanc": "#ffffff",
    "Vert": "#00ff00",
    "Vert F": "#006400",
    "Rose": "#ffc0cb",
    "Orange": "#ffa500",
    "Violet": "#800080",
}

# Imported from the club spreadsheet
# https://docs.google.com/spreadsheets/d/1H7SPqSTyTyBOWyY7zHwxDc1bfN51_IRUBz5rkhFwkww
# lane -> ((grade, colour), ...)
TOPO_SEP_2024_2025 = {
    1: (("5b", "Jaune"), ("6b", "Rouge"), ("6c", "Bleu")),
    2: (("6a", "Noir"), ("6b", "Blanc")),
    3: (("6a", "Bleu"),),
    4: (("6c", "Rose"),),
    5: (("5c", "Vert F"), ("6a", "Violet"), ("7a", "Blanc")),
    6: (("6b", "Vert"), ("6c", "Jaune"), ("7b+", "Bleu")),
    7: (("5c", "Noir"), ("6a", "Rose")),
    10: (("6a+", "Jaune"), ("7a+", "Violet")),
    11: (("7a", "Bleu"), ("7b", "Rouge")),
    12: (("6b", "Noir"), ("8a+", "Rose")),
    13: (("6c", "Vert"),),
    14: (("6a", "Blanc"), ("6b+", "Orange"), ("7a+", "Bleu"), ("8b", "Violet")),
    15: (("6c", "Rose"),),
    16: (("7b", "Rouge"),),
    17: (("7b", "Bleu"),),
    18: (("8b", "Jaune"),),
    19: (("6a+", "Orange"), ("6c+", "Rose")),
    20: (("5a+", "Rose"), ("5b", "Orange")),
    21: (("7a", "Noir"), ("7c", "Jaune"), ("8a", "Bleu")),
    22: (("5b+", "Blanc"), ("6b", "Violet"), ("6c", "Orange")),
    23: (("5a", "Bleu"), ("5b+", "Vert"), ("6b+", "Rose")),
    24: (("5c", "Vert F"), ("5a+", "Blanc"), ("5b", "Noir")),
    25: (("6b", "Rouge"), ("6c", "Bleu"), ("7a+", "Violet")),
    26: (("5b", "Orange"), ("6a+", "Jaune")),
    27: (("4c", "Violet"), ("5a", "Rose"), ("5a+", "Noir")),
    28: (("6b", "Rouge"),),
    29: (("5a", "Noir"), ("5b", "Jaune"), ("6b+", "Orange"), ("6c", "Violet")),
    30: (("5a", "Bleu"), ("5a+", "Blanc"), ("5b", "Vert"), ("6a+", "Violet"), ("6b+", "Rose")),
    31: (("4b", "Rouge"), ("4c", "Orange"), ("5c+", "Noir")),
}

TOPOS = (
    (date(2023, 9, 1), {
        1: (("5c", "Bleu"), ("6a", "Vert"), ("7b", "Rouge")),
        2: (("5b", "Jaune"), ("5c", "Orange")),
        3: (("6a", "Blanc"), ("6a+", "Violet")),
        4: (("6b", "Bleu"),),
        5: (("5c+", "Orange"), ("6c", "Noir"), ("7a", "Bleu")),
        6: (("6b+", "Vert"), ("6a", "Rouge"), ("7c", "Violet")),
        10: (("6a", "Noir"), ("6c", "Violet"), ("7b", "Rose")),
        11: (("7c", "Bleu"), ("8a+", "Rouge")),
        12: (("6b", "Vert F"), ("7a+", "Blanc"), ("7c", "Vert")),
        13: (("7c", "Jaune"),),
        14: (("6a", "Blanc"), ("7b", "Orange"), ("8a+", "Vert")),
        15: (("6b", "Noir"),),
        16: (("6b", "Orange"), ("7a+", "Vert"), ("7b", "Bleu")),
        17: (("7a", "Rose"), ("8a", "Rouge"), ("8b", "Jaune")),
        18: (("6a+", "Rose"), ("7a+", "Vert")),
        19: (("5a+", "Violet"),),
        20: (("5c", "Blanc"), ("6c", "Bleu"), ("7a+", "Orange"), ("7b+", "Rose")),
        22: (("4b", "Rouge"), ("5b", "Noir"), ("6b", "Vert")),
        23: (("5c", "Violet"), ("6c", "Bleu"), ("7a", "Jaune")),
        24: (("5a", "Bleu"), ("5a+", "Blanc"), ("6a+", "Vert F")),
        25: (("5b", "Jaune"), ("6b", "Rouge"), ("7a", "Bleu")),
        26: (("5b", "Noir"), ("6b", "Blanc"), ("6c", "Rose")),
        27: (("5b", "Orange"),),
        28: (("5a", "Vert F"), ("5b+", "Jaune"), ("7a", "Bleu")),
        29: (("5b", "Noir"), ("6a+", "Rose"), ("6b", "Blanc"), ("6b+", "Rouge")),
        30: (("4b", "Jaune"), ("5a", "Orange"), ("5b+", "Vert"), ("6b+", "Bleu")),
        31: (("4c", "Rouge"), ("6a+", "Violet"), ("6b+", "Noir")),
    }),
    (date(2024, 5, 1), {
        1: (("5b", "Jaune"), ("6a+", "Rouge")),
        2: (("5b+", "Noir"), ("6b", "Blanc")),
        3: (("6a", "Bleu"),),
        4: (("6c", "Rose"),),
        5: (("5b+", "Vert F"), ("5c", "Rose"), ("6c", "Jaune"), ("7a", "Blanc")),
        6: (("6b", "Vert"),),
        7: (("5b", "Rouge"), ("5c", "Noir"), ("7b", "Rose")),
        10: (("6a", "Orange"), ("7b", "Rouge")),
        11: (("7a", "Bleu"),),
        12: (("6a+", "Blanc"), ("8a", "Jaune")),
        13: (("6c+", "Vert"),),
        14: (("6a+", "Orange"), ("6b", "Noir"), ("8b", "Bleu")),
        15: (("7c+", "Violet"), ("6b", "Rose")),
        17: (("7a+", "Orange"), ("7c", "Vert")),
        18: (("8a+", "Rouge"), ("7a+", "Bleu")),
        19: (("6a", "Noir"), ("6c+", "Rose")),
        20: (("5a", "Rose"), ("5b", "Jaune")),
        21: (("6a", "Vert"), ("7a", "Noir"), ("8a", "Bleu")),
        22: (("5b+", "Orange"), ("6c", "Orange")),
        23: (("4c", "Bleu"), ("7a", "Rouge")),
        24: (("5a+", "Blanc"), ("5c", "Vert"), ("6a", "Violet")),
        25: (("6b", "Bleu"), ("6b+", "Orange"), ("7a+", "Rose")),
        26: (("6a+", "Jaune"), ("6b+", "Noir")),
        27: (("5a", "Rose"), ("5b", "Vert F"), ("5b+", "Violet")),
        28: (("6a", "Rouge"), ("7a", "Bleu")),
        29: (("5a", "Noir"), ("5b", "Jaune"), ("6b+", "Orange"), ("7b", "Violet")),
        30: (("4b", "Jaune"), ("5a+", "Violet"), ("6a", "Rose"), ("6a+", "Vert")),
        31: (("4c", "Rouge"), ("5a+", "Orange"), ("6a", "Noir")),
    }),
    (date(2024, 9, 1), TOPO_SEP_2024_2025),
    (date(2025, 9, 1), TOPO_SEP_2024_2025),
)


def grade_to_difficulty(grade):
    return int(grade[0]) + TOPO_GRADES[grade[1:]]


def populate():
    run_migrations()
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

        created_versions = []
        for topo_date, lanes in TOPOS:
            version_date = datetime.combine(topo_date, time.min)
            version = db.query(models.VersionVoie).filter(models.VersionVoie.date == version_date).first()
            if not version:
                version = models.VersionVoie(date=version_date, end_date=None)
                db.add(version)
                db.flush()
                for lane, routes in lanes.items():
                    for grade, color in routes:
                        db.add(models.Voie(
                            couloir_id=lane,
                            color=TOPO_COLORS[color],
                            difficulty=grade_to_difficulty(grade),
                            active=True,
                            versionvoie_id=version.id,
                        ))
                created_versions.append(version)
        db.commit()

        # A freshly imported topo stays valid until the next imported one; the
        # most recent remains open-ended, versions managed through the app are
        # left untouched.
        for version, next_version in zip(created_versions, created_versions[1:]):
            if version.end_date is None:
                version.end_date = next_version.date
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    populate()
