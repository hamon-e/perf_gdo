import pandas as pd
import os
import datetime
import traceback

from . import models, schemas, crud

from typing import List
from sqlalchemy.orm import Session
from .db import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
db = SessionLocal()

role = models.UserRole(id=0, name='admin')
db.add(role)
db.commit()
role = models.UserRole(id=1, name='basic')
db.add(role)
db.commit()

user = models.User(name='Admin', surname='Admin', pwd_hash=crud.get_password_hash('qwerty'), email='admin@gmail.com', role_id=0)
db.add(user)
db.commit()

seance = models.Seance(start='2022-10-09T13:00', end='2022-10-09T13:00', max_people=50)
db.add(seance)
db.commit()

seance = models.Seance(start='2022-10-10T18:00', end='2022-10-10T20:00', max_people=50)
db.add(seance)
seance = models.Seance(start='2022-10-10T20:00', end='2022-10-10T22:00', max_people=50)
db.add(seance)
seance = models.Seance(start='2022-10-12T20:00', end='2022-10-12T22:00', max_people=50)
db.add(seance)
seance = models.Seance(start='2022-10-15T11:00', end='2022-10-15T13:00', max_people=50)
db.add(seance)

versionvoie = models.VersionVoie(id=0, date='2022-09-01T00:00')
db.add(versionvoie)
db.commit()

couloir_type_plexi = models.CouloirType(name='Plexi+toit')
db.add(couloir_type_plexi)
couloir_type_verrin_gauche = models.CouloirType(name='Verrin Gauche')
db.add(couloir_type_verrin_gauche)
couloir_type_devers = models.CouloirType(name='Devers')
db.add(couloir_type_devers)
couloir_type_verrin_droite = models.CouloirType(name='Verrin Droite')
db.add(couloir_type_verrin_droite)
couloir_type_dalle = models.CouloirType(name='Dalle')
db.add(couloir_type_dalle)
couloir_type_9m = models.CouloirType(name='9m')
db.add(couloir_type_9m)
db.commit()

for i in range(1, 4):
    tmp = models.Couloir(id=i, type_id=couloir_type_plexi.id)
    db.add(tmp)
for i in range(4, 9):
    tmp = models.Couloir(id=i, type_id=couloir_type_verrin_gauche.id)
    db.add(tmp)
for i in range(9, 20):
    tmp = models.Couloir(id=i, type_id=couloir_type_devers.id)
    db.add(tmp)
for i in range(20, 23):
    tmp = models.Couloir(id=i, type_id=couloir_type_verrin_droite.id)
    db.add(tmp)
for i in range(23, 28):
    tmp = models.Couloir(id=i, type_id=couloir_type_dalle.id)
    db.add(tmp)
for i in range(28, 32):
    tmp = models.Couloir(id=i, type_id=couloir_type_9m.id)
    db.add(tmp)
db.commit()

# voie = models.Voie(versionvoie_id=versionvoie.id, couloir_id=1, difficulty=5.60, color='#386DFA')
# voie = models.Voie(versionvoie_id=versionvoie.id, couloir_id=1, difficulty=5.85, color='#FEF154')
# voie = models.Voie(versionvoie_id=versionvoie.id, couloir_id=1, difficulty=7.35, color='#000000')


