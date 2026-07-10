# Entreprenly — Frontend

Aplicación web de **Entreprenly**, una plataforma para pequeños negocios y bodegas que centraliza inventario, ventas, atención por WhatsApp y suscripciones en un solo panel.

Este repositorio contiene el cliente web (SPA en Vue 3). El backend vive en [`ap-entreprenly-web-services`](https://github.com/Kauflink/ap-entreprenly-web-services) y expone la API REST que consume este frontend.

## Funcionalidades

- **Autenticación** — registro e inicio de sesión con JWT.
- **Inventario** — productos y lotes por *unidad* y por *peso*, con alertas de stock y códigos QR.
- **Ventas (POS)** — carrito, métodos de pago, resumen de caja e historial de ventas.
- **Chatbot / WhatsApp** — conversaciones, mensajes, pedidos y conexión del bridge de WhatsApp por QR.
- **Suscripción** — panel de plan, uso, facturación y gestión del Plan Control.
- **Perfil** — datos del usuario, preferencias, notificaciones y cambio de credenciales.
- **Internacionalización** — español e inglés (`vue-i18n`).

## Stack

| Área | Tecnología |
|------|-----------|
| Framework | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) |
| Build tool | [Vite](https://vite.dev/) |
| Estado | [Pinia](https://pinia.vuejs.org/) |
| Enrutado | [Vue Router](https://router.vuejs.org/) |
| UI | [PrimeVue](https://primevue.org/) + PrimeFlex + PrimeIcons |
| HTTP | [Axios](https://axios-http.com/) |
| i18n | [Vue I18n](https://vue-i18n.intlify.dev/) |
| Hosting | Firebase Hosting |

## Arquitectura

El código sigue un enfoque **Domain-Driven Design** organizado por *bounded contexts* (módulos). Cada módulo se divide en cuatro capas:

```
src/<módulo>/
├── application/      # Stores de Pinia (casos de uso / estado)
├── domain/model/     # Entidades y objetos de valor
├── infrastructure/   # Clientes de API y assemblers (resource ⇄ entidad)
└── presentation/     # Vistas, componentes y rutas
```

Módulos: `auth`, `login`, `register`, `inventory`, `sales`, `subscription`, `chatbot`, `profile` y `shared` (layout, componentes y utilidades comunes).

Capa compartida clave en `src/shared/infrastructure/`:

- **`base-api.js`** — instancia de Axios; inyecta el JWT (Bearer) en cada petición salvo las de autenticación.
- **`base-endpoint.js`** — CRUD REST genérico reutilizado por los clientes de cada módulo.

## Requisitos

- **Node.js** `^20.19.0` o `>=22.12.0`
- **npm**

## Puesta en marcha

```sh
npm install     # instalar dependencias
npm run dev     # servidor de desarrollo con hot-reload
```

### Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite). |
| `npm run build` | Build de producción en `dist/`. |
| `npm run preview` | Previsualiza el build de producción localmente. |
| `npm run server` | Levanta un mock REST con `json-server` (`server/db.json`) en el puerto `3000`. |

## Variables de entorno

Vite carga los `.env` desde **`src/`** (`envDir` apunta a `./src` en `vite.config.js`), no desde la raíz del proyecto. Existen `src/.env.development` y `src/.env.production`.

| Variable | Descripción |
|----------|-------------|
| `VITE_ENTREPENLY_PLATFORM_API_URL` | URL base de la API (por defecto `https://ap-api.entreprenly.online/api/v1`). |
| `VITE_*_ENDPOINT_PATH` | Rutas relativas de cada recurso (inventario, ventas, perfiles, suscripciones, chatbot, etc.). |

> **Nota:** actualmente `src/.env.development` apunta a la API de producción. Si necesitas desarrollar contra un backend local, ajusta `VITE_ENTREPENLY_PLATFORM_API_URL`.

La sesión (usuario + JWT) se persiste en `localStorage` bajo la clave `entreprenly-auth`.

## Despliegue

El sitio se hospeda en **Firebase Hosting** (proyecto `ap-entreprenly`). Sirve `dist/` con *rewrite* SPA a `index.html`.

```sh
npm run build
firebase deploy --only hosting
```

## Estructura del proyecto

```
├── public/            # Activos estáticos
├── server/            # Mock de json-server (db.json, routes.json)
├── src/
│   ├── <módulos>/     # Bounded contexts (ver Arquitectura)
│   ├── shared/        # Layout, componentes y utilidades comunes
│   ├── router/        # Configuración de Vue Router y guardas de auth
│   ├── locales/       # Traducciones es / en
│   ├── assets/        # Estilos globales y branding
│   ├── i18n.js        # Configuración de i18n
│   ├── pinia.js       # Instancia de Pinia
│   └── main.js        # Punto de entrada
├── firebase.json      # Configuración de Firebase Hosting
└── vite.config.js     # Configuración de Vite (alias @ → src, envDir → src)
```

## IDE recomendado

[VS Code](https://code.visualstudio.com/) + [Vue (Official / Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (deshabilita Vetur).
