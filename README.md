# Raymarching for Creative Art — an interactive shader course

A hands-on, browser-based course that takes you from **"what is a pixel"** to a **fully lit, raymarched 3D scene** you can publish on [Shadertoy](https://www.shadertoy.com/) — in 13 short lessons.

Every lesson runs **live in the page**: real WebGL shaders you can edit, sliders you can drag, and challenges that **grade themselves** by reading the pixels back from the canvas. No build step, no dependencies.

> **▶ Live course:** https://franpiaggio.github.io/interactive-shader-course/
> **🫧 Toy with it:** https://franpiaggio.github.io/interactive-shader-course/demo/metaballs.html — a full-screen, mouse-reactive metaballs shader (one fragment, no meshes)

<!-- Add a screenshot/GIF here for your post, e.g.: ![preview](preview.png) -->

## What you'll build

| # | Lesson | The win |
|---|---|---|
| 01 | Every pixel runs your code | Fragment shaders + the `uv` coordinate (hover-inspect any pixel) |
| 02 | Shaping a glowing circle | Turn distance into form with `smoothstep` + `mix` |
| 03 | Combining shapes: SDF booleans | `min` / `max` / `smin` smooth-merge |
| 04 | **Raymarch your first sphere** | Write the sphere-tracing loop — real 3D, no mesh |
| 05 | A camera you can orbit | A pinhole camera from four vectors; drag to orbit |
| 06 | Composing a scene | One `map()`: ground, transforms, `smin` |
| 07 | **Normals, light & shadows** | Diffuse + ambient, soft shadows, fog, gamma |
| 08 | Color: palettes & specular | Cosine palettes + a specular glint |
| 09 | Domain repetition | Infinite worlds from one `mod` line |
| 10 | Fractals: the Menger sponge | Infinite detail from a tiny iterated SDF |
| 11 | Volumetric clouds | March *through* a noise density field |
| 12 | Finish & ship to Shadertoy | Materials, polish, and publishing |
| 13 | **Fun experiments** | Lava lamp, neon tunnel, kaleido-plasma — go make art |

## Run it locally

The lessons use ES modules, so they must be served over HTTP (not opened as `file://`):

```bash
python3 -m http.server 8777
# then open http://localhost:8777/index.html
```

That's it — no install, no bundler. Everything is vanilla HTML + a tiny vanilla-WebGL2 engine.

## How it's built

- **`index.html`** — the course home / table of contents.
- **`lessons/`** — one self-contained HTML file per lesson.
- **`assets/shader-lab.js`** — a reusable, dependency-free WebGL2 playground: lazy "▶ Run" labs, live editor, slider uniforms, pixel inspector, and auto-graded challenges. Shadertoy-compatible (`mainImage`, `iTime`, `iResolution`, `iMouse`), so any snippet pastes straight into [shadertoy.com](https://www.shadertoy.com/).
- **`assets/lesson.css`**, **`assets/quiz.js`** — shared styling + retrieval-quiz widget.
- **`reference/`**, **`MISSION.md`**, **`GLOSSARY.md`**, **`RESOURCES.md`** — quick reference, scope, glossary, and curated sources.

## Credits & sources

Built on the techniques and writing of **[Iñigo Quílez](https://iquilezles.org/articles/)** (raymarching, SDFs, smin, soft shadows, palettes, fog) and **[The Book of Shaders](https://thebookofshaders.com/)**, with [Shadertoy](https://www.shadertoy.com/) as the playground. See [`RESOURCES.md`](./RESOURCES.md) for the full, annotated list.

## License

MIT — see [`LICENSE`](./LICENSE). Learn from it, fork it, remix it.
