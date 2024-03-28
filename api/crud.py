from datetime import datetime, timedelta, date

from sqlalchemy.orm import Session
from passlib.context import CryptContext

import base64

from typing import List, Optional

from fastapi import Depends, HTTPException, status, UploadFile
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from . import models, schemas

import random
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"

def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session):
    return db.query(models.User).all()

def new_user(db: Session, user: schemas.User):
    tmp = user.dict()
    del tmp['category']
    db.add(models.User(**tmp))
    db.commit()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    print(user)
    if not verify_password(password, user.pwd_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def signup(db: Session, user_info: schemas.UserSignUp):
    db.add(models.User(name='User', surname='User', pwd_hash=get_password_hash(user_info.password), email=user_info.email, role_id=1))
    db.commit()

def get_current_user(db: Session, token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

def compute_dashboard_coverage(db: Session, current_user: schemas.User):
    version = db.query(models.VersionVoie).order_by(models.VersionVoie.date.desc()).first()
    all_user = db.query(models.UserSeance.voie_id).filter(models.UserSeance.user_id == current_user.id).filter(models.UserSeance.top == 100).filter(models.UserSeance.voie_id.in_(db.query(models.Voie.id).filter(models.Voie.versionvoie_id == version.id))).distinct().all()
    all_user_tete = db.query(models.UserSeance.en_tete).filter(models.UserSeance.user_id == current_user.id).filter(models.UserSeance.voie_id.in_(db.query(models.Voie.id).filter(models.Voie.versionvoie_id == version.id))).all()
    tmp = {
    'coverage': 0,
    'coverage_dalle': 0,
    'coverage_devers': 0,
    'coverage_diedre': 0,
    'coverage_9m': 0,
    'max_lvl': 0,
    'tete': 0,
    'moulinette': 0
     }
    for elem in all_user_tete:
        if elem[0] == True:
            tmp['tete'] = tmp['tete'] + 1
        else:
            tmp['moulinette'] = tmp['moulinette'] + 1

    for elem in all_user:
        voie = db.query(models.Voie).filter(models.Voie.id == elem[0]).first()
        if voie.difficulty >= tmp['max_lvl']:
            tmp['max_lvl'] = voie.difficulty
        tmp['coverage'] = tmp['coverage'] + 1
        if voie.couloir_id in [2,3]:
            tmp['coverage_diedre'] = tmp['coverage_diedre'] + 1
        elif voie.couloir_id in [1, 23,24,25,26,26,27]:
            tmp['coverage_dalle'] = tmp['coverage_dalle'] + 1
        elif voie.couloir_id in [28,29,30,31]:
            tmp['coverage_9m'] = tmp['coverage_9m'] + 1
        else:
            tmp['coverage_devers'] = tmp['coverage_devers'] + 1

    all = db.query(models.Voie).filter(models.Voie.versionvoie_id == version.id).all()
    nbr = {
    'nbr': 0,
    'nbr_dalle': 0,
    'nbr_devers': 0,
    'nbr_diedre': 0,
    'nbr_9m': 0,
     }
    for elem in all:
        nbr['nbr'] = nbr['nbr'] + 1
        if elem.couloir_id in [2,3]:
            nbr['nbr_diedre'] = nbr['nbr_diedre'] + 1
        elif elem.couloir_id in [1, 23,24,25,26,26,27]:
            nbr['nbr_dalle'] = nbr['nbr_dalle'] + 1
        elif elem.couloir_id in [28,29,30,31]:
            nbr['nbr_9m'] = nbr['nbr_9m'] + 1
        else:
            nbr['nbr_devers'] = nbr['nbr_devers'] + 1
    if nbr['nbr'] != 0:
        tmp['coverage'] = round(tmp['coverage'] / nbr['nbr'], 2)
    else:
        tmp['coverage'] = 1
    if nbr['nbr_diedre'] != 0:
        tmp['coverage_diedre'] = round(tmp['coverage_diedre'] / nbr['nbr_diedre'], 2)
    else:
        tmp['coverage_diedre'] = 1
    if nbr['nbr_dalle'] != 0:
        tmp['coverage_dalle'] = round(tmp['coverage_dalle'] / nbr['nbr_dalle'], 2)
    else:
        tmp['coverage_dalle'] = 1
    if nbr['nbr_9m'] != 0:
        tmp['coverage_9m'] = round(tmp['coverage_9m'] / nbr['nbr_9m'], 2)
    else:
        tmp['coverage_9m'] = 1
    if nbr['nbr_devers'] != 0:
        tmp['coverage_devers'] = round(tmp['coverage_devers'] / nbr['nbr_devers'], 2)
    else:
        tmp['coverage_devers'] = 1
    if tmp['coverage_devers'] == 0:
        tmp['coverage_devers'] = 0.01
    if tmp['coverage_9m'] == 0:
        tmp['coverage_9m'] = 0.01
    if tmp['coverage_diedre'] == 0:
        tmp['coverage_diedre'] = 0.01
    if tmp['coverage_dalle'] == 0:
        tmp['coverage_dalle'] = 0.01

    tmp['tete_ratio'] = round(tmp['tete'] / (tmp['tete'] + tmp['moulinette']), 2)
    return tmp

def compute_dashboard_nbr_of_seances(db: Session, current_user: schemas.User):
    start = datetime.today().replace(day=1).replace(hour=1)
    next_month = datetime.today().replace(day=28).replace(hour=1) + timedelta(days=4)
    end = next_month - timedelta(days=next_month.day)
    nbr_of_seances = db.query(models.UserSeance.date).filter(models.UserSeance.user_id == current_user.id).filter(models.UserSeance.date >= start).filter(models.UserSeance.date <= end).distinct().count()
    print(nbr_of_seances)
    return nbr_of_seances

def get_dashboard(db: Session, current_user: schemas.User):
    tmp = compute_dashboard_coverage(db, current_user)
    print(tmp)
    tmp['nbr_of_seances'] = compute_dashboard_nbr_of_seances(db, current_user)
    return tmp

def get_seances(db: Session, current_user: schemas.User, start: date, end: date):
    print(db.query(models.Seance).filter(models.Seance.start >= start).filter(models.Seance.start <= end).all())
    return db.query(models.Seance).filter(models.Seance.start >= start).filter(models.Seance.start <= end).all()

def get_versionvoie(db: Session):
    return db.query(models.VersionVoie).order_by(models.VersionVoie.date.desc()).all()

def post_versionvoie(db: Session, date: datetime):
    db.add(models.VersionVoie(date=date))
    db.commit()

def get_voies(db: Session, current_user: schemas.User, version_id: int):
    if version_id == -1:
        version_id = db.query(models.VersionVoie).order_by(models.VersionVoie.date.desc()).first().id
    return db.query(models.Voie).filter(models.Voie.versionvoie_id == version_id).order_by(models.Voie.difficulty).order_by(models.Voie.couloir_id).all()

def post_voie(db: Session, current_user: schemas.User, voie: schemas.Voie):
    tmp = voie.dict()
    tmp['active'] = True
    del tmp['couloir']
    id = tmp['id']
    del tmp['id']
    if not id:
        db.add(models.Voie(**tmp))
        db.commit()
    else:
        print(tmp)
        db.query(models.Voie).filter(models.Voie.id == id).update(tmp)
        db.commit()

def delete_voie(db: Session, current_user: schemas.User, id: int):
   db.query(models.Voie).filter(models.Voie.id == id).delete()
   db.commit()

def get_crenautype(db: Session, current_user: schemas.User):
    return db.query(models.CrenauType).all()

def post_crenautype(db: Session, current_user: schemas.User, crenautype: schemas.CrenauType):
    tmp = crenautype.dict()
    del tmp['id']
    db.add(models.CrenauType(**tmp))
    db.commit()

def get_crenaux(db: Session, current_user: schemas.User):
    return db.query(models.Crenau).all()

def post_crenau(db: Session, current_user: schemas.User, crenau: schemas.Crenau):
    tmp = crenau.dict()
    del tmp['id']
    db.add(models.Crenau(**tmp))
    db.commit()

def get_userseance(db: Session, current_user: schemas.User, date: date):
    return db.query(models.UserSeance).filter(models.UserSeance.user_id == current_user.id).filter(models.UserSeance.date == date).all()

def get_userseance_days(db: Session, current_user: schemas.User, date: date):
    start = datetime(year=date.year, month=date.month, day=1)
    end = start + timedelta(days=31)
    tmp = db.query(models.UserSeance.date).filter(models.UserSeance.user_id == current_user.id).filter(models.UserSeance.date >= start).filter(models.UserSeance.date < end).distinct().all()
    return [r.date for r in tmp]

def post_userseance(db: Session, current_user: schemas.User, userseance: schemas.UserSeance):
    tmp = userseance.dict()
    del tmp['id']
    del tmp['voie']
    tmp['user_id'] = current_user.id
    print(tmp)
    db.add(models.UserSeance(**tmp))
    db.commit()

def delete_userseance(db: Session, current_user: schemas.User, userseance_id: int):
   db.query(models.UserSeance).filter(models.UserSeance.id == userseance_id).delete()
   db.commit()

def get_palmares(db: Session, current_user: schemas.User):
    tmp = db.query(models.UserSeance.voie_id).filter(models.UserSeance.user_id == current_user.id).filter(models.UserSeance.top == 100).filter(models.UserSeance.pause == 0).distinct().all()
    return [r.voie_id for r in tmp]

def get_colors(db: Session, current_user: schemas.User):
    tmp = db.query(models.Voie.color).distinct().all()
    return [r.color for r in tmp]

def get_contest_users(db: Session, contest_id: int):
    tmp = db.query(models.UserContest).filter(models.UserContest.contest_id == contest_id).all()
    return tmp

def get_contest_user(db: Session, contest_id: int, user_id: int):
    tmp = db.query(models.UserContest).filter(models.UserContest.contest_id == contest_id).filter(models.UserContest.id == user_id).first()
    return tmp

def create_contest_user(db: Session, user: schemas.UserContest):
    tmp = user.dict()
    del tmp['id']
    if not db.query(models.UserContest).filter(models.UserContest.contest_id == user.contest_id).filter(models.UserContest.name == tmp['name']).first():
        tmp['score'] = 0
        tmp2 = models.UserContest(**tmp)
        db.add(tmp2)
        db.commit()
        return tmp2

def create_contest_zone(db: Session, zone: schemas.ZoneContest):
    tmp = zone.dict()
    del tmp['id']
    db.add(models.ZoneContest(**tmp))
    db.commit()
    return True

def create_contest_bloc(db: Session, bloc: schemas.BlocContest):
    print(bloc)
    tmp = bloc.dict()
    del tmp['id']
    db.add(models.BlocContest(**tmp))
    db.commit()
    return True

def get_contest_blocs(db: Session, contest_id: int, zone_id: int):
    tmp = db.query(models.BlocContest).filter(models.BlocContest.contest_id == contest_id).filter(models.BlocContest.zone_id == zone_id).order_by(models.BlocContest.difficulty).all()
    return tmp

def create_contest_voie(db: Session, voie: schemas.VoieContest):
    tmp = voie.dict()
    del tmp['id']
    db.add(models.VoieContest(**tmp))
    db.commit()
    return True

def get_contest_voies(db: Session, contest_id: int, zone_id: int):
    tmp = db.query(models.VoieContest).filter(models.VoieContest.contest_id == contest_id).filter(models.VoieContest.zone_id == zone_id).order_by(models.VoieContest.difficulty).all()
    return tmp

def get_contest_zones(db: Session, contest_id: int):
    tmp = db.query(models.ZoneContest).filter(models.ZoneContest.contest_id == contest_id).order_by(models.ZoneContest.id).all()
    return tmp

def get_contests(db: Session):
    tmp = db.query(models.Contest).all()
    return tmp

def create_contest(db: Session, contest: schemas.Contest):
    tmp = contest.dict()
    del tmp['id']
    print(tmp)
    db.add(models.Contest(**tmp))
    db.commit()
    return True

def get_contest_bloc_res(db: Session, contest_id: int, user_id: int):
    tmp = db.query(models.ResultContest).filter(models.ResultContest.contest_id == contest_id).filter(models.ResultContest.user_id == user_id).all()
    return tmp

def get_contest_voie_res(db: Session, contest_id: int, user_id: int):
    tmp = db.query(models.ResultContestVoie).filter(models.ResultContestVoie.contest_id == contest_id).filter(models.ResultContestVoie.user_id == user_id).all()
    return tmp

def compute_score(db: Session, contest_id: int):
    tmp = db.query(models.UserContest).filter(models.UserContest.contest_id == contest_id).all()
    for elem in tmp:
        score = 0
        res = db.query(models.ResultContest).filter(models.ResultContest.contest_id == contest_id).filter(models.ResultContest.user_id == elem.id).all()
        for bloc in res:
            x = db.query(models.BlocContest).filter(models.BlocContest.id == bloc.bloc_id).first()
            score += 250
        elem.score = score
        db.commit()

def compute_score_voie(db: Session, contest_id: int):
    tmp = db.query(models.UserContest).filter(models.UserContest.contest_id == contest_id).all()
    for elem in tmp:
        score = 0
        res = db.query(models.ResultContestVoie).filter(models.ResultContestVoie.contest_id == contest_id).filter(models.ResultContestVoie.user_id == elem.id).join(models.VoieContest).order_by(models.VoieContest.difficulty).all()
        for voie in res[-3:]:
            x = db.query(models.VoieContest).filter(models.VoieContest.id == voie.voie_id).first()
            score += 500 + 100 * (x.difficulty - 1)
        if len(res[-3:]) == 3 and res[-3] == 11:
            score = 5000
        elem.score_voie = score
        db.commit()

def post_contest_bloc_res(db: Session, contest_id: int, user_id: int, bloc_id: int):
    tmp = db.query(models.ResultContest).filter(models.ResultContest.contest_id == contest_id).filter(models.ResultContest.user_id == user_id).filter(models.ResultContest.bloc_id == bloc_id).first()
    if tmp:
        db.query(models.ResultContest).filter(models.ResultContest.contest_id == contest_id).filter(models.ResultContest.user_id == user_id).filter(models.ResultContest.bloc_id == bloc_id).delete()
        db.query(models.BlocContest).filter(models.BlocContest.id == bloc_id).update({'top': models.BlocContest.top - 1})
    else:
        db.add(models.ResultContest(contest_id=contest_id, bloc_id=bloc_id, user_id=user_id))
        db.query(models.BlocContest).filter(models.BlocContest.id == bloc_id).update({'top': models.BlocContest.top + 1})
    db.commit()
    compute_score(db, contest_id)
    return True

def post_contest_voie_res(db: Session, contest_id: int, user_id: int, voie_id: int):
    tmp = db.query(models.ResultContestVoie).filter(models.ResultContestVoie.contest_id == contest_id).filter(models.ResultContestVoie.user_id == user_id).filter(models.ResultContestVoie.voie_id == voie_id).first()
    if tmp:
        db.query(models.ResultContestVoie).filter(models.ResultContestVoie.contest_id == contest_id).filter(models.ResultContestVoie.user_id == user_id).filter(models.ResultContestVoie.voie_id == voie_id).delete()
        db.query(models.VoieContest).filter(models.VoieContest.id == voie_id).update({'top': models.VoieContest.top - 1})
    else:
        db.add(models.ResultContestVoie(contest_id=contest_id, voie_id=voie_id, user_id=user_id))
        db.query(models.VoieContest).filter(models.VoieContest.id == voie_id).update({'top': models.VoieContest.top + 1})
    db.commit()
    compute_score_voie(db, contest_id)
    return True


def post_contest_speed_res(db: Session, contest_id: int, user_id: int, time: float):
    tmp = db.query(models.ResultSpeedContest).filter(models.ResultSpeedContest.contest_id == contest_id).filter(models.ResultSpeedContest.user_id == user_id).first()
    if tmp:
        db.query(models.ResultSpeedContest).filter(models.ResultSpeedContest.id == tmp.id).update({'time': time})
    else:
        db.add(models.ResultSpeedContest(contest_id=contest_id, time=time, user_id=user_id))
    db.commit()
    return True

def get_contest_speed(db: Session, contest_id: int, user_id: int):
    tmp = db.query(models.ResultSpeedContest).filter(models.ResultSpeedContest.contest_id == contest_id).filter(models.ResultSpeedContest.user_id == user_id).first()
    return tmp.time if tmp else -1

def get_contest_classement(db: Session, contest_id: int):
    tmp = db.query(models.UserContest).filter(models.UserContest.contest_id == contest_id).order_by(models.UserContest.score.desc()).all()
    return tmp

def get_contest_speed_res(db: Session, contest_id: int):
    tmp = db.query(models.ResultSpeedContest).filter(models.ResultSpeedContest.contest_id == contest_id).order_by(models.ResultSpeedContest.time.asc()).all()
    return tmp

def get_contest_user_speed_classement(db: Session, contest_id: int, user_id: int):
    user = db.query(models.UserContest).filter(models.UserContest.id == user_id).first()
    users = [x[0] for x in db.query(models.UserContest.id).filter(models.UserContest.contest_id == contest_id).filter(models.UserContest.age == user.age).all()]
    tmp = db.query(models.ResultSpeedContest).filter(models.ResultSpeedContest.contest_id == contest_id).filter(models.ResultSpeedContest.user_id.in_(users)).order_by(models.ResultSpeedContest.time.asc()).all()
    i = 1
    for x in tmp:
        if x.user_id == user_id:
            break
        i += 1
    return i

def get_speed_contest_top(db: Session, contest_id: int):
    tmp = db.query(models.ResultSpeedContest).filter(models.ResultSpeedContest.contest_id == contest_id).order_by(models.ResultSpeedContest.time.asc()).all()
    return tmp

def get_contest_top(db: Session, contest_id: int):
    tmp = db.query(models.UserContest).filter(models.UserContest.contest_id == contest_id).order_by(models.UserContest.score.desc()).limit(5).all()
    return tmp

def get_contest_user_classement(db: Session, contest_id: int, user_id: int):
    user = db.query(models.UserContest).filter(models.UserContest.id == user_id).first()
    tmp = db.query(models.UserContest).filter(models.UserContest.contest_id == contest_id).filter(models.UserContest.difficulty == user.difficulty).order_by(models.UserContest.score.desc()).all()
    i = 1
    for x in tmp:
        if x.id == user_id:
            break
        i += 1
    return i
