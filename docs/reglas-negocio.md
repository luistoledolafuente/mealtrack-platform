# Reglas de negocio - MealTrack

## Propósito del documento
Este documento define las reglas de negocio del sistema MealTrack. Su objetivo es establecer las políticas, restricciones y principios que gobiernan la operación del sistema, independientemente de la implementación técnica.

## Reglas generales

### RN-01 Responsabilidad del restaurante
Cada restaurante es responsable de sus estudiantes, suscripciones, consumos y operación dentro de la plataforma.

### RN-02 Aislamiento entre restaurantes
Un restaurante no debe ver ni operar sobre datos de otro restaurante dentro del flujo estándar, salvo reglas futuras explícitas.

### RN-03 Jerarquía de roles
El superadmin tiene acceso global. El admin opera solo sobre su restaurante. El estudiante solo sobre su propia información.

### RN-04 Trazabilidad de acciones
Toda acción que modifique estado financiero, consumo histórico o configuración sensible debe quedar registrada con actor, fecha, detalle y estado anterior.

## Reglas de suscripción y planes

### RN-05 Inicio de plan
Toda suscripción debe registrar fecha de inicio, cantidad de días contratados, precio pactado y estado.

### RN-06 Estado de suscripción
Una suscripción puede estar en estado activa, vencida, pausada, cancelada o finalizada.

### RN-07 Consumo asociado
Todo consumo diario debe estar vinculado a una suscripción válida.

## Reglas de consumo diario

### RN-08 Registro del día actual
El registro de consumo se hará para el día actual dentro de la ventana operativa definida por el restaurante o la plataforma.

### RN-09 Un registro por día
No debe existir más de un registro final de consumo por estudiante, por fecha y por suscripción, salvo eventos controlados de corrección.

### RN-10 Inmutabilidad histórica
Los registros históricos no pueden editarse libremente por estudiante ni por admin.

### RN-11 Estado del día
Cada día relevante debe quedar registrado con estado consumido, no consumido, justificado, pendiente o ajustado, según las reglas del flujo.

### RN-12 Impacto en saldo
Un consumo aprobado como consumido descuenta saldo del plan. Un día no consumido validado no debe descontar saldo y puede extender la vigencia lógica del plan según política definida.

## Reglas de ajuste

### RN-13 Solicitud obligatoria
Si existe discrepancia sobre un día ya registrado o cerrado, la corrección debe realizarse mediante una solicitud de ajuste.

### RN-14 Trazabilidad del ajuste
Toda solicitud debe registrar motivo, solicitante, fecha, estado, revisor y resolución.

### RN-15 Aprobación controlada
Solo los roles autorizados podrán aprobar o rechazar ajustes.

### RN-16 Sin borrado silencioso
Ningún ajuste debe eliminar evidencia histórica; el sistema debe preservar trazabilidad del estado original y del estado corregido.

## Reglas de pagos

### RN-17 Registro de pago
Todo pago debe registrar monto, fecha, método, referencia opcional y usuario que lo registró.

### RN-18 Relación con suscripción
Todo pago debe vincularse a una suscripción, renovación o concepto válido.

### RN-19 Estado financiero
La situación del estudiante puede reflejarse como al día, por vencer, vencido o pendiente según reglas definidas.

## Reglas de notificación

### RN-20 Alertas de vencimiento
El sistema debe poder generar alertas cuando una suscripción esté próxima a terminar o vencer.

### RN-21 Alertas de pago
El sistema debe generar recordatorios cuando exista pago pendiente o renovación próxima.

## Reglas de validación QR

### RN-22 QR de consumo
En la versión Pro, un QR válido debe representar una autorización temporal y verificable para registrar o confirmar un consumo.

### RN-23 Vigencia del QR
Todo QR debe tener vigencia limitada para evitar reutilización indebida.

## Reglas de auditoría

### RN-24 Eventos auditables
Deben quedar auditadas al menos las siguientes acciones: creación y actualización de suscripciones, pagos, ajustes, validaciones, aprobaciones, cambios de rol y acciones de superadmin.

### RN-25 Integridad de auditoría
Los registros de auditoría no deben ser editables por usuarios operativos comunes.

## Reglas de sincronización

### RN-26 Prioridad de consistencia
Cuando exista conflicto entre dato local y dato remoto, la resolución debe seguir la política definida por backend.

### RN-27 Estados de sincronización
Los registros móviles deben poder quedar marcados como pendiente, sincronizado, rechazado o con error.

### RN-28 Reintento
El sistema debe poder reintentar sincronizaciones fallidas sin pérdida de trazabilidad.

## Reglas de dashboards y reportes

### RN-29 Métricas por rol
Cada rol debe ver únicamente métricas acordes a su nivel de acceso.

### RN-30 Corte temporal
Los reportes financieros y operativos deben poder filtrarse por rangos de fecha.

## Reglas del superadmin

### RN-31 Poder controlado
El superadmin puede gestionar entidades globales, pero sus intervenciones sensibles también deben quedar auditadas.

### RN-32 Correcciones extraordinarias
Si el superadmin realiza una corrección excepcional, esta debe registrar motivo y trazabilidad completa.

## Principios rectores
- No alterar el pasado sin evidencia.
- No permitir acceso cruzado entre restaurantes.
- No depender totalmente de conectividad permanente.
- No sacrificar trazabilidad por rapidez operativa.
