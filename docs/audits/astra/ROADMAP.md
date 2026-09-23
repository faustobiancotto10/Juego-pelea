# ASTRA — plan de ejecución y gates de la auditoría

**Documento de handoff, no activación automática.** R005 sigue ACTIVE; Neureon decide incorporación y ownership cuando el usuario active al equipo. `main` base `c527d463…`; candidato de producto sprite `fe2b505…`. Antes de implementar, sincronizar y comprobar que esos SHAs/gates siguen vigentes. Ninguna tarea aquí permite promover la preview a producción.

## Priorización por efecto real

| Orden | Grupo | Hallazgo | Veredicto |
|---|---|---|---|
| 0 | Juego/operación actual | A-001/M-002, token `HANDOFF_CONSUMED` rompe prueba de coordinación actual (9/10) | **HIGH; reparación corta previa a siguiente handoff** |
| 1 | Juego actual / gate cutover | S-001 escala de guardia + ~40% anatómico, identidad LARGE débil | **HIGH; blocker de aceptación visual/cutover** |
| 2 | Juego actual / gate cutover | S-002 FX de identidad producidos pero integración declarada `deferred` | **HIGH; completar para promesa FX del piloto** |
| 3 | Juego actual / gate cutover | S-003 dash usa rects walk | **HIGH; corregir legibilidad del movimiento** |
| 4 | Escalabilidad + móvil | A-003 lifecycle cache/race y T-001 geometría/escala sin gate | **HIGH antes de roster sprite completo** |
| 5 | Escalabilidad N+1 | A-002 `FightRenderer` con condiciones por fighter, G-001 fallback CPU Camaleoni | **HIGH/MEDIUM antes de siguiente fighter** |
| 6 | Deuda real | A-004 stage duplicado, A-005 sesión para segundo modo, M-001 historia de estado sin encabezado vigente | **MEDIUM, en la primera expansión relacionada** |
| 7 | Validación exploratoria | G-002 trades simultáneos, perfil frame/heap/D-pad Safari | **Evidencia primero, cambio solo si se reproduce** |

## Fases y contratos de trabajo

### F0. Reparar autoridad de ronda (Neureon; QA Germinator)

**Entrada:** `main` `c527d463…`, round R005 ACTIVE; nadie toca código producto. **Owner de archivos:** Neureon `coordination/PROTOCOL.md`, `STATUS.md`, `LOCKS.md`, `CURRENT_ROUND.md`; Germinator `tests/coordination-contract.test.mjs` solo después de congelar semántica. Neureon define `HANDOFF_CONSUMED` como estado legal y transiciones, o vuelve a estado existente con campo `consumed` separado; no hacer `sed` a ciegas sobre historia. Primero reparar prueba roja, después vista canónica de locks/estado. **Contrato:** un único estado vigente por lane; handoff publicado conserva exact SHA y las dependencias no cambian sin decisión explícita. **Aceptación:** `node --test tests/coordination-contract.test.mjs` 10/10 en `main` nuevo + fixture que verifica Mario-A/B y rechaza un token inventado; ACTIVE/preview permitida, producción bloqueada. **Riesgo:** reabrir chain de R005 por elegir estado incorrecto. **Gate independiente:** Germinator compara elegibilidad previa y posterior; no basta un test verde. **Dependencia:** inmediata, en paralelo con diseño read-only F1, no con ediciones de R005 ya congeladas.

### F1. Congelar contrato de piloto (Neureon + Mario; Ricardo solo por evento)

Antes de dividir trabajo fijar: (a) perfil `sizeClass`/estatura canónica por fighter y anchors comparables; (b) `SpriteEffectDefinition` con key de clip, source evento, anchor, layer, clock (`combatTick`/`projectile.age`/`ultimatePhaseFrame`), lifetime y política fallback procedural; (c) dash clips distintos de walk LEFT/RIGHT y cobertura; (d) límite de atlas/decodificación por pelea; (e) formatos del piloto vs producción (`body.webp`, `animations.json`, FX opcional) o enmienda documentada. Ricardo certifica que `CombatEvent.hit.projectileId`, `moveId`, `projectile` y fases de Ultimate alcanzan para los cuatro FX; si falta dato, añade solo campo de evento autoritativo, nunca lectura de sprite por sim. **Acceptance:** paquete ficticio con una identidad FX mapeada sin fighter-ID en sim/renderer central; matriz de eventos/pivots/ticks firmada por Mario/Ricardo. **Riesgo:** diseño del FX no contempla evento de impacto si el proyectil desaparece antes de snapshot; elegir retención de visualKey por ID ya presente en renderer, o evento explícito. **Gate:** Neureon congela interfaces antes de F2; no ciclo de PRESENT por subetapa.

### F2. Reparar El Toro con lanes no solapadas (Mario-A / Mario-B / Ricardo)

| Lane / archivos exclusivos | Trabajo y dependencia | Evidencia de aceptación |
|---|---|---|
| Mario-A `docs/characters/el-toro/sprite-source/**`, `sprite-package/**`, `scripts/el-toro-sprite-*.mjs`, `assets/fighters/el-toro/**` | Renormalizar sheets de cuerpo antes del atlas con una métrica anatómica estable; revalidar 168 cuadros corporales y sus anclas (84 por lado); crear dash forward/back con silueta/cadencia propias. Depende F1. | Reporte por frame LEFT/RIGHT: idle/walk/block/hurt/jab en mismo dominio, diferencia de estatura proyectada objetivo ≤8% salvo pose declarada; dash vs walk visual y rects claves diferentes; El Toro se ve large frente a medium a escala de pelea; bytes reproducibles. |
| Mario-B `src/game/render/sprites/*Effect*.ts`, presentación de ataque por keys; **no editar archivos Mario-A** | Integrar routing/clock/capas/cleanup para FX y test unitario usando assets fixture. Puede arrancar con F1 congelado en paralelo con Mario-A. | 4 FX dibujan cuando corresponde, LEFT/RIGHT coherentes, blocked/whiff sin doble emisión, cancelación en round/teardown, sin alterar HP/hitbox. |
| Ricardo `src/game/render/sprites/SpriteAssetStore.ts`, `SpriteFightAssetLifecycle.ts`, `src/game/types.ts` **solo si evento insuficiente** | Validación de bounds real tras decode, carga fight-scoped de FX y eliminación de carrera A-003; coordinar interfaz F1 con Mario-B. Trabajo paralelo únicamente tras acordar separación de archivos. | Promesas A/B fuera de orden no eliminan B; salida en vuelo no repuebla cache; límites de atlas/decode; rematch presupuestado; tests de ausencia/formatos. |

**Integrador:** Mario designado integra deltas en rama específica desde exact approved product SHA que indique Neureon; no merge indiscriminado de ramas con coordinación vieja. **Brancaforte:** no activa salvo que cambie la UI de carga/error (si sucede, owns `AppController.ts`, CSS/control). **Riesgo cruzado:** renormalizar invalida anchors/hashes; FX asset puede duplicar procedural; evitar que Mario-A y B editen el mismo `FightRenderer.ts` simultáneamente. **Tests:** package geometry, animations parity, source→dist bytes, sprite event router, resolved clips versus dash/guard, lifecycle race, renderer/sim separation; screenshot matriz 844×390 con P1/P2 LEFT/RIGHT, guard, dash, tres moves y FX.

### F3. Escalabilidad solo después de piloto estable (Mario, Ricardo, Neureon)

Mario mueve branches de `FightRenderer` por fighter a registros visuales/presets con módulos por familia; `CombatEffects`/procedural sigue funcional mientras híbrido. Ricardo hace tácticas CPU obligatorias para personaje futuro con adaptador que conserva seed/trace de los cuatro actuales; ningún rebalance general. Neureon define kit de personaje N+1: gameplay registry + presentation backend/keys + anim/FX/scale + CPU + tests de assets, sin exigir editar `FightRenderer` para una habilidad nueva del tipo soportado. **Aceptación:** fixture fighter quinto con move/projectile/Ultimate visual vía keys, CI valida contenido y genera preview sin `if id===fifth` en core; trazas actuales iguales bajo seed. **Riesgo:** extracción visual cambia layer/telegraph; QA comparativa frame por frame. Stage package UI (A-004) y `FightSession` (A-005) solo cuando exista tercer stage/segundo modo concreto.

### F4. QA independiente, integración y decisión de release (Germinator → Gonza → usuario/Neureon)

Germinator reconstruye build de **SHA exacto**, reproduce escala/FX/dash y A-003 desde salida servida, no acepta mensaje `done` del implementador. Recorre `idle, walk ±, block alto/bajo, hurt, jab, low, Topete, Shawarmazo, Super Eructo, dash ±`, ambos lados; contrasta pivots/feet/texto y comprueba FX en blocking/hit/miss y durante hitstop. Confirma simulación byte/snapshot equivalente para entradas fijadas y suite completa, además de prueba de rounds/teardown. Gonza publica **preview aislada** del SHA aprobado, verifica paridad de HTML/JS/manifests/body/FX servidos, sin mover raíz. Prueba física en iPhone landscape: no callouts/selección de pad, estabilidad/decodificación/memoria, escala y lectura tras veinte cambios de estado/dashes; la falta de teléfono queda marcada explícitamente PENDIENTE, no verde por CI. El usuario decide si estética y feel alcanzan; Neureon enmienda o aplica formato canónico y solo considera cutover al terminar aceptación de **todo** el roster. El release gate no se infiere de un commit o PR verde.

## NO construir todavía

- Runtime de scripts arbitrarios de habilidades, sistema ECS global o modos abstractos sin segundo modo real.
- Per-frame scale patches dentro de Canvas, espejado LEFT, reemplazo directo por hojas fuente o gameplay determinado por píxeles.
- Fan-out sprite a cuatro fighters antes de corregir piloto y presupuesto móvil, ni desmantelar backend procedural en R005.
- Cambio de balance/CPU/60 Hz por un bug de presentación, ni reescritura del simulador por longitud de archivo.
- FX particle engine ilimitado, atlas de todo el roster precargado, test visual que inspeccione solo idle y declare verde todo el paquete.

## Cierre verificable de esta auditoría

Esta intervención termina cuando existen informes con evidencia y SHAs, plan ejecutable con owners/dependencias/riesgos, pruebas hechas identificadas y limitaciones humanas declaradas, commits publicados en rama documental y un handoff legible para Neureon. **No** implica que los defectos de producto estén resueltos ni que haya autorización de corte a producción.
