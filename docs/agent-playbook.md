# Playbook de agentes — MealTrack

## Propósito

Este documento coordina el trabajo entre Codex, OpenCode y Antigravity sin perder trazabilidad ni crear conflictos en el repositorio.

## Roles

| Rol | Responsabilidad |
|---|---|
| Product Owner | Prioriza problemas, aprueba alcance y valida el piloto con usuarios reales. |
| Codex núcleo | Mantiene arquitectura, backlog, ADRs, seguridad, revisión final e integración. |
| OpenCode | Implementa tareas backend, pruebas y automatizaciones con alcance acotado. |
| Antigravity | Implementa y valida Flutter, UX móvil, compilaciones y pruebas manuales. |

## Regla de aislamiento

Cada tarea de implementación usa una rama y worktree propios. No se permiten dos agentes modificando el mismo módulo o archivo sin una división explícita aprobada por Codex.

Formato de ramas:

```text
codex/s0-01-resource-authorization
opencode/s0-03-transactional-consumption
antigravity/s0-07-mobile-staging
```

## Contrato de una tarea

Todo encargo a un agente debe incluir:

1. ID de historia y objetivo.
2. Archivos o módulos dentro del alcance.
3. Archivos explícitamente fuera del alcance.
4. Criterios de aceptación y comandos de verificación.
5. Restricciones de seguridad y reglas de negocio.
6. Entregable: diff, pruebas, riesgos y decisiones tomadas.

## Flujo de entrega

```text
Backlog refinado → agente implementa en worktree → pruebas → revisión independiente →
revisión de Codex → integración → staging → demo → retrospectiva
```

## Reglas no negociables

- Nunca exponer secretos, tokens, contraseñas o bases de datos de clientes.
- Nunca seleccionar tenant desde un dato controlable por cliente sin verificar membresía.
- Nunca permitir edición directa de consumos históricos.
- Nunca borrar evidencia de auditoría.
- Nunca ejecutar seeds destructivos o migraciones de desarrollo sobre staging o producción.
- Nunca integrar un cambio sin pruebas proporcionales a su riesgo.

## Escalamiento

Un agente debe detenerse y reportar a Codex cuando encuentre un conflicto de arquitectura, una decisión que afecte varios módulos, un cambio de esquema irreversible, un secreto, una posible fuga de tenant o una prueba de seguridad fallida.

