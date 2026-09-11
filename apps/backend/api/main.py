from datetime import datetime, timedelta, date
import os
from typing import List

from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .db import SessionLocal, engine
from .topo_pdf import build_topo_pdf
from io import BytesIO

from fastapi.security import OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordBearer

def ensure_database_schema():
    """Create new tables and apply the small additive upgrade used by this app."""
    models.Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    if "user" in inspector.get_table_names() and "group_id" not in {column["name"] for column in inspector.get_columns("user")}:
        with engine.begin() as connection:
            connection.execute(text('ALTER TABLE "user" ADD COLUMN group_id INTEGER REFERENCES usergroup(id)'))
    if "versionvoie" in inspector.get_table_names() and "active" not in {column["name"] for column in inspector.get_columns("versionvoie")}:
        with engine.begin() as connection:
            connection.execute(text('ALTER TABLE versionvoie ADD COLUMN active BOOLEAN NOT NULL DEFAULT FALSE'))
    if "versionvoie" in inspector.get_table_names():
        version_columns = {column["name"] for column in inspector.get_columns("versionvoie")}
        with engine.begin() as connection:
            if "parent_version_id" not in version_columns:
                connection.execute(text('ALTER TABLE versionvoie ADD COLUMN parent_version_id INTEGER REFERENCES versionvoie(id)'))
            if "subversion" not in version_columns:
                connection.execute(text('ALTER TABLE versionvoie ADD COLUMN subversion INTEGER NOT NULL DEFAULT 0'))
    if "voie" in inspector.get_table_names() and "source_voie_id" not in {column["name"] for column in inspector.get_columns("voie")}:
        with engine.begin() as connection:
            connection.execute(text('ALTER TABLE voie ADD COLUMN source_voie_id INTEGER REFERENCES voie(id)'))
    if "versionvoie" in inspector.get_table_names():
        with engine.begin() as connection:
            has_active_version = connection.execute(text('SELECT 1 FROM versionvoie WHERE active = TRUE LIMIT 1')).first()
            if not has_active_version:
                connection.execute(text('UPDATE versionvoie SET active = TRUE WHERE id = (SELECT id FROM versionvoie ORDER BY date DESC, id DESC LIMIT 1)'))


ensure_database_schema()

app = FastAPI()
router = APIRouter()

origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60*24*30))

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user = crud.get_current_user(db, token)
    return user

def get_current_admin(current_user: schemas.User = Depends(get_current_user)):
    if current_user.role_id != 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Droits administrateur requis",
        )
    return current_user

@router.get("/")
async def root():
    return {"message": "Hello World"}

@router.post("/signup", response_model=bool)
async def signup(user_info: schemas.UserSignUp, db: Session = Depends(get_db)):
    crud.signup(db, user_info)
    return True

@router.get("/user-groups", response_model=List[schemas.UserGroup])
async def read_user_groups(db: Session = Depends(get_db)):
    return crud.get_user_groups(db)

@router.post("/user-groups", response_model=schemas.UserGroup, status_code=status.HTTP_201_CREATED)
async def create_user_group(group: schemas.UserGroupName, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return crud.create_user_group(db, group.name)

@router.put("/user-groups/{group_id}", response_model=schemas.UserGroup)
async def update_user_group(group_id: int, group: schemas.UserGroupName, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return crud.rename_user_group(db, group_id, group.name)

@router.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crud.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me/", response_model=schemas.User)
def read_users(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user

@router.get("/dashboard", response_model=schemas.Dashboard)
async def get_voies(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_dashboard(db, current_user)

@router.get("/users/", response_model=List[schemas.User])
def read_users(current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return crud.get_users(db)

def get_user_or_404(db: Session, user_id: int):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable")
    return user

@router.get("/users/{user_id}/userseance", response_model=List[schemas.UserSeance])
def read_user_seance_for_admin(user_id: int, date: date, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    get_user_or_404(db, user_id)
    return crud.get_userseance_for_user(db, user_id, date)

@router.get("/users/{user_id}/userseance_days", response_model=List[datetime])
def read_user_seance_days_for_admin(user_id: int, date: date, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    get_user_or_404(db, user_id)
    return crud.get_userseance_days_for_user(db, user_id, date)

@router.get("/progression", response_model=List[schemas.ProgressionPoint])
async def get_progression(months: int = 12, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if months not in (1, 6, 12):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La période doit être de 1, 6 ou 12 mois",
        )
    return crud.get_progression(db, current_user, months)

@router.get("/versionvoie", response_model=List[schemas.VersionVoie])
async def get_versionvoie(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    versionvoie = crud.get_versionvoie(db)
    return versionvoie

@router.post("/versionvoie", response_model=schemas.VersionVoie)
async def post_versionvoie(date: schemas.VersionVoie, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return crud.post_versionvoie(db, date.date)

@router.post("/versionvoie/{version_id}/subversion", response_model=schemas.VersionVoie)
async def post_subversionvoie(version_id: int, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    version = crud.post_subversionvoie(db, version_id)
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version du mur introuvable")
    return version

@router.patch("/versionvoie/{version_id}/active", response_model=bool)
async def activate_versionvoie(version_id: int, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    if not crud.activate_versionvoie(db, version_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version du mur introuvable")
    return True

@router.get("/voies", response_model=List[schemas.Voie])
async def get_voies(version_id: int = -1, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    versionvoie = crud.get_voies(db, current_user, version_id)
    return versionvoie


@router.get("/wall-analysis", response_model=schemas.WallAnalysis)
async def get_wall_analysis(version_id: int, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    version = db.query(models.VersionVoie).filter(models.VersionVoie.id == version_id).first()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version du mur introuvable")
    return crud.get_wall_analysis(db, version_id)


@router.get("/topo.pdf")
async def export_topo_pdf(version_id: int, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Download the selected wall version as a printable A4 landscape topo."""
    version = db.query(models.VersionVoie).filter(models.VersionVoie.id == version_id).first()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version du mur introuvable")
    routes = crud.get_voies(db, current_user, version_id)
    document = build_topo_pdf(routes, version.date)
    filename = f"topo-voies-{version.date.strftime('%Y-%m-%d') if version.date else version_id}.pdf"
    return StreamingResponse(
        BytesIO(document),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/voie", response_model=bool)
async def post_voie(voie: schemas.Voie, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    crud.post_voie(db, current_user, voie)
    return True

@router.delete("/voie", response_model=bool)
async def delete_voie(id: int, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    crud.delete_voie(db, current_user, id)
    return True

@router.get("/crenautype", response_model=List[schemas.CrenauType])
async def get_crenautype(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crenautype = crud.get_crenautype(db, current_user)
    return crenautype

@router.post("/crenautype", response_model=bool)
async def post_crenautype(crenautype: schemas.CrenauType, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    crud.post_crenautype(db, current_user, crenautype)
    return True

@router.get("/crenaux", response_model=List[schemas.Crenau])
async def get_crenaux(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crenaux = crud.get_crenaux(db, current_user)
    return crenaux

@router.post("/crenau", response_model=bool)
async def post_crenau(crenau: schemas.Crenau, current_user: schemas.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    crud.post_crenau(db, current_user, crenau)
    return True

@router.get("/userseance", response_model=List[schemas.UserSeance])
async def get_userseance(date: date, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_userseance(db, current_user, date)

@router.get("/voie/{voie_id}/userseance", response_model=schemas.VoieHistory)
async def get_voie_history(voie_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = crud.get_voie_history(db, current_user, voie_id)
    if not history:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voie introuvable")
    return history

@router.get("/palmares", response_model=List[int])
async def get_palmares(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_palmares(db, current_user)

@router.get("/userseance_days", response_model=List[datetime])
async def get_userseance_days(date: date, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    tmp = crud.get_userseance_days(db, current_user, date)
    return tmp

@router.post("/userseance", response_model=bool)
async def post_userseance(userseance: schemas.UserSeance, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.post_userseance(db, current_user, userseance)
    return True

@router.delete("/userseance", response_model=bool)
async def delete_userseance(userseance_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.delete_userseance(db, current_user, userseance_id)
    return True

@router.get("/colors", response_model=List[str])
async def get_colors(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_colors(db, current_user)

@router.get("/contests", response_model=List[schemas.Contest])
async def get_contests(db: Session = Depends(get_db)):
    return crud.get_contests(db)

@router.post("/contest", response_model=bool)
async def create_contest(contest: schemas.Contest, db: Session = Depends(get_db)):
    return crud.create_contest(db, contest)

@router.get("/contest_zones", response_model=List[schemas.ZoneContest])
async def get_contest_zones(contest_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_zones(db, contest_id)

@router.post("/contest_zone", response_model=bool)
async def create_contest_zone(zone: schemas.ZoneContest, db: Session = Depends(get_db)):
    return crud.create_contest_zone(db, zone)

@router.get("/contest_blocs", response_model=List[schemas.BlocContest])
async def get_contest_blocs(contest_id: int, zone_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_blocs(db, contest_id, zone_id)

@router.post("/contest_bloc", response_model=bool)
async def create_contest_bloc(bloc: schemas.BlocContest, db: Session = Depends(get_db)):
    return crud.create_contest_bloc(db, bloc)

@router.get("/contest_voies", response_model=List[schemas.VoieContest])
async def get_contest_voies(contest_id: int, zone_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_voies(db, contest_id, zone_id)

@router.post("/contest_voie", response_model=bool)
async def create_contest_voie(voie: schemas.VoieContest, db: Session = Depends(get_db)):
    return crud.create_contest_voie(db, voie)

@router.get("/contest_users", response_model=List[schemas.UserContest])
async def get_contest_users(contest_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_users(db, contest_id)

@router.post("/contest_user", response_model=schemas.UserContest)
async def create_contest_user(user: schemas.UserContest, db: Session = Depends(get_db)):
    return crud.create_contest_user(db, user)

@router.get("/contest_bloc_res", response_model=List[schemas.ResultContest])
async def get_contest_users(contest_id: int, user_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_bloc_res(db, contest_id, user_id)

@router.post("/contest_bloc_res", response_model=bool)
async def get_contest_users(res: schemas.ResultContest, db: Session = Depends(get_db)):
    return crud.post_contest_bloc_res(db, res.contest_id, res.user_id, res.bloc_id)

@router.get("/contest_voie_res", response_model=List[schemas.ResultContestVoie])
async def get_contest_users(contest_id: int, user_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_voie_res(db, contest_id, user_id)

@router.post("/contest_voie_res", response_model=bool)
async def get_contest_users(res: schemas.ResultContestVoie, db: Session = Depends(get_db)):
    return crud.post_contest_voie_res(db, res.contest_id, res.user_id, res.voie_id)


@router.get("/contest_user_classement", response_model=int)
async def get_contest_users(contest_id: int, user_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_user_classement(db, contest_id, user_id)

@router.post("/contest_speed", response_model=bool)
async def post_contest_speed_res(res: schemas.ResultSpeedContest, db: Session = Depends(get_db)):
    return crud.post_contest_speed_res(db, res.contest_id, res.user_id, res.time)

@router.get("/contest_speed", response_model=float)
async def get_contest_speed(contest_id: int, user_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_speed(db, contest_id, user_id)

@router.get("/contest_res", response_model=dict)
async def get_contest_speed(contest_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_classement(db, contest_id)

@router.get("/contest_speed_res", response_model=List[schemas.ResultSpeedContest])
async def get_contest_speed(contest_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_speed_res(db, contest_id)

@router.get("/contest_user_speed_classement", response_model=int)
async def get_contest_user_speed_classement(contest_id: int, user_id: int, db: Session = Depends(get_db)):
    return crud.get_contest_user_speed_classement(db, contest_id, user_id)

app.include_router(router)
