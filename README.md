# Proyecto Presidencial 2026 — Landing Page

Plataforma web institucional de campaña presidencial Colombia 2026.
Desarrollada en HTML5 + CSS3 + JavaScript vanilla. Sin dependencias de frameworks.

---

## Estructura del proyecto

```
proyecto2026/
├── index.html          ← Landing page principal
├── css/
│   └── styles.css      ← Sistema de diseño completo
├── js/
│   └── main.js         ← Lógica, contadores, formularios
├── assets/             ← (pendiente) Logo, imágenes, og-image
└── README.md           ← Este archivo
```

---

## Despliegue rápido

### Opción A — Netlify (recomendado, gratuito)
1. Crea cuenta en https://netlify.com
2. Arrastra la carpeta `proyecto2026/` al dashboard de Netlify
3. Netlify asigna URL temporal (ej: `proyecto2026.netlify.app`)
4. Cuando tengas el dominio: Settings → Domain management → Add custom domain

### Opción B — Vercel
1. `npm install -g vercel`
2. Desde la carpeta del proyecto: `vercel deploy`
3. Sigue las instrucciones en terminal

### Opción C — Servidor propio (Apache / Nginx)
```bash
# Copiar archivos al servidor
scp -r proyecto2026/* usuario@servidor:/var/www/html/

# Nginx — bloque de configuración mínima
server {
    listen 443 ssl;
    server_name TU_DOMINIO.com www.TU_DOMINIO.com;
    root /var/www/html;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/TU_DOMINIO.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/TU_DOMINIO.com/privkey.pem;

    # Gzip para carga rápida en zonas rurales
    gzip on;
    gzip_types text/css application/javascript text/html;
    gzip_min_length 1024;

    # Cache de assets estáticos
    location ~* \.(css|js|jpg|png|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
# Redirigir HTTP → HTTPS
server {
    listen 80;
    server_name TU_DOMINIO.com www.TU_DOMINIO.com;
    return 301 https://$host$request_uri;
}
```

### Opción D — GitHub Pages (gratuito)
1. Crear repositorio en GitHub
2. Subir la carpeta `proyecto2026/`
3. Settings → Pages → Source: main / root
4. Cuando tengas dominio: Settings → Pages → Custom domain

---

## Personalización pendiente (antes del lanzamiento)

### 1. Dominio
Busca en `index.html` los comentarios `<!-- Actualizar con dominio real -->` y reemplaza:
```html
<!-- <meta property="og:url" content="https://TU_DOMINIO.com"> -->
<!-- <link rel="canonical" href="https://TU_DOMINIO.com/"> -->
```

### 2. Nombre del candidato
Reemplaza `[Nombre del Candidato]` en `index.html` en la sección hero y metas.

### 3. Imagen OG (para compartir en redes)
- Crea imagen de 1200×630px con el logo y slogan
- Guárdala como `assets/og-image.jpg`
- Descomenta en `index.html`:
```html
<meta property="og:image" content="https://TU_DOMINIO.com/assets/og-image.jpg">
<meta name="twitter:image" content="https://TU_DOMINIO.com/assets/og-image.jpg">
```

### 4. Logo oficial
- Reemplaza el favicon SVG en `index.html` (línea `<link rel="icon">`)
- Actualiza el `logo__mark` en el navbar con el logo real

### 5. Datos de contacto reales
- Correo: `contacto@proyecto2026.com` → reemplazar
- Teléfono: `01 8000 000 000` → reemplazar
- Sede: `Bogotá D.C.` → reemplazar con dirección real

### 6. URLs de redes sociales
Busca los `<a class="soc-btn" href="#">` en la sección de contacto y actualiza con las URLs reales.

### 7. Contadores reales (cuando el backend esté listo)
En `js/main.js`, sección `COUNTER_DATA`, reemplazar los valores estáticos por llamadas al API:
```javascript
// Reemplazar la sección initCounters() por:
async function loadCounters() {
    const res = await fetch('/api/v1/estadisticas/contadores');
    const data = await res.json();
    // data: { apoyo, testigos, municipios, propuestas }
    animateCounter(document.getElementById('cnt-apoyo'), data.apoyo);
    // etc.
}
```

---

## Contratos API — Backend Java (Spring Boot)

Cuando el backend esté listo, en `js/main.js` busca los bloques comentados
`// ── INTEGRACIÓN FUTURA CON BACKEND JAVA ────` y descomenta el código `fetch()`.

### POST /api/v1/escucha
Registra un reporte ciudadano.

**Request body (JSON):**
```json
{
  "municipio":    "Cundinamarca, Ubaté",
  "tema":         "empleo",
  "descripcion":  "Texto del ciudadano (máx 1000 chars)",
  "contacto":     "opcional@correo.com"
}
```

**Response 201:**
```json
{
  "id":        "uuid-generado",
  "recibido":  "2026-05-24T15:30:00Z",
  "estado":    "PENDIENTE"
}
```

**Response 400:**
```json
{
  "error": "VALIDATION_ERROR",
  "campos": ["municipio", "tema"]
}
```

---

### POST /api/v1/registro
Registra un participante (simpatizante, colaborador o testigo electoral).

**Request body (JSON):**
```json
{
  "nombres":              "Juan Carlos",
  "apellidos":            "Pérez Gómez",
  "cedula":               "12345678",
  "departamento":         "Cundinamarca",
  "municipio":            "Ubaté",
  "barrio":               "Centro",
  "celular":              "+573001234567",
  "email":                "juan@correo.com",
  "tipoParticipacion":    3,
  "experienciaElectoral": "no"
}
```

**tipoParticipacion:** `1` = Simpatizante, `2` = Colaborador, `3` = Testigo Electoral

**Response 201:**
```json
{
  "id":     "uuid-generado",
  "codigo": "COL-2026-00142",
  "tipo":   "TESTIGO_ELECTORAL",
  "estado": "PENDIENTE_CAPACITACION"
}
```

**Response 409 (cédula duplicada):**
```json
{
  "error": "CEDULA_DUPLICADA",
  "mensaje": "Esta cédula ya está registrada en el sistema."
}
```

---

### GET /api/v1/estadisticas/contadores
Retorna cifras para los contadores animados del hero.

**Response 200:**
```json
{
  "apoyo":      147823,
  "testigos":   34210,
  "municipios": 862,
  "propuestas": 52340,
  "timestamp":  "2026-05-24T15:30:00Z"
}
```

---

### GET /api/v1/estadisticas/temas
Retorna los porcentajes de temas para las barras de Escucha Ciudadana.

**Response 200:**
```json
[
  { "tema": "empleo",    "porcentaje": 38 },
  { "tema": "seguridad", "porcentaje": 27 },
  { "tema": "salud",     "porcentaje": 18 },
  { "tema": "educacion", "porcentaje": 11 },
  { "tema": "vias",      "porcentaje":  6 }
]
```

---

## Cumplimiento legal

| Norma | Implementación |
|-------|---------------|
| Ley 1581/2012 — Habeas Data | Aviso legal en ambos formularios |
| Ley 2494/2025 — Electoral | Identificación de iniciativa política en header y footer |
| CNE — Encuestas | Nota explícita: cifras internas ≠ encuestas oficiales |
| Registraduría — Testigos | Proceso de certificación documentado |
| SSL/HTTPS | Obligatorio en servidor de producción |

---

## Performance (zonas rurales con baja conectividad)

- Sin frameworks pesados (0 KB de bundle JS extra)
- Fuentes Google con `display=swap` (no bloquean render)
- Iconos Tabler via CDN con cache de 1 año
- Gzip habilitado en configuración de servidor
- Imágenes: cuando se agreguen, usar WebP + lazy loading
- Lighthouse score objetivo: > 90 en Mobile

---

*Elaborado por: Coordinación de Estrategia Digital y Organización*
*Versión: 1.0 — 24 mayo 2026*
