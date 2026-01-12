# Guía de Configuración de Variables de Entorno

Esta guía explica cómo configurar las variables de entorno para diferentes escenarios de deployment.

## 📋 Tabla de Contenidos

- [Variables Requeridas](#variables-requeridas)
- [Configuración por Entorno](#configuración-por-entorno)
- [Obtener Credenciales](#obtener-credenciales)
- [Troubleshooting](#troubleshooting)

---

## Variables Requeridas

### Obligatorias para Producción

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base del API Gateway | `/api` o `https://api.tudominio.com/api` |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Clave pública de MercadoPago | `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

### Opcionales (pero recomendadas)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_WS_URL` | URL del WebSocket | `wss://api.tudominio.com` |
| `VITE_EMAILJS_SERVICE_ID` | ID del servicio EmailJS | `service_xxxxxxx` |
| `VITE_EMAILJS_TEMPLATE_ID` | ID del template EmailJS | `template_xxxxxxx` |
| `VITE_EMAILJS_PUBLIC_KEY` | Clave pública EmailJS | `xxxxxxxxxxxxxxx` |

### Solo para Desarrollo

| Variable | Descripción | Valores |
|----------|-------------|---------|
| `VITE_USE_MOCK_API` | Usar datos mock en lugar de API real | `true` / `false` |

---

## Configuración por Entorno

### 🖥️ Desarrollo Local

**Archivo:** `.env`

```env
# Backend corriendo en localhost
VITE_API_BASE_URL=http://localhost:8989/api
VITE_WS_URL=ws://localhost:8989

# Credenciales de prueba
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_EMAILJS_SERVICE_ID=service_test
VITE_EMAILJS_TEMPLATE_ID=template_test
VITE_EMAILJS_PUBLIC_KEY=test_public_key

# Opcional: usar mock API
VITE_USE_MOCK_API=false
```

**Iniciar:**
```bash
npm run dev
```

---

### 🐳 Docker (Development)

**Archivo:** `.env` o `docker-compose.yml`

```env
# Usar nombres de servicio de Docker Compose
VITE_API_BASE_URL=http://api-gateway:8989/api
VITE_WS_URL=ws://api-gateway:8989

VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_EMAILJS_SERVICE_ID=service_test
VITE_EMAILJS_TEMPLATE_ID=template_test
VITE_EMAILJS_PUBLIC_KEY=test_public_key
```

**docker-compose.yml:**
```yaml
services:
  frontend:
    build:
      context: .
      args:
        - VITE_API_BASE_URL=/api
        - VITE_MERCADOPAGO_PUBLIC_KEY=${MERCADOPAGO_PUBLIC_KEY}
    environment:
      - NODE_ENV=development
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
    depends_on:
      - api-gateway
```

---

### 🚀 Producción (Netlify)

**Configuración en Netlify Dashboard:**

1. Ir a **Site settings** → **Environment variables**
2. Agregar las siguientes variables:

```
VITE_API_BASE_URL=/api
VITE_WS_URL=wss://api.tudominio.com
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

**Build settings:**
- Build command: `npm run build`
- Publish directory: `dist`

**netlify.toml** (ya incluido):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 🚀 Producción (Vercel)

**Configuración en Vercel Dashboard:**

1. Ir a **Settings** → **Environment Variables**
2. Agregar las variables para **Production**, **Preview**, y **Development**

**Archivo:** `vercel.json` (crear si no existe)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.tudominio.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### 🚀 Producción (Docker)

**Dockerfile multi-stage** (ya incluido):

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build args para variables de entorno
ARG VITE_API_BASE_URL
ARG VITE_MERCADOPAGO_PUBLIC_KEY
ARG VITE_EMAILJS_SERVICE_ID
ARG VITE_EMAILJS_TEMPLATE_ID
ARG VITE_EMAILJS_PUBLIC_KEY

RUN npm run build

# Production stage
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build con variables:**
```bash
docker build \
  --build-arg VITE_API_BASE_URL=/api \
  --build-arg VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx \
  -t chedoparti-frontend .
```

---

## Obtener Credenciales

### 💳 MercadoPago

1. Crear cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Ir a **Credenciales** en el panel
3. Copiar **Public Key**:
   - **Test:** `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Producción:** `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

⚠️ **Importante:** Nunca uses credenciales de producción en desarrollo.

### 📧 EmailJS

1. Crear cuenta en [EmailJS](https://www.emailjs.com/)
2. Ir a **Email Services** → Agregar servicio (Gmail, Outlook, etc.)
3. Copiar **Service ID**
4. Ir a **Email Templates** → Crear template
5. Copiar **Template ID**
6. Ir a **Account** → **API Keys**
7. Copiar **Public Key**

**Template de ejemplo:**
```html
Hola {{user_name}},

Tu reserva ha sido confirmada:
- Cancha: {{court_name}}
- Fecha: {{date}}
- Hora: {{time}}

Gracias por usar Chedoparti!
```

---

## Troubleshooting

### ❌ Error: "Cannot read property 'VITE_API_BASE_URL' of undefined"

**Causa:** Variable de entorno no está definida o no tiene prefijo `VITE_`

**Solución:**
1. Verificar que la variable existe en `.env`
2. Verificar que tiene prefijo `VITE_`
3. Reiniciar el dev server: `npm run dev`

---

### ❌ Error: "Network Error" al hacer requests

**Causa:** URL del API incorrecta o backend no está corriendo

**Solución:**
1. Verificar que `VITE_API_BASE_URL` apunta al backend correcto
2. Verificar que el backend está corriendo
3. En desarrollo local, verificar proxy en `vite.config.js`
4. Verificar CORS en el backend

---

### ❌ MercadoPago no carga

**Causa:** Clave pública incorrecta o no configurada

**Solución:**
1. Verificar `VITE_MERCADOPAGO_PUBLIC_KEY` en `.env`
2. Verificar que la clave es válida en MercadoPago dashboard
3. En desarrollo, usar clave TEST
4. Verificar console del navegador para errores

---

### ❌ WebSocket no conecta

**Causa:** URL de WebSocket incorrecta

**Solución:**
1. Verificar `VITE_WS_URL` en `.env`
2. En producción, usar `wss://` (seguro)
3. En desarrollo, usar `ws://` (no seguro)
4. Verificar que el backend tiene WebSocket habilitado

---

### ❌ Variables no se actualizan

**Causa:** Vite cachea las variables de entorno

**Solución:**
1. Detener el dev server (Ctrl+C)
2. Limpiar cache: `rm -rf node_modules/.vite`
3. Reiniciar: `npm run dev`

---

## Validación de Variables

Para verificar que las variables están configuradas correctamente:

```javascript
// En la consola del navegador
console.log({
  API_URL: import.meta.env.VITE_API_BASE_URL,
  WS_URL: import.meta.env.VITE_WS_URL,
  MP_KEY: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY?.substring(0, 10) + '...',
  EMAIL_SERVICE: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD
});
```

---

## Seguridad

### ✅ Buenas Prácticas

- ✅ Usar variables de entorno para todas las credenciales
- ✅ Nunca commitear `.env` al repositorio
- ✅ Usar credenciales TEST en desarrollo
- ✅ Rotar credenciales regularmente en producción
- ✅ Usar HTTPS/WSS en producción

### ❌ Evitar

- ❌ Hardcodear credenciales en el código
- ❌ Commitear `.env` o `.env.local`
- ❌ Usar credenciales de producción en desarrollo
- ❌ Compartir credenciales por email/chat
- ❌ Exponer claves privadas en el frontend

---

## Checklist Pre-Deploy

Antes de deployar a producción, verificar:

- [ ] Todas las variables de entorno están configuradas
- [ ] Credenciales de MercadoPago son de PRODUCCIÓN (no TEST)
- [ ] URLs usan HTTPS/WSS (no HTTP/WS)
- [ ] `.env` está en `.gitignore`
- [ ] Variables están configuradas en el hosting (Netlify/Vercel)
- [ ] Build de producción funciona: `npm run build`
- [ ] Preview funciona correctamente: `npm run preview`
- [ ] WebSocket conecta correctamente
- [ ] Pagos de prueba funcionan

---

## Recursos Adicionales

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
