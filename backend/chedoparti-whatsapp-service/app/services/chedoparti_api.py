import httpx
from app.config import settings

async def search_institution(query: str):
    url = f"{settings.api_gateway_url}/api/institution/search"
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url, params={"q": query})
        resp.raise_for_status()
        return resp.json()

async def check_availability(institution_id: str, date: str, sport: str):
    url = f"{settings.api_gateway_url}/api/reservation/availability"
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(
            url,
            params={"institutionId": institution_id, "date": date, "sport": sport},
        )
        resp.raise_for_status()
        return resp.json()

async def create_reservation(payload: dict):
    url = f"{settings.api_gateway_url}/api/reservation"
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()

async def find_or_create_user(wa_id: str) -> str:
    """Busca o crea un usuario en el user-service basado en el número de WhatsApp."""
    url = f"{settings.api_gateway_url}/api/auth/whatsapp-login"
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(url, json={"phone": wa_id})
        resp.raise_for_status()
        data = resp.json()
        return data["userId"]

async def create_payment_link(reservation_id: str) -> str:
    """Solicita al payment-service un link de pago asociado a la reserva."""
    url = f"{settings.api_gateway_url}/api/payment/whatsapp-link"
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.post(url, json={"reservationId": reservation_id})
        resp.raise_for_status()
        data = resp.json()
        return data.get("paymentUrl", "")
