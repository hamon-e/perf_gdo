from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects import postgresql

from .db import Base

class SeanceSubscription(Base):
    __tablename__ = "seancesubscription"

    id = Column(Integer, primary_key=True, index=True)
    seance_id = Column(Integer, ForeignKey('seance.id'))
    user_id = Column(Integer, ForeignKey('user.id'))

class Subscription(Base):
    __tablename__ = "subscription"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    surname = Column(String)
    pwd_hash = Column(String)
    email = Column(String, unique=True)

    subscription_id = Column(Integer, ForeignKey("subscription.id"))
    status_id = Column(Integer, ForeignKey("userstatus.id"))
    role_id = Column(Integer, ForeignKey("userrole.id"))

class UserStatus(Base):
    __tablename__ = "userstatus"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class UserRole(Base):
    __tablename__ = "userrole"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)


class Seance(Base):
    __tablename__ = "seance"

    id = Column(Integer, primary_key=True, index=True)
    start = Column(DateTime)
    end = Column(DateTime)
    max_people = Column(Integer)

    subscription_id = Column(Integer, ForeignKey('subscription.id'))

class VersionVoie(Base):
    __tablename__ = "versionvoie"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)

class CouloirType(Base):
    __tablename__ = "couloirtype"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class Couloir(Base):
    __tablename__ = "couloir"

    id = Column(Integer, primary_key=True, index=True)
    type_id = Column(Integer, ForeignKey('couloirtype.id'))
    type = relationship('CouloirType')

class Voie(Base):
    __tablename__ = "voie"

    id = Column(Integer, primary_key=True, index=True)
    couloir_id = Column(Integer, ForeignKey('couloir.id'))
    couloir = relationship("Couloir")
    color = Column(String)
    difficulty = Column(Float)
    active = Column(Boolean)

    versionvoie_id = Column(Integer, ForeignKey("versionvoie.id"))

class UserSeance(Base):
    __tablename__ = "userseance"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    user_id = Column(Integer, ForeignKey("user.id"))
    voie_id = Column(Integer, ForeignKey("voie.id"))
    voie = relationship('Voie')
    en_tete = Column(Boolean)
    top = Column(Integer)
    pause = Column(Integer)

class CrenauType(Base):
    __tablename__ = "crenautype"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class Crenau(Base):
    __tablename__ = "crenau"

    id = Column(Integer, primary_key=True, index=True)
    type_id = Column(Integer, ForeignKey("crenautype.id"))
    cron = Column(String)

class Contest(Base):
    __tablename__ = "contest"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class ZoneContest(Base):
    __tablename__ = "zonecontest"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contest.id"))
    name = Column(String)

class BlocContest(Base):
    __tablename__ = "bloccontest"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contest.id"))
    zone_id = Column(Integer, ForeignKey("zonecontest.id"))
    name = Column(String)
    top = Column(Integer)
    difficulty = Column(Integer)

class VoieContest(Base):
    __tablename__ = "voiecontest"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contest.id"))
    zone_id = Column(Integer, ForeignKey("zonecontest.id"))
    name = Column(String)
    top = Column(Integer)
    difficulty = Column(Integer)


class UserContest(Base):
    __tablename__ = "usercontest"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contest.id"))
    name = Column(String)
    score = Column(Integer)
    score_voie = Column(Integer)
    age = Column(Integer)
    difficulty = Column(Integer)

class ResultContest(Base):
    __tablename__ = "resultcontest"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contest.id"))
    bloc_id = Column(Integer, ForeignKey("bloccontest.id"))
    user_id = Column(Integer, ForeignKey("usercontest.id"))

class ResultContestVoie(Base):
    __tablename__ = "resultcontestvoie"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contest.id"))
    voie_id = Column(Integer, ForeignKey("voiecontest.id"))
    user_id = Column(Integer, ForeignKey("usercontest.id"))

class ResultSpeedContest(Base):
    __tablename__ = "speedresultcontest"

    id = Column(Integer, primary_key=True, index=True)
    contest_id = Column(Integer, ForeignKey("contest.id"))
    user_id = Column(Integer, ForeignKey("usercontest.id"))
    time = Column(Float)
