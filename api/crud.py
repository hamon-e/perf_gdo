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

def get_seances(db: Session, current_user: schemas.User, start: date, end: date):
    print(db.query(models.Seance).filter(models.Seance.start >= start).filter(models.Seance.start <= end).all())
    return db.query(models.Seance).filter(models.Seance.start >= start).filter(models.Seance.start <= end).all()

def get_versionvoie(db: Session, current_user: schemas.User):
    return db.query(models.VersionVoie).order_by(models.VersionVoie.date).all()

def get_voies(db: Session, current_user: schemas.User, version_id: int):
    if version_id == -1:
        version_id = db.query(models.VersionVoie).order_by(models.VersionVoie.date.desc()).first().id
    return db.query(models.Voie).filter(models.Voie.versionvoie_id == version_id).order_by(models.Voie.difficulty).order_by(models.Voie.couloir_id).all()

def post_voie(db: Session, current_user: schemas.User, voie: schemas.Voie):
    tmp = voie.dict()
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
