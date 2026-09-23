# Handoff ASTRA → Neureon (2026-09-23)

**No activa un task ni modifica R005.** Base coordinación `main` `c527d463…`; preview sprite candidato `fe2b505…`. Leer [README.md](README.md) y [ROADMAP.md](ROADMAP.md) para evidencia/owners/dependencias completas. Esta rama contiene solo documentación; ninguna corrección producto fue integrada.

1. **Primero:** resolver estado `HANDOFF_CONSUMED` de Mario/Mario-A/B: viola `PROTOCOL.md` y hace fallar `node --test tests/coordination-contract.test.mjs` en `main` actual (9/10). Fijar semántica/CI y comprobar que no cambian gates de Gonza ni de usuario. Germinator valida independientemente.
2. **Producto aislado El Toro:** Mario normaliza estatura por fuente/pose (guardia hoy +42% cabeza-pie), hace dash visual diferente de walk; con contrato estable de Ricardo/Mario conecta los cuatro FX empaquetados a eventos y archivos realmente servidos. El resolver ya distingue dash. No tocar daño o velocidad para arreglar dibujo.
3. **Antes de roster sprite:** límites geométricos y escala en package gate, lifecycle de carga cancelable y teardown de decoded images, mediciones en iPhone. Evitar que una CI verde de cuatro muestras de sprites certifique todo el atlas.
4. **Fighter N+1:** quitar ramas de identidad de `FightRenderer` mediante claves/presets visuales acotados; exigir tácticas CPU del paquete nuevo. Segundo modo y tercer stage habilitan extracción `FightSession`/stage package, sin motor genérico especulativo.

**Gate legal de promoción:** QA Germinator sobre SHA integrado exacto → Gonza verifica bytes servidos en preview aislada → usuario prueba iPhone/acepta arte y feel → Neureon resuelve formato `body.webp`/`animations.json` o enmienda → roster completo supera aceptación sprite → decisión explícita de cutover. Ningún verde anterior equivale a ese cierre.

**Solicitudes de decisión reales:** umbral visual definitivo LARGE frente a un personaje medio; política de cache rematch vs liberación; formato canónico; si el usuario acepta FX procedural temporarios pese a haber encargado FX sprite (recomendación ASTRA: no declararlos integrados si router sigue `deferred`).
