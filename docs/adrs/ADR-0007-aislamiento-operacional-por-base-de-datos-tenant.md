# ADR-0007: Aislamiento operacional por base de datos por tenant de forma gradual

**Estado:** Aceptado

## Contexto

MealTrack inicia con un piloto pequeño de Pensiones, limitado a almuerzo. El modelo actual usa una base PostgreSQL compartida y aislamiento lógico por `restaurant_id`, definido en ADR-0006. Esta opción reduce coste y operación inicial, pero el producto SaaS necesita poder dar a cada restaurante una frontera de datos, backup y recuperación independientes cuando el volumen, el contrato comercial o la sensibilidad de los datos lo justifiquen.

Migrar de inmediato todas las tablas y el despliegue del MVP a una base por restaurante añadiría riesgo operativo: aprovisionamiento, enrutamiento, migraciones y soporte de varias conexiones. No mejora la validación inicial del producto lo suficiente como para justificar retrasar el piloto.

## Decisión

Adoptar como arquitectura objetivo un modelo de **control plane compartido + una base operacional por tenant**, migrado gradualmente.

- El **control plane** conserva el registro de tenants, estado de aprovisionamiento, plan contratado, región, referencia de conexión cifrada y metadatos operativos. No contiene consumos, pagos ni otros datos operacionales de estudiantes.
- Cada **base operacional** contiene exclusivamente los datos de un restaurante: usuarios operativos, planes, suscripciones, consumos, pagos, auditoría y configuración propia.
- El MVP y su piloto continúan temporalmente en la base compartida con aislamiento lógico obligatorio por `restaurant_id` y las defensas de ADR-0006.
- Los primeros tenants que se incorporen después de habilitar el aprovisionamiento podrán crearse directamente con base dedicada. Los tenants existentes se migrarán uno por uno mediante el runbook documentado.

La identidad y el tenant siguen validándose por servidor. El cliente nunca selecciona una conexión, host o nombre de base.

## Consecuencias

### Positivas

- Reduce el radio de impacto de una fuga, restauración o degradación de datos.
- Permite backups, restauraciones y retención por restaurante.
- Facilita contratos que exijan aislamiento mayor y futuras regiones.
- Evita reescribir módulos de negocio: la selección de conexión ocurre antes de repositorios y servicios.

### Negativas

- Aumenta número de bases, coste y tareas de migración.
- Los reportes globales y soporte requieren un patrón explícito de agregación desde el control plane; no se permiten consultas cruzadas improvisadas.
- Requiere automatización confiable de aprovisionamiento, secretos, monitoreo y versiones de esquema.

## Guardrails

- No se admite una base dedicada como sustituto de autorización: cada consulta conserva sus validaciones de actor y tenant.
- Ninguna URL de conexión se entrega a Flutter, al navegador ni se escribe en logs.
- No hay cambios de base dentro de una request ya autenticada.
- Una restauración de tenant no puede restaurar ni sobreescribir otro tenant.
- El estado del tenant es `provisioning`, `active`, `migration_pending`, `suspended` o `failed`; solo `active` acepta tráfico operacional.

## Plan de adopción

1. **Piloto MVP:** base compartida, RLS/filters por tenant, backup y prueba de restauración. No bloquea la salida del piloto.
2. **Sprint 1:** prototipo de dos tenants con bases separadas y pruebas de no cruce, utilizando datos ficticios.
3. **Antes del primer cliente dedicado:** automatizar creación, secreto, migraciones, health checks, backup y eliminación recuperable.
4. **Migración gradual:** trasladar un tenant por ventana de mantenimiento, verificar conteos/auditoría y mantener rollback probado.

## Referencias

- ADR-0006: `ADR-0006-diseno-multi-tenant-por-restaurante.md`
- Runbook: `../runbooks/base-datos-por-tenant.md`
- Plan de lanzamiento: `../sprints/SPRINT-0.md`
