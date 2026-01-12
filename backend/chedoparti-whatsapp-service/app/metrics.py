from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST

# Mensajes entrantes/salientes en WhatsApp
WHATSAPP_MESSAGES = Counter(
    "chedoparti_whatsapp_messages_total",
    "Total de mensajes procesados por el bot de WhatsApp",
    ["direction"],
)

# Reservas confirmadas vía WhatsApp
WHATSAPP_RESERVATIONS = Counter(
    "chedoparti_whatsapp_reservations_total",
    "Total de reservas confirmadas vía WhatsApp",
)

def prometheus_app():
    from fastapi import APIRouter, Response

    router = APIRouter()

    @router.get("/metrics")
    async def metrics():
        data = generate_latest()
        return Response(content=data, media_type=CONTENT_TYPE_LATEST)

    return router
