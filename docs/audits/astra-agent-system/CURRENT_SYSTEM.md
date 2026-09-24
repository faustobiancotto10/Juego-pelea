# Sistema real en `main` c527d463

## Reconstrucción del boot actual

`AGENTS.md` y `coordination/README.md` mandan leer PROTOCOL → TOOLING → CURRENT_ROUND → STATUS → LOCKS → identidad → tareas → foro activo; identidad y protocolo agregan handoffs relevantes, decisiones, branch/base y verificación de dependencias. Una pulsación `.` reactiva el chat pero los chats no se despiertan entre sí (`PROTOCOL.md` §6). `AUTO_CHAIN` preautoriza tareas elegibles, no crea workers ni reserva ownership.

`PROTOCOL.md` §§1–19 conserva seis roles, una ronda global, estados de tarea/agent, QA independiente, publicación por Gonza, escalación al usuario y memoria de identidad. `CURRENT_ROUND.md` contiene rondas lógicas agregadas dentro de R005: plan inicial, squad Mario-A/B/C/D, piloto sprite, bloqueo G1 y reparación. Un branch de producto usa base congelada y coordinación viva está en `main` (§10). La rama de auditoría no se registra como lane de producción.

## Contraste de superficies

| Superficie | Estado concreto en SHA base | Consecuencia |
| --- | --- | --- |
| Protocolo §7 y test línea 93–106 | Vocabulario cerrado; el test lee una sola fila por nombre de los seis roles | No valida el resto de instancias ni transiciones. |
| `STATUS.md` | Mario-B `HANDOFF_CONSUMED` fuera de vocabulario; Mario-A `WORKING`, G1 y Gonza `BLOCKED` | 9/10 tests; contradice los handoffs G1 APPROVE y Z0 VERIFIED de la misma línea de trabajo. |
| `CURRENT_ROUND.md` líneas 229–267 | Bloqueo G1 histórico, reemplazo `fe2b505…` pendiente de QA | La aprobación en `handoffs/V07-SPR-G1-germinator.md` y preview `V07-SPR-Z0-gonza.md` son posteriores; el lector debe resolver temporalidad. |
| `tasks/V07-SPR-MB.md` línea 5 | `HANDOFF_READY_BILATERAL_ANCHOR_REVIEW` no aparece en §7 | Otro token inválido que el test actual no ve. |
| `tasks/V07-SPR-G1.md`, `tasks/V07-SPR-Z0.md` | `VERIFIED` | Contradicen las filas bloqueadas de STATUS; el preview aislado, NO producción, fue servido. |
| `LOCKS.md` | Liberaciones y claims históricos con encabezados «Active» coexistentes | No ofrece conjunto único actual de reservas. |
| `templates/squad-lane.md` | Identidad, etiqueta, task, SHA base, branch, dependencias, superficies, integrador | Contrato conceptual útil; no hay registro ni claim atómico verificable. |
| `TOOLING.md` | Capacidad se descubre por sesión, fallback honesto | Correcto; no prometer plugins entre chats. |

El handoff G1 identifica candidato `fe2b505639d8ebf2dc4ab204b545233d96f214f2`, QA `ac860f2ef320f83a977939483e742472b40389f9`, veredicto APPROVE solo para preview. El handoff Z0 identifica `gh-pages` `5f0eed1335a887ec1daea9a42091eb77bdd90ab4`, hashes de HTML/manifest/atlas, evidencia de served parity y gate humano/dispositivo pendiente. No equivale a ROUND_COMPLETE.

## Mario-A/B: qué funcionó y qué falló

El piloto aisló Mario-A en source/normalización, Mario-B en paquete derivado y Ricardo en runtime (`CURRENT_ROUND.md` §§ sprite-pilot; `tasks/V07-SPR-MA.md`, `-MB.md`, `-R1.md`). Mario-A recibió rol temporal de integrador; G1 consumió un SHA compuesto. La separación impidió editar el mismo producto a ciegas y el rechazo G1 del primer candidato `5c76664…` produjo reparación exacta `fe2b505…` antes de publicar preview. Esa es evidencia de gates efectivos.

La adaptación fue manual: dependencias y SHA superseded se añadieron al final de archivos largos. `V07-SPR-MB-mario-b.md` tiene 664 líneas y nueve revisiones; `r005-sprite-pilot.md` tiene 1039 líneas. La fila Mario-B y el encabezado de lock quedaron sin reconciliar. No hay primitiva que asigne Mario-02 de forma exclusiva ante dos chats concurrentes. `README.md` anuncia N instancias, pero los tests solo buscan texto de la plantilla.

## Identidad y tooling

Seis `coordination/agents/*.md` conservan misión, propiedad, prohibiciones, boot duplicado, handoff/QA y «Durable role learnings». `PROTOCOL.md` §17 exige `UPDATED`/`PROPOSAL`/`NO_CHANGE` para todo closeout significativo; squads proponen y el integrador consolida. En `agents/mario.md` se observan aprendizajes concretos de paquete, anchors y promoción; otros roles mantienen responsabilidades propias. La duplicación de los 11 pasos de boot en seis archivos aumenta el costo de cambio: centralizar la secuencia en una sola entrada y dejar los archivos de rol solo con diferencias estables.

`TOOLING.md` acierta en distinguir autorización del repo y disponibilidad de plugin en cada chat. GitHub es el transporte de SHAs y PRs pero no hay garantía universal de connector; registrar la capacidad efectiva al iniciar, usar CLI/git si están disponibles y bloquear evidencia que no pueda verificarse. Game Studio / Game Development Studio solo aportan evidencia cuando corresponden a una tarea, nunca requisito para iniciar un worker de coordinación.

## Cobertura inspeccionada

Se leyeron `AGENTS.md`, `docs/DECISIONS.md`, los cinco archivos operativos, seis identidades, templates de task/lane/handoff, tareas/handoffs sprite MA/MB/MI/R1/G1/Z0, foro activo, historial reciente de coordination y `tests/coordination-contract.test.mjs`. El caso de previews/remoto se ancla al SHA main, no al candidato sprite como estado operativo. Hallazgos y propuesta completos siguen en los otros archivos de esta carpeta.
