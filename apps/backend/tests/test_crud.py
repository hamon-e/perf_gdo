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


def test_active_wall_version_controls_default_routes(db):
    first_version = crud.post_versionvoie(db, datetime(2026, 1, 1))
    second_version = crud.post_versionvoie(db, datetime(2026, 2, 1))
    route_type = models.CouloirType(name="Dalle")
    db.add(route_type)
    db.commit()
    couloir = models.Couloir(type_id=route_type.id)
    db.add(couloir)
    db.commit()
    first_route = models.Voie(couloir_id=couloir.id, color="#ff0000", difficulty=5.0, active=True, versionvoie_id=first_version.id)
    second_route = models.Voie(couloir_id=couloir.id, color="#00ff00", difficulty=6.0, active=True, versionvoie_id=second_version.id)
    db.add_all([first_route, second_route])
    db.commit()

    assert first_version.active is True
    assert second_version.active is False
    assert [route.id for route in crud.get_voies(db, None, -1)] == [first_route.id]

    assert crud.activate_versionvoie(db, second_version.id) is True
    assert [route.id for route in crud.get_voies(db, None, -1)] == [second_route.id]
    assert db.query(models.VersionVoie).filter(models.VersionVoie.active.is_(True)).count() == 1


def test_subversion_copies_routes_and_keeps_source_unchanged(db):
    source = crud.post_versionvoie(db, datetime(2026, 1, 1))
    route_type = models.CouloirType(name="Dalle")
    db.add(route_type)
    db.commit()
    couloir = models.Couloir(type_id=route_type.id)
    db.add(couloir)
    db.commit()
    source_route = models.Voie(
        couloir_id=couloir.id,
        color="#ff0000",
        difficulty=5.0,
        active=True,
        versionvoie_id=source.id,
    )
    db.add(source_route)
    db.commit()

    first_revision = crud.post_subversionvoie(db, source.id)
    copied_route = crud.get_voies(db, None, first_revision.id)[0]
    copied_route.difficulty = 6.5
    db.commit()
    second_revision = crud.post_subversionvoie(db, first_revision.id)

    assert first_revision.parent_version_id == source.id
    assert first_revision.subversion == 1
    assert second_revision.parent_version_id == source.id
    assert second_revision.subversion == 2
    assert first_revision.date == source.date
    assert copied_route.id != source_route.id
    assert crud.get_voies(db, None, source.id)[0].difficulty == 5.0
    assert crud.get_voies(db, None, second_revision.id)[0].difficulty == 6.5
    assert source.active is True


def test_ticked_route_stays_ticked_across_subversions(db):
    user = create_user(db, "grimpeur@example.com")
    source = crud.post_versionvoie(db, datetime(2026, 1, 1))
    route_type = models.CouloirType(name="Dalle")
    db.add(route_type)
    db.commit()
    couloir = models.Couloir(type_id=route_type.id)
    db.add(couloir)
    db.commit()
    source_route = models.Voie(
        couloir_id=couloir.id,
        color="#ff0000",
        difficulty=5.0,
        active=True,
        versionvoie_id=source.id,
    )
    db.add(source_route)
    db.commit()
    db.add(models.UserSeance(date=datetime.now(), user_id=user.id, voie_id=source_route.id, en_tete=True, top=100, pause=0))
    db.commit()

    revision = crud.post_subversionvoie(db, source.id)
    copied_route = crud.get_voies(db, None, revision.id)[0]
    assert copied_route.source_voie_id == source_route.id

    crud.activate_versionvoie(db, revision.id)
    assert copied_route.id in crud.get_palmares(db, user)
    coverage = crud.compute_dashboard_coverage(db, user)
    assert coverage["coverage"] == 1
    assert coverage["max_lvl"] == 5.0
    assert coverage["tete_ratio"] == 1.0

    crud.post_voie(db, user, schemas.Voie(
        id=copied_route.id,
        couloir_id=copied_route.couloir_id,
        color=copied_route.color,
        difficulty=6.5,
        versionvoie_id=revision.id,
    ))
    edited_route = crud.get_voies(db, None, revision.id)[0]
    assert edited_route.source_voie_id is None
    assert edited_route.id not in crud.get_palmares(db, user)
    assert crud.compute_dashboard_coverage(db, user)["coverage"] == 0


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


def test_admin_can_attach_a_user_to_a_group(db):
    user = create_user(db, "rattache@example.com")
    group = crud.create_user_group(db, "Les lynx")
    other_group = crud.create_user_group(db, "Les panthères")

    assigned = crud.assign_user_group(db, user.id, group.id)
    assert assigned.group_id == group.id
    assert crud.get_users(db)[0].group.name == "Les lynx"

    reassigned = crud.assign_user_group(db, user.id, other_group.id)
    assert reassigned.group_id == other_group.id


def test_attach_user_rejects_unknown_user_or_group(db):
    user = create_user(db, "orphan@example.com")
    group = crud.create_user_group(db, "Les lynx")

    with pytest.raises(HTTPException) as error:
        crud.assign_user_group(db, 9999, group.id)
    assert error.value.status_code == 404

    with pytest.raises(HTTPException) as error:
        crud.assign_user_group(db, user.id, 9999)
    assert error.value.status_code == 404

    detached = crud.assign_user_group(db, user.id, None)
    assert detached.group_id is None


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


def test_voie_history_counts_attempts_across_lineage_and_users(db):
    climber = create_user(db, "climber@example.com")
    other = create_user(db, "other@example.com")
    route_type = models.CouloirType(name="Dalle")
    db.add(route_type)
    db.commit()
    couloir = models.Couloir(type_id=route_type.id)
    db.add(couloir)
    db.commit()
    source_version = crud.post_versionvoie(db, datetime(2026, 1, 1))
    source_route = models.Voie(couloir_id=couloir.id, color="#ff0000", difficulty=6.0, active=True, versionvoie_id=source_version.id)
    db.add(source_route)
    db.commit()
    db.add_all([
        models.UserSeance(date=datetime(2026, 1, 10), user_id=climber.id, voie_id=source_route.id, en_tete=False, top=50, pause=1),
        models.UserSeance(date=datetime(2026, 1, 20), user_id=climber.id, voie_id=source_route.id, en_tete=True, top=100, pause=0),
        models.UserSeance(date=datetime(2026, 1, 20), user_id=other.id, voie_id=source_route.id, en_tete=True, top=100, pause=0),
    ])
    db.commit()

    revision = crud.post_subversionvoie(db, source_version.id)
    copied_route = crud.get_voies(db, None, revision.id)[0]
    db.add(models.UserSeance(date=datetime(2026, 2, 5), user_id=climber.id, voie_id=copied_route.id, en_tete=True, top=100, pause=0))
    db.commit()

    history = crud.get_voie_history(db, climber, copied_route.id)
    assert history["total_attempts"] == 3
    assert history["total_tops"] == 2
    assert history["voie"].id == copied_route.id
    assert [session.date for session in history["sessions"]] == [
        datetime(2026, 2, 5),
        datetime(2026, 1, 20),
        datetime(2026, 1, 10),
    ]
    assert {session.voie_id for session in history["sessions"]} == {source_route.id, copied_route.id}

    assert crud.get_voie_history(db, climber, 9999) is None
