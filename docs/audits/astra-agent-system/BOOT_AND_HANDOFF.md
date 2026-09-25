# Boot, claim, checkpoint y handoff

## Boot actual y costo medido

El orden actual está en `AGENTS.md`, `coordination/README.md` y se duplica en seis identidades. Antes de saber qué hacer, Mario ve `PROTOCOL.md` 331 líneas, `CURRENT_ROUND.md` 247, `STATUS.md` 36, `LOCKS.md` 77, `TOOLING.md` 65, `agents/mario.md` 127: **883 líneas**, antes de tareas, handoff y foro. El foro sprite añade 1039 líneas y el handoff MB 664 si se leen completos. No todo se lee siempre, pero el boot actual no da índice de qué secciones son vigentes.

## Boot objetivo para «Sos Mario. Entrá al repo»

1. Sincronizar `main` y registrar SHA de lectura. Leer `AGENTS.md` y `coordination/BOOT.md` (índice de ~60 líneas) con versión/links del protocolo, ronda y estado; si el índice faltase, seguir boot heredado.
2. Leer `coordination/agents/mario.md`, `coordination/current/round.json` (o front matter validado) y `coordination/current/queue/mario.json`. No leer historial de otros roles.
3. Determinar slots elegibles: ronda activa, dependencias verificadas, gates humanos satisfechos, branch/base y no path overlap. Si hay claim propio heredado, reanudar el mismo slot; si hay dos slots libres, ordenar por prioridad/ID y reclamar con CAS; si ninguno, comunicar que no hay trabajo elegible.
4. Releer estado tras ganar claim; consultar solo task, contrato de interfaz y handoff exacto de dependencia. Descubrir capacidades del host y señalar `TOOL_UNAVAILABLE` solo si el gate depende de ellas.
5. Verificar que branch parte de base, checkout aislado, superficie permitida, locks vigentes. Trabajar; publicar checkpoint SHA + progreso resumido al completar un resultado y antes de una pausa/cambio de contexto.
6. Antes de handoff, releer HEAD coordinación: si contrato/gate cambió, no declarar verde. Ejecutar tests; publicar commit de producto; registrar handoff con exact SHA, recibo Identity Learning, liberar claim/lock vía CAS. Downstream pasa a READY solo tras evidencia válida.

Si el usuario fuerza una tarea, se valida alcance y exclusividad; prioridad forzada no salta un lock/QA/block. Si pausa una lane, el claim permanece con motivo y checkpoint hasta liberación explícita. Si mata una instancia, Neureon o el dueño autorizado registra reasignación del slot; otro chat no se autodeclara reemplazo del worker activo.

## Ejemplo mínimo de task/claim (contrato propuesto, no archivo operativo)

```json
{
  "round": "R006",
  "task": "M-104",
  "role": "mario",
  "slot": "mario-02",
  "priority": 20,
  "branch": "round/r006-m104",
  "base_sha": "<40-hex autorizado en ronda>",
  "exclusive_paths": ["src/game/render/fighters/new-fighter/**"],
  "dependencies": [{"task": "R-103", "verdict": "VERIFIED", "sha": "<40-hex>"}],
  "integration_target": "M-199",
  "claim": {"instance": "mario-02", "state": "ACTIVE", "last_checkpoint_sha": "<40-hex o null>"}
}
```

Schema materializado separa definición de task inmutable y claim mutable; ejemplo compacto combina ambos para mostrar su vínculo, no invita a que dos roles editen el mismo archivo. `exclusive_paths` deben resolverse por normalización de globs reales y revisión de archivos changed en PR; si globs se solapan, bloquear claim. Las referencias `<...>` son placeholders de ejemplo, no SHAs de R005 ni material ejecutable.

## Handoff canónico compacto

```text
task + role/instance + destinatario + ronda
base_sha + branch + product_sha + tree_sha (si relevante)
paths changed (o PR diff) + interfaces consumidas/producidas
tests (comando, resultado, SHA probado, run/artefacto) + QA verdict exacto si aplica
verified / not verified + risk/blocker + downstream eligibility
identity_learning: UPDATED | PROPOSAL | NO_CHANGE + enlace/razón breve
next action + claim release / reassign evidence
```

Un archivo por task conserva solo la última revisión vigente y enlaces a previas inmutables. Un blocker no se elimina: se referencia `supersedes` y nuevo SHA. Para G1 el approval de `fe2b505…` no borra el rechazo `5c76664…`. El receptor valida SHAs existentes y árbol, no acepta una frase «GREEN» sobre branch head móvil. Foros activos contienen preguntas con dueño/fecha/estado, no actúan de handoff ni diario.

## Ciclo completo

Usuario activa chat → boot e identidad → selección de slot → claim condicional + locks → trabajo y checkpoints en branch → handoff verificable → QA en SHA integrado cuando corresponde → Gonza en SHA aprobado → release/next task → cierre de instancia/archivo. Si cualquier precondición falla, se detiene la cadena afectada y se deja razón recuperable; los otros slots disjuntos continúan.
