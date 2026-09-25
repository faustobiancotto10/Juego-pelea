# Migración propuesta, independiente de R005

**No ejecutar desde esta rama documental.** R005 y sus SHAs, tareas, previews, gates humanos y locks legítimos permanecen tal como están. Neureon decide la fase posterior y abre un cambio operativo separado, con QA propia. `main` base auditada: `c527d4633f8b3d70a3c4b29ab19de06fa8eeef91`.

## Phase 0 — reconciliar estado actual (CRITICAL)

**Owner:** Neureon; Germinator verifica, Gonza comprueba que el preview y gates de release sigan intactos. **Dependencia:** evidencia exacta de `STATUS.md`, G1 y Z0, más decisión explícita de cuándo alterar coordinación viva. **Ediciones futuras:** `coordination/STATUS.md`, `CURRENT_ROUND.md`, `LOCKS.md`, `tasks/V07-SPR-MB.md`, `tests/coordination-contract.test.mjs`; no producto ni branches de los especialistas. Reemplazar `HANDOFF_CONSUMED` por estado permitido que refleje tarea/instancia; trasladar «consumido» a vínculo de handoff, preservar prueba de consumo. Resolver el token de task MB y rotular bloqueos antiguos «superseded» sin reinterpretar el gate humano. Snapshot current arriba del historial o archive con enlaces; no borrar handoffs/SHAs. **Gate:** test de coordinación 10/10, tarea/STATUS/QA/Z0 consistentes en exact SHA, `git diff` muestra solo superficies autorizadas y release sigue pendiente de dispositivo/usuario. **Riesgo:** declarar producción liberada por confundir preview con aceptación; QA debe impedirlo.

## Phase 1 — modelo mínimo sin cutover (HIGH)

**Owner:** Neureon diseño/contratos; Gonza checker/CLI, Germinator pruebas. **Dependencia:** Phase 0 y nueva ronda/branch aislada. Añadir `coordination/BOOT.md` pequeño y contrato parseable de task/lane/claim en `coordination/current/` para tareas NUEVAS; mantener Markdown legible, generar STATUS como vista verificada, no editar históricas R005. Comparar alternativas antes de codificar: front matter en task si un writer, archivo claim separado si trabajadores distintos actualizan metadata simultáneamente. Regla única de prioridad/estado/roles documentada. **Gate:** boot de un nuevo rol en menos de 10 lecturas focalizadas y sin abrir foros/handoffs históricos; mismo resultado leyendo índice y contratos completos. **Riesgo:** duplicar fuentes de verdad durante convivencia; checker rechaza desacuerdo.

## Phase 2 — roles estables, instances reemplazables (HIGH)

**Owner:** Neureon identidad/protocolo, cada rol revisa sus límites, Germinator inspecciona. Reducir los once pasos duplicados en cada identidad a enlace a BOOT/protocolo manteniendo misión, permisos y lecciones durables; extraer conocimiento técnico largo a docs referidos. Registrar `instances/<round>/<slot>.json` con role/task/branch/checkpoint y release/reassign, sin datos de sesión ChatGPT. Mantener `PROPOSAL/NO_CHANGE/UPDATED` y consolidación de aprendizaje una vez por squad. **Gate:** reemplazo de Mario-02 reconstruye mismo slot, base, último SHA y próximo gate desde repo, sin contexto del chat; dos instancias no pueden escribir identidad compartida simultáneamente. **Riesgo:** pérdida de reglas de rol al deduplicar; diff auditado de autoridad por los seis roles.

## Phase 3 — validador de invariantes (CRITICAL antes de claims genéricos)

**Owner:** Gonza tooling con Neureon; Germinator diseña fixtures adversariales. Tests descritos en `COORDINATION_TESTING.md`: vocabulario, transiciones, tareas/roles, ciclos, locks/globs, SHA/linaje, recibo ILR, exact QA y release gate. Reutilizar Node/test runner actual, sin servidor ni DB. **Gate:** errores introducidos deliberadamente (doble owner, overlap, SHA inexistente, QA sobre otro árbol, token inválido) fallan con ruta/campo; snapshot R005 se conserva y se lee sin mutación. **Riesgo:** bloquear trabajo por parser ambiguo; iniciar report-only, pasar a hard gate solo sobre estructura nueva tras fixtures.

## Phase 4 — ensayo multi-instance genérico (HIGH)

**Owner:** Neureon publica 2 tareas disjuntas de ensayo y 1 tarea disputada; Ricardo/Mario como workers solo si el usuario abre la ronda correspondiente; Germinator observa independientemente; Gonza integra SHAs de ensayo. Probar CAS de dos claims simultáneos en repo/branch temporal sin `force`; ganador único, perdedor reevalúa y toma slot disjunto; simular desconexión tras checkpoint, reasignación explícita, branch sin handoff y QA exact SHA. **Gate:** cero colisiones de paths; handoff de replacement apunta al último checkpoint; branch no se integra sin verificación; ensayo de 10–20 workers solo si 2–4 funciona y hay trabajo genuinamente disjunto. **Riesgo:** APIs/rate-limit/rebase; fallback a asignación manual del slot, nunca claims concurrentes no verificados.

## Phase 5 — retirar compatibilidad vieja cuando corresponda (LATER)

**Owner:** Neureon y Gonza; Germinator valida archive. Tras R005 ROUND_COMPLETE y al menos una ronda nueva con modelo estable, archivar STATUS/LOCKS/foro históricos con SHAs íntegros, hacer STATUS vista actual desde estructura y eliminar parser de tokens heredados solo de rondas nuevas. **Gate:** un sustituto de Neureon encuentra últimos handoffs de R005 y decisiones humanas desde enlaces sin leer la narrativa entera; tests de archive pasan. **Riesgo:** perder trazabilidad al compactar; no reescribir historial de git ni eliminar archivos de rondas cerradas.

## Costo y orden

Fase 0 y parser de fase 3 tienen el mejor efecto por esfuerzo: reparan el fallo actual y bloquean drift futuro. Fases 1–2 pueden diseñarse en paralelo una vez congelado el esquema task/claim; no ejecutar escritor concurrente antes de que el checker detecte overlap. Phase 4 necesita modelo, tests y permisos probados; Phase 5 depende de experiencia real. No activar a todos los agentes para documentación de protocolo: Neureon + Gonza + Germinator basta; especialistas solo prueban límites de ownership o su rol cuando haya tareas reales.
