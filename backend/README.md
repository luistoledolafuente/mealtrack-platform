# MealTrack Backend

Node.js + Express + TypeScript + Prisma API para la plataforma MealTrack.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript (tsx) |
| Framework | Express 4 |
| ORM | Prisma 5 |
| DB | PostgreSQL (Supabase) |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Logging | Pino |
| Tests | Vitest + Supertest |

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL con tu conexión de Supabase

# 3. Inicializar base de datos
npx prisma migrate dev --name init
npx prisma db seed

# 4. Iniciar en modo desarrollo
npm run dev
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia con hot-reload (tsx watch) |
| `npm run build` | Compila TypeScript a JS |
| `npm start` | Inicia en producción |
| `npm test` | Ejecuta tests (Vitest) |
| `npm run db:migrate` | Crea migración Prisma |
| `npm run db:seed` | Pobla datos de prueba |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run lint` | ESLint |

## Estructura

```
src/
├── config/         # env, logger (Pino), Prisma client
├── shared/         # middleware, errors, utils, types
├── modules/        # 11 módulos por dominio
│   ├── auth/       # login, logout, perfil
│   ├── users/      # CRUD de usuarios
│   ├── restaurants/# multi-tenant
│   ├── meal-plans/ # planes de comida
│   ├── subscriptions/ # suscripciones
│   ├── daily-meals/   # consumo diario
│   ├── adjustment-requests/ # solicitudes de ajuste
│   ├── payments/   # pagos
│   ├── notifications/ # notificaciones
│   ├── dashboards/ # vistas agregadas
│   └── audit/      # logs de auditoría
├── routes/         # router central
├── app.ts          # configuración Express
└── server.ts       # entry point + graceful shutdown
```

## Convenciones

- Patrón: Controller → Service → Repository
- Modular por dominio (cada módulo autocontenido)
- API REST base `/api/v1`
- Autenticación: Bearer JWT
- Respuestas: `{ success, message, data }`
- Multi-tenant: filtrado por `restaurantId`
- Validación: Zod schemas
- Sin comentarios en código (salvo TODOs explícitos)
