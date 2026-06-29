# Project lesson: the infinite sphere field (mission win banked)

Recorded 2026-06-29. Over a long hands-on session the user designed an original raymarched piece from
scratch (the `sphere-field/` demo) by directing changes iteratively — camera behaviour, a travelling
light pulse, per-sphere variation, lighting/bloom mood. They then asked for a tutorial of that build, so
it was captured as **Lesson 14** ([[0014-build-an-infinite-sphere-field]]). This is the first lesson
*reverse-engineered from something the user already made*, which is exactly the mission target: "publish a
finished piece." Demo is live at franpiaggio.github.io/interactive-shader-course/sphere-field/.

## What the user has demonstrably internalised (drove these decisions themselves)
- **Domain repetition as the scene** (L09) — a `mod`/`round` lattice of spheres, flown through.
- **A travelling Gaussian pulse** — `exp(-k·d²)` against a moving front, reused for both geometry (shrink
  the radius) and shading (warm glow), kept in sync. This is the genuinely new technique the lesson teaches.
- **Per-cell variation** via `hash(id)` — size, tint and a `sin(iTime+phase)` orbit, the L09 trick extended.
- **Overshoot intuition** — understood *why* varied/orbiting cells break a plain `mod` march, and accepted
  the conservative-step fix (`t += d*0.6`). Also grasped the even/odd "guardian" idea for a safe camera path.

## Scope decision for L14
Kept it a one-win lesson despite the source video having seven steps: the build steps that were already
taught are *links back* to their lessons (01,02,04,05,09,07,08,12); the lesson teaches only the new pulse
as its interactive, graded win, plus a compact Shadertoy-ready ship block. Honours "considering the
tutorials we already have" without re-teaching.

## Two explainer videos exist (Remotion, in `video/`, gitignored mp4s)
`sphere-recap` (continuous morph build-up) and `sphere-explain` (each function as a 2D diagram, then its
use in the shader, ending on a showcase). Source lives in `video/src/sphere-*.{js,jsx}`. Title for both:
"How to make an infinite exploring shader."

## Next branches (on request)
Directional pulse along the view vector (vs world z); the alternating weave/dive camera maths in depth;
reflections/env; or publish L14's piece to Shadertoy as the explicit mission checkpoint.
