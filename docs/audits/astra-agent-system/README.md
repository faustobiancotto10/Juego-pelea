# ASTRA — auditoría del sistema de agentes

Estado: AUDITORÍA COMPLETA / PROPUESTA SIN IMPLEMENTAR. Solo documentación; no modifica el protocolo, R005, tareas, identidades ni locks.

Fecha: 2026-09-24. Base autoritativa `main`: `c527d4633f8b3d70a3c4b29ab19de06fa8eeef91` (consultado en GitHub). Rama documental: `audit/astra-agent-system-2026-09-24`. El piloto sprite y el PR de auditoría anterior son líneas distintas; ninguna constituye automáticamente el estado operativo de `main`.

## Alcance y método

Comparar AGENTS, protocolo, tooling, ronda, STATUS, LOCKS, tareas, handoffs, foro, identidades y plantillas contra tests y evidencia de commits/PR; distinguir `CONFIRMED`, `PROBABLE` y `HYPOTHESIS`. Leer historia solo para explicar cambios relevantes; el punto de partida de cada juicio sobre operación actual es el SHA de `main` arriba.

## Resumen ejecutivo

**Respuesta:** el sistema actual soporta squads preparados manualmente (Mario-A/B y otros), pero no garantiza un claim exclusivo si diez chats idénticos se activan a la vez. La máquina de estados y el test ya discrepan en `main`; el estado vigente exige leer revisiones viejas y resolver encabezados contradictorios. La solución de mayor retorno es reconciliar el estado, agregar un índice vigente pequeño, validar tasks/locks/handoffs y probar adquisición condicional de slots disjuntos. Mantener roles y QA de exact SHA; no introducir scheduler ni base de datos.

**Fuerzas probadas:** el QA de Germinator rechazó un candidato sprite que carecía de integración jugable, verificó la reparación `fe2b505…` y Gonza publicó la preview aislada con paridad de assets. Esta disciplina de candidatos exactos escala bien y debe conservarse.

## Checkpoint 1 — evidencia inicial

- `CONFIRMED`: `coordination/PROTOCOL.md` §7 permite OFF_ROUND, READY, WORKING, WAITING_DEPENDENCY, HANDOFF_READY, REVIEWING, VERIFIED, BLOCKED, UNRESPONSIVE. `coordination/STATUS.md` usa `HANDOFF_CONSUMED` en la fila Mario **y** en las subfilas Mario-A/B. Reproducción en base `main`: `node --test tests/coordination-contract.test.mjs` = 9/10, falla `invalid state for Mario` en línea 106; este PR documental no corrige el estado operativo.
- `CONFIRMED`: `coordination/LOCKS.md` contiene un encabezado «Active sprite-pilot claim — Mario-B» y más abajo un claim «Active Mario-A live-integration repair», además de liberaciones históricas; hoy requiere interpretación humana para decidir qué claims siguen activos.
- `CONFIRMED`: `coordination/README.md` admite N instancias si CURRENT_ROUND define lanes separables; la activación real exige leer al menos nueve superficies antes del código. La capacidad genérica prometida todavía no equivale a claiming atómico.
- `CONFIRMED`: `main` sigue en R005 ACTIVE, AUTO_CHAIN / SAME-ROLE MARIO SQUAD. Se preserva intacto.

## Checkpoints publicados

1. Baseline y reproducción del test: `b570d78092ffcc8bdbd596298daf3efd9d286455`.
2. Sistema real y fallas: `3989144c5bddd79f4f30b6a82bf88d394e1276a8`.
3. Corrección puntual de la lectura de STATUS: `9ef7ea5a9a6d89ab7f8868e4443759503246dc36`.
4. Diseño de roles, workers y estados: `a88d36710de5a54a38132a42ba6ceca29a1faee2`.
5. Boot, handoff y QA propuestos: `438dbe03bb9c3ea37fc920d579ce78a75c1cf6b7`.

## Documentos

- `CURRENT_SYSTEM.md`: reconstrucción real, divergencias, experimento Mario-A/B y tooling.
- `FAILURE_MODES.md`: hallazgos con evidencia, impacto, riesgo/owner/gate y seis escenarios de reemplazo.
- `TARGET_ARCHITECTURE.md`: entidades, residencia, responsabilidad y exclusiones.
- `MULTI_INSTANCE.md`: slots N, ownership y límites de integrador/QA.
- `STATE_MODEL.md`: estados separados de task/instance/round y reglas de admisión.
- `BOOT_AND_HANDOFF.md`: flujo de activación, claiming, checkpoints y recibo canónico.
- `COORDINATION_TESTING.md`: regresiones, fixtures y ensayo concurrente.
- `MIGRATION_PLAN.md`: fases 0–5 con owners, dependencias y gates.
- `HANDOFF.md`: decisión recomendada a Neureon.

## Límite de evidencia

Se hizo inspección estática y prueba local de coordinación sobre `main`, más inspección de historial y metadatos de PR #50, #52, #55, #59 y #60. No se activaron chats de agentes ni se probó concurrencia real. El CAS mediante avance condicional de ref es diseño pendiente de prueba. El gate físico/usuario de R005 no fue tocado.

## Estado durante los primeros checkpoints (histórico)

Estos ítems quedaron atendidos por `CURRENT_SYSTEM.md`, `FAILURE_MODES.md`, `COORDINATION_TESTING.md` y el plan. Los SHAs de los checkpoints preservan qué estaba probado en cada momento; el handoff vigente es `HANDOFF.md`.
