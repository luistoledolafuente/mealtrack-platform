# Requerimientos - MealTrack

## Propósito del documento
Este documento define los requerimientos funcionales y no funcionales del sistema MealTrack. Su objetivo es establecer qué debe hacer el sistema, bajo qué condiciones y con qué restricciones, sirviendo como base para el diseño, desarrollo y validación del producto.

## Requerimientos funcionales

### RF-01 Autenticación
El sistema debe permitir iniciar sesión mediante correo electrónico y contraseña.

### RF-02 Roles de usuario
El sistema debe soportar al menos los roles: estudiante, admin de restaurante y superadmin.

### RF-03 Registro de usuarios
El sistema debe permitir registrar nuevos usuarios con datos básicos y asignación de rol.

### RF-04 Gestión de restaurantes
El sistema debe permitir asociar usuarios a un restaurante y asignarles roles autorizados.

### RF-05 Gestión de planes de pensión
El sistema debe permitir crear y administrar planes de pensión indicando nombre, precio, duración, reglas y estado.

### RF-06 Registro de suscripción
El sistema debe permitir registrar una suscripción de estudiante a un plan de pensión con fecha de inicio, días contratados y estado.

### RF-07 Calendario de consumo
El sistema debe mostrar un calendario o historial por fechas indicando si el estudiante consumió o no consumió en un día determinado.

### RF-08 Registro de consumo diario
El sistema debe permitir registrar el consumo diario del estudiante bajo las reglas definidas para el día actual.

### RF-09 Cálculo de saldo de días
El sistema debe calcular y mostrar días consumidos, días pendientes y fecha estimada de vencimiento.

### RF-10 Alertas y recordatorios
El sistema debe generar alertas por vencimiento próximo, pagos pendientes o eventos relevantes.

### RF-11 Gestión de pagos
El sistema debe permitir registrar pagos realizados por el estudiante relacionados con su plan o renovación.

### RF-12 Estado de cuenta
El sistema debe permitir visualizar el estado de pagos y vigencias del estudiante.

### RF-13 Solicitudes de ajuste
El sistema debe permitir que el estudiante o el admin generen solicitudes de ajuste cuando exista discrepancia sobre un consumo.

### RF-14 Flujo de revisión de ajustes
El sistema debe permitir revisar, aprobar o rechazar solicitudes de ajuste según permisos definidos.

### RF-15 Auditoría
El sistema debe registrar eventos sensibles como creación de suscripciones, pagos, ajustes, aprobaciones y cambios administrativos.

### RF-16 Dashboard del restaurante
El sistema debe mostrar al admin métricas básicas como estudiantes activos, pensiones por vencer, pagos recientes y resumen operativo.

### RF-17 Dashboard superadmin
El sistema debe mostrar al superadmin información consolidada de restaurantes, usuarios, actividad y estado general de la plataforma.

### RF-18 Soporte offline-first
La app móvil debe permitir trabajar con datos locales y sincronizar con el backend cuando exista conectividad.

### RF-19 Validación por QR
La versión Pro debe permitir validar el consumo del día mediante QR.

### RF-20 Reportes financieros
La versión Pro debe permitir generar reportes operativos y financieros por rango de fechas.

### RF-21 Multi-restaurante
El sistema debe soportar múltiples restaurantes con aislamiento lógico de información.

### RF-22 Panel web administrativo
La versión futura debe permitir acceso administrativo desde interfaz web.

## Requerimientos no funcionales

### RNF-01 Seguridad
El sistema debe aplicar autenticación segura, autorización por roles y aislamiento de datos por restaurante.

### RNF-02 Trazabilidad
Toda acción sensible debe quedar registrada en logs de auditoría.

### RNF-03 Disponibilidad operativa
La app debe seguir siendo usable en condiciones de conectividad intermitente para los flujos prioritarios del estudiante.

### RNF-04 Rendimiento
Las consultas principales del dashboard y del calendario deben responder en tiempos aceptables para una experiencia fluida.

### RNF-05 Escalabilidad
La arquitectura debe permitir crecer a más restaurantes, usuarios y módulos sin rediseños radicales.

### RNF-06 Mantenibilidad
El sistema debe seguir una arquitectura modular, con separación clara de responsabilidades y documentación actualizada.

### RNF-07 Usabilidad
La interfaz debe ser simple, clara y comprensible para usuarios no técnicos.

### RNF-08 Portabilidad
El cliente principal debe ejecutarse en Android e idealmente quedar preparado para iOS mediante Flutter.

### RNF-09 Integridad de datos
No deben existir alteraciones históricas directas sin trazabilidad.

### RNF-10 Observabilidad
El backend debe permitir monitorear errores, eventos y actividad relevante.

## Requerimientos por actor

### Estudiante
- Ver plan activo.
- Ver días restantes.
- Ver historial de consumo.
- Ver pagos.
- Recibir alertas.
- Solicitar ajustes.

### Admin restaurante
- Gestionar estudiantes de su restaurante.
- Ver suscripciones activas.
- Validar consumos.
- Registrar pagos.
- Revisar ajustes.
- Consultar dashboard y reportes.

### Superadmin
- Gestionar restaurantes.
- Gestionar usuarios globales.
- Consultar auditoría.
- Monitorear operación general.
- Configurar reglas globales.

## Restricciones
- El sistema no debe permitir edición libre del pasado por parte de estudiante o admin.
- La información de un restaurante no debe ser visible para otro restaurante.
- El MVP no debe depender de integraciones externas críticas.

## Criterios de aceptación globales
- Los requerimientos deben ser verificables mediante pruebas funcionales.
- Las reglas críticas deben estar alineadas con el documento de reglas de negocio.
- Todo requerimiento del MVP debe poder mapearse a una pantalla, endpoint o caso de uso.
