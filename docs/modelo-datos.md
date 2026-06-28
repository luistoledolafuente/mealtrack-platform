# Modelo de datos - MealTrack

## Propósito del documento
Este documento describe el modelo de datos del sistema MealTrack. Su objetivo es definir las entidades principales, sus atributos, relaciones y restricciones, sirviendo como referencia para el diseño de la base de datos y las estructuras de datos en la aplicación.

## Principios del modelo
- Aislamiento lógico por restaurante.
- Trazabilidad de cambios sensibles.
- Soporte para sincronización offline.
- Integridad referencial.
- Preparación para auditoría.

## Entidades principales

### Usuario
Representa una persona que puede acceder al sistema.

| Atributo       | Tipo     | Descripción                          |
|----------------|----------|--------------------------------------|
| id             | UUID     | Identificador único                  |
| nombre         | String   | Nombre completo                      |
| email          | String   | Correo electrónico (único)           |
| password_hash  | String   | Hash de contraseña                   |
| rol            | Enum     | Estudiante, admin, superadmin        |
| activo         | Boolean  | Estado del usuario                   |
| created_at     | DateTime | Fecha de creación                    |
| updated_at     | DateTime | Fecha de última actualización        |

### Restaurante
Representa un restaurante o tenant dentro de la plataforma.

| Atributo       | Tipo     | Descripción                          |
|----------------|----------|--------------------------------------|
| id             | UUID     | Identificador único                  |
| nombre         | String   | Nombre del restaurante               |
| direccion      | String   | Dirección física                     |
| activo         | Boolean  | Estado del restaurante               |
| config         | JSON     | Configuraciones específicas          |
| created_at     | DateTime | Fecha de creación                    |
| updated_at     | DateTime | Fecha de última actualización        |

### PlanDePension
Representa un tipo de plan ofrecido por un restaurante.

| Atributo       | Tipo     | Descripción                          |
|----------------|----------|--------------------------------------|
| id             | UUID     | Identificador único                  |
| restaurante_id | UUID     | Restaurante al que pertenece         |
| nombre         | String   | Nombre del plan                      |
| precio         | Decimal  | Precio del plan                      |
| duracion_dias  | Integer  | Cantidad de días del plan            |
| descripcion    | Text     | Descripción y reglas del plan        |
| activo         | Boolean  | Estado del plan                      |
| created_at     | DateTime | Fecha de creación                    |
| updated_at     | DateTime | Fecha de última actualización        |

### Suscripcion
Representa la suscripción de un estudiante a un plan de pensión.

| Atributo          | Tipo     | Descripción                          |
|-------------------|----------|--------------------------------------|
| id                | UUID     | Identificador único                  |
| estudiante_id     | UUID     | Estudiante suscrito                  |
| plan_id           | UUID     | Plan contratado                      |
| restaurante_id    | UUID     | Restaurante asociado                 |
| fecha_inicio      | Date     | Fecha de inicio del plan             |
| dias_contratados  | Integer  | Días contratados                     |
| saldo_restante    | Integer  | Días no consumidos aún               |
| estado            | Enum     | Activa, vencida, pausada, cancelada  |
| created_at        | DateTime | Fecha de creación                    |
| updated_at        | DateTime | Fecha de última actualización        |

### ConsumoDiario
Representa el registro de consumo de un estudiante en un día específico.

| Atributo         | Tipo     | Descripción                          |
|------------------|----------|--------------------------------------|
| id               | UUID     | Identificador único                  |
| suscripcion_id   | UUID     | Suscripción asociada                 |
| estudiante_id    | UUID     | Estudiante                           |
| fecha            | Date     | Fecha del consumo                    |
| estado           | Enum     | Consumido, no consumido, justificado |
| registrado_por   | UUID     | Usuario que registró                 |
| metodo_validacion| String   | Manual, QR, etc.                     |
| sync_status      | Enum     | Pendiente, sincronizado, conflicto   |
| created_at       | DateTime | Fecha de creación                    |
| updated_at       | DateTime | Fecha de última actualización        |

### SolicitudAjuste
Representa una solicitud de corrección sobre un consumo registrado.

| Atributo         | Tipo     | Descripción                          |
|------------------|----------|--------------------------------------|
| id               | UUID     | Identificador único                  |
| consumo_id       | UUID     | Consumo cuestionado                  |
| solicitante_id   | UUID     | Quién solicita el ajuste             |
| motivo           | Text     | Razón de la solicitud                |
| estado           | Enum     | Pendiente, aprobada, rechazada       |
| revisor_id       | UUID     | Quién revisó                         |
| resolucion       | Text     | Comentario de resolución             |
| created_at       | DateTime | Fecha de creación                    |
| updated_at       | DateTime | Fecha de última actualización        |

### Pago
Representa un pago registrado en el sistema.

| Atributo         | Tipo     | Descripción                          |
|------------------|----------|--------------------------------------|
| id               | UUID     | Identificador único                  |
| suscripcion_id   | UUID     | Suscripción asociada                 |
| estudiante_id    | UUID     | Estudiante que paga                  |
| restaurante_id   | UUID     | Restaurante que recibe               |
| monto            | Decimal  | Monto del pago                       |
| fecha_pago       | Date     | Fecha del pago                       |
| metodo_pago      | String   | Efectivo, transferencia, etc.        |
| referencia       | String   | Referencia opcional                  |
| registrado_por   | UUID     | Usuario que registró                 |
| sync_status      | Enum     | Pendiente, sincronizado, conflicto   |
| created_at       | DateTime | Fecha de creación                    |
| updated_at       | DateTime | Fecha de última actualización        |

### Auditoria
Representa un registro de auditoría del sistema.

| Atributo         | Tipo     | Descripción                          |
|------------------|----------|--------------------------------------|
| id               | UUID     | Identificador único                  |
| usuario_id       | UUID     | Usuario que realizó la acción        |
| accion           | String   | Tipo de acción                       |
| entidad          | String   | Entidad afectada                     |
| entidad_id       | UUID     | ID de la entidad                     |
| detalle          | JSON     | Detalle del cambio                   |
| ip_origen        | String   | Dirección IP de origen               |
| created_at       | DateTime | Fecha de creación                    |

### Notificacion
Representa una notificación generada por el sistema.

| Atributo         | Tipo     | Descripción                          |
|------------------|----------|--------------------------------------|
| id               | UUID     | Identificador único                  |
| usuario_id       | UUID     | Usuario destinatario                 |
| tipo             | Enum     | Vencimiento, pago, ajuste, sistema   |
| titulo           | String   | Título de la notificación            |
| mensaje          | Text     | Cuerpo de la notificación            |
| leida            | Boolean  | Estado de lectura                    |
| created_at       | DateTime | Fecha de creación                    |

## Relaciones principales

1. Un **Restaurante** tiene muchos **PlanesDePension**.
2. Un **Restaurante** tiene muchos **Usuarios** (estudiantes y admins).
3. Un **PlanDePension** pertenece a un **Restaurante**.
4. Una **Suscripcion** vincula un **Estudiante** con un **PlanDePension** en un **Restaurante**.
5. Una **Suscripcion** tiene muchos **ConsumosDiarios**.
6. Una **Suscripcion** tiene muchos **Pagos**.
7. Un **ConsumoDiario** puede tener una **SolicitudAjuste**.
8. Un **Usuario** puede tener muchas **Notificaciones**.

## Consideraciones de sincronización
- Las entidades que se crean o modifican en el cliente móvil deben incluir un campo `sync_status` para control de sincronización.
- El `id` debe generarse en el cliente (UUID) para evitar conflictos de concurrencia.
- Los campos `created_at` y `updated_at` deben manejarse tanto local como remotamente.

## Consideraciones de auditoría
- Toda operación de creación, actualización o eliminación sensible debe registrar un evento en la tabla de auditoría.
- La tabla de auditoría debe ser de solo inserción, sin actualizaciones ni eliminaciones permitidas.

## Consideraciones multi-tenant
- Las tablas principales deben incluir `restaurante_id` para permitir aislamiento lógico.
- Las consultas deben filtrar siempre por `restaurante_id` excepto para roles superadmin.
- Las relaciones deben respetar el contexto del restaurante para evitar fuga de datos.

## Vistas recomendadas
Para facilitar operaciones frecuentes, se recomienda considerar vistas o consultas optimizadas para:
- saldo de días por estudiante,
- estado de pago,
- consumo diario,
- ajustes,
- actividad auditada.

## Evolución futura del modelo
El modelo puede ampliarse más adelante para:
- sedes múltiples por restaurante,
- promociones,
- facturación,
- wallets o saldo,
- integraciones de pago,
- reglas de consumo por horario o servicio.
