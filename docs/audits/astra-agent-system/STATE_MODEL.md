# Estados y transiciones propuestos

## Observación actual

`PROTOCOL.md` §7 ofrece nueve estados mezclando tarea e instancia. `STATUS.md` introduce `HANDOFF_CONSUMED` para Mario y `tasks/V07-SPR-MB.md` introduce `HANDOFF_READY_BILATERAL_ANCHOR_REVIEW`; ambos fuera del vocabulario. `tests/coordination-contract.test.mjs` lee solo seis filas de STATUS, comprueba presencia textual de términos en docs y no valida tareas, transiciones, locks ni referencias. Un handoff consumido es relación de dependencia/evidencia, no estado del trabajador.

## Máquina mínima para nueva ronda (sin aplicar a R005)

Task: `WAITING_DEPENDENCY → READY → CLAIMED → CHECKPOINTED → HANDOFF_READY → VERIFIED`. Se permite `CLAIMED` o `CHECKPOINTED → BLOCKED → READY/CLAIMED` tras corrección autorizada; `HANDOFF_READY → CLAIMED` para reparación tras QA BLOCK preservando versión y veredicto previos. `VERIFIED → ARCHIVED` solo tras round closure. QA rechazada no es VERIFIED; añade un veredicto BLOCK referenciando el SHA y reabre task con nueva revisión. `CHECKPOINTED` es opcional como evento interno (no estado requerido en STATUS). Si cambia el scope o base, se crea revisión de task, no se borra el SHA previo.

Instance: `UNASSIGNED → ACTIVE → RELEASED`; `ACTIVE → PAUSED → ACTIVE` por reactivación; `ACTIVE/PAUSED → REASSIGNED` solo con cesión explícita o decisión humana documentada. `UNRESPONSIVE` puede anotarse como diagnóstico humano, nunca liberar automáticamente paths. El estado del worker no se infiere del estado del producto.

Round: `IDLE → ACTIVE → VALIDATION → RELEASE → ROUND_COMPLETE`, con `PAUSED` cuando hay gate externo; regresar a ACTIVE/VALIDATION requiere evento documentado y preserva evidencia anterior. Un preview verificado y pendiente de teléfono no equivale a RELEASE ni ROUND_COMPLETE.

Eventos ortogonales: `HANDOFF_CONSUMED(task_id, recipient_task_id, evidence_sha)`; `QA_APPROVE(candidate_sha)`; `QA_BLOCK(candidate_sha, reason)`; `USER_GATE_ACCEPTED(artifact_sha)`; `LOCK_RELEASED(slot, paths)`. Estos no son valores para la columna State de un agent.

Reglas de admisión:

1. Cada task tiene role/owner slot inequívoco, branch y base SHA completo; cada dependencia apunta a un task existente y evidencia aceptada.
2. CLAIM exige READY, sin otro claim activo para slot/paths, y CAS sobre HEAD de coordinación; si CAS falla, re-evaluar todas las precondiciones.
3. HANDOFF_READY exige SHA de commit existente descendiente de base, changed paths permitidos, verificación registrada y recibo Identity Learning Review.
4. VERIFIED exige QA explícita cuando contrato la requiere y exact SHA/árbol; un QA BLOCK impide dependientes afectados.
5. Release exige gates de `PROTOCOL.md` §14 y consenso de versión entre task, handoff, QA e integración; estado global no se modifica por un worker accidentalmente.

Probar estas reglas antes de migrar STATUS a datos estructurados. Durante transición, validator lee tanto formato heredado como nuevo y enumera excepciones R005 explícitamente, pero no oculta tokens inválidos futuros.
