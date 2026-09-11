from datetime import datetime

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from api import crud, models, schemas
from api.db import Base


@pytest.fixture()
def db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


def create_user(db, email, role_id=1):
    user = models.User(
        name="Test",
        surname="Grimpeur",
        email=email,
        pwd_hash=crud.get_password_hash("password123"),
        role_id=role_id,
    )
    db.add(user)
    db.commit()
    return user


def test_progression_uses_real_session_data(db):
    user = create_user(db, "progression@example.com")
    version = models.VersionVoie(date=datetime.now())
    route_type = models.CouloirType(name="Dalle")
    db.add_all([version, route_type])
    db.commit()
    couloir = models.Couloir(type_id=route_type.id)
    db.add(couloir)
    db.commit()
    voie = models.Voie(
        couloir_id=couloir.id,
        color="#ff0000",
        difficulty=6.5,
        active=True,
        versionvoie_id=version.id,
    )
    db.add(voie)
    db.commit()
    db.add_all([
        models.UserSeance(date=datetime.now(), user_id=user.id, voie_id=voie.id, en_tete=True, top=100, pause=0),
        models.UserSeance(date=datetime.now(), user_id=user.id, voie_id=voie.id, en_tete=False, top=50, pause=1),
    ])
    db.commit()

    current_month = crud.get_progression(db, user, 1)[0]
    assert current_month["sessions"] == 1
    assert current_month["attempts"] == 2
    assert current_month["tops"] == 1
    assert current_month["max_level"] == 6.5
    assert current_month["lead_ratio"] == 0.5


def test_user_cannot_delete_another_users_entry(db):
    owner = create_user(db, "owner@example.com")
    another_user = create_user(db, "another@example.com")
    version = models.VersionVoie(date=datetime.now())
    route_type = models.CouloirType(name="Dévers")
    db.add_all([version, route_type])
    db.commit()
    couloir = models.Couloir(type_id=route_type.id)
    db.add(couloir)
    db.commit()
    voie = models.Voie(couloir_id=couloir.id, color="#00ff00", difficulty=5.5, active=True, versionvoie_id=version.id)
    db.add(voie)
    db.commit()
    entry = models.UserSeance(date=datetime.now(), user_id=owner.id, voie_id=voie.id, en_tete=False, top=100, pause=0)
    db.add(entry)
    db.commit()

    crud.delete_userseance(db, another_user, entry.id)
    assert db.query(models.UserSeance).filter(models.UserSeance.id == entry.id).first() is not None

    crud.delete_userseance(db, owner, entry.id)
    assert db.query(models.UserSeance).filter(models.UserSeance.id == entry.id).first() is None


def test_signup_can_join_an_existing_group(db):
    group = models.UserGroup(name="Les lézards")
    db.add(group)
    db.commit()

    crud.signup(db, schemas.UserSignUp(
        email="member@example.com",
        password="password123",
        group_id=group.id,
    ))

    user = crud.get_user(db, "member@example.com")
    assert user.group_id == group.id
    assert crud.get_users(db)[0].group.name == "Les lézards"


def test_signup_can_create_a_group(db):
    crud.signup(db, schemas.UserSignUp(
        email="creator@example.com",
        password="password123",
        new_group_name="  Les aigles  ",
    ))

    user = crud.get_user(db, "creator@example.com")
    assert user.group.name == "Les aigles"
    assert [group.name for group in crud.get_user_groups(db)] == ["Les aigles"]


def test_admin_can_create_and_rename_a_group(db):
    group = crud.create_user_group(db, "  Les panthères ")

    assert group.name == "Les panthères"
    renamed_group = crud.rename_user_group(db, group.id, "Les lynx")
    assert renamed_group.name == "Les lynx"


def test_group_name_must_be_unique_case_insensitively(db):
    crud.create_user_group(db, "Les aigles")

    with pytest.raises(HTTPException) as error:
        crud.create_user_group(db, "les AIGLES")

    assert error.value.status_code == 409


def test_admin_history_queries_only_return_the_selected_users_sessions(db):
    selected_user = create_user(db, "selected@example.com")
    another_user = create_user(db, "another-history@example.com")
    version = models.VersionVoie(date=datetime.now())
    route_type = models.CouloirType(name="Dalle")
    db.add_all([version, route_type])
    db.commit()
    couloir = models.Couloir(type_id=route_type.id)
    db.add(couloir)
    db.commit()
    voie = models.Voie(couloir_id=couloir.id, color="#0000ff", difficulty=6.0, active=True, versionvoie_id=version.id)
    db.add(voie)
    db.commit()

    session_date = datetime(2026, 9, 8, 18, 0)
    db.add_all([
        models.UserSeance(date=session_date, user_id=selected_user.id, voie_id=voie.id, en_tete=True, top=100, pause=0),
        models.UserSeance(date=session_date, user_id=another_user.id, voie_id=voie.id, en_tete=False, top=50, pause=1),
    ])
    db.commit()

    sessions = crud.get_userseance_for_user(db, selected_user.id, session_date.date())
    session_days = crud.get_userseance_days_for_user(db, selected_user.id, session_date.date())

    assert len(sessions) == 1
    assert sessions[0].user_id == selected_user.id
    assert session_days == [session_date]
