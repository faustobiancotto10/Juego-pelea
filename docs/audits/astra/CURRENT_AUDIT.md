# ASTRA — auditoría maestra en curso (2026-09-22)

Estado: **AUDITORÍA DOCUMENTAL CERRADA para los dos SHAs indicados; hallazgos producto abiertos y teléfono físico pendiente.** No representa autorización de cutover. Esta rama es documental; no invade las lanes activas de R005. Los checkpoints llevan commits y SHAs publicados. Responsable: ASTRA, intervención externa.

## Bases verificadas

- `main` examinado inicialmente: `c527d4633f8b3d70a3c4b29ab19de06fa8eeef91` (coordinación + producto procedural). No equiparar `main` al piloto de sprites.
- Producto sprite aprobado por Germinator y publicado como preview aislada: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`, tree `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`, según `coordination/CURRENT_ROUND.md` y `coordination/handoffs/V07-SPR-Z0-gonza.md`; preview `https://faustobiancotto10.github.io/Juego-pelea/v07-sprite-preview/`, publicación `gh-pages` `5f0eed1335a887ec1daea9a42091eb77bdd90ab4`. Los objetos del candidato se obtuvieron y analizaron en un worktree de lectura aislado.
- Ronda R005 **ACTIVE**: aceptación física y decisión expresa de cutover siguen pendientes. `AGENTS.md` permite sprites *derivados normalizados* tras R005 y exige simulación autoritativa a 60 Hz. No recomendar revertir indiscriminadamente el piloto por la antigua regla de arte procedural.

## Revisado / pendiente

Revisado: `AGENTS.md`, coordinación actual; código exacto `fe2b5056…` de manifest, normalizador/packer, resolver, renderer, loader y contrato FX; simulation/CPU/character registry, stage, UI/lifecycle y tests pertinentes; preview pública observada en browser desktop; test de coordinación ejecutado en ambos árboles. Hallazgos S-001/2/3 en [SPRITES.md](SPRITES.md); A-002/3/4/5 en [ARCHITECTURE.md](ARCHITECTURE.md); gameplay, QA, mobile y multiagentes en [SYSTEMS.md](SYSTEMS.md); plan [ROADMAP.md](ROADMAP.md). Pendiente del equipo: prueba en teléfono físico, suite completa del próximo candidato integrado y decisiones del gate humano.

## Hallazgo confirmado A-001 — estado de coordinación fuera del contrato [HIGH; CI actual roja]

**Problema.** `coordination/STATUS.md` asigna `HANDOFF_CONSUMED` a Mario, Mario-A y Mario-B; `coordination/PROTOCOL.md` §7 enumera los estados válidos y no incluye ese token. El commit en `main` `c527d46` ya señala el desajuste; sigue presente en el árbol auditado.

**Impacto.** Un parser o agente que aplique la lista cerrada puede rechazar o interpretar de forma distinta estas transiciones. La regresión es **reproducida** en el checkout exacto de `main` `c527d463…`: `node --test tests/coordination-contract.test.mjs` da 9 PASS / 1 FAIL, `invalid state for Mario`, en test 91:1 / assertion 106. Esto debilita los gates de AUTO_CHAIN justo en un cutover delicado. Los 433/433 verdes pertenecen al candidato previo, no al `main` auditado.

**Causa probable.** El lenguaje informal de handoff evolucionó sin actualizar el contrato enumerado. **Propuesta.** Neureon define si `HANDOFF_CONSUMED` es estado legal con semántica y transición documentadas, o lo sustituye por `VERIFIED`/`HANDOFF_READY` con un campo separado de consumo. Una prueba de contrato debe validar todos los tokens de STATUS/tasks respecto de PROTOCOL. **Alcance:** `coordination/PROTOCOL.md`, `coordination/STATUS.md`, `tests/coordination-contract.test.mjs`; posible tooling de coordinación. **Riesgo:** cambiar estados puede alterar elegibilidad de tareas existentes; fijar transición con round activo. **Validación:** parser de todos los estados + comprobación de cadena Z0 sin inferencias de chat. **Owner:** Neureon; QA Germinator.

## Hipótesis abiertas (NO confirmadas)

- Medidas de frames confirman la deriva de `block` frente a `idle`; la causa exacta en la hoja de origen y el efecto del renormalizado sobre calidad artística requieren inspección visual/ensayo de pipeline.
- Efectos procedurales podrían verse mientras faltan los efectos de identidad sprite; distinguirlos en la preview.
- Telemetría de uso de memoria y rendimiento de iPhone aún no existe para el preview.

## Tareas derivadas / decisiones pendientes

Los tres pasos de investigación y publicación anteriores están terminados. La ejecución de mejoras y los gates pendientes se detallan en [ROADMAP.md](ROADMAP.md) y [HANDOFF.md](HANDOFF.md); esta auditoría no activa al equipo permanente.
