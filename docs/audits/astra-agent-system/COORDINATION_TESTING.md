# QA del contrato de coordinación

## Baseline reproducible

Sobre `main` `c527d463…`: `node --test tests/coordination-contract.test.mjs` = **9 pass, 1 fail** (`invalid state for Mario`). La prueba actual valida frases de protocolo/plantillas y la primera fila por rol; no recorre subinstancias ni tasks, no comprueba SHA, transiciones ni exclusividad. PR #59 y PR #60 fueron ramas de verificación cerradas sin merge de producción; un CI verde de sus SHAs no prueba el estado de `main`. PR #52 sí fue integrado en una rama de paquete, pero eso tampoco actualiza automáticamente `main`.

## Gates propuestos ordenados por valor

| Gate | Fixture de fallo y expectativa | Dónde / owner |
| --- | --- | --- |
| Estado/consistencia | `HANDOFF_CONSUMED` en columna State o `HANDOFF_READY_BILATERAL_ANCHOR_REVIEW` en task provoca error por ruta/fila; comparar STATUS con tasks/G1/Z0 | ampliar `tests/coordination-contract.test.mjs`; Neureon + Germinator. |
| Claim/colisión | dos workers con mismo slot/branch o paths que se solapan no coexisten; dos commits hermanos sobre mismo HEAD: segundo falla, relee y elige otro slot | test puro de parser/path overlap + integración GitHub acotada en fase 4; Gonza + Germinator. |
| Dependencias | task inexistente/ciclo/bloqueada no READY; task VERIFICADA sin handoff exacto falla; QA BLOCK de SHA viejo no bloquea reemplazo aprobado si supersedes explícito | `tests/coordination-graph.test.mjs`; Neureon + Germinator. |
| SHA/linaje | handoff con SHA inventado, SHA no descendiente de base, PR diff fuera de paths o SHA test distinto a product SHA falla | checker git local CI con fetch de refs explícitas; Gonza. |
| Instancia y rol | `mario-02` refiere a `agents/mario.md` y tarea permitida; instancia huérfana/duplicada se reporta; identidades de squad no se guardan como roles nuevos | parser `instances/` en fases 2–3; Neureon. |
| Lock/cleanup | HANDOFF_READY sin release cuando no hay seguimiento, overlap y lock huérfano provocan diagnóstico; no autocaducar por fecha | mismo validador; Neureon. |
| Handoff/ILR | falta `NO_CHANGE/PROPOSAL/UPDATED`, QA SHA o destinatario bloquea desbloqueo, no exige plugins irrelevantes | fixture sobre handoff; Germinator. |

Tests de docs pueden ser unitarios y rápidos sin red. Existencia remota de branch/PR/run se verifica en gate de integración con credencial del host, no en cada ejecución local. En una fase de compatibilidad R005, fixture congelado debe informar sus dos tokens heredados y evitar tomar su texto como estados nuevos; objetivo Phase 0 corrige tokens luego desactiva excepción. No escribir tests que solo buscan que el texto «same-role» aparezca y concluyen «safe to scale horizontally».

## Verificación adversarial antes de 10 chats

En sandbox de repo/ramas de ensayo, activar dos Ricardo sobre mismo slot y dos Mario sobre slots disjuntos; matar una sesión entre checkpoint/handoff; inyectar SHA inválido, lock huérfano, CI de branch distinta, QA BLOCK antiguo y APPROVE nuevo. Germinator inspecciona logs y commits, Gonza verifica candidato integrado y preview, Neureon revisa que no haya edición fuera de ownership. Evidencia mínima: logs de intentos, resultado de CAS, grafo antes/después, changed-paths por branch, SHAs completos y tiempo de boot medido. No probar esto sobre tareas vivas R005.
