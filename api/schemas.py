from typing import List, Optional

from pydantic import BaseModel
from fastapi import UploadFile
from datetime import date, datetime

class UserSignUp(BaseModel):
    email: str
    password: str

    class Config:
        orm_mode = True

class User(BaseModel):
    id: Optional[int]
    name: str
    surname: str
    email: str
    role_id: int

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
    id: Optional[int]
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

class Dashboard(BaseModel):
    max_lvl: float
    tete_ratio: float
    coverage: float
    coverage_dalle: float
    coverage_devers: float
    coverage_diedre: float
    coverage_9m: float
    nbr_of_seances: int

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

class UserSeance(BaseModel):
    id: Optional[int]
    date: date
    voie_id: int
    en_tete: bool
    top: int
    pause: int
    voie: Optional[Voie]

    class Config:
        orm_mode = True

class Contest(BaseModel):
    id: Optional[int]
    name: str

    class Config:
        orm_mode = True

class ZoneContest(BaseModel):
    id: Optional[int]
    name: str
    contest_id: int

    class Config:
        orm_mode = True

class BlocContest(BaseModel):
    id: Optional[int]
    contest_id: int
    zone_id: int
    name: str
    top: int
    difficulty: int

    class Config:
        orm_mode = True

class VoieContest(BaseModel):
    id: Optional[int]
    contest_id: int
    zone_id: int
    name: str
    top: int
    difficulty: int

    class Config:
        orm_mode = True

class UserContest(BaseModel):
    id: Optional[int]
    contest_id: int
    name: str
    score: int
    score_voie: int
    difficulty: int
    age: int

    class Config:
        orm_mode = True

class ResultContest(BaseModel):
    id: Optional[int]
    contest_id: int
    bloc_id: int
    user_id: int

    class Config:
        orm_mode = True

class ResultContestVoie(BaseModel):
    id: Optional[int]
    contest_id: int
    voie_id: int
    user_id: int

    class Config:
        orm_mode = True


class ResultSpeedContest(BaseModel):
    id: Optional[int]
    contest_id: int
    time: float
    user_id: int

    class Config:
        orm_mode = True
