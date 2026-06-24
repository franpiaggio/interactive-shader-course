# Raymarching with Fragment Shaders — Resources

Curated, high-trust sources. Lessons draw knowledge from here, not from guesses.

## Knowledge

- **Local: `../shader-bible/`** — a progressive, example-driven GLSL knowledge base built
  by this user, modules 00→05 culminating in raymarching, each lesson with runnable HTML.
  Use for: the canonical lesson ladder and copy-pasteable example code. This is the primary spine.
- [Iñigo Quílez — Raymarching SDFs](https://iquilezles.org/articles/raymarchingdf/)
  The canonical raymarching article (the loop, camera, normals). Use for: the core technique.
- [IQ — 3D SDFs (distance functions catalogue)](https://iquilezles.org/articles/distfunctions/)
  30+ primitives with exact distance formulas. Use for: every shape you sculpt with. Bookmark, don't memorise.
- [IQ — Smooth minimum](https://iquilezles.org/articles/smin/)
  The `smin` blend that makes organic, melted forms. Use for: merging primitives smoothly.
- [IQ — Numerical normals for SDFs](https://iquilezles.org/articles/normalsSDF/)
  Gradient normals via the tetrahedron trick. Use for: lighting raymarched surfaces.
- [IQ — Soft shadows](https://iquilezles.org/articles/rmshadows/) ·
  [Better fog](https://iquilezles.org/articles/fog/) ·
  [Palettes (cosine)](https://iquilezles.org/articles/palettes/)
  The cheap-but-gorgeous lighting/color tricks that make a scene read as art.
- [The Book of Shaders — Patricio Gonzalez Vivo & Jen Lowe](https://thebookofshaders.com/)
  The gentlest on-ramp to fragment-shader fundamentals (UVs, shaping, color). Use for: the absolute basics.
- [Maxime Heckel — "Painting with math: a gentle study of raymarching"](https://blog.maximeheckel.com/posts/painting-with-math-a-gentle-study-of-raymarching/)
  Beautiful, beginner-friendly raymarching walkthrough with **interactive widgets**: the march loop, SDFs,
  `smin`, normals, soft shadows, fog, FBM and **noise derivatives for terrain**, domain repetition, Menger.
  Use for: a gentle second pass over the core course, and the noise-derivative/erosion terrain technique (advanced A4-style).
- [Shadertoy](https://www.shadertoy.com/) — the playground + a vast searchable corpus of
  finished shaders to read, fork, and learn idioms from. Use for: practice and reading real art.

## Terrain & landscapes (advanced track)

- [IQ — Terrain marching](https://iquilezles.org/articles/terrainmarching/)
  The heightfield-march loop (step + sign-change + interpolation + LOD). Use for: the core terrain renderer (A1).
- [IQ — fBM](https://iquilezles.org/articles/fbm/)
  Building the height function from octaves of noise. Use for: the terrain elevation (A2).
- [IQ — Noise & derivatives ("morenoise")](https://iquilezles.org/articles/morenoise/)
  Analytic gradients → erosion-like ridged terrain that settles on slopes. Use for: A4 realism.
- [IQ — Domain warping](https://iquilezles.org/articles/warp/)
  Feed fBM into itself for winding valleys and ridgelines. Use for: A4.
- [IQ — "Painting a landscape with maths" (talk)](https://www.youtube.com/watch?v=BFld4EBO2RE) ·
  [Shadertoy "Elevated"](https://www.shadertoy.com/view/MdX3Rr)
  The definitive end-to-end landscape walkthrough + reference shader. Use for: A3 materials/fog/sky and beyond.
- [IQ — Outdoor lighting](https://iquilezles.org/articles/outdoorslighting/) · [Fog](https://iquilezles.org/articles/fog/)
  Sun + sky ambient + bounce, and atmospheric distance fog. Use for: A2/A3 shading.

## Wisdom (Communities)

- [Shadertoy](https://www.shadertoy.com/) itself — comment threads, "Inputs/Common" sharing,
  and forking. The fastest way to get feedback is to publish and read others' code.
- [r/shaders](https://www.reddit.com/r/shaders/) and [r/GraphicsProgramming](https://www.reddit.com/r/GraphicsProgramming/)
  — critique, debugging help, technique discussion. Use for: "why is my shader doing X" and feedback on pieces.
- [Graphics Programming Discord](https://discord.gg/6mgNGk7) — active real-time help for shader/GLSL questions.

_Community note: not yet confirmed whether the user wants to join communities — surface gently, don't push._

## Gaps
- No single curated "creative direction / composition for procedural art" source yet —
  technique is well covered, aesthetics less so. Surface art-direction references as the user nears finished pieces.
