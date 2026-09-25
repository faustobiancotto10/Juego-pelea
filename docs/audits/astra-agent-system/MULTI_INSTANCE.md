# Varias instancias por rol

`coordination/PROTOCOL.md` §18 ya afirma identidad ≠ instancia y Mario-A/B/C/D lo ejercieron en R005. El problema pendiente es asignación concurrente y recuperación, no inventar de nuevo seis identidades.

## Slot, claim y selección

Neureon publica tareas particionadas por archivos/subsistemas con `role`, `slot`, `branch`, `base_sha`, `dependencies`, `exclusive_paths`, `integration_target`. Etiqueta de instancia `mario-01`, `mario-02`, etc. se asigna al claim y no determina privilegios; el nombre permanente sigue `mario`. Dos chats que oyen «Sos Mario» leen el mismo índice, calculan slots READY con dependencias verificadas, ordenan prioridad e ID estable, e intentan reclamar uno con commit condicional. El perdedor relee y elige siguiente slot disjunto. Ningún chat se inventa una tarea si no hay slot habilitado.

El slot es dueño del branch; la instancia es ocupante reemplazable. A lo sumo un claim activo por slot. Branch e inputs se congelan en el task; un commit de checkpoint del worker cambia solo `last_checkpoint_sha` y evidencia, nunca reescribe `base_sha`. Un segundo Mario solo puede ocupar el mismo slot después de release o cesión documentada. No usar ID de chat como secreto ni exigir que ChatGPT revele identificador interno inexistente.

## Integración y QA

El integrador se define por dependencia real: Mario-A actuó de integrador para paquete/normalización, pero Ricardo-01/Ricardo-02 pueden producir cambios disjuntos y Gonza componerlos si no existe interfaz compartida. Cuando hay interfaz común o identidad durable compartida, elegir un consolidator del rol y entregar un único SHA integrado a QA. Squad no implica que cada rol necesite parent worker o chat supervisor.

Germinator-01 puede verificar una task A mientras Germinator-02 verifica B si sus implementadores son distintos y no auditan trabajo propio; la aprobación para release se aplica al árbol integrado exacto. Dos QA no pueden declarar el mismo gate final de formas contradictorias: QA gate tiene un slot/owner único. Gonza acepta solo el candidato exacto que pasó ese gate o revalida cuando árbol cambia.

## Beneficio y límite

Con 6 roles + 10–20 slots, un índice por rol muestra 1–4 slots libres y referencias, no 20 filas con diario. El paralelismo útil está limitado por paths/interfaz, no por chats disponibles. `LOCKS.md` actual solo describe contratos; no es mecanismo atómico. El diseño necesitará prueba real de doble claim y repositorio con permisos de escritura a `main`; hasta entonces requiere asignación manual de slots no solapados. La propuesta no autoriza aplicar nuevas reglas a R005 durante este PR.
