from typing import List
from datetime import datetime, timedelta, date

import traceback

from starlette.datastructures import MutableHeaders
from fastapi import Depends, FastAPI, HTTPException, status, UploadFile, File, Request, APIRouter, Response, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from typing import Callable,  Tuple

from fastapi.responses import PlainTextResponse


from sqlalchemy.orm import Session

from . import crud, models, schemas
from .db import SessionLocal, engine

from fastapi.security import OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordBearer

from typing import List, Optional

models.Base.metadata.create_all(bind=engine)

class ContextIncludedRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            print(request.headers)
            if request.headers.get('X-Trayvisor-Token'):
                id_header = ("authorization".encode(), str("bearer " + request.headers['X-Trayvisor-Token']).encode())
                request.headers.__dict__["_list"].append(id_header)
            response = await original_route_handler(request)
            return response
        return custom_route_handler

app = FastAPI()
router = APIRouter(route_class=ContextIncludedRoute)

origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACCESS_TOKEN_EXPIRE_MINUTES = 60*24*30

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

@router.get("/")
async def root():
    return {"message": "Hello World"}

@router.post("/signup", response_model=bool)
async def signup(user_info: schemas.UserSignUp, db: Session = Depends(get_db)):
    crud.signup(db, user_info)
    return True

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

@router.get("/seances", response_model=List[schemas.Seance])
async def get_seances(start: datetime, end: datetime, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    seances = crud.get_seances(db, current_user, start, end)
    return seances

@router.get("/versionvoie", response_model=List[schemas.VersionVoie])
async def get_versionvoie(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    versionvoie = crud.get_versionvoie(db, current_user)
    return versionvoie

@router.get("/voies", response_model=List[schemas.Voie])
async def get_voies(version_id: int = -1, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    versionvoie = crud.get_voies(db, current_user, version_id)
    return versionvoie

@router.post("/voie", response_model=bool)
async def post_voie(voie: schemas.Voie, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.post_voie(db, current_user, voie)
    return True

@router.delete("/voie", response_model=bool)
async def delete_voie(id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.delete_voie(db, current_user, id)
    return True

@router.get("/crenautype", response_model=List[schemas.CrenauType])
async def get_crenautype(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crenautype = crud.get_crenautype(db, current_user)
    return crenautype

@router.post("/crenautype", response_model=bool)
async def post_crenautype(crenautype: schemas.CrenauType, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.post_crenautype(db, current_user, crenautype)
    return True

@router.get("/crenaux", response_model=List[schemas.Crenau])
async def get_crenaux(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crenaux = crud.get_crenaux(db, current_user)
    return crenaux

@router.post("/crenau", response_model=List[schemas.Crenau])
async def post_crenau(crenau: schemas.Crenau, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.post_crenau(db, current_user, crenau)
    return True

@router.get("/userseance", response_model=List[schemas.UserSeance])
async def get_userseance(date: date, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_userseance(db, current_user, date)

@router.get("/palmares", response_model=List[int])
async def get_palmares(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_palmares(db, current_user)

@router.get("/userseance_days", response_model=List[datetime])
async def get_userseance_days(date: date, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    tmp = crud.get_userseance_days(db, current_user, date)
    print(tmp)
    return tmp

@router.post("/userseance", response_model=bool)
async def post_userseance(userseance: schemas.UserSeance, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.post_userseance(db, current_user, userseance)
    return True

@router.delete("/userseance", response_model=bool)
async def delete_userseance(userseance_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.delete_userseance(db, current_user, userseance_id)
    return True

app.include_router(router)
