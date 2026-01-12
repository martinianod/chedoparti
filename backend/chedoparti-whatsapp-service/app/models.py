from pydantic import BaseModel
from typing import Optional

class ReservationSlots(BaseModel):
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None
    sport: Optional[str] = None
    date: Optional[str] = None       # YYYY-MM-DD
    time: Optional[str] = None       # HH:MM 24h
    duration: str = "01:00"
    players: int = 4
    user_id: Optional[str] = None

class SessionState(BaseModel):
    state: str = "START"
    slots: ReservationSlots = ReservationSlots()

class ReservationIntent(BaseModel):
    institution_query: Optional[str] = None
    sport: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    duration: Optional[str] = None
