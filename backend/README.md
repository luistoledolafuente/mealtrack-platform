# MealTrack Backend

Node.js + Express API para la plataforma MealTrack.

## Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (via Supabase)
- **Auth:** JWT (jsonwebtoken + bcrypt)
- **Validation:** Joi

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL y JWT_SECRET

# 3. Iniciar en modo desarrollo
npm run dev
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia con nodemon (hot reload) |
| `npm start` | Inicia en producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta Jest |

## Estructura

```
src/
├── config/         # Config (env, db connection)
├── constants/      # Enums y constantes
├── modules/        # Módulos por dominio (11 módulos)
│   ├── auth/
│   ├── users/
│   ├── restaurants/
│   ├── meal-plans/
│   ├── subscriptions/
│   ├── daily-meals/
│   ├── adjustment-requests/
│   ├── payments/
│   ├── notifications/
│   ├── dashboards/
│   └── audit/
├── routes/         # Router central que monta todos los módulos
├── shared/         # Middlewares, errores, logger, utilidades
└── server.js       # Entry point
```

Cada módulo sigue el patrón: `routes → controller → service → repository`

## Módulos (resumen)

| Módulo | Responsabilidad |
|---|---|
| auth | Login, logout, refresh token |
| users | Perfil de usuario (CRUD básico) |
| restaurants | Gestión de restaurantes (multi-tenant) |
| meal-plans | Planes de pensión por restaurante |
| subscriptions | Suscripciones de estudiantes a planes |
| daily-meals | Registro diario de consumo |
| adjustment-requests | Solicitudes de ajuste por discrepancia |
| payments | Registro de pagos |
| notifications | Notificaciones y alertas |
| dashboards | Dashboards por rol (student/admin/superadmin) |
| audit | Registro de auditoría |

## Convenciones

- Patrón: Controller → Service → Repository
- Modular por dominio (cada módulo autocontenido)
- API REST base `/api/v1`
- Autenticación: Bearer JWT
- Respuestas formato: `{ success, message, data }`
- Multi-tenant: filtrado por `restaurant_id`
- Sin comentarios en código (salvo TODOs explícitos)
