# Mission expanded: advanced terrain/landscape track

Established 2026-06-23, after the 13-lesson core course + the published repo/site/videos. The user wants
to go deeper into **procedural terrain/landscape generation** with shaders, explicitly grounded in
Iñigo Quílez's landscape work.

This adds an **advanced track** (`advanced/`) on top of the core course rather than replacing the
mission — see [[MISSION.md]]. Key points for future sessions:
- **New mechanic:** heightfield raymarching (march + sign-change + interpolation + LOD step), which is
  *different* from SDF sphere-tracing. Don't conflate them when teaching.
- **Built so far:** A1 heightfield march · A2 noise+normals+light · A3 materials/fog/sky (a postable
  vista). The A3 shader was **visually validated** by rendering a still via the Remotion WebGL pipeline
  (not just logic-checked) — terrain renders correctly (green slopes, rock, snow, fog, sun).
- **Next (offered, not built):** A4 — fBM analytic derivatives (erosion/ridged), domain warping, soft
  terrain shadows; optionally volumetric clouds over the terrain (reusing core L11).
- **Validation habit worth keeping:** render a still and *look* at advanced shaders before shipping —
  the Chrome extension isn't connected, so render-and-view is the reliable check.
