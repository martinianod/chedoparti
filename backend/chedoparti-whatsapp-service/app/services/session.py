import json
import redis
from app.config import settings
from app.models import SessionState, ReservationSlots

_redis = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    db=settings.redis_db,
    decode_responses=True,
)

PREFIX = "session:whatsapp:"

def load_session(wa_id: str) -> SessionState:
    data = _redis.get(PREFIX + wa_id)
    if not data:
        return SessionState()
    raw = json.loads(data)
    return SessionState(
        state=raw.get("state", "START"),
        slots=ReservationSlots(**raw.get("slots", {})),
    )

def save_session(wa_id: str, session: SessionState):
    _redis.set(PREFIX + wa_id, session.model_dump_json(), ex=60 * 60 * 4)

def reset_session(wa_id: str):
    _redis.delete(PREFIX + wa_id)
