# Visión del producto - MealTrack

## Propósito del documento
Este documento define la visión general del producto MealTrack. Su objetivo es alinear el proyecto antes de entrar a la etapa de requerimientos detallados, arquitectura y desarrollo, ya que un documento de visión describe el problema, los usuarios objetivo, el alcance general y la propuesta de valor del sistema [1][2].

## Descripción del producto
MealTrack es una plataforma mobile-first orientada al control de pensiones alimentarias para estudiantes y restaurantes. El sistema permitirá registrar planes de comida prepagados, controlar los días consumidos, gestionar días pendientes, alertar vencimientos, validar consumos y llevar trazabilidad de pagos y ajustes.

La primera experiencia principal estará centrada en una aplicación móvil para estudiantes y administradores operativos, con la posibilidad futura de incorporar una versión web enfocada en paneles administrativos y de control. Una visión clara del producto ayuda a que las decisiones posteriores de alcance y requisitos se mantengan consistentes [3][4].

## Problema
Actualmente, muchos estudiantes pagan pensiones o planes mensuales de comida en restaurantes para obtener un costo por menú más bajo. Sin embargo, cuando un estudiante no asiste a consumir uno o más días, normalmente no existe un sistema confiable, compartido y auditable que permita saber:

- Qué días sí consumió.
- Qué días no consumió.
- Cuántos días le quedan.
- Cuándo vencerá su plan.
- Si corresponde una extensión.
- Si su estado de pago está al día.

Esto genera desorden, discusiones, errores de control, poca transparencia y pérdida de tiempo tanto para el estudiante como para el restaurante.

## Usuarios objetivo
Los principales usuarios del sistema serán:

- **Estudiantes** que pagan una pensión o plan de comidas y necesitan controlar su saldo, vencimiento y consumo.
- **Admins del restaurante** que necesitan verificar consumos, controlar afiliados, revisar vencimientos y monitorear ingresos.
- **Superadmin** que gestionará el sistema a nivel global, restaurantes, configuraciones y auditoría general.

## Propuesta de valor
MealTrack busca convertirse en una solución especializada para la administración de planes de comida estudiantiles. Su propuesta de valor es ofrecer control claro, trazabilidad, reducción de conflictos, mejor gestión operativa y soporte para crecimiento futuro como plataforma SaaS multi-restaurante.

### Beneficios para el estudiante
- Saber cuántos días le quedan en tiempo real.
- Ver historial de consumo.
- Recibir alertas de vencimiento y pago.
- Tener evidencia formal ante discrepancias.

### Beneficios para el restaurante
- Controlar estudiantes afiliados y vigencias.
- Reducir errores manuales.
- Tener visibilidad operativa y financiera.
- Contar con trazabilidad ante ajustes o reclamos.

## Objetivo general
Construir una plataforma confiable, escalable y bien documentada para gestionar pensiones alimentarias estudiantiles, combinando experiencia móvil, backend robusto, control por roles y una base preparada para escalar a administración web y múltiples restaurantes.

## Objetivos específicos
- Permitir el registro y control de planes de comida prepagados.
- Registrar el consumo diario de forma controlada.
- Mostrar días consumidos, pendientes y vencimiento estimado.
- Gestionar pagos, recordatorios y estado de cuenta.
- Incorporar solicitudes de ajuste cuando existan discrepancias.
- Registrar auditoría de cambios sensibles.
- Preparar la solución para trabajo offline-first con sincronización posterior.

## Alcance del MVP
La primera versión funcional del sistema debe cubrir:

- Autenticación.
- Gestión básica de usuarios por rol.
- Registro de estudiantes y suscripciones.
- Calendario de consumo.
- Visualización de días restantes.
- Vencimiento del plan.
- Notificaciones básicas.
- Dashboard operativo básico para el restaurante.
- Sincronización inicial entre datos locales y backend.

## Alcance de la versión Pro
La versión Pro del producto incorporará:

- Validación mediante QR.
- Reportes financieros.
- Auditoría completa.
- Solicitudes de ajuste con flujo de aprobación.
- Soporte multi-restaurante más sólido.
- Herramientas ampliadas para superadmin.
- Panel web administrativo.

## No alcance inicial
Para evitar expansión descontrolada del proyecto, en la primera fase no se considera prioritario:

- Integración con pasarelas de pago complejas.
- Integración con sistemas contables externos.
- Facturación electrónica avanzada.
- Aplicación de escritorio nativa.
- Automatizaciones de IA dentro del flujo principal.

## Supuestos
- Los estudiantes contarán con un dispositivo móvil para interactuar con la app.
- El restaurante dispondrá de al menos un dispositivo para gestión y validación.
- La aplicación operará con conectividad variable, por lo que el soporte offline será relevante.
- El negocio crecerá hacia una estructura multi-restaurante.

## Riesgos iniciales
- Definir mal las reglas de consumo y ajuste puede generar conflictos de negocio.
- Una mala sincronización podría producir inconsistencias de datos.
- El control de permisos incompleto podría exponer información entre restaurantes.
- Un MVP demasiado grande podría retrasar la salida inicial.

## Criterios de éxito
El producto se considerará bien encaminado si logra:

- Disminuir el control manual de pensiones.
- Dar visibilidad clara de días pendientes y pagos.
- Reducir disputas entre estudiante y restaurante.
- Ofrecer una base documental y técnica lista para crecer.

## Resumen de visión
MealTrack será una plataforma enfocada en resolver un problema concreto y frecuente en contextos estudiantiles y restaurantes: el control de planes de comida prepagados. La visión es empezar con una solución móvil sólida, bien documentada y respaldada por un backend propio, para luego evolucionar hacia una plataforma más amplia de gestión operativa y administrativa.
