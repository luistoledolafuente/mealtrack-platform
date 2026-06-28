# AGENTS.md — MealTrack Platform

Memoria persistente del agente para el proyecto MealTrack.

---

## Project Overview

MealTrack es una plataforma mobile-first para gestionar pensiones alimentarias estudiantiles. Permite controlar planes de comida prepagados, registrar consumo diario, gestionar pagos, solicitar ajustes y mantener auditoría completa.

**Actores:** Estudiante | Admin de restaurante | Superadmin

**Estado actual:** Planificación y documentación (pre-implementación).

**Stack definido:**
- Frontend móvil: Flutter (ADR-0001)
- Backend API: Node.js + Express (ADR-0002)
- Base de datos: PostgreSQL sobre Supabase (ADR-0003)
- Estrategia de datos: Offline-first en móvil (ADR-0004)
- Multi-tenancy: Lógico por restaurante (ADR-0006)

**MVP:** Autenticación, roles, suscripciones, calendario de consumo, saldo de días, vencimientos, notificaciones básicas, dashboard admin, sincronización inicial.

**Versión Pro (+):** Validación QR, reportes financieros, auditoría completa, flujo de ajustes, multi-restaurante, panel web admin.

**Fuera del MVP:** Pasarelas de pago complejas, facturación electrónica, integraciones contables, automatizaciones con IA.

---

## Repository Structure

```
mealtrack-platform/
├── AGENTS.md              # Este archivo
├── README.md              # Vista general del proyecto
├── docs/
│   ├── vision.md          # Visión del producto
│   ├── requerimientos.md  # RFs y RNFs
│   ├── reglas-negocio.md  # 32 reglas de negocio (RN-01..RN-32)
│   ├── arquitectura.md    # Componentes, flujos, principios
│   ├── modelo-datos.md    # Entidades, atributos, relaciones
│   ├── api.md             # Contrato REST (12 recursos)
│   └── adrs/
│       ├── README.md
│       ├── ADR-0001.md    # Flutter
│       ├── ADR-0002.md    # Node.js + Express
│       ├── ADR-0003.md    # PostgreSQL / Supabase
│       ├── ADR-0004.md    # Offline-first
│       ├── ADR-0005.md    # No edición histórica directa
│       └── ADR-0006.md    # Multi-tenant por restaurante
├── backend/               # TODO: proyecto Node.js + Express
├── mobile/                # TODO: proyecto Flutter
└── web-admin/             # TODO: futuro panel web
```

---

## Build & Development Commands

**TODO** — Aún no hay comandos configurados. Se agregarán cuando existan los proyectos `backend/` y `mobile/`.

Previsión:
- Backend: `npm run dev`, `npm run lint`, `npm test`
- Mobile: `flutter run`, `flutter test`, `flutter analyze`

---

## Code Style & Conventions

### Backend (Node.js + Express)
- **Patrón:** Controller → Service → Repository
- **Organización:** Modular por dominio (`backend/src/modules/<modulo>/`)
- **Módulos planificados:** auth, users, restaurants, meal-plans, subscriptions, daily-meals, adjustment-requests, payments, dashboards, notifications, audit
- **Flujo HTTP:** Request → Middleware → Router → Controller → Service → Repository → Database (docs/arquitectura.md:84)
- **API REST** con base `/api/v1`, tokens Bearer, formato JSON consistente (`{ success, message, data }`)

### Mobile (Flutter)
- **Capas:** Presentation → Application/State → Domain → Data
- Repositorios coordinan almacenamiento local + remoto
- IDs UUID generados en cliente para evitar conflictos de sync
- `sync_status` en entidades sincronizables

### Convenciones generales
- Sin comentarios en código (a menos que se requiera explícitamente)
- No emojis en archivos
- Commits descriptivos, sin --force-push ni --amend

---

## Architecture Notes

### Componentes
| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Cliente móvil | Flutter | UI, almacenamiento local, cola de sync |
| Backend API | Node.js + Express | Endpoints, reglas de negocio, auditoría |
| Base de datos | PostgreSQL (Supabase) | Persistencia, RLS multi-tenant |
| Web admin | Futuro | Dashboards y operación |

### Flujo offline-first
1. Acción del usuario → guardado local
2. Actualización visual inmediata
3. Cola de sincronización
4. Cuando hay conectividad → envío al backend
5. Backend valida reglas y responde
6. App actualiza estado final

### Multi-tenancy
- Aislamiento lógico vía `restaurant_id` en tablas principales
- Consultas filtran siempre por `restaurant_id` (excepto superadmin)
- Políticas RLS en Supabase

### Auditoría
- Tabla de solo inserción (sin UPDATE ni DELETE)
- Eventos auditables: creación/actualización de suscripciones, pagos, ajustes, validaciones, aprobaciones, cambios de rol, acciones de superadmin (RN-24)

### Entidades principales
`Usuario` → `Restaurante` → `PlanDePension` → `Suscripcion` → `ConsumoDiario` / `Pago` / `SolicitudAjuste` → `Auditoria` / `Notificacion`

(Ver docs/modelo-datos.md para atributos detallados)

### API Resources
- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET/PATCH /users/me`
- `GET/POST /restaurants`, `GET/PATCH /restaurants/{id}`
- `GET/POST /meal-plans`, `GET/PATCH /meal-plans/{id}`
- `GET/POST /subscriptions`, `GET/PATCH /subscriptions/{id}`
- `GET/POST /daily-meals`, `GET /daily-meals/{id}`
- `GET/POST /adjustment-requests`, `PATCH .../{id}/review`
- `GET/POST /payments`, `GET /payments/{id}`
- `GET /dashboards/student`, `/admin`, `/superadmin`
- `GET /notifications`, `PATCH .../{id}/read`
- `GET /audit-logs`
- `POST /qr/issue`, `POST /qr/validate`

---

## Testing Strategy

**TODO** — No definida aún. Se espera definir en `docs/testing.md`.

Previsión:
- Backend: pruebas unitarias (servicios), pruebas de integración (endpoints)
- Mobile: tests de widget, tests de unidad, tests de integración
- Criterio: los requerimientos deben ser verificables mediante pruebas funcionales (docs/requerimientos.md:137)

---

## Security & Compliance

### Autenticación y autorización
- Token JWT en cabecera `Authorization: Bearer <token>` (docs/api.md:29)
- Roles: estudiante, admin restaurante, superadmin (RF-02, RN-03)
- Estudiante: solo sus datos | Admin: solo su restaurante | Superadmin: acceso global auditado

### Reglas de integridad (RN inmutables)
- **RN-10:** No editar consumos históricos
- **RN-13:** Correcciones vía solicitud de ajuste
- **RN-16:** Sin borrado silencioso, preservar trazabilidad
- **RN-25:** Auditoría no editable por usuarios operativos
- **RN-02:** Aislamiento total entre restaurantes

### Principios rectores (docs/reglas-negocio.md:124)
1. No alterar el pasado sin evidencia
2. No permitir acceso cruzado entre restaurantes
3. No depender totalmente de conectividad permanente
4. No sacrificar trazabilidad por rapidez operativa

---

## Agent Guardrails

1. **NUNCA** permitir edición directa de consumos históricos (RN-10)
2. **NUNCA** permitir acceso cruzado entre restaurantes (RN-02)
3. **NUNCA** almacenar o exponer secrets (claves, tokens, contraseñas en texto plano)
4. **NUNCA** eliminar trazabilidad de auditoría (RN-25)
5. **NUNCA** cometer cambios sin haber leído el archivo existente
6. **NUNCA** usar --force-push, --amend, o reescribir historia de git
7. **SIEMPRE** filtrar por `restaurant_id` en queries (excepto superadmin)
8. **SIEMPRE** verificar rol antes de exponer datos o endpoints
9. **SIEMPRE** generar UUID en cliente para sincronización offline
10. **SIEMPRE** registrar auditoría en operaciones sensibles (RN-24)
11. **TODO** explícito cuando un dato no existe en la documentación (no inventar)

---

## Extensibility Hooks

Puntos donde el sistema está diseñado para crecer:

- **Multi-tenancy:** `restaurant_id` en tablas prepara el modelo SaaS
- **Módulos backend:** Cada módulo en `backend/src/modules/` es autocontenido para agregar nuevas capacidades
- **ADRs:** Nuevas decisiones de arquitectura se agregan como ADR-0007+ en `docs/adrs/`
- **Entidades futuras:** El modelo de datos contempla sedes, promociones, facturación, wallets (docs/modelo-datos.md:182)
- **API versionada:** Base `/api/v1` permite evolucionar el contrato
- **Web admin:** Previsto como capa independiente (`web-admin/`)
- **Offline-first:** Permite agregar nuevos flujos offline sin rediseñar la estrategia de sync
- **Panel superadmin:** Punto de extensión para herramientas de control global

---

## Further Reading

Orden recomendado para nuevos colaboradores:

1. `README.md` — Contexto general
2. `docs/vision.md` — Propósito y alcance
3. `docs/requerimientos.md` — Qué debe hacer el sistema
4. `docs/reglas-negocio.md` — Reglas críticas del dominio
5. `docs/arquitectura.md` — Cómo está estructurado
6. `docs/adrs/README.md` → ADR-0001 al ADR-0006 — Decisiones técnicas
7. `docs/modelo-datos.md` — Entidades y relaciones
8. `docs/api.md` — Contrato REST de la API
