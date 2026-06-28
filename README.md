# MealTrack Platform

Plataforma mobile-first para gestionar pensiones alimentarias estudiantiles, control diario de consumo, seguimiento de pagos, solicitudes de ajuste, validación por QR, reportes financieros y auditoría completa para restaurantes y administradores.

Este repositorio será la base técnica de **MealTrack**, una solución pensada para ayudar a los estudiantes a controlar sus planes de comida prepagados y, al mismo tiempo, ayudar a los restaurantes a administrar estudiantes afiliados, días consumidos, días pendientes, vencimientos, pagos y reportes operativos. Un buen README debe explicar qué hace el proyecto, por qué es útil y cómo empezar a entenderlo, ya que suele ser lo primero que se ve al entrar a un repositorio.

## Descripción general

MealTrack se está diseñando como una plataforma con tres actores principales:

- **Estudiante**: consulta sus días restantes, estado diario, recordatorios de pago, notificaciones y solicitudes de ajuste.
- **Admin del restaurante**: gestiona estudiantes asociados, valida consumos diarios, revisa vencimientos próximos, controla pagos y monitorea métricas del negocio.
- **Superadmin**: administra restaurantes, planes, configuraciones globales, soporte y control general de auditoría.

El producto está planteado como una aplicación móvil en Flutter con backend propio, porque las reglas críticas del negocio, los permisos, la auditoría y la sincronización entre usuarios no deberían depender únicamente de lógica del lado cliente. A futuro también se contempla una experiencia web orientada a administración y operación del restaurante.

## Problema que resuelve

Muchos estudiantes pagan una pensión mensual o un plan prepago de comidas porque el costo por menú termina siendo más económico que pagar día por día. El problema aparece cuando un estudiante falta uno o varios días y no existe un control claro, compartido y confiable sobre qué días consumió, cuáles no consumió, cuántos le quedan, si su plan debe extenderse o si ya tiene un pago pendiente.

MealTrack busca resolver ese problema centralizando:

- Control del plan de pensión.
- Registro diario de consumo.
- Recordatorios de pago y vencimiento.
- Validación por parte del restaurante.
- Flujo de solicitudes de ajuste.
- Reportes e historial de auditoría.

## Alcance planificado

### MVP

La primera versión del sistema está pensada para incluir:

- Autenticación y acceso por roles.
- Registro de pensiones alimentarias.
- Calendario diario de días consumidos y pendientes.
- Cálculo de días restantes.
- Visualización de vencimiento del plan.
- Notificaciones y recordatorios básicos.
- Dashboard básico para admin del restaurante.
- Manejo local de datos con estrategia de sincronización remota.

### Versión Pro

La versión extendida del sistema está pensada para incluir:

- Validación de consumo mediante QR.
- Reportes financieros.
- Auditoría completa.
- Flujo de solicitudes de ajuste para disputas de “comí / no comí”.
- Soporte multi-restaurante.
- Herramientas de control para superadmin.
- Futuro panel web administrativo.

## Arquitectura propuesta

La dirección técnica actual del proyecto es la siguiente:

- **Frontend móvil**: Flutter.
- **Backend**: Node.js + Express.
- **Base de datos**: PostgreSQL sobre Supabase.
- **Autorización**: acceso por roles con aislamiento por restaurante.
- **Estrategia de datos**: enfoque offline-first / local-first en móvil con sincronización remota.
- **Futuro panel administrativo**: experiencia web orientada a gestión.

## Estructura del repositorio

Una vista rápida de la estructura del repositorio ayuda a que cualquier persona se ubique más rápido dentro del proyecto, y es una práctica recomendada en READMEs claros [3][2].

```text
mealtrack-platform/
├── README.md
├── docs/
│   ├── vision.md
│   ├── requerimientos.md
│   ├── reglas-negocio.md
│   ├── arquitectura.md
│   ├── modelo-datos.md
│   ├── api.md
│   ├── offline-sync.md
│   ├── seguridad.md
│   ├── testing.md
│   ├── deploy.md
│   └── adrs/
├── mobile/
├── backend/
└── web-admin/
```

## Módulos principales

El sistema está proyectado alrededor de estos módulos:

- Autenticación y perfiles.
- Restaurantes y gestión de tenants.
- Planes de pensión.
- Suscripciones de estudiantes.
- Registro diario de consumo.
- Solicitudes de ajuste.
- Validación por QR.
- Pagos y control de caja.
- Notificaciones.
- Dashboard y reportes.
- Auditoría.
- Administración global del sistema.

## Reglas base del negocio

Algunas reglas principales ya definidas para el proyecto son:

- El estudiante no puede editar libremente consumos históricos.
- El admin del restaurante tampoco debe alterar directamente registros pasados.
- Las correcciones históricas deben pasar por una solicitud de ajuste.
- Los cambios sensibles deben quedar auditados.
- La información debe quedar aislada por restaurante.
- La app móvil debe tolerar problemas de conexión y sincronizar después.

## Estrategia de documentación

La documentación del proyecto estará separada en tres espacios:

- **GitHub / docs del repositorio** para documentación técnica versionada.
- **Notion** para planificación, backlog, sprints y organización colaborativa.
- **Archivos exportables** como PDF o Word solo para entregables formales.

## Primeros pasos

Actualmente este repositorio se encuentra en fase de planificación y documentación. Los siguientes pasos inmediatos son:

1. Cerrar la visión del producto.
2. Documentar requerimientos funcionales y no funcionales.
3. Definir reglas de negocio en detalle.
4. Registrar los primeros ADRs.
5. Crear la base inicial de los proyectos mobile y backend.

## ADRs planificados

Las primeras decisiones de arquitectura que deberían registrarse en este repositorio son:

- Usar Flutter como frontend principal móvil.
- Usar Node.js + Express como backend propio.
- Usar Supabase PostgreSQL como base de datos principal.
- Adoptar arquitectura offline-first en móvil.
- Prohibir edición directa de consumos históricos.
- Implementar ajustes mediante solicitud y auditoría.
- Reservar una futura versión web para administración.

## Guía para futuros colaboradores

Si en el futuro se integran más personas al proyecto, el orden sugerido de lectura sería:

1. `README.md`
2. `docs/vision.md`
3. `docs/requerimientos.md`
4. `docs/reglas-negocio.md`
5. `docs/arquitectura.md`
6. ADRs relevantes dentro de `docs/adrs/`

Un README bien estructurado debe ayudar a que cualquier colaborador entienda rápidamente qué es el proyecto, para qué sirve y por dónde empezar antes de revisar código.

## Estado actual

Estado actual del proyecto: planificación, documentación y definición de arquitectura.

Este repositorio está siendo preparado con un enfoque documentation-first para que la etapa de implementación comience con alcance claro, reglas definidas y dirección técnica consistente.
