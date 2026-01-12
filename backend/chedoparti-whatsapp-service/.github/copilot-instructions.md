# Copilot Instructions for chedoparti-whatsapp-service

## Project Overview

- Integrates WhatsApp Business Cloud API with CheDoparti ecosystem for conversational court reservations.
- Core stack: FastAPI (webhook, metrics), LangChain (intent extraction), Redis (session state), API Gateway (Spring Cloud microservices), Prometheus (metrics).
- Business logic (availability, reservations, payments) is handled by CheDoparti microservices via API Gateway.

## Architecture & Data Flow

- Entry: WhatsApp messages via webhook (`/whatsapp/webhook`).
- Flow: LangChain interprets user intent → Redis manages session state → API Gateway proxies requests to user/institution/reservation/payment services.
- Metrics exposed at `/metrics` for Prometheus/Grafana.
- Conversation state managed as a state machine (see `app/flow.py`).

## Key Files & Directories

- `app/main.py`: FastAPI app, webhook, metrics endpoint.
- `app/flow.py`: Conversational flow logic (state machine).
- `app/services/langchain_intent.py`: LangChain integration for intent extraction.
- `app/services/session.py`: Redis session management.
- `app/services/chedoparti_api.py`: API Gateway/microservice integration.
- `app/metrics.py`: Prometheus metrics counters.
- `app/models.py`: Pydantic models for slots, session, intent.
- `db/migration/V50__add_whatsapp_columns.sql`: Flyway migration for WhatsApp user columns.

## Developer Workflows

- **Run locally**: Use Docker Compose (see README example). Ensure Redis and API Gateway are available.
- **Environment variables**: Set WhatsApp, Redis, API Gateway, and OpenAI credentials as per README.
- **Testing**: Use Postman collection (`chedoparti-whatsapp-service.postman_collection.json`) for webhook and message simulation.
- **Database migration**: Apply Flyway SQL for WhatsApp columns in user-service.
- **Metrics**: Query `/metrics` for Prometheus-compatible stats.

## Patterns & Conventions

- All external service calls (user, institution, reservation, payment) go through API Gateway.
- Session state is always stored in Redis, keyed by WhatsApp user.
- LangChain is used only for intent extraction; business logic is delegated to backend services.
- Metrics use Prometheus counter pattern, with custom labels for direction and reservation status.
- Conversation flow is strictly state-driven; see `app/flow.py` for transitions.

## Integration Points

- WhatsApp Business Cloud API: webhook verification and message handling.
- Redis: session persistence.
- API Gateway: all business logic requests.
- Prometheus: metrics scraping.
- OpenAI: language model for LangChain.

## Example: Adding a New Intent

- Update `app/services/langchain_intent.py` to extract the new intent.
- Extend state machine in `app/flow.py` to handle new flow.
- Add new metrics in `app/metrics.py` if needed.

## Useful Endpoints

- `GET /whatsapp/webhook`: Webhook verification.
- `POST /whatsapp/webhook`: Message processing.
- `GET /metrics`: Prometheus metrics.

---

For questions or unclear conventions, review `README.md` and key files above. If workflow or integration details are missing, ask for clarification or examples from maintainers.
