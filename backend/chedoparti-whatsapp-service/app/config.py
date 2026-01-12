from pydantic import BaseModel
import os

class Settings(BaseModel):
    whatsapp_verify_token: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "changeme")
    whatsapp_access_token: str = os.getenv("WHATSAPP_ACCESS_TOKEN", "changeme")
    whatsapp_phone_number_id: str = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "changeme")

    redis_host: str = os.getenv("REDIS_HOST", "redis")
    redis_port: int = int(os.getenv("REDIS_PORT", "6379"))
    redis_db: int = int(os.getenv("REDIS_DB", "0"))

    api_gateway_url: str = os.getenv("API_GATEWAY_URL", "http://api-gateway:8989")

    openai_api_key: str = os.getenv("OPENAI_API_KEY", "changeme")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

settings = Settings()
