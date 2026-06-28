# ADR-0002: Usar Node.js + Express como backend principal

**Estado:** Aceptado

## Contexto
El sistema requiere un backend API REST que gestione autenticación, reglas de negocio, persistencia y sincronización. Se consideraron Node.js + Express, Python/FastAPI, Go y Java/Spring Boot. Los criterios incluyen: rapidez de desarrollo, ecosistema, afinidad con la experiencia del equipo y flexibilidad para arquitectura modular.

## Decisión
Usar Node.js + Express como backend principal del sistema.

## Consecuencias
- Positivas: rapidez de desarrollo, ecosistema maduro (npm), afinidad con la experiencia previa del proyecto, flexibilidad para arquitectura modular por dominio.
- Negativas: será necesario imponer estructura y convenciones para evitar crecimiento desordenado.
- Seguimiento: definir patrón Controller -> Service -> Repository y contratos de API.
