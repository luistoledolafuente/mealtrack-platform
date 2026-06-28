# ADR-0004: Adoptar enfoque offline-first en móvil

**Estado:** Aceptado

## Contexto
La aplicación móvil operará en entornos con conectividad variable. Los estudiantes deben poder consultar su saldo, registrar consumo y realizar acciones básicas incluso sin conexión. Se consideraron enfoques online-only, offline-first con sincronización diferida y PWA con Service Workers.

## Decisión
Adoptar enfoque offline-first con almacenamiento local, cola de sincronización y validación remota cuando exista conectividad.

## Consecuencias
- Positivas: mejor experiencia de usuario, continuidad operativa, tolerancia a fallos de red, disponibilidad sin conexión.
- Negativas: mayor complejidad en sincronización, control de estados (pendiente, sincronizado, conflicto) y resolución de conflictos.
- Seguimiento: documentar política de conflictos, estados de sincronización y responsabilidades entre cliente y servidor.
