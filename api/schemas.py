from typing import List, Optional

from pydantic import BaseModel
from fastapi import UploadFile
from datetime import date, datetime

class User(BaseModel):
    id: Optional[int]
    name: str
    surname: str
    email: str

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Status(BaseModel):
    status: bool

class Password(BaseModel):
    password: str

class Seance(BaseModel):
    start: datetime
    end: datetime
    max_people: int

    class Config:
        orm_mode = True

class VersionVoie(BaseModel):
    id: int
    date: datetime

    class Config:
        orm_mode = True

class CouloirType(BaseModel):
    name: str

    class Config:
        orm_mode = True

class Couloir(BaseModel):
    type = CouloirType

    class Config:
        orm_mode = True

class Voie(BaseModel):
    id: Optional[int]
    couloir: Optional[Couloir]
    couloir_id: int
    color: str
    difficulty: float
    versionvoie_id: int

    class Config:
        orm_mode = True

class CrenauType(BaseModel):
    id: Optional[int]
    name: str

    class Config:
        orm_mode = True

class Crenau(BaseModel):
    id: Optional[int]
    cron: str
    type_id: int

    class Config:
        orm_mode = True

