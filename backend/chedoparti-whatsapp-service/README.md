# chedoparti-whatsapp-service

Microservicio encargado de integrar **WhatsApp Business Cloud API** con el ecosistema **CheDoparti**, permitiendo que los usuarios realicen reservas de canchas directamente desde WhatsApp mediante un bot conversacional con IA (LangChain).

## 🚀 Objetivo

- Permitir **reservas de canchas** vía WhatsApp, sin necesidad de usar la app web o móvil.
- Centralizar la lógica conversacional en un servicio dedicado (FastAPI + LangChain).
- Mantener la **lógica de negocio crítica** (disponibilidad, reservas, usuarios, pagos) en los microservicios existentes de CheDoparti (Spring Boot).
- Exponer métricas Prometheus para monitoreo y dashboards (Grafana).

## 🧱 Arquitectura

- **FastAPI**: expone el webhook `/whatsapp/webhook` para recibir y responder mensajes.
- **LangChain**: interpreta el lenguaje natural del usuario y extrae datos relevantes (club, fecha, hora, deporte, etc.).
- **Redis**: almacena el estado de la conversación por usuario (state machine).
- **API Gateway**: todos los accesos a user-service, institution-service, reservation-service y payment-service se hacen a través del gateway.
- **WhatsApp Business Cloud API**: canal de mensajería oficial de Meta.
- **Prometheus**: consumo de métricas vía `/metrics`.

Diagrama simplificado:

```text
Usuario WhatsApp
      ↓
WhatsApp Cloud API
      ↓ (webhook)
whatsapp-service (FastAPI + LangChain + Redis)
      ↓
API Gateway (Spring Cloud)
  ↓        ↓           ↓           ↓
user    institution  reservation  payment
```

## 🗂️ Estructura del proyecto

```text
app/
  __init__.py
  main.py                # FastAPI app + webhooks + métricas
  config.py              # configuración (env vars)
  models.py              # Pydantic models (slots, sesión, intent)
  flow.py                # lógica de flujo conversacional (state machine)
  metrics.py             # contadores Prometheus
  services/
    __init__.py
    session.py           # manejo de sesiones en Redis
    langchain_intent.py  # integración con LangChain para extracción de intent
    chedoparti_api.py    # integración con API Gateway / microservicios
db/
  migration/
    V50__add_whatsapp_columns.sql  # Flyway para user-service
requirements.txt
Dockerfile
chedoparti-whatsapp-service.postman_collection.json
```

## ⚙️ Configuración

Variables de entorno:

```bash
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

API_GATEWAY_URL=http://api-gateway:8989

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

### Ejemplo de servicio en `docker-compose.yml`

```yaml
whatsapp-service:
  build: ./backend/chedoparti-whatsapp-service
  container_name: whatsapp-service
  environment:
    WHATSAPP_VERIFY_TOKEN: your_verify_token
    WHATSAPP_ACCESS_TOKEN: your_whatsapp_token
    WHATSAPP_PHONE_NUMBER_ID: your_phone_id
    REDIS_HOST: redis
    REDIS_PORT: 6379
    API_GATEWAY_URL: http://api-gateway:8989
    OPENAI_API_KEY: your_openai_key
    OPENAI_MODEL: gpt-4o-mini
  depends_on:
    - api-gateway
    - redis
  networks:
    - chedoparti_net
```

## 🔗 Endpoints

### `GET /whatsapp/webhook`
Usado por Meta para verificar el webhook.

### `POST /whatsapp/webhook`
Recibe mensajes de WhatsApp, procesa la sesión y responde al usuario.

### `GET /metrics`
Exposición de métricas Prometheus (mensajes in/out, reservas confirmadas).

## 🧠 Flujo conversacional (simplificado)

```text
START
 → IDENTIFY_USER (find_or_create_user)
 → ASK_INSTITUTION
 → ASK_SPORT
 → ASK_DATE
 → ASK_TIME (consulta availability)
 → CONFIRM_RESERVATION (crea reserva, opcionalmente genera link de pago)
 → DONE
```

La IA (LangChain) se usa para **interpretar** lo que escribe el usuario; la lógica de negocio sigue en los microservicios de CheDoparti.

## 🧪 Testing (Postman)

Incluye `chedoparti-whatsapp-service.postman_collection.json` con:

- Verificación de webhook (`GET /whatsapp/webhook`)
- Simulación de mensaje entrante (`POST /whatsapp/webhook`)

## 🧩 Flyway – user-service

En `db/migration/V50__add_whatsapp_columns.sql` se agregan columnas para vincular número de WhatsApp con usuarios:

- `phone`
- `whatsapp_id`

Ajustá el nombre de la tabla (`users`) si tu modelo JPA usa otro nombre.

## 📊 Métricas / Monitoreo

- `chedoparti_whatsapp_messages_total{direction="in|out"}`
- `chedoparti_whatsapp_reservations_total`

Consumibles desde Prometheus y visualizables en Grafana para:

- volumen de mensajes
- cantidad de reservas vía WhatsApp
- ratio reservas / mensajes

## 🗺️ Ideas de dashboard (Admins)

Con las métricas expuestas:

- Gráfico de líneas: reservas por día (últimos 30 días).
- Gráfico de barras: reservas por institución (top 5).
- Número: reservas confirmadas hoy / esta semana.
- Número: mensajes promedio por reserva.

La UI (React, etc.) puede consumir directamente `/metrics` vía Prometheus o construir endpoints adicionales si necesitás JSON más amigable.
