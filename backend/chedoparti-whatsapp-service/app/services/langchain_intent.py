from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.config import settings
from app.models import ReservationIntent

llm = ChatOpenAI(
    api_key=settings.openai_api_key,
    model=settings.openai_model,
    temperature=0.1,
)

parser = PydanticOutputParser(pydantic_object=ReservationIntent)

prompt = ChatPromptTemplate.from_template(
    """Sos un asistente para reservas deportivas.

Extraé SI PODÉS los siguientes campos del mensaje del usuario:
- institution_query: nombre del club o zona (string)
- sport: deporte (ej: "Padel", "Tenis")
- date: fecha en formato ISO (YYYY-MM-DD) si es inferible
- time: hora en formato 24h HH:MM si es inferible
- duration: duración en HH:MM (si no, null)

Si no podés determinar un campo con seguridad, dejalo en null.

Devolvé SOLO JSON válido con este formato:
{format_instructions}

Mensaje del usuario:
"{user_message}"
"""
).partial(format_instructions=parser.get_format_instructions())

async def extract_intent(user_message: str) -> ReservationIntent:
    chain = prompt | llm | parser
    result: ReservationIntent = await chain.ainvoke({"user_message": user_message})
    return result
