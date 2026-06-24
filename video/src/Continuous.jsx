import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {useRef, useLayoutEffect} from 'react';
import gsap from 'gsap';
import {Shader} from './Shader';
import {ThreeQuad} from './ThreeQuad';
import {CONTINUOUS} from './terrain-continuous';

const ACCENT = '#e6885f', INK = '#f1eee5';
const SANS = 'Helvetica, Arial, sans-serif', MONO = '"SF Mono", ui-monospace, Menlo, monospace';

export const FPS = 30;
const QUAD = 150;            // quad intro (5s)
const OVERLAP = 22;          // crossfade quad -> shader
const SHADER_F = 44 * FPS;   // continuous shader length (frames)
export const TOTAL_FRAMES = (QUAD - OVERLAP) + SHADER_F;

const Scrim = () => <AbsoluteFill style={{background: 'linear-gradient(transparent 52%, rgba(0,0,0,0.82))'}} />;

const FadeWrap = ({children, fin = 0, fout = 0, dur}) => {
  const f = useCurrentFrame();
  const oin = fin ? interpolate(f, [0, fin], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const oout = fout ? interpolate(f, [dur - fout, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return <AbsoluteFill style={{opacity: oin * oout}}>{children}</AbsoluteFill>;
};

// GSAP-driven caption: paused timeline seeked to the local frame → fancy, deterministic in/out.
const GsapCap = ({step, title, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const root = useRef(null);
  const tl = useRef(null);
  useLayoutEffect(() => {
    if (!tl.current && root.current) {
      const q = (c) => root.current.querySelector(c);
      const t = gsap.timeline({paused: true});
      t.from(q('.line'), {scaleX: 0, duration: 0.55, ease: 'power3.out', transformOrigin: 'left center'}, 0)
       .from(q('.k'), {opacity: 0, x: -26, duration: 0.45, ease: 'power2.out'}, 0.12)
       .from(q('.t'), {opacity: 0, y: 46, duration: 0.6, ease: 'back.out(1.5)'}, 0.22)
       .to([q('.line'), q('.k'), q('.t')], {opacity: 0, y: -24, duration: 0.5, ease: 'power2.in'}, dur - 0.55);
      tl.current = t;
    }
    if (tl.current) tl.current.seek(f / fps);
  }, [f, fps, dur]);
  return (
    <div ref={root} style={{position: 'absolute', left: 64, right: 64, bottom: 70}}>
      <div className="line" style={{height: 3, width: 110, background: ACCENT, borderRadius: 2, marginBottom: 14}} />
      <div className="k" style={{fontFamily: MONO, color: ACCENT, letterSpacing: 5, fontSize: 24, fontWeight: 700, textShadow: '0 2px 12px #000'}}>{step}</div>
      <div className="t" style={{fontFamily: SANS, color: '#fff', fontSize: 56, fontWeight: 800, marginTop: 4, textShadow: '0 2px 18px rgba(0,0,0,0.78)'}}>{title}</div>
    </div>
  );
};

// GSAP-driven pixel grid (the "fragments"), scales/fades in then out
const GsapGrid = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ref = useRef(null);
  const tl = useRef(null);
  useLayoutEffect(() => {
    if (!tl.current && ref.current) {
      const t = gsap.timeline({paused: true});
      t.from(ref.current, {opacity: 0, scale: 1.08, duration: 0.7, ease: 'power2.out'}, 0)
       .to(ref.current, {opacity: 0, duration: 0.5, ease: 'power2.in'}, dur - 0.5);
      tl.current = t;
    }
    if (tl.current) tl.current.seek(f / fps);
  }, [f, fps, dur]);
  const cell = 1080 / 13;
  return <AbsoluteFill ref={ref} style={{opacity: 0.55, mixBlendMode: 'overlay',
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)',
    backgroundSize: `${cell}px ${cell}px`}} />;
};

const cap = (from, dur, step, title) => (
  <Sequence key={step} from={Math.round(from * FPS)} durationInFrames={Math.round(dur * FPS)}>
    <GsapCap step={step} title={title} dur={dur} />
  </Sequence>
);

const QuadIntro = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - 4, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{background: '#0c0e15'}}>
      <ThreeQuad dur={QUAD} />
      <Scrim />
      <div style={{position: 'absolute', top: 70, left: 64, right: 64, opacity: a}}>
        <div style={{fontFamily: MONO, color: ACCENT, letterSpacing: 6, fontSize: 22, fontWeight: 700}}>HOW A SHADER PAINTS A WORLD</div>
      </div>
      {cap(0.6, 4.0, '01 · GEOMETRY', 'We start with 2 triangles')}
    </AbsoluteFill>
  );
};

const ShaderPart = () => {
  const s = useCurrentFrame() / useVideoConfig().fps;
  const end = SHADER_F / FPS;
  const outro = interpolate(s, [end - 2.0, end - 1.4, end], [0, 1, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Shader source={CONTINUOUS} />
      <Sequence from={Math.round(1.2 * FPS)} durationInFrames={Math.round(3.4 * FPS)}><GsapGrid dur={3.4} /></Sequence>
      {cap(0.3,  3.7, '02 · FRAGMENT',  'Every pixel gets a color')}
      {cap(4.3,  2.6, '03 · A PLANE',   'Start with a flat grid ground')}
      {cap(7.0,  3.8, '04 · NOISE',     'Paint fBM onto it — black & white')}
      {cap(11.0, 5.0, '05 · fBM HEIGHT','Bright = high → the noise becomes mountains')}
      {cap(16.5, 3.3, '06 · SUN',       'Add a source of light')}
      {cap(20.0, 3.8, '07 · LIGHT',     'Now it lights the slopes')}
      {cap(24.0, 4.7, '08 · MATERIALS', 'Grass, rock, snow')}
      {cap(29.0, 4.7, '09 · SHADOWS',   'Long cast shadows')}
      {cap(34.0, 3.7, '10 · FOG',       'Atmospheric depth')}
      {cap(37.8, 4.0, '11 · CLOUDS',    'A volumetric sky')}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: outro}}>
        <div style={{fontFamily: SANS, color: '#fff', fontSize: 46, fontWeight: 800, textShadow: '0 3px 22px rgba(0,0,0,0.9)'}}>
          From 2 triangles to a world — <span style={{color: ACCENT}}>one shader</span>.
        </div>
        <div style={{fontFamily: MONO, color: INK, fontSize: 24, marginTop: 16, textShadow: '0 2px 14px #000'}}>
          franpiaggio.github.io/shader-terrain-landscapes
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ContinuousTerrain = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence durationInFrames={QUAD}><FadeWrap dur={QUAD} fout={OVERLAP}><QuadIntro /></FadeWrap></Sequence>
    <Sequence from={QUAD - OVERLAP} durationInFrames={SHADER_F}><FadeWrap dur={SHADER_F} fin={OVERLAP}><ShaderPart /></FadeWrap></Sequence>
  </AbsoluteFill>
);
