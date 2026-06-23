# Mission: Raymarching for creative art

## Why
The user wants to make procedural, Shadertoy-style visual art — abstract scenes,
fractals, clouds, glowing surfaces — built entirely in a fragment shader using
the raymarching technique. The goal is *expressive output they can publish*
(Shadertoy, portfolio), not shipping production web features.

## Success looks like
- Write a raymarched scene from a blank editor: camera, a `map()` SDF, the march loop, lighting.
- Sculpt form with SDF primitives + smooth booleans (`smin`) to make organic shapes.
- Light and color a scene so it reads as art (normals, diffuse, soft shadows, fog, palettes).
- Post a finished piece to Shadertoy and read/remix other people's shaders fluently.

## Constraints
- **New to shaders.** Starting from fragment-shader fundamentals; must not skip the basics
  even though raymarching is the destination. Keep each lesson within working-memory limits.
- Wants code that runs both locally (self-contained HTML) and pasted into Shadertoy unchanged.
- Self-directed, session-based learning.

## Out of scope (for now)
- Vertex shaders / mesh pipelines, 3D engines, game integration.
- Production WebGL/three.js app architecture, performance tuning at scale.
- Classic raytracing / path tracing (the exact-intersection cousin) — revisit later.

---
_Grounding resource: the local `shader-bible/` (modules 00→05 build exactly this ladder),
backed by Iñigo Quílez's articles. See [RESOURCES.md](./RESOURCES.md)._
