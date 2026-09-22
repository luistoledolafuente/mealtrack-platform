# MealTrack Platform

MealTrack es una plataforma SaaS mobile-first para restaurantes. El primer
producto es **Pensiones**: permite administrar planes prepagados de almuerzo,
pagos, consumos, ausencias, cierres operativos y trazabilidad para estudiantes.

El piloto inicial usa una aplicación Flutter y una API Node.js con PostgreSQL.
Ventas, inventario, facturación y los demás módulos de restaurante se incorporan
después de validar este flujo con clientes reales.

## Alcance del MVP

El MVP público opera únicamente **almuerzo**. Incluye autenticación por roles,
aislamiento por restaurante, QR dinámico con código de respaldo, consumo
idempotente, ausencias, cierres, auditoría y una aplicación móvil para el
estudiante.

No incluye todavía desayuno/cena, ventas, inventario, pagos en línea,
facturación ni bases independientes por cliente. La estrategia para evolucionar
el aislamiento de datos está registrada en los ADR 0007 y 0008.

## Arquitectura

```text
Flutter mobile → Express API → PostgreSQL
```

- `mobile/`: aplicación Flutter.
- `backend/`: API TypeScript, Express, Prisma y PostgreSQL.
- `docs/`: decisiones de producto, arquitectura, API, ADRs y runbooks.

El backend usa módulos `Controller → Service → Repository`. Toda operación
sensible se autoriza por rol y restaurante, mantiene trazabilidad y no permite
editar consumos históricos directamente.

## Documentación canónica

| Necesidad | Documento |
| --- | --- |
| Entender producto y alcance | [Visión](docs/vision.md) y [MVP Pensiones](docs/decisiones-mvp-pensiones.md) |
| Reglas que no se pueden violar | [Reglas de negocio](docs/reglas-negocio.md) |
| Diseño técnico y API | [Arquitectura](docs/arquitectura.md), [modelo de datos](docs/modelo-datos.md) y [API](docs/api.md) |
| Decisiones técnicas | [ADRs](docs/adrs/README.md) |
| Estado y criterios de Sprint 0 | [Sprint 0](docs/sprints/SPRINT-0.md) |
| Despliegue en VPS | [Runbook VPS](docs/runbooks/despliegue-vps.md) |
| Contexto compacto para otra IA | [Contexto para IA](docs/ai-context.md) |

## Desarrollo local

### Backend

```bash
cd backend
npm ci
cp .env.example .env
npx prisma migrate dev
npm run dev
```

### Mobile

```bash
cd mobile
flutter pub get
flutter run
```

Antes de integrar cambios se ejecutan `npm run build`, `npm run lint`, `npm test`,
`flutter analyze` y `flutter test`.

## Seguridad esencial

- El tenant procede del JWT validado, nunca del body, query ni headers del cliente.
- Un recurso ajeno responde `404` para impedir enumeración entre restaurantes.
- Los consumos y la auditoría no se modifican ni eliminan directamente.
- Secretos, `.env` y llaves de firma no se versionan.
- Producción usa HTTPS, CORS explícito y secretos fuertes.

## Despliegue

El origen remoto es GitHub. Primero se revisan y suben los cambios desde este
repositorio; recién entonces se clona en el VPS. La guía completa, incluido
Docker, Nginx, TLS, migraciones, backup y rollback, está en el
[runbook de VPS](docs/runbooks/despliegue-vps.md).
