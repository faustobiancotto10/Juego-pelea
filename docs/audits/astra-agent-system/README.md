# ASTRA — auditoría del sistema de agentes

Estado: EN CURSO. Solo auditoría y propuesta; no modifica el protocolo, R005, tareas, identidades ni locks.

Fecha: 2026-09-24. Base autoritativa `main`: `c527d4633f8b3d70a3c4b29ab19de06fa8eeef91` (consultado en GitHub). Rama documental: `audit/astra-agent-system-2026-09-24`. El piloto sprite y el PR de auditoría anterior son líneas distintas; ninguna constituye automáticamente el estado operativo de `main`.

## Alcance y método

Comparar AGENTS, protocolo, tooling, ronda, STATUS, LOCKS, tareas, handoffs, foro, identidades y plantillas contra tests y evidencia de commits/PR; distinguir `CONFIRMED`, `PROBABLE` y `HYPOTHESIS`. Leer historia solo para explicar cambios relevantes; el punto de partida de cada juicio sobre operación actual es el SHA de `main` arriba.

## Checkpoint 1 — evidencia inicial

- `CONFIRMED`: `coordination/PROTOCOL.md` §7 permite OFF_ROUND, READY, WORKING, WAITING_DEPENDENCY, HANDOFF_READY, REVIEWING, VERIFIED, BLOCKED, UNRESPONSIVE. `coordination/STATUS.md` usa `HANDOFF_CONSUMED` en la fila Mario **y** en las subfilas Mario-A/B. Reproducción en base `main`: `node --test tests/coordination-contract.test.mjs` = 9/10, falla `invalid state for Mario` en línea 106; este PR documental no corrige el estado operativo.
- `CONFIRMED`: `coordination/LOCKS.md` contiene un encabezado «Active sprite-pilot claim — Mario-B» y más abajo un claim «Active Mario-A live-integration repair», además de liberaciones históricas; hoy requiere interpretación humana para decidir qué claims siguen activos.
- `CONFIRMED`: `coordination/README.md` admite N instancias si CURRENT_ROUND define lanes separables; la activación real exige leer al menos nueve superficies antes del código. La capacidad genérica prometida todavía no equivale a claiming atómico.
- `CONFIRMED`: `main` sigue en R005 ACTIVE, AUTO_CHAIN / SAME-ROLE MARIO SQUAD. Se preserva intacto.

## Pendiente inmediato

1. Medir cobertura de invariantes del test; fallo base reproducido, se preserva como evidencia.
2. Leer tareas y handoffs Mario-A/B, historial de su integración, identidades/learning reviews y foro activo.
3. Contrastar documentación con branches/PRs y diseñar recuperación, estado actual compacto y migración segura.

Siguiente checkpoint: hallazgos reproducidos y matriz de estado/documentos.
