# ADR-0008: Enrutamiento seguro y versionado de esquema para bases por tenant

**Estado:** Aceptado

## Contexto

La arquitectura objetivo de ADR-0007 necesita resolver a qué base operacional se conecta una request y cómo mantener muchas bases con el mismo esquema. Un encabezado controlado por el cliente, un parámetro de URL o un identificador almacenado sin validación permitirían apuntar una request a otro tenant.

También es inseguro ejecutar migraciones de forma manual y desigual: una API nueva podría llegar a un tenant cuya base aún no tiene las tablas o restricciones requeridas.

## Decisión

Centralizar el enrutamiento y el estado de esquema en un servicio interno de tenant registry dentro del control plane.

1. La autenticación valida JWT/sesión y obtiene el `tenantId` autorizado. Un superadmin debe seleccionar un tenant mediante una acción explícita, auditada y con expiración corta.
2. Un componente de servidor consulta el registry con ese `tenantId`, verifica que esté `active` y resuelve una referencia de conexión almacenada como secreto. El cliente no participa en esta resolución.
3. La conexión queda asociada a la request o unidad de trabajo; repositorios reciben un cliente ya resuelto y no una URL.
4. Cada base operacional registra una versión de esquema. El despliegue ejecuta migraciones de forma controlada, verifica versión y marca el tenant activo solo cuando health/readiness pasan.
5. Las migraciones deben ser compatibles hacia atrás. Una migración destructiva requiere una fase expandir → migrar datos → cambiar código → contraer, con backup verificable.

## Consecuencias

- El middleware de tenant y la fábrica de cliente serán infraestructura crítica y deben tener pruebas de aislamiento.
- El pool de conexiones debe limitarse por proceso/tenant; no se abrirá una conexión permanente ilimitada por restaurante.
- El piloto no usa todavía esta fábrica de conexiones; conserva una conexión compartida y el filtro lógico actual.
- Los procesos batch se ejecutan por tenant y con una llave de idempotencia que incluya `tenantId`, fecha y tipo de operación.

## Criterios antes de habilitar un tenant dedicado

- Creación repetible de base, usuario mínimo y secreto.
- Migraciones aplicadas y versión registrada.
- `/ready` contra la base del tenant y prueba de acceso cruzado negativa.
- Backup restaurado en una base temporal y conteos críticos verificados.
- Auditoría de aprovisionamiento, migración, suspensión y restauración.

## Alternativas descartadas

- **`x-tenant-id` o subdominio como selector de conexión directo:** pueden servir como pista de UX, pero no como autoridad.
- **Una sola base para siempre:** económica al inicio, pero limita aislamiento contractual y recuperación independiente.
- **Una instancia completa de API por restaurante:** aporta aislamiento fuerte, pero multiplica coste y despliegues antes de necesitarlo.

## Referencias

- ADR-0007: `ADR-0007-aislamiento-operacional-por-base-de-datos-tenant.md`
- Runbook: `../runbooks/base-datos-por-tenant.md`
