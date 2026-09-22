# Decisiones de producto — MVP Pensiones

Este documento es el contexto funcional para agentes que trabajen en Pensiones. No se debe modificar código que contradiga estas reglas sin aprobación explícita del Product Owner.

## Alcance congelado del piloto

El piloto público opera solamente **almuerzo**. El modelo funcional conserva la
posibilidad futura de desayuno y cena, pero no se habilitan en QR, planes,
ausencias ni cierre automático hasta contar con saldos independientes por
servicio. Tampoco forman parte del piloto ventas, inventario, facturación ni
pagos en línea.

No se incorporan estudiantes reales hasta aplicar migraciones en staging,
superar el smoke test de QR de almuerzo y ensayar una restauración de backup.

## Objetivo

Permitir que un estudiante con una pensión mensual registre su asistencia al escanear un QR mostrado por el restaurante. El sistema controla el saldo, los días permitidos, ausencias justificadas, horarios, cierres del restaurante y pagos.

## 1. Flujo de QR de consumo

El QR pertenece al restaurante, no al estudiante. Un colaborador autorizado abre la pantalla de registro de consumo en una tablet, teléfono o pantalla del restaurante.

```text
Restaurante muestra QR → estudiante lo escanea en la app → API valida reglas → consumo registrado
```

El QR representa una sesión temporal de consumo para un restaurante, sucursal, servicio y ventana horaria. No identifica a un estudiante por sí mismo; la identidad sale de la sesión autenticada de la app móvil.

### Reglas

- El QR debe rotar automáticamente y vencer en poco tiempo, recomendado entre 30 y 60 segundos. Para el personal puede parecer visualmente estable: la aplicación lo renueva en segundo plano sin exigir una nueva acción.
- Un QR está vinculado a restaurante, sucursal, servicio y ventana operativa.
- Un estudiante puede consumir solo si tiene suscripción activa, saldo disponible, servicio incluido y día permitido por su plan.
- Un estudiante solo puede registrar un consumo por fecha y servicio.
- Escanear el QR fuera del horario, en otro restaurante, con saldo cero o con una suscripción inactiva debe ser rechazado.
- Un QR estático impreso no es suficiente para el flujo final porque puede compartirse o escanearse fuera del restaurante. Puede existir como solución provisional solo si se acompaña de una sesión dinámica mostrada en pantalla.
- La pantalla debe mostrar además un código temporal de seis dígitos para ingreso manual cuando la cámara no funcione. El código tiene la misma caducidad y validaciones que el QR.

## 2. Servicios de comida (diseño futuro)

La plataforma soportará en su diseño objetivo:

- Desayuno.
- Almuerzo.
- Cena.

El superadmin habilita qué servicios puede usar cada restaurante según su plan SaaS. El admin del restaurante configura los servicios que realmente ofrece, sus horarios y sus días de atención.

Cada consumo será único por:

```text
suscripción + fecha + servicio
```

Ejemplo: una suscripción puede incluir almuerzo de lunes a sábado; usar el QR de cena no debe consumir saldo si cena no forma parte del plan.

## 3. Planes de pensión mensuales

El MVP vende pensiones mensuales, no paquetes arbitrarios de días.

Los formatos iniciales son:

- Lunes a viernes.
- Lunes a sábado.
- Lunes a domingo.

Un plan debe definir:

- Ciclo mensual.
- Servicios incluidos: desayuno, almuerzo, cena o combinación.
- Días de semana permitidos.
- Precio.
- Ventana horaria por servicio.
- Límite mensual de ausencias justificables.
- Política de pago parcial.

Los días contratados se calculan desde el calendario del periodo y los días de atención configurados. Ejemplo: un plan de almuerzo de lunes a sábado para junio incluye los días de junio que cumplan ese calendario, no un valor fijo inventado.

## 4. Cierres y días no operativos

El admin debe poder anunciar un cierre extraordinario: motivo, fecha o rango de fechas y servicios afectados.

Ejemplo:

```text
Domingo 14: restaurante cerrado por mantenimiento; afecta almuerzo y cena.
```

El sistema debe:

1. Mostrar una alerta destacada en la pantalla principal de los estudiantes afectados.
2. Impedir registrar consumo para ese restaurante, fecha y servicio.
3. No descontar saldo por el cierre.
4. Extender automáticamente la vigencia por cada servicio elegible afectado.
5. Registrar el evento, la extensión resultante y las notificaciones en auditoría.

La extensión debe aplicarse una sola vez por cierre, suscripción, fecha y servicio, incluso si el job se reintenta.

## 5. Ausencias del estudiante

Cada restaurante configura un límite mensual de ausencias justificables. Valor inicial recomendado: tres por periodo mensual.

El estudiante puede avisar que no asistirá y explicar el motivo. No se exige evidencia médica en el MVP. El aviso puede enviarse hasta el cierre operativo del día configurado por el restaurante, incluso si la ventana de servicio ya terminó.

Ejemplo: el almuerzo atendió de 12:00 a 16:00 y el cierre operativo es a las 22:00. El estudiante puede registrar el aviso hasta las 22:00, siempre que no exista ya un consumo QR o manual para esa fecha y servicio.

### Resultado de una ausencia

| Situación | Resultado |
|---|---|
| Solicitud aprobada dentro del límite mensual | No se descuenta el consumo; se extiende o acredita un día según política del plan. |
| Solicitud pendiente dentro del cierre operativo | Queda pendiente de revisión del admin; no se cobra automáticamente antes del cierre operativo. |
| Solicitud rechazada | El día cuenta como consumo si estaba programado. |
| Límite mensual superado | El día cuenta como consumo si estaba programado. |
| Sin aviso al cierre operativo | El día cuenta como consumo si estaba programado. |
| Restaurante cerrado | No cuenta como ausencia del estudiante ni como consumo. |

Se necesitan dos flujos distintos:

- **Aviso de ausencia:** para una fecha o servicio próximo.
- **Solicitud de ajuste:** para corregir un consumo histórico registrado por error.

No deben confundirse. El aviso de ausencia no reescribe historial; la solicitud de ajuste conserva el registro original y su resolución.

## 6. Cierre de cada servicio

Al llegar al cierre operativo del día, el sistema evalúa cada suscripción activa que tenía derecho a cada servicio. El cierre operativo puede ser posterior al fin de la ventana de atención para permitir avisos tardíos y revisión operativa.

- Si escaneó el QR: queda `consumed` y se descuenta saldo.
- Si tiene aviso de ausencia pendiente: queda `absence_pending_review` y no se descuenta aún; el admin lo aprueba o rechaza.
- Si tiene ausencia aprobada: queda `justified` y no se descuenta saldo.
- Si el restaurante estaba cerrado: queda `not_operational` y no se descuenta saldo.
- Si no asistió ni notificó una ausencia antes del cierre: queda `consumed` por cierre automático y se descuenta saldo.

Este cierre debe ser un job de backend idempotente y auditable; nunca depende únicamente de la app móvil.

## 7. Pagos parciales

La política de pago parcial es configurable por restaurante. Valor recomendado para el MVP: bloqueado por defecto.

Opciones previstas:

- `block`: la suscripción no se activa hasta completar el pago.
- `allow_full_plan_with_debt`: se activa el plan completo, pero queda deuda registrada.

No implementar prorrateo automático de días por monto parcial en el MVP. Ejemplo: pagar S/ 50 de S/ 300 no debe inventar automáticamente cinco días sin una regla comercial explícita.

## 8. Permisos

| Acción | Estudiante | Admin restaurante | Superadmin |
|---|---:|---:|---:|
| Escanear QR del restaurante | Sí | No | Solo soporte auditado |
| Mostrar QR operativo | No | Sí | Sí |
| Registrar consumo manual excepcional | No | Sí | Sí, auditado |
| Crear aviso de ausencia | Sí | Sí, por operación del restaurante | Sí |
| Crear ajuste histórico | Sí | Sí, solo su restaurante | Sí |
| Aprobar/rechazar ausencia o ajuste | No | Sí, solo su restaurante | Sí |
| Configurar horarios, días y servicios | No | Sí, dentro de servicios habilitados | Sí |
| Habilitar servicios para un restaurante | No | No | Sí |

## 9. Operación y seguridad

- Saldo cero bloquea siempre el consumo.
- Toda operación de consumo, saldo y resolución de ajuste debe ejecutarse en una transacción.
- Reintentos por falta de conexión deben usar una clave de idempotencia.
- Los cambios históricos se hacen mediante eventos de ajuste, nunca mediante edición o borrado.
- Un admin no puede operar sobre otro restaurante.
- Horarios y zona horaria pertenecen al restaurante/sucursal, no al dispositivo del estudiante.

## 10. Decisiones confirmadas

- QR mostrado por el restaurante y escaneado por el estudiante.
- Saldo cero bloqueado.
- Planes mensuales de lunes a viernes, lunes a sábado o lunes a domingo.
- Ausencias justificables con límite configurable; valor inicial recomendado: tres por mes.
- No se exige evidencia médica en el MVP.
- Servicios desayuno, almuerzo y cena soportados desde el modelo.
- Superadmin habilita servicios por restaurante; admin configura la operación permitida.
- Admin y estudiante pueden crear solicitudes según su alcance.
- Pago parcial configurable, bloqueado por defecto.
- Ventanas operativas configurables por restaurante.
- Cierres extraordinarios extienden automáticamente la vigencia por cada servicio elegible afectado.
- El aviso de ausencia puede crearse hasta el cierre operativo del día y requiere aprobación del admin del restaurante.
- Una inasistencia sin aviso se cobra automáticamente al cierre operativo.
- El QR se muestra desde una app o pantalla operativa del restaurante y se renueva automáticamente; existe código temporal de seis dígitos como respaldo.

## 11. Reglas técnicas derivadas para S0-03

1. Persistir servicio, zona horaria, método de registro, motivo de cierre y claves de idempotencia en los eventos operativos.
2. Hacer único el consumo por suscripción, fecha y servicio; un reintento debe devolver el mismo resultado, nunca descontar doble saldo.
3. Mantener el aviso de ausencia como entidad distinta de la solicitud de ajuste histórico.
4. Resolver consumo, saldo, auditoría y notificación en una transacción del backend.
5. Ejecutar el cierre operativo mediante un job idempotente, no desde el móvil ni desde una acción manual del usuario.
6. Validar por servidor el restaurante, sede, servicio, horario, token QR/código temporal, rol y suscripción activa.
7. Toda aprobación, rechazo, cierre automático, extensión por cierre y registro manual excepcional debe quedar auditado.
