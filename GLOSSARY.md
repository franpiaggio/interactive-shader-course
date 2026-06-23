# Raymarching for Creative Art — Glossary

The canonical language for this workspace. Lessons adhere to these terms.
A term is added only once the user can use it correctly — this file grows with understanding.

## Terms

**Fragment shader**:
A program the GPU runs once per pixel, in parallel, whose only job is to output that pixel's color.
_Avoid_: pixel script, screen program

**Fragment**:
The GPU's word for a single pixel-to-be-colored, with its screen coordinate `gl_FragCoord`.
_Avoid_: dot, point

**UV**:
Normalized screen coordinates derived from the fragment position — the per-pixel input that drives the whole image.
_Avoid_: texture coords (here it means screen position), st

**mainImage**:
The Shadertoy entry point `void mainImage(out vec4 fragColor, in vec2 fragCoord)` — the function the harness calls per fragment.
_Avoid_: main (that's the raw-GLSL wrapper), draw

## SDFs & raymarching

**SDF (Signed Distance Field)**:
A function returning the distance from a point to the nearest surface, negative inside and positive outside.
_Avoid_: distance map, implicit surface

**smin (smooth minimum)**:
A blended `min` that melts two SDFs together over a radius `k`, replacing the sharp crease of a plain union with an organic join.
_Avoid_: soft min, blend min

**Raymarching**:
Rendering by shooting a ray per pixel and stepping along it until it hits a surface described by an SDF.
_Avoid_: ray casting (that's the exact-intersection cousin), ray tracing

**Sphere tracing**:
The raymarching step rule: advance the ray by exactly `map(p)` each iteration — the largest jump guaranteed not to overshoot any surface.
_Avoid_: distance stepping, marching

**map**:
The single function `float map(vec3 p)` returning the SDF of the entire scene — what the marcher calls repeatedly.
_Avoid_: scene, sdf (those are looser); SDF is the field, `map` is the function

**Ray origin / ray direction (`ro` / `rd`)**:
The camera point a ray starts from (`ro`) and the per-pixel unit direction it travels (`rd`).
_Avoid_: eye/look, start/dir

**Normal**:
The unit vector perpendicular to a surface at a point; for an SDF it's the normalized gradient of `map`, found by sampling nearby (the tetrahedron taps).
_Avoid_: face direction, perpendicular
