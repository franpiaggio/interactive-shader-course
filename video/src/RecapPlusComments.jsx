// Same as RecapPlus, but each layer's example line also carries a one-line // comment
// explaining what it is. Kept as a separate composition so the previous one is untouched.
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {useRef, useLayoutEffect} from 'react';
import gsap from 'gsap';
import {Shader} from './Shader';
import {ThreeQuad} from './ThreeQuad';
import {CONTINUOUS} from './terrain-continuous';
import {FINAL} from './terrain-final';

const ACCENT = '#e6885f', INK = '#f1eee5';
const SANS = 'Helvetica, Arial, sans-serif', MONO = '"SF Mono", ui-monospace, Menlo, monospace';

export const FPS = 30;
const QUAD = 150, OVERLAP = 22, SHADER_F = 44 * FPS;
const BODY = (QUAD - OVERLAP) + SHADER_F;
const TEASER = 6 * FPS;
export const RECAP_TOTAL = (TEASER - OVERLAP) + BODY;

const Scrim = () => <AbsoluteFill style={{background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.84))'}} />;

const FadeWrap = ({children, fin = 0, fout = 0, dur}) => {
  const f = useCurrentFrame();
  const oin = fin ? interpolate(f, [0, fin], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const oout = fout ? interpolate(f, [dur - fout, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return <AbsoluteFill style={{opacity: oin * oout}}>{children}</AbsoluteFill>;
};

// caption: step + title + one line of example code WITH a dim // comment explaining it.
const GsapCapCode = ({step, title, code, comment, dur}) => {
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
       .from(q('.c'), {opacity: 0, y: 22, duration: 0.5, ease: 'power2.out'}, 0.40)
       .to([q('.line'), q('.k'), q('.t'), q('.c')], {opacity: 0, y: -24, duration: 0.5, ease: 'power2.in'}, dur - 0.55);
      tl.current = t;
    }
    if (tl.current) tl.current.seek(f / fps);
  }, [f, fps, dur]);
  return (
    <div ref={root} style={{position: 'absolute', left: 64, right: 64, bottom: 70}}>
      <div className="line" style={{height: 3, width: 110, background: ACCENT, borderRadius: 2, marginBottom: 14}} />
      <div className="k" style={{fontFamily: MONO, color: ACCENT, letterSpacing: 5, fontSize: 24, fontWeight: 700, textShadow: '0 2px 12px #000'}}>{step}</div>
      <div className="t" style={{fontFamily: SANS, color: '#fff', fontSize: 54, fontWeight: 800, marginTop: 4, textShadow: '0 2px 18px rgba(0,0,0,0.78)'}}>{title}</div>
      <div className="c" style={{display: 'inline-block', marginTop: 14, fontFamily: MONO, fontSize: 25,
        background: 'rgba(0,0,0,0.5)', padding: '7px 14px', borderRadius: 7, textShadow: '0 1px 4px #000'}}>
        <span style={{color: '#ffd9a0'}}>{code}</span>
        <span style={{color: '#8b94a6'}}>{'  // ' + comment}</span>
      </div>
    </div>
  );
};

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

const cap = (from, dur, step, title, code, comment) => (
  <Sequence key={step} from={Math.round(from * FPS)} durationInFrames={Math.round(dur * FPS)}>
    <GsapCapCode step={step} title={title} code={code} comment={comment} dur={dur} />
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
      {cap(0.6, 4.0, '01 · GEOMETRY', 'We start with 2 triangles', 'gl_Position = vec4(pos, 1.0);', 'place the 2 triangles')}
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
      {cap(0.3,  3.7, '02 · FRAGMENT',  'Every pixel gets a color',    'col = vec3(uv, 0.5);',              'pixel coord → color')}
      {cap(4.3,  2.6, '03 · A PLANE',   'Start with a flat ground',    'd = p.y;',                          'flat ground at y=0')}
      {cap(7.0,  3.8, '04 · NOISE',     'Paint fBM onto it',           'n = fbm(p.xz);',                    'layered value noise')}
      {cap(11.0, 5.0, '05 · fBM HEIGHT','The noise becomes mountains', 'h = 16.0 * fbm(p.xz);',            'noise → terrain height')}
      {cap(16.5, 3.3, '06 · SUN',       'Add a light direction',       'sun = normalize(vec3(-1.,.3,.2));', 'the light direction')}
      {cap(20.0, 3.8, '07 · LIGHT',     'It lights the slopes',        'dif = max(dot(n, sun), 0.);',       'how much it faces the sun')}
      {cap(24.0, 4.7, '08 · MATERIALS', 'Grass, rock, snow',           'mix(rock, grass, slope);',          'color by steepness')}
      {cap(29.0, 4.7, '09 · SHADOWS',   'Long cast shadows',           'sh = shadow(p, sun);',              'ray traced toward the sun')}
      {cap(34.0, 3.7, '10 · FOG',       'Atmospheric depth',           'mix(col, sky, fog(t));',            'fade into the sky by distance')}
      {cap(37.8, 4.0, '11 · CLOUDS',    'A volumetric sky',            'cloud = fbm(p + wind);',            'drifting density overhead')}
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

const Body = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence durationInFrames={QUAD}><FadeWrap dur={QUAD} fout={OVERLAP}><QuadIntro /></FadeWrap></Sequence>
    <Sequence from={QUAD - OVERLAP} durationInFrames={SHADER_F}><FadeWrap dur={SHADER_F} fin={OVERLAP}><ShaderPart /></FadeWrap></Sequence>
  </AbsoluteFill>
);

const Teaser = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - 28, fps, config: {damping: 200}});
  const b = spring({frame: f - 46, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Shader source={FINAL} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, transparent 30%, rgba(0,0,0,0.6))'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 90}}>
        <div style={{fontFamily: MONO, color: ACCENT, letterSpacing: 6, fontSize: 24, fontWeight: 700, opacity: a, textShadow: '0 2px 14px #000'}}>STEP BY STEP</div>
        <div style={{fontFamily: SANS, color: '#fff', fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginTop: 18,
          whiteSpace: 'nowrap', opacity: a, transform: `translateY(${(1 - a) * 26}px)`, textShadow: '0 3px 24px rgba(0,0,0,0.92)'}}>
          How is something like this<br/>rendered in a browser?
        </div>
        <div style={{fontFamily: SANS, color: '#ece9df', fontSize: 32, marginTop: 24, maxWidth: 820, opacity: b, textShadow: '0 2px 16px rgba(0,0,0,0.95)'}}>
          From a single triangle to a raymarched world.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const RecapPlusComments = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence durationInFrames={TEASER}><FadeWrap dur={TEASER} fout={OVERLAP}><Teaser /></FadeWrap></Sequence>
    <Sequence from={TEASER - OVERLAP} durationInFrames={BODY}><FadeWrap dur={BODY} fin={OVERLAP}><Body /></FadeWrap></Sequence>
  </AbsoluteFill>
);
