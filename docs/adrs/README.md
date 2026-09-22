# Architecture Decision Records - MealTrack

Este directorio contiene los Architecture Decision Records (ADRs) del proyecto MealTrack.

Los ADRs documentan decisiones técnicas significativas, su contexto, la alternativa evaluada y las consecuencias esperadas.

## ADRs registrados

| ID | Título | Estado |
|---|---|---|
| ADR-0001 | Usar Flutter como frontend principal móvil | Aceptado |
| ADR-0002 | Usar Node.js + Express como backend principal | Aceptado |
| ADR-0003 | Usar PostgreSQL sobre Supabase | Aceptado |
| ADR-0004 | Adoptar enfoque offline-first en móvil | Aceptado |
| ADR-0005 | Prohibir edición directa de consumos históricos | Aceptado |
| ADR-0006 | Diseñar el sistema como multi-tenant por restaurante | Aceptado |
| ADR-0007 | Aislamiento operacional por base de datos por tenant de forma gradual | Aceptado |
| ADR-0008 | Enrutamiento seguro y versionado de esquema para bases por tenant | Aceptado |

## Convención
- Un archivo por decisión.
- Nombres numerados secuencialmente: `ADR-XXXX-titulo-breve.md`.
- Los ADRs se mantienen incluso si una decisión cambia; en ese caso se actualiza el estado.

## Cómo revisarlos
Se recomienda revisarlos en el siguiente orden:

1. `docs/adrs/README.md`
2. ADR-0001 al ADR-0008
3. `docs/api.md`
