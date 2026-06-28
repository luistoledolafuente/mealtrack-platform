# ADR-0003: Usar PostgreSQL sobre Supabase

**Estado:** Aceptado

## Contexto
Se necesita una base de datos relacional que soporte integridad referencial, consultas transaccionales, aislamiento multi-tenant y escalabilidad. Se evaluaron PostgreSQL (auto-gestionado), Supabase, Firebase Firestore, MySQL y MongoDB. Los criterios incluyen: modelo relacional, capacidades de seguridad, facilidad de despliegue y costo inicial.

## Decisión
Usar PostgreSQL sobre Supabase como base de datos principal del sistema.

## Consecuencias
- Positivas: base relacional robusta, buen soporte para consultas, escalabilidad razonable, capacidades de seguridad (RLS) útiles para multi-tenant, hosting gestionado con plan gratuito inicial.
- Negativas: habrá que diseñar cuidadosamente tablas, políticas (RLS) y flujos de acceso.
- Seguimiento: documentar modelo de datos, tenant isolation y estrategia de acceso desde backend.
