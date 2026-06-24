import {Composition, AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Shader} from './Shader';
import {KALEIDO, LAVA, TUNNEL, CLOUDS} from './shaders';
import {TERRAIN} from './terrain-dev';
import {GRADIENT, SDF2D, NORMALS3D, LIT, TEXTURED} from './explainer';
import {MORPH} from './morph';
import {MORPH2} from './morph2';
import {Journey, JOURNEY_TOTAL} from './journey';
import {LAVA_HERO2} from './lavabuild';

const TerrainStill = () => (
  <AbsoluteFill style={{background: '#000'}}><Shader source={TERRAIN} /></AbsoluteFill>
);

const BG = '#0c0e15';
const ACCENT = '#e6885f';
const INK = '#f1eee5';
const MUTED = '#9aa0b0';
const SANS = 'Helvetica, Arial, sans-serif';
const MONO = '"SF Mono", ui-monospace, Menlo, monospace';

// ---- fade in/out wrapper (local-frame based) ----
const Fade = ({children, dur, hold = 12}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, hold, dur - hold, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const rise = (frame, fps, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 200}});

// ---- intro ----
const Title = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 4);
  const b = rise(f, fps, 16);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: 90}}>
      <div style={{fontFamily: MONO, color: ACCENT, letterSpacing: 8, fontSize: 26, fontWeight: 700,
        opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>CLAUDE&nbsp;CODE&nbsp;·&nbsp;/tech</div>
      <div style={{fontFamily: SANS, color: INK, fontSize: 96, fontWeight: 800, lineHeight: 1.02,
        textAlign: 'center', marginTop: 28, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
        From zero to<br/><span style={{color: ACCENT}}>Raymarching</span>
      </div>
      <div style={{fontFamily: SANS, color: MUTED, fontSize: 34, textAlign: 'center', maxWidth: 780,
        marginTop: 34, opacity: b, transform: `translateY(${(1 - b) * 20}px)`}}>
        I used <span style={{color: INK, fontFamily: MONO}}>/tech</span> to generate an interactive
        roadmap for learning shaders.
      </div>
    </AbsoluteFill>
  );
};

// ---- roadmap ----
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

// ---- shader showcase clip ----
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

// ---- outro ----
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
        Built with <span style={{color: ACCENT, fontFamily: MONO}}>/tech</span> in Claude Code 🤖
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
//  STORY cut — "I wanted to learn to make this → I used /teach"
// ============================================================

const Hook = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lab = rise(f, fps, 22);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Shader source={LAVA} />
      <AbsoluteFill style={{background: 'linear-gradient(transparent 48%, rgba(0,0,0,0.88))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 130, textAlign: 'center',
        opacity: lab, transform: `translateY(${(1 - lab) * 22}px)`}}>
        <div style={{fontFamily: SANS, color: '#fff', fontSize: 66, fontWeight: 800, lineHeight: 1.08,
          textShadow: '0 2px 22px rgba(0,0,0,0.7)'}}>
          I wanted to learn<br/>to make <span style={{color: ACCENT}}>this</span>.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Reveal = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 4);
  const b = rise(f, fps, 14);
  const c = rise(f, fps, 26);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: 90}}>
      <div style={{fontFamily: SANS, color: MUTED, fontSize: 40, opacity: a,
        transform: `translateY(${(1 - a) * 18}px)`}}>So I used</div>
      <div style={{fontFamily: MONO, color: ACCENT, fontSize: 150, fontWeight: 700, lineHeight: 1,
        marginTop: 6, opacity: b, transform: `scale(${0.8 + b * 0.2})`}}>/teach</div>
      <div style={{fontFamily: SANS, color: INK, fontSize: 34, textAlign: 'center', maxWidth: 800,
        marginTop: 34, opacity: c, transform: `translateY(${(1 - c) * 18}px)`}}>
        Claude Code's teaching skill turned it into an interactive, self-grading course.
      </div>
    </AbsoluteFill>
  );
};

const Steps = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const head = rise(f, fps, 2);
  return (
    <AbsoluteFill style={{background: BG, padding: '90px 110px', justifyContent: 'center'}}>
      <div style={{fontFamily: MONO, color: ACCENT, letterSpacing: 6, fontSize: 22, opacity: head}}>
        /teach BUILT A STEP-BY-STEP PATH
      </div>
      <div style={{fontFamily: SANS, color: INK, fontSize: 60, fontWeight: 800, marginTop: 8, marginBottom: 34,
        opacity: head}}>13 lessons, from a pixel to 3D</div>
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

const StoryOutro = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 4);
  const b = rise(f, fps, 16);
  const c = rise(f, fps, 26);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: 90}}>
      <div style={{fontFamily: SANS, color: INK, fontSize: 64, fontWeight: 800, textAlign: 'center',
        opacity: a, transform: `translateY(${(1 - a) * 24}px)`}}>
        Now I can make<br/><span style={{color: ACCENT}}>all of this</span>.
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

const SD = {hook: 105, reveal: 90, steps: 135, clip: 110, tunnel: 140, outro: 130};
const Story = () => {
  let at = 0;
  const seq = (dur, node) => { const el = <Sequence key={at} from={at} durationInFrames={dur}>{node}</Sequence>; at += dur; return el; };
  return (
    <AbsoluteFill style={{background: BG}}>
      {seq(SD.hook, <Fade dur={SD.hook}><Hook/></Fade>)}
      {seq(SD.reveal, <Fade dur={SD.reveal}><Reveal/></Fade>)}
      {seq(SD.steps, <Fade dur={SD.steps}><Steps/></Fade>)}
      {seq(SD.clip, <Clip source={KALEIDO} title="Kaleidoscope plasma" tag="polar UVs · fbm noise · palette" dur={SD.clip}/>)}
      {seq(SD.tunnel, <Clip source={TUNNEL} title="Neon tunnel" tag="1/r perspective · turns · palette" dur={SD.tunnel}/>)}
      {seq(SD.clip, <Clip source={CLOUDS} title="Volumetric clouds" tag="density march · fbm · sun" dur={SD.clip}/>)}
      {seq(SD.outro, <Fade dur={SD.outro}><StoryOutro/></Fade>)}
    </AbsoluteFill>
  );
};
const STORY_TOTAL = SD.hook + SD.reveal + SD.steps + SD.clip * 2 + SD.tunnel + SD.outro;

// ---- timeline ----
const D = {intro: 70, road: 130, clip: 110, tunnel: 140, outro: 150};
const Showcase = () => {
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

const TOTAL = D.intro + D.road + D.clip * 3 + D.tunnel + D.outro;

// ============================================================
//  EXPLAINER cut — "flat color -> lit 3D, all in a fragment shader"
// ============================================================

const scrim = (top, bot) =>
  `linear-gradient(rgba(0,0,0,${top}) 0%, transparent 24%, transparent 58%, rgba(0,0,0,${bot}))`;

// a teaching beat: live shader + number chip (top) + concept title (bottom)
const EClip = ({source, n, kicker, title, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 8);
  return (
    <Fade dur={dur}>
      <AbsoluteFill style={{background: '#000'}}>
        <Shader source={source} />
        <AbsoluteFill style={{background: scrim(0.5, 0.85)}} />
        <div style={{position: 'absolute', left: 56, top: 50, display: 'flex', alignItems: 'center', gap: 14,
          opacity: a, transform: `translateY(${(1 - a) * -14}px)`}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: '#1a1208', background: ACCENT,
            padding: '6px 15px', borderRadius: 9}}>{n}</div>
          <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: '#ffd9a0',
            textShadow: '0 2px 8px #000'}}>{kicker}</div>
        </div>
        <div style={{position: 'absolute', left: 56, right: 56, bottom: 84, opacity: a,
          transform: `translateY(${(1 - a) * 18}px)`}}>
          <div style={{fontFamily: SANS, color: '#fff', fontSize: 58, fontWeight: 800, lineHeight: 1.05,
            textShadow: '0 2px 18px rgba(0,0,0,0.7)'}}>{title}</div>
        </div>
      </AbsoluteFill>
    </Fade>
  );
};

const EHookA = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 8);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Shader source={GRADIENT} />
      <AbsoluteFill style={{background: scrim(0.5, 0.82)}} />
      <div style={{position: 'absolute', left: 56, top: 54, fontFamily: MONO, fontSize: 26, letterSpacing: 4,
        color: '#fff', opacity: a, textShadow: '0 2px 8px #000'}}>ONE RECTANGLE · A COLOR PER PIXEL</div>
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 96, opacity: a,
        transform: `translateY(${(1 - a) * 18}px)`}}>
        <div style={{fontFamily: SANS, color: '#fff', fontSize: 84, fontWeight: 800,
          textShadow: '0 2px 22px #000'}}>From this…</div>
      </div>
    </AbsoluteFill>
  );
};

const EHookB = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 8);
  const b = rise(f, fps, 22);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Shader source={LAVA} />
      <AbsoluteFill style={{background: scrim(0.3, 0.86)}} />
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 110, opacity: a,
        transform: `translateY(${(1 - a) * 18}px)`}}>
        <div style={{fontFamily: SANS, color: ACCENT, fontSize: 84, fontWeight: 800,
          textShadow: '0 2px 22px #000'}}>…to this.</div>
        <div style={{fontFamily: SANS, color: '#fff', fontSize: 34, marginTop: 10, opacity: b,
          textShadow: '0 2px 10px #000'}}>Same rectangle. Only fragment code — here's how.</div>
      </div>
    </AbsoluteFill>
  );
};

const EReveal = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 8);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Shader source={LAVA} />
      <AbsoluteFill style={{background: scrim(0.2, 0.84)}} />
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 92, opacity: a,
        transform: `translateY(${(1 - a) * 18}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: '#ffd9a0'}}>STACK THEM TOGETHER</div>
        <div style={{fontFamily: SANS, color: '#fff', fontSize: 58, fontWeight: 800, marginTop: 8,
          textShadow: '0 2px 18px rgba(0,0,0,0.7)'}}>A living, lit world — zero meshes.</div>
      </div>
    </AbsoluteFill>
  );
};

const EOutro = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = rise(f, fps, 4);
  const b = rise(f, fps, 18);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: 90}}>
      <div style={{fontFamily: SANS, color: INK, fontSize: 62, fontWeight: 800, textAlign: 'center',
        opacity: a, transform: `translateY(${(1 - a) * 22}px)`}}>
        It's all just a<br/><span style={{color: ACCENT}}>fragment shader</span>.
      </div>
      <div style={{fontFamily: SANS, color: MUTED, fontSize: 30, marginTop: 26, opacity: b}}>Learn it, step by step:</div>
      <div style={{fontFamily: MONO, color: INK, fontSize: 32, marginTop: 16, opacity: b,
        background: 'rgba(255,255,255,0.06)', padding: '14px 26px', borderRadius: 12, border: '1px solid #2a2d39'}}>
        ▶ franpiaggio.github.io/interactive-shader-course
      </div>
    </AbsoluteFill>
  );
};

const ED = {hookA: 60, hookB: 95, beat: 115, reveal: 105, outro: 120};
const Explainer = () => {
  let at = 0;
  const seq = (dur, node) => { const el = <Sequence key={at} from={at} durationInFrames={dur}>{node}</Sequence>; at += dur; return el; };
  return (
    <AbsoluteFill style={{background: BG}}>
      {seq(ED.hookA, <Fade dur={ED.hookA}><EHookA/></Fade>)}
      {seq(ED.hookB, <Fade dur={ED.hookB}><EHookB/></Fade>)}
      {seq(ED.beat, <EClip source={SDF2D} n="01" kicker="DISTANCE FIELDS" title="A formula becomes a shape" dur={ED.beat}/>)}
      {seq(ED.beat, <EClip source={NORMALS3D} n="02" kicker="RAYMARCHING" title="One ray per pixel → 3D, no mesh" dur={ED.beat}/>)}
      {seq(ED.beat, <EClip source={LIT} n="03" kicker="LIGHTING" title="The field's gradient is the surface normal" dur={ED.beat}/>)}
      {seq(ED.beat, <EClip source={TEXTURED} n="04" kicker="NOISE" title="Procedural texture, terrain & clouds" dur={ED.beat}/>)}
      {seq(ED.reveal, <Fade dur={ED.reveal}><EReveal/></Fade>)}
      {seq(ED.outro, <Fade dur={ED.outro}><EOutro/></Fade>)}
    </AbsoluteFill>
  );
};
const EXPL_TOTAL = ED.hookA + ED.hookB + ED.beat * 4 + ED.reveal + ED.outro;

// ============================================================
//  MORPH cut — ONE fragment, one quad, edited live from flat color into 3D
// ============================================================

const stageForFrame = (f, fps) => {
  const t = f / fps;
  return t < 4.5 ? 0 : Math.min(5, (t - 4.5) / 3.4);   // hold flat, then ramp 0->5
};

const MORPH_CODE = [
  {t: 'Paint by pixel position',      a: 'vec2 uv = fragCoord / iResolution.xy;', b: 'col = vec3(uv, 0.5);   // a color per pixel'},
  {t: 'A distance field → a shape',   a: 'float d = length(uv) - 0.6;   // circle', b: 'col = d < 0.0 ? fill : bg;'},
  {t: 'Fake depth → a sphere',        a: 'float z = sqrt(R*R - dot(uv,uv));', b: 'vec3  n = normalize(vec3(uv, z));'},
  {t: 'Light the surface normal',     a: 'float diff = max(dot(n, L), 0.0);', b: 'col = albedo*diff + specular;'},
  {t: 'Noise → procedural texture',   a: 'float k = fbm(n * 3.0);', b: 'albedo = palette(k);'},
  {t: 'Displace → a living blob',     a: 'R += fbm(uv*3.0 + iTime) * 0.15;', b: '// still ONE fragment shader.'},
];

const GeometryOverlay = ({frame}) => {
  const show = interpolate(frame, [6, 26, 95, 138], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (show <= 0) return null;
  const x0 = 120, y0 = 165, x1 = 960, y1 = 735;
  const vtx = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  return (
    <AbsoluteFill style={{opacity: show}}>
      <svg viewBox="0 0 1080 1080" style={{width: '100%', height: '100%'}}>
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="rgba(230,136,95,0.05)" stroke="#e6885f" strokeWidth="3" strokeDasharray="11 9" />
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#e6885f" strokeWidth="2" strokeDasharray="6 9" opacity="0.55" />
        {vtx.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="12" fill="#ffd9a0" stroke="#1a1208" strokeWidth="3" />)}
        <text x={x0} y={y0 - 24} fill="#fff" fontFamily="monospace" fontSize="30" fontWeight="700">1 quad · 4 vertices · 2 triangles</text>
        <text x={(x0 + x1) / 2} y={y1 + 58} fill="#9aa0b0" fontFamily="monospace" fontSize="26" textAnchor="middle">the GPU runs your fragment on every pixel inside</text>
      </svg>
    </AbsoluteFill>
  );
};

const CodeCard = ({frame, stage}) => {
  const appear = interpolate(frame, [108, 144], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (appear <= 0) return null;
  const idx = Math.max(0, Math.min(5, Math.round(stage)));
  const code = MORPH_CODE[idx];
  const blink = (Math.floor(frame / 15) % 2 === 0) ? 1 : 0.25;
  return (
    <div style={{position: 'absolute', left: 48, right: 48, bottom: 48, opacity: appear,
      background: 'rgba(8,10,16,0.82)', border: '1px solid #2a2d39', borderRadius: 14, padding: '20px 28px'}}>
      <div style={{fontFamily: MONO, color: ACCENT, fontSize: 22, letterSpacing: 1, marginBottom: 12}}>// {code.t}</div>
      <div style={{fontFamily: MONO, color: '#d6e9c0', fontSize: 29, lineHeight: 1.5}}>{code.a}</div>
      <div style={{fontFamily: MONO, color: '#d6e9c0', fontSize: 29, lineHeight: 1.5}}>{code.b}<span style={{opacity: blink, color: ACCENT}}>▍</span></div>
    </div>
  );
};

const Morph = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stage = stageForFrame(frame, fps);
  const scrimO = interpolate(frame, [0, 82, 138], [1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const header = interpolate(frame, [8, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const endO = interpolate(frame, [720, 760], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#0a0c12'}}>
      <Shader source={MORPH} uniforms={{uStage: stage}} />
      <AbsoluteFill style={{background: '#0a0c12', opacity: scrimO}} />
      <GeometryOverlay frame={frame} />
      <div style={{position: 'absolute', left: 48, top: 44, opacity: header, fontFamily: MONO, fontSize: 24, letterSpacing: 2}}>
        <span style={{background: ACCENT, color: '#1a1208', padding: '5px 12px', borderRadius: 8, fontWeight: 700}}>FRAGMENT SHADER</span>
        <span style={{marginLeft: 14, color: '#cdd6e6', textShadow: '0 2px 8px #000'}}>one quad · paints every pixel</span>
      </div>
      <CodeCard frame={frame} stage={stage} />
      {endO > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 118, textAlign: 'center', opacity: endO}}>
          <div style={{fontFamily: SANS, color: '#fff', fontSize: 48, fontWeight: 800, textShadow: '0 2px 16px #000'}}>It's all one fragment shader.</div>
          <div style={{fontFamily: MONO, color: '#ffd9a0', fontSize: 26, marginTop: 10, textShadow: '0 2px 8px #000'}}>franpiaggio.github.io/interactive-shader-course</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const MORPH_TOTAL = 810;

// ============================================================
//  BUILD cut — smaller object, longer, then fract()-multiplied, then lava lamp.
//  Code panel is TYPED (fast), not jump-cut between blocks.
// ============================================================

const BUILD_CODE = [
  {t: 'Paint by pixel position',     a: 'vec2 uv = fragCoord / iResolution.xy;', b: 'col = vec3(uv, 0.5);'},
  {t: 'A distance field → a shape',  a: 'float d = length(uv) - 0.4;', b: 'col = d < 0.0 ? fill : bg;'},
  {t: 'Fake depth → a sphere',       a: 'float z = sqrt(R*R - dot(uv,uv));', b: 'vec3  n = normalize(vec3(uv, z));'},
  {t: 'Light the surface normal',    a: 'float diff = max(dot(n, L), 0.0);', b: 'col = albedo*diff + specular;'},
  {t: 'Noise → procedural texture',  a: 'float k = fbm(n * 3.0);', b: 'albedo = palette(k);'},
  {t: 'Displace → a living blob',    a: 'R += fbm(uv*3.0 + iTime) * 0.12;', b: '// one wobbling sphere'},
  {t: 'Multiply it → fract() repeat',a: 'uv = fract(uv * 3.0) - 0.5;', b: '// one sphere → a whole grid'},
];

const stageBuild = (f, fps) => { const t = f / fps; return t < 5 ? 0 : Math.min(6, (t - 5) / 3.2); };
const SECS = 3.2, START = 5;

const TypedCode = ({frame, stage}) => {
  const appear = interpolate(frame, [108, 144], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
              * interpolate(frame, [760, 798], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (appear <= 0) return null;
  const idx = Math.max(0, Math.min(6, Math.round(stage)));
  const code = BUILD_CODE[idx];
  const startF = (START + (idx - 0.5) * SECS) * 30;        // when this block became active
  const full = code.a + '\n' + code.b;
  const nShown = Math.max(0, Math.min(full.length, Math.floor((frame - startF - 5) * 1.8))); // fast type
  const shown = full.slice(0, nShown);
  const blink = (Math.floor(frame / 15) % 2 === 0) ? 1 : 0.25;
  return (
    <div style={{position: 'absolute', left: 48, right: 48, bottom: 48, opacity: appear,
      background: 'rgba(8,10,16,0.82)', border: '1px solid #2a2d39', borderRadius: 14, padding: '20px 28px', minHeight: 132}}>
      <div style={{fontFamily: MONO, color: ACCENT, fontSize: 22, letterSpacing: 1, marginBottom: 12}}>// {code.t}</div>
      <div style={{fontFamily: MONO, color: '#d6e9c0', fontSize: 29, lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>
        {shown}<span style={{opacity: blink, color: ACCENT}}>▍</span>
      </div>
    </div>
  );
};

const Build = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stage = stageBuild(frame, fps);
  const scrimO = interpolate(frame, [0, 82, 138], [1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const header = interpolate(frame, [8, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lavaO  = interpolate(frame, [786, 824], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const capO   = interpolate(frame, [812, 846, 906, 936], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const endO   = interpolate(frame, [912, 946], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#0a0c12'}}>
      <Shader source={MORPH2} uniforms={{uStage: stage}} />
      <AbsoluteFill style={{background: '#0a0c12', opacity: scrimO}} />
      <GeometryOverlay frame={frame} />
      <div style={{position: 'absolute', left: 48, top: 44, opacity: header, fontFamily: MONO, fontSize: 24, letterSpacing: 2}}>
        <span style={{background: ACCENT, color: '#1a1208', padding: '5px 12px', borderRadius: 8, fontWeight: 700}}>FRAGMENT SHADER</span>
        <span style={{marginLeft: 14, color: '#cdd6e6', textShadow: '0 2px 8px #000'}}>one quad · paints every pixel</span>
      </div>
      <TypedCode frame={frame} stage={stage} />

      {/* lava-lamp finale on top */}
      {lavaO > 0 && (
        <AbsoluteFill style={{opacity: lavaO}}>
          <Shader source={LAVA} />
        </AbsoluteFill>
      )}
      {capO > 0 && (
        <div style={{position: 'absolute', left: 48, right: 48, bottom: 70, opacity: capO, textAlign: 'center'}}>
          <div style={{fontFamily: SANS, color: '#fff', fontSize: 50, fontWeight: 800, textShadow: '0 2px 18px #000'}}>
            …now push it further.
          </div>
          <div style={{fontFamily: MONO, color: '#ffd9a0', fontSize: 28, marginTop: 8, textShadow: '0 2px 10px #000'}}>
            a raymarched lava lamp — same idea
          </div>
        </div>
      )}
      {endO > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: endO}}>
          <div style={{fontFamily: SANS, color: '#fff', fontSize: 50, fontWeight: 800, textShadow: '0 2px 16px #000'}}>It's all one fragment shader.</div>
          <div style={{fontFamily: MONO, color: '#ffd9a0', fontSize: 26, marginTop: 10, textShadow: '0 2px 8px #000'}}>franpiaggio.github.io/interactive-shader-course</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const BUILD_TOTAL = 960;

export const RemotionRoot = () => (
  <>
    <Composition id="Showcase" component={Showcase} durationInFrames={TOTAL} fps={30} width={1080} height={1080} />
    <Composition id="Story" component={Story} durationInFrames={STORY_TOTAL} fps={30} width={1080} height={1080} />
    <Composition id="Explainer" component={Explainer} durationInFrames={EXPL_TOTAL} fps={30} width={1080} height={1080} />
    <Composition id="Morph" component={Morph} durationInFrames={MORPH_TOTAL} fps={30} width={1080} height={1080} />
    <Composition id="Build" component={Build} durationInFrames={BUILD_TOTAL} fps={30} width={1080} height={1080} />
    <Composition id="Journey" component={Journey} durationInFrames={JOURNEY_TOTAL} fps={30} width={1080} height={1080} />
    <Composition id="Journey2" component={Journey} durationInFrames={JOURNEY_TOTAL} fps={30} width={1080} height={1080}
      defaultProps={{
        chatA: 'I want to learn how to code 3D stuff on the browser with shaders...',
        chatB: '🤖 sure! let me make you an explainer video, with real time renders.',
        heroSrc: LAVA_HERO2,
      }} />
    <Composition id="TerrainStill" component={TerrainStill} durationInFrames={300} fps={30} width={1280} height={720} />
  </>
);
