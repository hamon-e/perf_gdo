from . import models, schemas, crud

from typing import List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date

import numpy as np


access_token_expires = timedelta(days=1000)
access_token = crud.create_access_token(
    data={"sub": "borne4@sanofi"}, expires_delta=access_token_expires
)
print(access_token)
