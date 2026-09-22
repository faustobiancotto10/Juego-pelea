# Character Pipeline V2

Purpose: give Mario a stronger authoring/validation environment for procedural fighter construction without changing the permanent rule that runtime fighters are procedural Canvas2D rigs.

## Toolchain

Primary free authoring/reference tools:
- Synfig CLI / Synfig Studio — vector rig and motion studies.
- Inkscape — vector shape construction and silhouette studies.
- FFmpeg / ImageMagick — frame/contact-sheet/visual-diff utilities.
- OpenToonz — optional external motion/cutout study tool. It is not a runtime dependency and is not required in CI.

The repository remains self-contained at runtime. No Synfig/OpenToonz/Inkscape binary, project file or rendered raster may become a runtime fighter dependency.

## Bootstrap

Ubuntu / cloud workstation:

```bash
bash tools/character-pipeline-v2/bootstrap-ubuntu.sh
```

Containerized/headless Synfig environment:

```bash
docker build -t juego-pelea-character-lab tools/character-pipeline-v2
```

## Pipeline

1. Read the authoritative character reference package.
2. Build a character-specific structural profile: head, torso, shoulders, limbs, stance, center-of-mass bias and silhouette accents.
3. Use vector/rig tools only to study poses, proportions, arcs and timing.
4. Implement the final character as procedural Canvas2D geometry in the game renderer.
5. Validate neutral silhouette before clothing/text/effects.
6. Validate locomotion and attacks with effects disabled.
7. Validate effects separately.
8. Validate phone-scale readability.
9. Validate that no reference/raster path is loaded by runtime.

## Mandatory visual gates

A fighter fails if:
- its neutral black silhouette is confusable with another released fighter;
- identity depends mainly on shirt text, colors or accessories;
- body proportions are materially inherited from another fighter without authored justification;
- preparation / force / contact / recovery cannot be read with effects disabled;
- reference images or tool renders are used as runtime sprites.

El Toro specifically must read as a heavy, broad, planted line-breaker even with all clothing text and effects removed.

## Runtime boundary

External tools are authoring aids only. Simulation remains combat authority. Renderer remains snapshot-driven. Runtime remains TypeScript + Canvas2D unless a later user-approved architecture round changes that.
