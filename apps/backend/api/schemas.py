from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, model_validator


class Schema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserSignUp(Schema):
    email: str
    password: str
    group_id: Optional[int] = None
    new_group_name: Optional[str] = None

    @model_validator(mode="after")
    def validate_group_choice(self):
        if self.group_id is not None and self.new_group_name:
            raise ValueError("Choisissez un groupe existant ou créez-en un nouveau, pas les deux.")
        if self.new_group_name is not None:
            self.new_group_name = self.new_group_name.strip()
            if not self.new_group_name:
                raise ValueError("Le nom du nouveau groupe ne peut pas être vide.")
        return self


class UserGroup(Schema):
    id: int
    name: str


class UserGroupName(Schema):
    name: str


class UserGroupAssign(Schema):
    group_id: Optional[int] = None


class User(Schema):
    id: Optional[int] = None
    name: str
    surname: str
    email: str
    role_id: int
    group_id: Optional[int] = None
    group: Optional[UserGroup] = None


class Token(Schema):
    access_token: str
    token_type: str


class TokenData(Schema):
    email: Optional[str] = None


class Status(Schema):
    status: bool


class Password(Schema):
    password: str


class Seance(Schema):
    id: Optional[int] = None
    start: datetime
    end: datetime
    max_people: int


class ProgressionPoint(Schema):
    period: date
    sessions: int
    attempts: int
    tops: int
    max_level: float
    lead_ratio: float


class VersionVoie(Schema):
    id: Optional[int] = None
    date: datetime
    end_date: Optional[datetime] = None
    active: bool = False
    parent_version_id: Optional[int] = None
    subversion: int = 0


class VersionVoiePeriod(Schema):
    date: datetime
    end_date: Optional[datetime] = None

    @model_validator(mode="after")
    def validate_period(self):
        if self.end_date is not None and self.end_date <= self.date:
            raise ValueError("La date de fin doit être postérieure à la date de début.")
        return self


class CouloirType(Schema):
    name: str


class Couloir(Schema):
    type: CouloirType


class Dashboard(Schema):
    max_lvl: float
    tete_ratio: float
    coverage: float
    coverage_dalle: float
    coverage_devers: float
    coverage_diedre: float
    coverage_9m: float
    nbr_of_seances: int
    suggestions: List['RouteSuggestion']


class RouteSuggestion(Schema):
    voie_id: int
    couloir_id: int
    color: str
    difficulty: float
    reason: str
    last_attempt: Optional[datetime] = None


class Voie(Schema):
    id: Optional[int] = None
    couloir: Optional[Couloir] = None
    couloir_id: int
    color: str
    difficulty: float
    versionvoie_id: int


class WallGradeStat(Schema):
    difficulty: float
    count: int


class WallLaneStat(Schema):
    lane: int
    count: int


class WallTopRoute(Schema):
    route_id: int
    couloir_id: int
    color: str
    difficulty: float
    climbs: int
    tops: int
    success_rate: int


class WallAnalysis(Schema):
    version_id: int
    total_routes: int
    equipped_lanes: int
    average_difficulty: float
    lowest_difficulty: float
    highest_difficulty: float
    climbs: int
    tops: int
    unique_climbed_routes: int
    grade_distribution: List[WallGradeStat]
    lane_distribution: List[WallLaneStat]
    top_routes: List[WallTopRoute]


class CrenauType(Schema):
    id: Optional[int] = None
    name: str


class Crenau(Schema):
    id: Optional[int] = None
    cron: str
    type_id: int


class UserSeance(Schema):
    id: Optional[int] = None
    date: date
    voie_id: int
    en_tete: bool
    top: int
    pause: int
    voie: Optional[Voie] = None


class VoieHistory(Schema):
    voie: Voie
    total_attempts: int
    total_tops: int
    sessions: List[UserSeance]


class Contest(Schema):
    id: Optional[int] = None
    name: str


class ZoneContest(Schema):
    id: Optional[int] = None
    name: str
    contest_id: int


class BlocContest(Schema):
    id: Optional[int] = None
    contest_id: int
    zone_id: int
    name: str
    top: int
    difficulty: int


class VoieContest(Schema):
    id: Optional[int] = None
    contest_id: int
    zone_id: int
    name: str
    top: int
    difficulty: int


class UserContest(Schema):
    id: Optional[int] = None
    contest_id: int
    name: str
    score: int
    score_voie: int
    difficulty: int
    age: int


class ResultContest(Schema):
    id: Optional[int] = None
    contest_id: int
    bloc_id: int
    user_id: int


class ResultContestVoie(Schema):
    id: Optional[int] = None
    contest_id: int
    voie_id: int
    user_id: int


class ResultSpeedContest(Schema):
    id: Optional[int] = None
    contest_id: int
    time: float
    user_id: int
