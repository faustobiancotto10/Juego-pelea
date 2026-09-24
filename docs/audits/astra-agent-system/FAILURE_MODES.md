# Fallas de coordinación y recuperación

Convención: CONFIRMED = probado contra `main` c527d463; PROBABLE = deriva de flujo sin claim atómico; HYPOTHESIS = requiere prueba concurrente. Prioridad se refiere a operar 10–20 workers, no a calidad del juego.

## F1 — estado operativo contradictorio — CONFIRMED / CRITICAL

**Problema/evidencia:** `STATUS.md` llama `BLOCKED` a G1/Gonza cuando `tasks/V07-SPR-G1.md`, `tasks/V07-SPR-Z0.md` están VERIFIED y sus handoffs documentan aprobación/preview. Mario-B usa `HANDOFF_CONSUMED`; prueba `node --test tests/coordination-contract.test.mjs`: 9/10, falla `invalid state for Mario`. `CURRENT_ROUND.md` deja bloqueo previo como sección «Current». **Causa:** se acumularon revisiones sin una proyección actual única. **Impacto:** replacement puede repetir QA o impedir Gonza; CI falla por estado real. **Cambio propuesto:** fase 0 reconcilia tokens y una cabecera de estado actual con evidencia exacta, preservando historia en archivo inmutable. **Alcance:** STATUS, CURRENT_ROUND, tasks, locks, test. **Riesgo:** marcar verde un bloqueo real; Germinator revisa evidencia y Neureon aprueba cambios operativos. **Gate:** todos los tokens válidos y estado de G1/Z0 concordante con SHA probado; owner Neureon + Germinator.

## F2 — doble claim y colisión de paths — PROBABLE / CRITICAL a escala

**Evidencia:** `PROTOCOL.md` §18 exige registro antes de editar y `LOCKS.md` §9 reserva manual; `templates/squad-lane.md` ofrece campos, no compare-and-swap ni lease. No existe transición de claim testeada en `tests/coordination-contract.test.mjs`. **Causa:** Markdown coordinado por disciplina humana y commits separados. **Impacto:** dos Ricardo activados a la vez pueden leer READY y editar la misma branch. **Propuesta:** slots predeclarados por tarea, claim mediante PR/commit condicional contra HEAD de `main`; un solo escritor de estado o GitHub compare-and-swap, conflicto implica relectura y reintento, sin force push. **Riesgo:** latencia/errores de API; fallback manual de Neureon si CAS no disponible. **Gate:** prueba de dos claims concurrentes contra la misma task con exactamente un ganador, paths disjuntos en claims activos; owner Neureon, tooling Gonza, QA Germinator. Verificar concurrencia real en fase 4.

## F3 — historia confundida con lock vigente — CONFIRMED / HIGH

`LOCKS.md` contiene claims «Active» Mario-B y Mario-A con liberaciones dispersas; handoff MB llega a 664 líneas y foro sprite 1039. **Causa:** archivos append-only usados también como estado. **Impacto:** un chat nuevo interpreta mal exclusividad y relee miles de líneas. **Propuesta:** índice de locks vivos pequeño y machine-readable, entradas históricas por commit/archive, handoff vigente único enlazado a revisiones; no borrar evidencia. **Gate:** boot solo lee locks vivos y un handoff canónico, historiales se abren por enlace; owner Neureon.

## F4 — trabajo no publicado antes de morir — HYPOTHESIS / HIGH

`PROTOCOL.md` pide commits significativos y handoff exacto, pero no hay plazo de checkpoint ni rescate de branch sin handoff. **Impacto:** cambios sin commit se pierden con el chat; commits aislados quedan sin eligible downstream. **Propuesta:** checkpoint en branch por resultado verificable/antes de cambio de contexto, puntero a último SHA en claim; rescate puede inspeccionar branch y tests pero no declarar VERIFIED sin nuevo QA. **Gate:** simulacro con worker que deja branch sin handoff, sustituto reconstruye diff y faltantes; owner Neureon/Germinator.

## Seis escenarios de reemplazo

| Escenario | Hoy | Recuperación diseñada |
| --- | --- | --- |
| Mario-02 se desconecta trabajando | Label/branch en round, lock manual; último commit recuperable, cambios sin commit perdidos | Mantener claim reservado; sustituto toma el MISMO slot tras evidencia de pausa/cesión, lee SHA checkpoint y revalida; no robar lock por reloj. |
| Neureon pierde chat | Identidad y ronda están en repo; interpretaciones contradictorias quedan a cargo de persona | Boot compacto con snapshot de ronda, agenda de decisiones y enlaces a evidencias, reconstituye autoridad sin reescribir log. |
| Germinator termina QA pero no avisa | Si dejó handoff/commit, AUTO_CHAIN desbloquea; si no, no hay APPROVE verificable | QA recibo durable con SHA y veredicto; notify al usuario es secundario, si falta recibo nueva instancia valida. |
| Dos Ricardos arrancan juntos | Ambos pueden leer misma tarea READY; lock manual no es adquisición atómica | Slots distintos preasignados o CAS único: uno gana, otro selecciona tarea disjunta/reintenta. |
| Código termina sin handoff | Branch existe pero §4 exige handoff para desbloquear; stale | Estado CHECKPOINTED, no VERIFIED; sustituto completa verificación y recibo con SHA exacto. |
| Branch persiste sin worker | `UNRESPONSIVE` solo al bloquear grafo, sin política de dueño/lease | Pausar claim con razón y último SHA; release/reassign explícito, nunca expiración automática por tiempo solamente. |

Riesgos transversales: un SHA de branch puede cambiar después del test; un handoff puede citar un SHA inexistente o fuera de base; un worker puede consumir una revisión vieja. Validador offline de hashes/linaje y checks de flujo antes de desbloquear dependencias, dejando las decisiones humanas (QA visual/user gate) explícitas.
