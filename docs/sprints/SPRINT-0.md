# Sprint 0 — Fundaciones para piloto seguro

## Objetivo

Preparar MealTrack para un piloto interno de Pensiones: cerrar accesos cruzados entre restaurantes, establecer una ruta de despliegue reproducible y definir la base de la arquitectura SaaS por tenant.

No se agregan módulos de ventas, inventario ni funcionalidades comerciales nuevas en este sprint.

## Resultado esperado

Al cierre del sprint, el equipo podrá desplegar una API de staging en Render con una base de datos de piloto aislada, secretos fuera del repositorio, migraciones de producción, pruebas de permisos y un APK interno que use HTTPS.

## Prioridades

### P0 — Debe terminar antes de cualquier despliegue público

| ID | Historia | Criterios de aceptación | Responsable sugerido |
|---|---|---|---|
| S0-01 | Como usuario, solo puedo leer recursos que me pertenecen o que pertenecen a mi restaurante. | Todos los endpoints de detalle verifican actor y contexto; los recursos fuera de alcance devuelven `404`; hay pruebas estudiante/admin/superadmin y de acceso cruzado. | Codex + OpenCode |
| S0-02 | Como plataforma, el tenant se determina únicamente mediante una membresía validada por servidor. | Se elimina `x-tenant-id` como fuente directa de contexto; el token o sesión proporciona el contexto validado; todo acceso de soporte queda auditado. | Codex |
| S0-03 | Como restaurante, el saldo y el consumo permanecen consistentes ante reintentos o concurrencia. | Consumo, QR y ajustes usan transacciones e idempotencia; no se consume con saldo cero; una solicitud no se revisa dos veces. | OpenCode, revisión Codex |
| S0-04 | Como plataforma, las operaciones sensibles dejan evidencia inmutable y acotada al tenant. | Auditoría registra tenant, actor, acción, entidad, correlación y detalle sanitizado; los logs no pueden modificarse mediante la cuenta operativa. | Codex |

### P1 — Necesario para operar un piloto interno

| ID | Historia | Criterios de aceptación | Responsable sugerido |
|---|---|---|---|
| S0-05 | Como equipo, la API falla al arrancar si producción está mal configurada. | Sin secretos débiles por defecto; CORS permitido explícitamente; rate limit de login; logs sin token ni contraseña. | OpenCode, revisión Codex |
| S0-06 | Como equipo, puedo desplegar staging de forma repetible. | `.env.example`, CI, `render.yaml`, build, `prisma migrate deploy`, `/health` y `/ready` documentados. | OpenCode |
| S0-07 | Como tester, puedo probar la app contra staging por HTTPS. | URL por `--dart-define`; Android release no permite tráfico HTTP claro; identificador de app y firma de release documentados. | Antigravity |
| S0-08 | Como startup, puedo evaluar el aislamiento por base independiente sin rehacer el MVP. | ADR aprobado, prototipo de dos tenants aislados y plan de aprovisionamiento/migración por tenant. | Codex |

### P2 — Preparación del siguiente sprint

| ID | Historia | Criterios de aceptación |
|---|---|---|
| S0-09 | Backlog de Pensiones listo para piloto. | Casos de aceptación por actor, flujo de ajustes y matriz de permisos aprobados. |
| S0-10 | Operación de incidentes preparada. | Runbook de rollback, backup, restauración y contacto de soporte. |

## Dependencias y orden

```text
S0-01 + S0-02 ─┬─> S0-03 ─> pruebas de regresión
               ├─> S0-04
               └─> S0-05 ─> S0-06 ─> S0-07 ─> piloto interno

S0-08 corre en paralelo y define el Sprint 1.
```

## Definición de listo

Una historia entra al sprint solo si tiene alcance, archivos o módulos afectados, criterios de aceptación, riesgo de seguridad, estrategia de prueba y responsable único de implementación.

## Definición de terminado

- Compila y pasa análisis estático, pruebas relevantes y revisión de cambios.
- No permite acceso cruzado entre tenants.
- Mantiene la auditoría y las reglas RN-02, RN-10, RN-16 y RN-25.
- No introduce secretos ni datos reales de estudiantes en repositorio.
- Incluye documentación operativa cuando cambia despliegue, permisos o arquitectura.
- Está revisada por un agente distinto al implementador y aprobada por el núcleo de arquitectura.

## Cadencia Scrum

- Duración: dos semanas.
- Refinamiento: semanal, dirigido por Product Owner.
- Daily: 10 minutos, bloqueos y cambios de alcance solamente.
- Review: demo de staging y resultados de pruebas.
- Retrospectiva: una mejora concreta de proceso para el siguiente sprint.

## Métricas del sprint

- Cero hallazgos P0 abiertos antes del piloto.
- Cobertura de pruebas de autorización en todos los recursos sensibles.
- Despliegue de staging reproducible desde una rama validada.
- Restauración de backup ensayada antes de usar datos de piloto.

