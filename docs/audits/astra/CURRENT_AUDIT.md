# ASTRA — auditoría maestra en curso (2026-09-22)

Estado: **EN CURSO; no representa un veredicto final ni autorización de cutover**. Esta rama es documental; no invade las lanes activas de R005. Cada checkpoint debe llevar commit y SHA publicado. Responsable: ASTRA, intervención externa.

## Bases verificadas

- `main` examinado inicialmente: `c527d4633f8b3d70a3c4b29ab19de06fa8eeef91` (coordinación + producto procedural). No equiparar `main` al piloto de sprites.
- Producto sprite aprobado por Germinator y publicado como preview aislada: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`, tree `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`, según `coordination/CURRENT_ROUND.md` y `coordination/handoffs/V07-SPR-Z0-gonza.md`; preview `https://faustobiancotto10.github.io/Juego-pelea/v07-sprite-preview/`, publicación `gh-pages` `5f0eed1335a887ec1daea9a42091eb77bdd90ab4`. La inspección del código exacto de este candidato queda pendiente hasta obtener sus objetos.
- Ronda R005 **ACTIVE**: aceptación física y decisión expresa de cutover siguen pendientes. `AGENTS.md` permite sprites *derivados normalizados* tras R005 y exige simulación autoritativa a 60 Hz. No recomendar revertir indiscriminadamente el piloto por la antigua regla de arte procedural.

## Revisado / pendiente

Revisado: `AGENTS.md`, `coordination/PROTOCOL.md` (autoridad, estados, handoffs), secciones actuales de `coordination/CURRENT_ROUND.md`, `coordination/STATUS.md` y handoff Gonza Z0; código exacto `fe2b5056…` de manifest, normalizador/packer, resolver, renderer, loader y contrato FX. Hallazgos S-001/2/3 en [SPRITES.md](SPRITES.md). Pendiente: preview en navegador/teléfono, simulation, character/mode architecture, UI/input, tests, performance, agentes y roadmap.

## Hallazgo confirmado A-001 — estado de coordinación fuera del contrato [MEDIUM; escalabilidad operativa]

**Problema.** `coordination/STATUS.md` asigna `HANDOFF_CONSUMED` a Mario, Mario-A y Mario-B; `coordination/PROTOCOL.md` §7 enumera los estados válidos y no incluye ese token. El commit en `main` `c527d46` ya señala el desajuste; sigue presente en el árbol auditado.

**Impacto.** Un parser o agente que aplique la lista cerrada puede rechazar o interpretar de forma distinta estas transiciones. Esto debilita los gates de AUTO_CHAIN justo en un cutover delicado.

**Causa probable.** El lenguaje informal de handoff evolucionó sin actualizar el contrato enumerado. **Propuesta.** Neureon define si `HANDOFF_CONSUMED` es estado legal con semántica y transición documentadas, o lo sustituye por `VERIFIED`/`HANDOFF_READY` con un campo separado de consumo. Una prueba de contrato debe validar todos los tokens de STATUS/tasks respecto de PROTOCOL. **Alcance:** `coordination/PROTOCOL.md`, `coordination/STATUS.md`, `tests/coordination-contract.test.mjs`; posible tooling de coordinación. **Riesgo:** cambiar estados puede alterar elegibilidad de tareas existentes; fijar transición con round activo. **Validación:** parser de todos los estados + comprobación de cadena Z0 sin inferencias de chat. **Owner:** Neureon; QA Germinator.

## Hipótesis abiertas (NO confirmadas)

- Medidas de frames confirman la deriva de `block` frente a `idle`; la causa exacta en la hoja de origen y el efecto del renormalizado sobre calidad artística requieren inspección visual/ensayo de pipeline.
- Efectos procedurales podrían verse mientras faltan los efectos de identidad sprite; distinguirlos en la preview.
- Telemetría de uso de memoria y rendimiento de iPhone aún no existe para el preview.

## Próximas decisiones / tareas derivadas

1. Auditar `fe2b5056…` y el preview servido como fuentes separadas; fijar evidencia de cadena para escala, FX y dash.
2. Publicar hallazgos de arquitectura/gameplay/mobile con SHAs y contratos, diferenciando bug comprobado de incertidumbre y prioridad.
3. Construir roadmap con owners sin activar la plantilla permanente ni alterar la ronda.
