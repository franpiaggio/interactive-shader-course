import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {useRef, useLayoutEffect} from 'react';
import gsap from 'gsap';
import {Shader} from './Shader';
import {ThreeQuad} from './ThreeQuad';
import {GRADIENT} from './explainer';
import {NOISE2D, HEIGHTMAP, TERRAIN_MARCH, TERRAIN_LIT, TERRAIN_MAT, TERRAIN_FULL} from './terrain-steps';

const BG = '#0c0e15', ACCENT = '#e6885f', INK = '#f1eee5', MUTED = '#9aa0b0';
const SANS = 'Helvetica, Arial, sans-serif', MONO = '"SF Mono", ui-monospace, Menlo, monospace';

const Fade = ({children, dur, hold = 12}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, hold, dur - hold, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

// GSAP-driven caption: a paused timeline seeked to the local frame (deterministic for Remotion).
const Caption = ({step, title, sub}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const root = useRef(null);
  const tl = useRef(null);
  useLayoutEffect(() => {
    if (!tl.current && root.current) {
      const q = (c) => root.current.querySelector(c);
      const t = gsap.timeline({paused: true});
      t.from(q('.k'), {opacity: 0, y: 24, duration: 0.5, ease: 'power3.out'})
       .from(q('.t'), {opacity: 0, y: 34, duration: 0.6, ease: 'power3.out'}, 0.12)
       .from(q('.s'), {opacity: 0, y: 22, duration: 0.6, ease: 'power2.out'}, 0.30);
      tl.current = t;
    }
    if (tl.current) tl.current.seek(f / fps);
  }, [f, fps]);
  return (
    <div ref={root} style={{position: 'absolute', left: 64, right: 64, bottom: 70}}>
      <div className="k" style={{fontFamily: MONO, color: ACCENT, letterSpacing: 5, fontSize: 24, fontWeight: 700,
        textShadow: '0 2px 12px #000'}}>{step}</div>
      <div className="t" style={{fontFamily: SANS, color: '#fff', fontSize: 58, fontWeight: 800, lineHeight: 1.05,
        margin: '6px 0', textShadow: '0 2px 18px rgba(0,0,0,0.7)'}}>{title}</div>
      <div className="s" style={{fontFamily: MONO, color: '#ffd9a0', fontSize: 26, textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{sub}</div>
    </div>
  );
};

const Scrim = () => <AbsoluteFill style={{background: 'linear-gradient(transparent 55%, rgba(0,0,0,0.82))'}} />;

// pixel-grid overlay (the "fragments"), revealed over the painted quad
const PixelGrid = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [10, 40], [0, 0.5], {extrapolateRight: 'clamp'});
  const cell = 1080 / 14;
  return (
    <AbsoluteFill style={{opacity: o,
      backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
      backgroundSize: `${cell}px ${cell}px`}} />
  );
};

const ShaderScene = ({source, step, title, sub, dur, grid}) => (
  <Fade dur={dur}>
    <AbsoluteFill style={{background: '#000'}}>
      <Shader source={source} />
      {grid ? <PixelGrid /> : null}
      <Scrim />
      <Caption step={step} title={title} sub={sub} />
    </AbsoluteFill>
  </Fade>
);

const QuadScene = ({dur}) => (
  <Fade dur={dur}>
    <AbsoluteFill style={{background: BG}}>
      <ThreeQuad dur={dur} />
      <Scrim />
      <Caption step="01 · GEOMETRY" title="We start with 2 triangles"
        sub="1 quad = 4 vertices = 2 triangles covering the screen" />
    </AbsoluteFill>
  </Fade>
);

const Title = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - 4, fps, config: {damping: 200}});
  const b = spring({frame: f - 16, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: 90, textAlign: 'center'}}>
      <div style={{fontFamily: MONO, color: ACCENT, letterSpacing: 7, fontSize: 24, fontWeight: 700, opacity: a}}>HOW A SHADER IS MADE</div>
      <div style={{fontFamily: SANS, color: INK, fontSize: 84, fontWeight: 800, lineHeight: 1.03, marginTop: 20, opacity: a,
        transform: `translateY(${(1 - a) * 26}px)`}}>From 2 triangles<br/>to a <span style={{color: ACCENT}}>landscape</span></div>
      <div style={{fontFamily: SANS, color: MUTED, fontSize: 32, marginTop: 28, maxWidth: 780, opacity: b}}>
        Step by step: geometry → pixels → noise → 3D terrain.
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - 4, fps, config: {damping: 200}});
  const b = spring({frame: f - 16, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: 90, textAlign: 'center'}}>
      <div style={{fontFamily: SANS, color: INK, fontSize: 60, fontWeight: 800, opacity: a,
        transform: `translateY(${(1 - a) * 24}px)`}}>It's all <span style={{color: ACCENT}}>painted geometry</span></div>
      <div style={{fontFamily: SANS, color: MUTED, fontSize: 30, marginTop: 24, maxWidth: 820, opacity: b}}>
        2 triangles, one color per pixel — scaled up to a world.
      </div>
      <div style={{fontFamily: MONO, color: INK, fontSize: 28, marginTop: 40, opacity: b,
        background: 'rgba(255,255,255,0.06)', padding: '12px 22px', borderRadius: 12, border: '1px solid #2a2d39'}}>
        ▶ franpiaggio.github.io/interactive-shader-course
      </div>
      <div style={{fontFamily: SANS, color: MUTED, fontSize: 26, marginTop: 30, opacity: b}}>
        Built with <span style={{color: ACCENT, fontFamily: MONO}}>/teach</span> · Remotion · Three.js
      </div>
    </AbsoluteFill>
  );
};

const D = {title: 85, quad: 145, frag: 100, noise: 95, height: 100, march: 110, lit: 100, mat: 100, full: 140, outro: 110};
export const ThreeExplainer = () => {
  let at = 0;
  const seq = (dur, node) => { const el = <Sequence key={at} from={at} durationInFrames={dur}>{node}</Sequence>; at += dur; return el; };
  return (
    <AbsoluteFill style={{background: BG}}>
      {seq(D.title, <Fade dur={D.title}><Title/></Fade>)}
      {seq(D.quad, <QuadScene dur={D.quad}/>)}
      {seq(D.frag, <ShaderScene source={GRADIENT} grid step="02 · FRAGMENTS"
        title="The shader paints each pixel" sub="every pixel runs your code once → one color" dur={D.frag}/>)}
      {seq(D.noise, <ShaderScene source={NOISE2D} step="03 · NOISE"
        title="A formula makes noise" sub="value noise summed in octaves = fBM" dur={D.noise}/>)}
      {seq(D.height, <ShaderScene source={HEIGHTMAP} step="04 · HEIGHT MAP"
        title="Read the noise as height" sub="h(x, z): bright = high ground" dur={D.height}/>)}
      {seq(D.march, <ShaderScene source={TERRAIN_MARCH} step="05 · RAYMARCH"
        title="March a ray into the height" sub="step forward until the ray is below the terrain" dur={D.march}/>)}
      {seq(D.lit, <ShaderScene source={TERRAIN_LIT} step="06 · LIGHT"
        title="Slopes catch the sun" sub="normals from the height map → diffuse" dur={D.lit}/>)}
      {seq(D.mat, <ShaderScene source={TERRAIN_MAT} step="07 · MATERIALS"
        title="Grass, rock, snow" sub="material chosen by slope & height" dur={D.mat}/>)}
      {seq(D.full, <ShaderScene source={TERRAIN_FULL} step="08 · ATMOSPHERE"
        title="Shadows, fog, sky" sub="the same fBM — now a landscape" dur={D.full}/>)}
      {seq(D.outro, <Fade dur={D.outro}><Outro/></Fade>)}
    </AbsoluteFill>
  );
};
export const EXPL_TOTAL = Object.values(D).reduce((a, b) => a + b, 0);
