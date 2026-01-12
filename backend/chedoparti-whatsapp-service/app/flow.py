from app.models import SessionState, ReservationSlots
from app.services.langchain_intent import extract_intent
from app.services.chedoparti_api import (
    search_institution,
    check_availability,
    create_reservation,
    find_or_create_user,
    create_payment_link,
)
from app import metrics

def merge_slots(slots: ReservationSlots, intent):
    # Merge simple: si intent trae algo y slot está vacío, lo rellenamos
    for field in ["sport", "date", "time", "duration"]:
        value = getattr(intent, field, None)
        if value and not getattr(slots, field):
            setattr(slots, field, value)
    return slots

async def resolve_institution(slots: ReservationSlots, institution_query: str) -> ReservationSlots:
    if not institution_query:
        return slots
    results = await search_institution(institution_query)
    if not results:
        return slots
    inst = results[0]
    slots.institution_id = str(inst.get("id"))
    slots.institution_name = inst.get("name")
    return slots

async def suggest_times(slots: ReservationSlots) -> str:
    if not (slots.institution_id and slots.date and slots.sport):
        return "Necesito el club, el deporte y la fecha para sugerir horarios."
    availability = await check_availability(
        institution_id=slots.institution_id,
        date=slots.date,
        sport=slots.sport,
    )
    times = availability.get("availableTimes", [])
    if not times:
        return "No encontré horarios disponibles para ese día. ¿Querés probar con otra fecha?"
    times_str = ", ".join(times[:6])
    return f"Estos horarios están disponibles: {times_str}. ¿Cuál te queda mejor?"

async def build_confirmation_message(slots: ReservationSlots) -> str:
    return (
        f"Perfecto, te resumo la reserva:\n"
        f"🏟️ Club: {slots.institution_name}\n"
        f"🏓 Deporte: {slots.sport}\n"
        f"📅 Día: {slots.date}\n"
        f"⏰ Hora: {slots.time}\n"
        f"⏱️ Duración: {slots.duration}\n\n"
        f"¿Confirmás la reserva? (Respondé 'sí' para confirmar)"
    )

async def handle_message_logic(wa_id: str, text: str, session: SessionState):
    slots = session.slots

    # Vincular usuario por número de WhatsApp
    if not slots.user_id:
        slots.user_id = await find_or_create_user(wa_id)

    # Intent / slots desde IA
    intent = await extract_intent(text)
    slots = merge_slots(slots, intent)

    state = session.state

    if state == "START":
        state = "ASK_INSTITUTION"
        reply = "¡Hola! Soy el asistente de reservas de CheDoparti 🏟️\n¿En qué club querés jugar?"

    elif state == "ASK_INSTITUTION":
        slots = await resolve_institution(slots, intent.institution_query or text)
        if not slots.institution_id:
            reply = "No encontré el club. ¿Me repetís el nombre o la zona?"
        else:
            state = "ASK_SPORT"
            reply = f"Perfecto, {slots.institution_name}. ¿Qué deporte querés jugar? (Ej: Padel, Tenis)"

    elif state == "ASK_SPORT":
        if not slots.sport:
            reply = "¿Qué deporte querés jugar? (Ej: Padel, Tenis)"
        else:
            state = "ASK_DATE"
            reply = "¿Para qué día querés reservar? (Ej: mañana, jueves, 20/11)"

    elif state == "ASK_DATE":
        if not slots.date:
            reply = "¿Para qué día querés reservar? (Ej: mañana, jueves, 20/11)"
        else:
            state = "ASK_TIME"
            reply = await suggest_times(slots)

    elif state == "ASK_TIME":
        if not slots.time:
            reply = "Decime qué horario preferís dentro de los disponibles."
        else:
            state = "CONFIRM_RESERVATION"
            reply = await build_confirmation_message(slots)

    elif state == "CONFIRM_RESERVATION":
        if text.strip().lower() in ["si", "sí", "ok", "dale", "confirmo", "confirmar"]:
            # Crear reserva en reservation-service
            reservation_resp = await create_reservation(slots.model_dump())
            metrics.WHATSAPP_RESERVATIONS.inc()

            reservation_id = str(reservation_resp.get("id", ""))
            payment_url = ""
            try:
                if reservation_id:
                    payment_url = await create_payment_link(reservation_id)
            except Exception:
                payment_url = ""

            if payment_url:
                reply = (
                    "Reserva confirmada ✅\n"
                    "Si querés pagar ahora, usá este enlace:\n"
                    f"{payment_url}\n"
                    "¡Buen partido! 💪"
                )
            else:
                reply = "Reserva confirmada ✅ ¡Buen partido! 💪"

            state = "DONE"
        else:
            state = "ASK_TIME"
            reply = "No se confirmó la reserva. Podés indicarme otro horario entre los disponibles."

    else:  # DONE u otro
        if "nueva" in text.lower():
            state = "ASK_INSTITUTION"
            slots = ReservationSlots()
            reply = "Genial, arrancamos otra reserva. ¿En qué club querés jugar?"
        else:
            reply = "Si querés hacer una nueva reserva, escribí 'nueva reserva'."

    session.state = state
    session.slots = slots
    return reply, session
