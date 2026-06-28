# ADR-0006: Diseñar el sistema como multi-tenant por restaurante

**Estado:** Aceptado

## Contexto
El producto está proyectado para escalar como plataforma SaaS donde múltiples restaurantes operarán de forma independiente. Cada restaurante debe tener su propio conjunto de estudiantes, planes, consumos y pagos, sin acceso cruzado entre ellos. Se evaluaron: multi-tenant con base de datos separada, multi-tenant lógico (aislamiento por columna) y single-tenant con instancias separadas.

## Decisión
Diseñar el sistema con modelo multi-tenant lógico basado en restaurante, con aislamiento por `restaurant_id` en las tablas principales y políticas de acceso por rol.

## Consecuencias
- Positivas: base lista para modelo SaaS, separación clara por organización, facilidad para escalar el negocio, un solo despliegue.
- Negativas: más cuidado en queries, permisos y diseño de tablas para evitar fugas de datos.
- Seguimiento: asegurar presencia de `restaurant_id` en entidades relevantes y validaciones centralizadas de acceso.
