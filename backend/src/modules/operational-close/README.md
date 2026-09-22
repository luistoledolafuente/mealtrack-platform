# Job de cierre operativo

Job backend idempotente que procesa cada restaurante, fecha y servicio al cierre operativo.

## Entrada

`runOperationalClose({ restaurantId, date, service, actor })`

| Campo | Formato |
|---|---|
| `restaurantId` | UUID del restaurante |
| `date` | `YYYY-MM-DD` en la zona horaria del restaurante |
| `service` | `breakfast` \| `lunch` \| `dinner` |
| `actor` | `{ id, role, restaurantId }`; solo `admin` del mismo restaurante o `superadmin` |

La fecha es operativa local. Quien agenda el job debe resolverla con `getOperationalDateString(timeZone)` usando `restaurant.config.timezone`. Nunca se usa la hora del teléfono.

## Reglas por suscripción activa

| Situación | Resultado | Descuento |
|---|---|---|
| Existe consumo (QR/manual) para la fecha | `skipped_existing`, sin writes | No |
| Ausencia aprobada para fecha+servicio | `justified` | No |
| Ausencia pendiente para fecha+servicio | `pending_review` | No |
| Cierre extraordinario cubre fecha+servicio | `not_operational` + extensión | No, acredita +1 una sola vez |
| Sin consumo ni aviso | `auto_consumed` | Sí, −1 con débito condicional |
| Sin saldo | `failed_insufficient_balance` | No, sin writes |

## Idempotencia

- `DailyMeal.idempotencyKey = oc:{subscriptionId}:{date}:{service}` con índice único; una violación `P2002` se interpreta como ya procesado.
- El crédito por cierre se protege además con auditoría `OPERATIONAL_CLOSE_CREDIT` por `(subscription, closure, date, service)`.
- Solo se escribe auditoría y notificación cuando se crea un resultado; los reintentos no duplican nada.
- Cada suscripción se procesa en su propia transacción: consumo+débito/crédito+auditoría+notificación son atómicos por suscripción.

## Límites conocidos

- `DailyMeal` no tiene columna de servicio en el esquema actual, por lo que la existencia de un consumo en la fecha bloquea conservadoramente otros servicios del mismo día. La unicidad por servicio vive en la clave de idempotencia y en `AbsenceNotice`.
- Un cierre declarado después de un consumo ya registrado no reescribe historial; se resuelve por solicitud de ajuste.
- La aprobación de ausencias confía en el estado del aviso; el control del límite mensual vive en el flujo de revisión.
- El rate limiter de login es en memoria; multi-instancia requiere Redis.
