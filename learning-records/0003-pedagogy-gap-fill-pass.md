# Course revision: filling the abrupt jumps

Recorded 2026-06-24, after a full pedagogical review of the 13-lesson core + advanced track. The course
was structurally strong (one-win ladder, live labs, slider intuition), but a recurring weakness surfaced:
key formulas were *shown working* without the *why*, so a careful reader of L1–L3 could still stall on
L4, L10, or L11. See [[NOTES.md]] for the per-lesson edit list.

## The three real jumps (severity order)
- **L04 — pixel → 3D ray.** The single hardest conceptual step. `vec3(uv, -1.5)` appeared with no
  derivation; the `-1.5` (focal length) was a mystery until L05 and the connection was never drawn.
- **L10 — Menger sponge.** The densest code in the course, dropped whole. The fix reframes it as two
  tools the learner *already has* — L09 domain fold + L03 `max` subtraction — run in a shrinking loop.
- **L11 — surface → volume.** A full algorithm swap (hit-finding → fixed-step density accumulation) with
  one line of warning, plus untaught premultiplied-alpha compositing. Also caught a **broken xref**: fbm
  was linked to L04 but is actually first taught in L11.

## Decision: patch in place, don't renumber
Inserting bridge lessons would renumber 10+ files and break index/nav/records. Instead the missing
intermediate steps were added *inside* the existing lessons as short intuition `note` callouts — keeping
each lesson's single "win" intact while lowering the working-memory cost of the hard parts. This matches
the teach principle that for *knowledge*, difficulty is the enemy.

## Standing rule going forward
Every magic formula a lesson asks the learner to trust gets a one-paragraph "read the formula" note that
names the moving parts. Glossary now covers the lighting/noise/volume vocabulary the later lessons assume.
