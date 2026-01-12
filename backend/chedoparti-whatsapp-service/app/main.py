from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
import httpx

from app.config import settings
from app.services.session import load_session, save_session
from app.flow import handle_message_logic
from app import metrics

app = FastAPI(title="Chedoparti WhatsApp Service")

# Registrar ruta /metrics
app.include_router(metrics.prometheus_app())

@app.get("/health")
async def health():
    return {"status": "UP", "service": "whatsapp-service"}

@app.get("/whatsapp/webhook")
async def verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        return int(hub_challenge)
    return JSONResponse(status_code=403, content={"status": "error", "message": "Invalid verify token"})

def extract_from_whatsapp(payload: dict):
    try:
        entry = payload["entry"][0]
        changes = entry["changes"][0]
        value = changes["value"]
        messages = value.get("messages", [])
        if not messages:
            return None, None
        msg = messages[0]
        wa_id = msg["from"]
        text = msg.get("text", {}).get("body", "")
        return wa_id, text
    except Exception:
        return None, None

async def send_whatsapp_message(wa_id: str, text: str):
    url = f"https://graph.facebook.com/v20.0/{settings.whatsapp_phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {settings.whatsapp_access_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": wa_id,
        "type": "text",
        "text": {"body": text},
    }
    async with httpx.AsyncClient(timeout=5.0) as client:
        await client.post(url, headers=headers, json=payload)

@app.post("/whatsapp/webhook")
async def whatsapp_webhook(request: Request):
    body = await request.json()

    wa_id, text = extract_from_whatsapp(body)
    if not wa_id or not text:
        return {"status": "ignored"}

    # Métrica de mensaje entrante
    metrics.WHATSAPP_MESSAGES.labels(direction="in").inc()

    session = load_session(wa_id)

    reply_text, updated_session = await handle_message_logic(wa_id, text, session)

    save_session(wa_id, updated_session)

    # Métrica de mensaje saliente
    metrics.WHATSAPP_MESSAGES.labels(direction="out").inc()

    await send_whatsapp_message(wa_id, reply_text)

    return {"status": "ok"}
