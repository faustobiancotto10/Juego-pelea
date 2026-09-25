# Arquitectura objetivo mínima — propuesta, sin vigencia operativa

## Regla de autoridad

El usuario define objetivos/gates humanos; Neureon congela grafo y contratos entre roles; cada worker reclama una tarea elegible y edita solo su superficie; Germinator valida un SHA exacto independientemente; Gonza integra candidatos admitidos y verifica artefacto servido. El repo sigue siendo autoridad durable. Un chat de ChatGPT no puede despertar otro chat, así que AUTO_CHAIN significa elegibilidad sin token nuevo, no ejecución espontánea.

## Entidades y residencia propuestas

| Entidad | Significado | Residencia tras migración |
| --- | --- | --- |
| ROLE | Misión, límites de autoridad, aprendizajes estables | `coordination/agents/<role>.md` (seis actuales, sin nombres por sesión). |
| INSTANCE | Claim temporal de un chat sobre slot y último checkpoint; etiqueta opaca `mario-01` | `coordination/instances/<round>/<instance>.json` solo mientras esté asignada; cierre archivado. No guardar IDs de chat ni secretos. |
| TASK | Resultado verificable, dependencias, owner role/slot, base e input SHAs | `coordination/tasks/<id>.md` legible; front matter pequeño estructurado para validación. |
| LANE | Superficie disjunta + rama + SHA base + integrador | task o `coordination/lanes/<id>.json` si hay varios workers del mismo rol; sin duplicar campos. |
| LOCK | Reserva activa sobre paths/globs normalizados ligada a task/instance | Derivada de claims de lane en un manifiesto current pequeño, no de relato libre en LOCKS.md. |
| HANDOFF | Contrato de salida que cita SHA, base, pruebas, riesgos y siguiente task | Un fichero canónico por task/revisión aceptada; revisiones previas en archive enlazadas. |
| STATUS | Proyección actual derivada de tareas/claims/handoffs/gates | `coordination/STATUS.md` generado o comprobado contra front matter; nunca fuente independiente de decisión. |
| ROUND | Objetivo, grafo, política de QA, gates humanos y puntero current | `coordination/CURRENT_ROUND.md` resumen corto; versiones cerradas en `archive/`. |
| DEPENDENCY | Referencia de task más condición de evidencia (`VERIFIED`/QA APPROVE exacto) | Metadatos de task; grafo validado sin ciclos. |
| EVIDENCE | SHA completo, run, PR, archivo, tree, veredicto y contexto de verificación | Handoff/recibo versionado; URL o ID externo con fecha; distinguir verificación local de CI. |
| ARCHIVE | Historia cerrada y decisiones aún relevantes por enlace | `coordination/archive/<round>/`, nunca mezclada en el resumen current. |

Un solo writer lógico para claims de coordinación: cada claim crea un commit hijo del HEAD leído de `main` y actualiza la ref con fast-forward sin force. Si otra instancia adelantó `main`, el commit hermano no es ancestro del nuevo HEAD; el segundo intento falla, relee snapshot y solo reclama otro slot libre. Es un diseño propuesto que debe probarse contra GitHub real, no presuponer atomicidad de un editor Markdown. Si el servidor/herramienta no soporta ref CAS ni permisos para hacerlo, transición manual con Neureon como fallback; no permitir dos CLAIM a partir de la misma lectura.

## Separación de conocimiento

- ROLE DEFINITION y CAPABILITIES: misión, ownership, prohibiciones, evidencia habitual en identidad; habilidades/plugin disponible se descubre en sesión y se registra solo cuando afecta la tarea.
- OPERATING RULES: una referencia al protocolo global, sin copiar once pasos en seis identidades.
- DURABLE LEARNINGS: lecciones role-specific con evidencia, agrupadas y deduplicadas por integrador; límite sugerido de una pantalla / enlaces a conocimiento técnico más extenso, revisión en archivo. No mezclar SHAs de ronda.
- CURRENT ASSIGNMENT: task/slot/branch/base/dep SHA en estado actual.
- INSTANCE STATE: claim activo, checkpoint SHA, estado, reservaciones, eventual cesión. Un chat reemplazo toma el mismo slot mediante reassign explícito, no necesita memoria del chat perdido.

## Prioridad Neureon / QA / Gonza

Neureon conserva apertura/cierre de ronda, contratos entre roles, cambios de alcance y conflictos de ownership; tareas elegibles avanzan sin gate suyo (`PROTOCOL.md` §§4–5/15 ya lo establece). Una decisión sobre resultados humanos (preview/dispositivo) sigue del usuario. Germinator realiza QA por riesgo: test local del worker antes de handoff; QA independiente sobre candidato integrado en puntos de integración y siempre para release, QA por task cuando cambia interfaz/contrato crítico. Debe validar exact SHA y repetir sobre árbol integrado si cambió. Gonza solo admite bundle de SHAs comprobados, nunca heads móviles; verifica SHA/árbol real servido y no invalida QA por integrar contenido adicional sin repetir gates.

## No construir

Sin scheduler externo, bots de chat, heartbeats automáticos, vencimiento de lock por reloj, base de datos, event bus, lenguaje de workflow arbitrario, integrador por rol obligatorio ni agente de QA por cada commit. Con 10–20 workers, slots predeclarados y claims condicionales bastan si las superficies son separables. Medir fricción real antes de añadir otro coordinador.
