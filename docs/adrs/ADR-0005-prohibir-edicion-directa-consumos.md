# ADR-0005: Prohibir edición directa de consumos históricos

**Estado:** Aceptado

## Contexto
Uno de los problemas principales que resuelve MealTrack es la falta de transparencia y control sobre los consumos registrados. Si se permite la edición libre del histórico, se pierde trazabilidad y se generan conflictos entre estudiantes y restaurantes. Se evaluaron: edición libre por cualquier rol, edición con auditoría simple, y prohibición total con flujo de ajuste.

## Decisión
Toda corrección histórica deberá pasar por solicitud de ajuste y quedar auditada. No se permite edición directa de consumos pasados.

## Consecuencias
- Positivas: mayor integridad del sistema, mejor trazabilidad, menor riesgo de manipulación indebida, transparencia para ambas partes.
- Negativas: se añade un flujo adicional de revisión para correcciones legítimas.
- Seguimiento: diseñar el módulo de adjustment requests y auditoría relacionada.
