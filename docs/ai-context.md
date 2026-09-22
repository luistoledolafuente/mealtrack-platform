# Contexto para IA — MealTrack

Usa este documento como contexto compacto. Si una decisión no aparece aquí,
consulta los documentos enlazados; no inventes reglas de producto ni cambies las
reglas no negociables.

## Producto y MVP

MealTrack es un SaaS mobile-first para restaurantes. El primer módulo,
**Pensiones**, opera planes prepagados para estudiantes. El piloto público está
congelado en **almuerzo**: QR dinámico, consumo idempotente, saldo, ausencias,
cierres operativos, ajustes, pagos y auditoría.

No son parte del MVP desayuno, cena, ventas, inventario, facturación, pagos en
línea ni bases independientes por cliente. La visión modular y las decisiones
funcionales completas están en [Visión](vision.md) y
[MVP Pensiones](decisiones-mvp-pensiones.md).

## Actores

- **Estudiante:** consulta su plan y registra su propio consumo.
- **Admin de restaurante:** opera exclusivamente su restaurante.
- **Superadmin:** soporte global, siempre bajo trazabilidad.

Los roles futuros (caja, almacén, cocina, etc.) no existen todavía.

## Reglas no negociables

1. Nunca hay acceso cruzado entre restaurantes.
2. Los consumos históricos no se editan ni eliminan directamente.
3. Una corrección histórica usa `AdjustmentRequest`, evidencia y auditoría.
4. Auditoría, pagos y consumos preservan trazabilidad; la auditoría es append-only.
5. Operaciones sensibles son transaccionales e idempotentes.
6. El tenant procede solo de un JWT validado, no del body, query ni headers del cliente.
7. No se exponen secretos, tokens ni contraseñas en código, logs o documentación.

## Stack y arquitectura

- **Mobile:** Flutter, Provider, GoRouter, HTTP, SharedPreferences, UUID.
- **API:** Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Zod y Pino.
- **Infraestructura del piloto:** Docker Compose en VPS, Nginx y TLS.
- **API:** prefijo `/api/v1`, respuesta `{ success, message, data }`.

```text
Flutter mobile → Express API → PostgreSQL
```

La API usa `Controller → Service → Repository`. Los módulos incluyen auth,
restaurants, meal-plans, subscriptions, daily-meals, consumptions, QR,
absence-notices, operational-closures, adjustments, payments y audit.

## Seguridad

- Recursos ajenos responden `404` para impedir enumeración.
- Producción exige `DATABASE_URL`, JWT de al menos 32 caracteres y CORS explícito.
- Usuarios inactivos reciben un error genérico de credenciales.
- `mustChangePassword` limita al usuario a cambiar su contraseña o cerrar sesión.
- El rate limit actual está en memoria: sirve para una instancia; antes de escalar
  se reemplaza por Redis o un servicio distribuido.

## Evolución SaaS

El piloto usa aislamiento lógico por restaurante. La evolución hacia control
plane y base operacional independiente por tenant está en
[ADR-0007](adrs/ADR-0007-aislamiento-operacional-por-base-de-datos-tenant.md),
[ADR-0008](adrs/ADR-0008-enrutamiento-seguro-y-versionado-esquema-tenant.md) y
el [runbook por tenant](runbooks/base-datos-por-tenant.md). No se implementa
para este lanzamiento.

## Forma de colaborar

Trabajar en sprints de dos semanas. Cada historia requiere alcance, criterios de
aceptación, pruebas y un responsable. Antes de publicar: build, lint sin errores,
tests backend/Flutter, migraciones revisadas y smoke test. El procedimiento de
VPS está en [despliegue-vps](runbooks/despliegue-vps.md).
