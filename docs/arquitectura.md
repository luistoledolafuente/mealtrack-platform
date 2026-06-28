# Arquitectura - MealTrack

## Propósito del documento
Este documento describe la arquitectura de alto nivel del sistema MealTrack. Su objetivo es definir los componentes principales, sus responsabilidades, las interacciones fundamentales y los principios arquitectónicos que guiarán el desarrollo.

## Principios arquitectónicos
- Modularidad por dominio de negocio.
- Separación de responsabilidades en capas.
- Offline-first en el cliente móvil.
- Aislamiento multi-tenant por restaurante.
- Trazabilidad y seguridad por roles.
- Facilitar mantenibilidad y colaboración futura.

## Componentes principales

### 1. Cliente móvil
Aplicación Flutter para estudiantes y administración operativa básica.

Responsabilidades:
- Interfaz de usuario.
- Almacenamiento local.
- Gestión de sesiones.
- Consulta de calendarios y estado del plan.
- Captura de acciones del usuario.
- Cola local de sincronización.

### 2. Backend API
Servicio backend construido con Node.js y Express.

Responsabilidades:
- Exponer endpoints.
- Validar permisos.
- Aplicar reglas de negocio.
- Orquestar operaciones de dominio.
- Registrar auditoría.
- Resolver conflictos de sincronización.
- Proteger acceso multi-tenant.

### 3. Base de datos principal
PostgreSQL en Supabase.

Responsabilidades:
- Persistencia central.
- Relaciones transaccionales.
- Integridad referencial.
- Soporte para aislamiento lógico por restaurante.
- Consulta histórica y reportes.

### 4. Futura interfaz web administrativa
Capa orientada a dashboards, caja, reportes y operación administrativa ampliada.

## Estilo arquitectónico
La arquitectura recomendada es:

- Modular por dominio.
- Separación por capas.
- Patrón Controller -> Service -> Repository en backend.
- Repositorios en el cliente para manejar local + remoto.
- Enfoque offline-first para móvil.

## Arquitectura del backend
Se propone una organización por módulos de negocio, donde cada módulo contenga su propia lógica.

```text
backend/
└── src/
    ├── config/
    ├── shared/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── restaurants/
    │   ├── meal-plans/
    │   ├── subscriptions/
    │   ├── daily-meals/
    │   ├── adjustment-requests/
    │   ├── payments/
    │   ├── dashboards/
    │   ├── notifications/
    │   └── audit/
    └── routes/
```

### Flujo backend
Request -> Middleware -> Router -> Controller -> Service -> Repository -> Database

Esta separación ayuda a que Express no concentre la lógica de negocio, mientras los servicios modelan reglas y los repositorios encapsulan acceso a datos.

## Arquitectura del cliente móvil
En Flutter se recomienda una arquitectura con responsabilidades separadas:

- Presentation.
- Application / state management.
- Domain.
- Data.

El módulo de datos debe coordinar almacenamiento local y acceso remoto a través de repositorios, siguiendo el patrón offline-first.

## Flujo offline-first
1. El usuario realiza una acción en la app.
2. La acción se guarda localmente.
3. El sistema actualiza el estado visual inmediatamente.
4. El registro queda en cola de sincronización.
5. Cuando hay conectividad, se envía al backend.
6. El backend valida reglas y responde.
7. La app actualiza el estado final de sincronización.

## Seguridad
La arquitectura debe considerar:
- Autenticación segura.
- Autorización por rol.
- Aislamiento multi-tenant.
- Auditoría de operaciones sensibles.
- Protección de endpoints críticos.

## Multi-tenancy
MealTrack operará con modelo multi-tenant lógico basado en restaurante. Cada registro relevante debe asociarse a un restaurante o contexto organizacional, y las políticas de acceso deben impedir fuga de datos entre tenants.

## Observabilidad
La solución debe contemplar:
- Logging estructurado.
- Manejo centralizado de errores.
- Métricas básicas de backend.
- Seguimiento de eventos de sincronización.

## Decisiones de arquitectura a documentar en ADRs
- Uso de Flutter para cliente móvil.
- Uso de Node.js + Express como backend.
- Uso de PostgreSQL/Supabase.
- Estrategia offline-first.
- Prohibición de edición histórica directa.
- Aislamiento multi-tenant por restaurante.

## Diagramas recomendados
Para enriquecer este documento más adelante, se recomienda agregar:
- Diagrama de contexto.
- Diagrama de contenedores.
- Diagrama de componentes del backend.
- Diagrama de flujo de sincronización.
- Diagrama del proceso de ajuste.
