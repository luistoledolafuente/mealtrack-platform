# Runbook: aprovisionamiento y migración de base por tenant

## Cuándo usarlo

Usar este runbook al crear un restaurante con base dedicada, mover un restaurante desde la base compartida o recuperar una base operacional. No se usa para el piloto MVP de almuerzo: ese piloto continúa con la base compartida y el aislamiento lógico vigente.

## Alcance y responsables

| Acción | Responsable | Aprobación requerida |
|---|---|---|
| Crear tenant dedicado | Plataforma/DevOps | Product Owner o responsable comercial |
| Migrar tenant existente | Plataforma + soporte | Product Owner y ventana acordada |
| Restaurar backup | Plataforma | Responsable de seguridad/operación |
| Consultar soporte global | Superadmin autorizado | Evento auditado |

No se opera una base de tenant desde una aplicación cliente ni se comparten URLs, contraseñas o dumps por chat.

## Arquitectura operativa

```text
JWT validado → tenant registry (control plane) → referencia secreta de conexión
                                                ↓
                                      base operacional del restaurante
```

El registry mantiene `tenantId`, estado, región, versión de esquema, referencia de secreto y marcas de backup. La base operacional mantiene todos los datos del restaurante. El `tenantId` del JWT se valida antes de resolver la conexión.

## Aprovisionar un tenant nuevo

### Prerrequisitos

- Tenant aprobado y sin datos reales en entornos de desarrollo.
- Pipeline de migraciones validado contra una base temporal.
- Retención de backups definida y propietario operacional asignado.

### Procedimiento

1. Crear el registro en control plane con estado `provisioning`.
2. Crear una base y un usuario de mínimo privilegio exclusivos del tenant.
3. Guardar la URL únicamente en el gestor de secretos y almacenar en el registry una referencia, nunca el valor.
4. Ejecutar migraciones versionadas contra esa base.
5. Ejecutar `/ready`, una prueba funcional con datos ficticios y una prueba negativa: un token de otro tenant debe obtener `404`/`403` sin datos.
6. Crear backup inicial y comprobar que puede restaurarse en una base temporal.
7. Registrar versión de esquema, evidencia de pruebas y cambiar estado a `active`.

Si un paso falla, mantener `failed` o `provisioning`, revocar acceso y no enrutar tráfico a esa base.

## Migrar un tenant desde la base compartida

### Preparación

1. Inventariar tablas y conteos filtrados por `restaurant_id`.
2. Verificar auditoría, archivos relacionados y referencias externas.
3. Crear backup de la base origen y probar restauración antes de la ventana.
4. Crear la base destino siguiendo el aprovisionamiento y aplicar la misma versión de esquema.
5. Comunicar una ventana corta de solo lectura al restaurante.

### Ejecución

1. Marcar tenant como `migration_pending`; bloquear escrituras operacionales para ese tenant.
2. Exportar únicamente filas del tenant, preservando UUIDs, fechas y registros de auditoría.
3. Importar dentro de transacciones por lote y verificar claves foráneas.
4. Comparar conteos y checksums lógicos de entidades críticas: usuarios, planes, suscripciones, pagos, consumos y auditoría.
5. Ejecutar smoke test con cuentas ficticias del tenant: login, autorización, QR de almuerzo, consumo idempotente, ausencia/ajuste cuando aplique.
6. Cambiar la referencia de conexión del registry de forma atómica, marcar `active` y reabrir escrituras.
7. Conservar la copia origen como solo lectura durante el periodo de reversión definido por operación.

### Rollback

Si falla una verificación antes del cambio de referencia, descartar la base destino y mantener origen activa. Si falla después, detener escrituras, volver la referencia al origen, invalidar conexiones cacheadas y documentar el incidente. Nunca mezclar escrituras de ambas bases: si hubo actividad en destino, restaurar mediante un procedimiento de reconciliación aprobado.

## Migraciones de esquema posteriores

1. Probar la migración en una copia temporal representativa.
2. Crear backup verificable de cada tenant afectado.
3. Aplicar primero cambios aditivos y compatibles.
4. Ejecutar la migración por tenant, registrando inicio, resultado y versión.
5. Ejecutar `/ready` y smoke test mínimo por tenant.
6. Solo tras completar todos los tenants y una ventana de estabilidad, retirar columnas/código antiguo mediante una migración posterior.

No ejecutar una migración destructiva, `db push`, ni SQL no revisado contra todas las bases.

## Backup y recuperación

- Cada tenant tiene backups etiquetados con tenant, fecha, versión de esquema y verificación de restauración.
- Restaurar siempre primero en una base temporal; validar conteos, integridad y ausencia de datos de otros tenants.
- Para recuperación real, suspender el tenant, restaurar solamente su base, probar `/ready` y documentar RPO/RTO observado.
- Los dumps están cifrados y su acceso se limita al equipo autorizado.

## Señales de escalamiento

Detener la operación y escalar si hay discrepancia de conteos, auditoría faltante, tenant inesperado en un dump, migración parcial, health fallido, una URL expuesta o cualquier intento de usar un tenant indicado por el cliente.

## Evidencia que debe conservarse

- ID de tenant, operador, fecha y aprobador.
- Versiones antes/después, identificador de backup y resultado de restore.
- Conteos de origen/destino y smoke tests.
- Decisión de cutover o rollback e incidente asociado, si lo hubo.
