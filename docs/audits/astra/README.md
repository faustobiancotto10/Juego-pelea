# ASTRA — auditoría maestra de Juego-pelea

**Fecha:** 2026-09-22/23 UTC. **Estado:** auditoría documental cerrada respecto a bases inmóviles indicadas abajo; los hallazgos de producto y gates humanos permanecen abiertos. **Autor:** ASTRA, intervención externa. Sin cambios de código producción ni activación de agentes.

## Executive Summary

El proyecto dispone de límites de gameplay bastante mejores que los que su tamaño sugiere: simulación 60 Hz y registro de contenido autoritativos, CPU sin lectura de input privado, paquetes de personaje validados, stages sin efectos sobre daño, y una ruta de sprites derivada que no toca hitboxes. **La debilidad principal no es reescribir combate**. Es que el piloto de sprites se declara listo para preview con defectos visibles que el contrato de paquete no puede detectar, mientras la presentación central acumula excepciones por luchador.

Hay tres fallos comprobados de El Toro en el candidato servido: el propio atlas deriva la estatura entre poses comparables (`block` 269 px vs `idle` 192 px, cabeza-pie +42%); los FX están empaquetables pero su ruta runtime figura expresamente diferida y los archivos FX no se sirven; y dash forward/back son los mismos frames que walk, aunque sim y resolver distinguen el estado. No se requiere retocar velocidad ni daño para resolver ninguno. El piloto no demuestra aún objetivo LARGE/HEAVY contra un rival medio en la preview de escritorio. La prueba de rendimiento/decode en iPhone sigue pendiente.

El hallazgo operativo inmediato está en `main`, separado del candidato de producto: `HANDOFF_CONSUMED` no existe en la lista de estados admitidos y `node --test tests/coordination-contract.test.mjs` falla 1/10 (`invalid state for Mario`). El resultado 433/433 verde reportado por QA para `fe2b505…` corresponde a **otro árbol**. Arreglar este contrato de coordinación antes del siguiente handoff. El test del candidato exacto sigue 10/10.

## Bases y trazabilidad

| Objetivo | SHA / fuente | Lo que prueba |
|---|---|---|
| `main` al iniciar/cerrar | `c527d4633f8b3d70a3c4b29ab19de06fa8eeef91` | Estado R005 ACTIVE y regresión de coordinación reproducida |
| Candidato sprite aprobado | `fe2b505639d8ebf2dc4ab204b545233d96f214f2`, tree `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a` | Código de cuatro fighters + cuerpo El Toro runtime; QA/Gonza handoff apuntan a este SHA |
| Preview aislada | `https://faustobiancotto10.github.io/Juego-pelea/v07-sprite-preview/`, `gh-pages` `5f0eed1335a887ec1daea9a42091eb77bdd90ab4` | Visual desktop observado, El Toro P1/supernariz CPU; teléfono físico no observado |

`main` no es el producto sprite; producción raíz sigue procedural V0.6 según handoff Gonza. R005 exige aceptación del usuario en dispositivo, acuerdo de formato canónico y decisión explícita antes de promover. Esta auditoría no sustituye esos gates ni el trabajo de Germinator.

## Top de hallazgos por impacto

| Prioridad | Área | Hallazgo | Acción mínima |
|---|---|---|---|
| HIGH actual | Coordinación | [A-001](CURRENT_AUDIT.md), [M-002](SYSTEMS.md): estado inválido y prueba roja en `main` | Neureon reconcilia estado/transiciones; QA prueba token y elegibilidad |
| HIGH gate visual | El Toro | [S-001](SPRITES.md): escala anatómica inconsistente en manifest/atlas | Normalización de fuentes con estatura declarativa y gate por pose/lado |
| HIGH gate visual | El Toro | [S-002](SPRITES.md): FX planificados pero router deferred y no servidos | Enlazar FX a eventos/capas/reloj y materializar assets |
| HIGH legibilidad | El Toro | [S-003](SPRITES.md): dash comparte rects de walk | Clips/poses específicos de dash en ambos sentidos |
| HIGH móvil/roster | Assets | [A-003](ARCHITECTURE.md), [T-001](SYSTEMS.md): retención/race y validación insuficiente | Lifecycle con cancelación/generación y gate atlas físico |
| HIGH N+1 | Presentación | [A-002](ARCHITECTURE.md): FightRenderer conoce identidades y moves específicos | Dispatch presentacional acotado por keys y módulos FX |
| MEDIUM N+1 | CPU/stages/modos | [G-001](SYSTEMS.md), [A-004/5](ARCHITECTURE.md) | CPU hints explícitos; stage package y sesión cuando haya expansión concreta |
| MEDIUM operación | Coordinación | [M-001](SYSTEMS.md): estado actual enterrado entre historia | Vista canónica corta de ronda/locks con handoffs linkeados |

**No se confirma** corrupción de combate por sprites, regresión móvil del D-pad, falta de determinismo o FPS bajo en teléfono. Evitar traducir hipótesis en tareas de reescritura.

## Estado arquitectónico real y arquitectura objetivo

- **Simulación:** `CombatSimulation` 2592 líneas controla rounds, movimiento, contactos, proyectiles, Ultimate y Clash con defs de `CombatRegistry`. Riesgo de orden de trades G-002 solo hipótesis; la longitud aislada no exige split.
- **Contenido/personajes:** `characterContent` compone kits/moves/projectiles/ultimates/presentación de cuatro fighters; agregar fighter N+1 es razonable en gameplay, pero presentación/FX requiere editar `FightRenderer` y CPU fallback esconde semántica Camaleoni.
- **Presentación:** dual procedural/sprite bien separada de daño. `AnimationResolver` correcto para dash, atlas/source no. Objetivo: cuerpo sprite por paquete, efectos visuales registrados por clave, renderer central solo orquesta capas/eventos.
- **Lifecycle:** `AppController` coordina flujo de duelo/CPU, RAF, HUD, carga y resultados. Objetivo: política explícita de cache/teardown y, recién cuando exista segundo modo, sesión de match reutilizable.
- **Stages:** dos stages de presentación, metadatos duplicados entre registro y selector. Un registro único de contenido de stage alcanza.
- **Agentes:** identidad, exact SHAs, lanes y QA independiente son positivos. Falta vista autoritativa corta y coherencia entre estados permitidos y STATUS; no pedir a chats nuevos que adivinen cuál sección histórica es vigente.

## Mapa de deuda y riesgos

**A — afecta hoy:** estado de coordinación rojo; escala/FX/dash del preview. **B — impide escalar:** router visual por fighter, falta gate anatómico/geométrico, lifetime de atlas, CPU fallback. **C — deuda real posponer:** stage metadata duplicado; `AppController` aún acoplado a duelo; foro/round largos con historia mezclada. **D — opcional:** optimizar asignaciones por tick/partículas solo si medición móvil excede presupuesto; investigación de trades slot-simétricos antes de cambiar lógica. Preservar la caja negra de `CombatSimulation` para agentes visuales, el pool acotado de partículas, authored LEFT, registros de contenido y pruebas existentes.

## Validación realizada y límites

- `main` `node --test tests/coordination-contract.test.mjs`: **9 PASS, 1 FAIL** (`invalid state for Mario`). En el candidato exacto `fe2b505…`: **10 PASS** con la misma orden.
- Inspector de manifest: 26 keys por orientación; primer cuadro `block` RIGHT 269 px vs `idle` 192 px; head→foot 238 vs 168. Las cuatro combinaciones (LEFT/RIGHT × dash forward/back) tienen rects/pivots **idénticos** a los de walk equivalentes, difiere `loop`.
- Preview pública abierta y jugable hasta comienzo de round en browser desktop; se verificó cuerpo sprite del P1, no una sesión de rendimiento en teléfono. Los FX ausentes están confirmados por ruta código/assets, no por filmación del evento en dispositivo.
- No se ejecutó suite TypeScript completa localmente: el toolchain npm no está instalado en este checkout. Handoff Germinator reporta 433/433 + build verde sobre candidato pre-cambio de `main`; no sustituir eso por tests del branch de auditoría. Ningún cambio producto se realizó.

## Documentos de trabajo

- [CURRENT_AUDIT.md](CURRENT_AUDIT.md): checkpoint vivo, alcance/SHAs/confirmaciones.
- [SPRITES.md](SPRITES.md): investigación fuente→atlas→manifest→renderer de El Toro.
- [ARCHITECTURE.md](ARCHITECTURE.md): límites, monolitos por responsabilidad, personaje N+1, modes y lifecycle.
- [SYSTEMS.md](SYSTEMS.md): gameplay/CPU/input/móvil/testing/multiagentes.
- [ROADMAP.md](ROADMAP.md): orden por fases, ownership, aceptación y release gate.
- [HANDOFF.md](HANDOFF.md): transferencia concisa a Neureon.
