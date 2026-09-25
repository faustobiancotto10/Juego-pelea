# Handoff a Neureon — auditoría exclusivamente de agentes

Base GitHub `main`: `c527d4633f8b3d70a3c4b29ab19de06fa8eeef91`; fecha de inicio 2026-09-24; branch documental `audit/astra-agent-system-2026-09-24`. Este PR solo propone; no corrige R005 ni activa workers.

## Respuesta a la pregunta de 10 chats

**Hoy no es seguro activar 10 chats adicionales sin asignarles lanes específicas.** El protocolo permite N instancias y Mario-A/B demostró que ramas separadas, integrador y QA exact SHA sirven, pero el reparto simultáneo no es atómico; LOCKS y CURRENT_ROUND conservan historia mezclada; el test de main falla 9/10 por estado inválido de Mario; ni tareas ni locks se validan exhaustivamente. Si los diez chats reciben slots disjuntos predefinidos y un coordinador los asigna manualmente, el sistema puede progresar con disciplina, pero la promesa «Sos Mario, entrá al repo» como autoasignación segura no está cumplida.

## Prioridad y evidencia

1. **CRITICAL CONFIRMED:** `STATUS.md` Mario/Mario-A/B = `HANDOFF_CONSUMED` fuera de `PROTOCOL.md` §7; `node --test tests/coordination-contract.test.mjs` 9/10, falla línea 106. `tasks/V07-SPR-MB.md` añade otro token informal. Reparar estado operativo en Phase 0 tras revisar SHAs.
2. **HIGH CONFIRMED:** `CURRENT_ROUND.md` conserva encabezado «Current sprite-pilot QA blocker» después de que handoff G1 aprobó `fe2b505…` y Z0 verificó preview. `LOCKS.md` contiene claims «Active» históricos. Introducir resumen vigente pequeño y archivar historia.
3. **CRITICAL a escala PROBABLE:** no existe CAS ni validador de overlap de ownership; dos activaciones Ricardo pueden reclamar el mismo slot. Probar solución real con GitHub ref fast-forward antes de confiar en ella.
4. **HIGH CONFIRMED:** boot fijo de Mario ~883 líneas antes de tarea/foro/handoff; foro sprite 1039 y handoff MB 664. Índice y recibo canónico actual reducirían lectura inútil.
5. **HIGH CONFIRMED:** QA e integración exact SHA funcionan cuando se ejercen: G1 rechazó `5c76664…`, aprobó `fe2b505…`, Gonza verificó served preview `5f0eed…`. Proteger este gate; no reescribir el sistema entero.

## Cambios recomendados

Ejecutar migración `MIGRATION_PLAN.md`: corregir inconsistencias actuales; separar role/worker/task/claim; indexar boot; validar grafo y ownership; ensayar claims concurrentes y reemplazos; archivar compatibilidad al final. No crear scheduler/DB/heartbeat por anticipado. Mantener QA independiente y exact SHA con Gonza verificando artefacto integrado. Neureon conserva autoridad arquitectónica y delega progreso rutinario a dependencias verificadas.

## Riesgos y trabajo pendiente

El claim por ref fast-forward es propuesta técnica, no se ejecutó un ensayo concurrente; GitHub connector/permisos varían por sesión. Los impactos de cambiar documentos operativos requieren decisión y fase aparte. No hubo test de 10 chats reales, ni se alteró el estado vivo de R005. El resultado de test 9/10 pertenece a `main` base y permanece sin corrección por diseño.

Para arrancar un trabajo posterior: Neureon lee `README.md`, `FAILURE_MODES.md`, `TARGET_ARCHITECTURE.md`, `MIGRATION_PLAN.md`; Germinator toma `COORDINATION_TESTING.md`; Gonza el contrato de CAS/linaje en `BOOT_AND_HANDOFF.md` y `STATE_MODEL.md`. Solicitar decisión del usuario solo donde el protocolo la exige: cambio de objetivo/gate humano/alcance, no para cada green handoff.
