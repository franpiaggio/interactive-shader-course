// Self-contained copy of the original "Showcase" composition (shader-course.mp4),
// with the only change being /tech -> /teach. Imports the SAME shaders + Shader so the
// rest of the video is byte-identical in behaviour. Does NOT import Root.jsx (in use).
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Shader} from './Shader';
import {KALEIDO, LAVA, TUNNEL, CLOUDS} from './shaders';

const BG = '#0c0e15';
const ACCENT = '#e6885f';
const INK = '#f1eee5';
const MUTED = '#9aa0b0';
const SANS = 'Helvetica, Arial, sans-serif';
const MONO = '"SF Mono", ui-monospace, Menlo, monospace';

const Fade = ({children, dur, hold = 12}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, hold, dur - hold, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const rise = (frame, fps, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 200}});

const Title = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 4);
  const b = rise(f, fps, 16);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: 90}}>
      <div style={{fontFamily: MONO, color: ACCENT, letterSpacing: 8, fontSize: 26, fontWeight: 700,
        opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>CLAUDE&nbsp;CODE&nbsp;·&nbsp;/teach</div>
      <div style={{fontFamily: SANS, color: INK, fontSize: 96, fontWeight: 800, lineHeight: 1.02,
        textAlign: 'center', marginTop: 28, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
        From zero to<br/><span style={{color: ACCENT}}>Raymarching</span>
      </div>
      <div style={{fontFamily: SANS, color: MUTED, fontSize: 34, textAlign: 'center', maxWidth: 780,
        marginTop: 34, opacity: b, transform: `translateY(${(1 - b) * 20}px)`}}>
        I used <span style={{color: INK, fontFamily: MONO}}>/teach</span> to generate an interactive
        roadmap for learning shaders.
      </div>
    </AbsoluteFill>
  );
};

const LESSONS = [
  '01 · Pixels & UVs',
  '02 · Glowing circle (SDF)',
  '03 · Booleans & smin',
  '04 · Raymarching: 1st sphere',
  '05 · Orbit camera',
  '06 · Scene composition',
  '07 · Normals, light & shadows',
  '08 · Color: palettes & specular',
  '09 · Domain repetition',
  '10 · Fractals (Menger)',
  '11 · Volumetric clouds',
  '12 · Polish & Shadertoy',
  '13 · Experiments',
];
const Roadmap = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const head = rise(f, fps, 2);
  return (
    <AbsoluteFill style={{background: BG, padding: '90px 110px', justifyContent: 'center'}}>
      <div style={{fontFamily: MONO, color: ACCENT, letterSpacing: 6, fontSize: 22, opacity: head}}>THE ROADMAP</div>
      <div style={{fontFamily: SANS, color: INK, fontSize: 60, fontWeight: 800, marginTop: 8, marginBottom: 34,
        opacity: head}}>13 lessons, live in the browser</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 40px'}}>
        {LESSONS.map((t, i) => {
          const s = rise(f, fps, 10 + i * 3);
          const milestone = i === 3 || i === 6 || i === 12;
          return (
            <div key={i} style={{fontFamily: MONO, fontSize: 30, lineHeight: 1.2,
              color: milestone ? ACCENT : INK, fontWeight: milestone ? 700 : 400,
              opacity: s, transform: `translateX(${(1 - s) * -24}px)`}}>{t}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Clip = ({source, title, tag, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lab = rise(f, fps, 8);
  return (
    <Fade dur={dur}>
      <AbsoluteFill style={{background: '#000'}}>
        <Shader source={source} />
        <AbsoluteFill style={{background: 'linear-gradient(transparent 62%, rgba(0,0,0,0.82))'}} />
        <div style={{position: 'absolute', left: 64, bottom: 70, opacity: lab,
          transform: `translateY(${(1 - lab) * 20}px)`}}>
          <div style={{fontFamily: SANS, color: '#fff', fontSize: 60, fontWeight: 800,
            textShadow: '0 2px 18px rgba(0,0,0,0.6)'}}>{title}</div>
          <div style={{fontFamily: MONO, color: '#ffd9a0', fontSize: 28, marginTop: 6,
            textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>{tag}</div>
        </div>
      </AbsoluteFill>
    </Fade>
  );
};

const Outro = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 4);
  const b = rise(f, fps, 16);
  const c = rise(f, fps, 26);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: 90}}>
      <div style={{fontFamily: SANS, color: INK, fontSize: 64, fontWeight: 800, textAlign: 'center',
        opacity: a, transform: `translateY(${(1 - a) * 24}px)`}}>
        Interactive course,<br/><span style={{color: ACCENT}}>open source</span>
      </div>
      <div style={{fontFamily: MONO, color: INK, fontSize: 32, marginTop: 40, opacity: b,
        background: 'rgba(255,255,255,0.06)', padding: '14px 26px', borderRadius: 12, border: '1px solid #2a2d39'}}>
        ▶ franpiaggio.github.io/interactive-shader-course
      </div>
      <div style={{fontFamily: MONO, color: MUTED, fontSize: 26, marginTop: 18, opacity: b}}>
        github.com/franpiaggio/interactive-shader-course
      </div>
      <div style={{fontFamily: SANS, color: MUTED, fontSize: 28, marginTop: 46, opacity: c}}>
        Built with <span style={{color: ACCENT, fontFamily: MONO}}>/teach</span> in Claude Code 🤖
      </div>
    </AbsoluteFill>
  );
};

const D = {intro: 70, road: 130, clip: 110, tunnel: 140, outro: 150};
export const ShowcaseTeach = () => {
  let at = 0;
  const seq = (dur, node) => { const el = <Sequence key={at} from={at} durationInFrames={dur}>{node}</Sequence>; at += dur; return el; };
  return (
    <AbsoluteFill style={{background: BG}}>
      {seq(D.intro, <Fade dur={D.intro}><Title/></Fade>)}
      {seq(D.road, <Fade dur={D.road}><Roadmap/></Fade>)}
      {seq(D.clip, <Clip source={KALEIDO} title="Kaleidoscope plasma" tag="polar UVs · fbm noise · palette" dur={D.clip}/>)}
      {seq(D.clip, <Clip source={LAVA} title="Lava lamp" tag="metaballs · smin · Fresnel" dur={D.clip}/>)}
      {seq(D.tunnel, <Clip source={TUNNEL} title="Neon tunnel" tag="1/r perspective · turns · palette" dur={D.tunnel}/>)}
      {seq(D.clip, <Clip source={CLOUDS} title="Volumetric clouds" tag="density march · fbm · sun" dur={D.clip}/>)}
      {seq(D.outro, <Fade dur={D.outro}><Outro/></Fade>)}
    </AbsoluteFill>
  );
};
export const TOTAL = D.intro + D.road + D.clip * 3 + D.tunnel + D.outro;
