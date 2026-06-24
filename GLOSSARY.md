# Raymarching with Fragment Shaders — Glossary

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

**Finite differences**:
Estimating a gradient by sampling a function at small offsets and comparing the values, instead of differentiating it — how both SDF normals and volume lighting are computed.
_Avoid_: derivative (that's the exact version), slope

**Domain repetition**:
Tiling one shape across space by folding the input point with `mod` before the SDF, so every cell maps onto the origin cell — infinite copies for the cost of one.
_Avoid_: instancing, copying

**Hash**:
A function that scrambles an input into a chaotic-looking but fully deterministic pseudo-random number — same input always gives the same value, used for per-cell variation and as the seed of noise.
_Avoid_: random (it isn't), rng

## Lighting & color

**Diffuse**:
The matte component of lighting: brightness equal to how directly the surface faces the light, `max(dot(normal, lightDir), 0.0)` (Lambert's law).
_Avoid_: shading (too broad), lambert

**Ambient**:
A small constant light added everywhere so surfaces facing away from the light keep some colour instead of going pure black.
_Avoid_: fill light, base light

**Specular**:
The shiny highlight where the surface mirrors the light toward the viewer — view-dependent, tightened by a shininess power.
_Avoid_: gloss, reflection (that's the full mirror)

**Gamma correction**:
The final `pow(col, 0.4545)` pass that maps linear light values to what the display expects, so midtones don't look muddy.
_Avoid_: brightness, tone mapping (related but distinct)

**Cosine palette**:
A smooth colour ramp built from `a + b*cos(6.2832*(c*t + d))` — four vec3 knobs that sweep hue/brightness as `t` varies (IQ's palettes).
_Avoid_: gradient, colormap

## Noise & volumes

**Noise**:
A smooth, repeatable pseudo-random field built by interpolating hashed lattice values — the raw material of organic, natural-looking variation.
_Avoid_: random, static

**fBM (fractional Brownian motion)**:
Several octaves of `noise` summed at doubling frequency and halving amplitude, giving detail at many scales — used for clouds, terrain, and texture.
_Avoid_: turbulence (a variant), fractal noise

**Volume marching**:
Rendering by stepping a ray at fixed intervals through a density field, accumulating colour and opacity — used for clouds, smoke, and fog where there is no single surface.
_Avoid_: raymarching (that's the surface, hit-finding cousin)

**Premultiplied alpha / front-to-back compositing**:
Accumulating colour already scaled by its own opacity, each new slab contributing only through the still-clear fraction `1 - sum.a`, so nearer volume correctly hides what's behind it.
_Avoid_: alpha blending (looser), over operator

**Heightfield marching**:
Terrain rendering that steps a ray forward and tests against a height function `y = h(x,z)`, detecting the surface by a sign change rather than an SDF distance.
_Avoid_: raymarching, sphere tracing (terrain uses neither)
