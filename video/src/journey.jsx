import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';
import {Shader} from './Shader';
import {MORPH2} from './morph2';
import {LAVA_BUILD, LAVA_HERO} from './lavabuild';

const BG = '#0a0c12';
const ACCENT = '#e6885f';
const INK = '#f1eee5';
const MONO = '"SF Mono", ui-monospace, Menlo, monospace';
const SANS = 'Helvetica, Arial, sans-serif';

const ease = Easing.inOut(Easing.cubic);
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const Ce = {...C, easing: ease};
const lerp = (f, range, out) => interpolate(f, range, out, Ce);
const typed = (full, startF, frame, speed, delay = 5) =>
  full.slice(0, Math.max(0, Math.min(full.length, Math.floor((frame - startF - delay) * speed))));

// each morph stage SETTLES, then eases to the next (no constant drift)
const stageJ = (f) => {
  if (f < 320) return 0;
  const x = (f - 320) / 105;
  const i = Math.floor(x), fr = x - i;
  const e = fr < 0.4 ? 0 : fr > 0.9 ? 1 : (fr - 0.4) / 0.5;
  const s = e <= 0 ? 0 : e >= 1 ? 1 : e * e * (3 - 2 * e);
  return Math.min(5, i + s);
};

// ---------- chat ----------
const Bubble = ({side, bg, color, text, startF, frame, maxW = 760}) => {
  const o = lerp(frame, [startF, startF + 14], [0, 1]);
  if (o <= 0) return null;
  // reveal char by char, but RESERVE the full text size (rest is transparent) so
  // the bubble never resizes / reflows — fixes the "types backwards" wrap glitch.
  const chars = [...text];   // code-point safe (emoji won't split)
  const n = Math.max(0, Math.min(chars.length, Math.floor((frame - startF - 8) * 1.5)));
  const shown = chars.slice(0, n).join('');
  const rest = chars.slice(n).join('');
  const done = n >= chars.length;
  return (
    <div style={{alignSelf: side === 'right' ? 'flex-end' : 'flex-start', maxWidth: maxW, background: bg, color,
      padding: '20px 26px', borderRadius: 22, margin: '12px 0', fontFamily: SANS, fontSize: 36, lineHeight: 1.32, opacity: o,
      boxShadow: '0 6px 24px rgba(0,0,0,0.35)', borderBottomRightRadius: side === 'right' ? 6 : 22, borderBottomLeftRadius: side === 'left' ? 6 : 22}}>
      {shown}{!done && <span style={{color: side === 'right' ? '#fff' : ACCENT}}>▍</span>}<span style={{opacity: 0}}>{rest}</span>
    </div>
  );
};
const Chat = ({frame, userText, botText}) => (
  <AbsoluteFill style={{justifyContent: 'center', padding: '0 90px'}}>
    <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
      <Bubble side="right" bg={ACCENT} color="#1a1208" frame={frame} startF={14} text={userText} />
      <Bubble side="left" bg="#1c2030" color={INK} frame={frame} startF={100} text={botText} />
    </div>
  </AbsoluteFill>
);

// ---------- geometry frame (tracks the animated box, fades as it expands) ----------
const Geometry = ({frame, box, bx, frameO}) => {
  if (frameO <= 0) return null;
  const x0 = bx, y0 = bx, x1 = bx + box, y1 = bx + box;
  const labelO = interpolate(frame, [196, 224, 296, 326], [0, 1, 1, 0], C);
  return (
    <AbsoluteFill style={{opacity: frameO}}>
      <svg viewBox="0 0 1080 1080" style={{width: '100%', height: '100%'}}>
        <rect x={x0} y={y0} width={box} height={box} fill="none" stroke={ACCENT} strokeWidth="3" strokeDasharray="11 9" />
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={ACCENT} strokeWidth="2" strokeDasharray="6 9" opacity="0.5" />
        {[[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="12" fill="#ffd9a0" stroke="#1a1208" strokeWidth="3" />)}
        <text x={x0} y={y0 - 22} fill="#fff" fontFamily="monospace" fontSize="28" fontWeight="700" opacity={labelO}>1 quad · 4 vertices · 2 triangles</text>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- narration ----------
const NARR = [
  {from: 196, to: 308, text: 'This is the canvas: one rectangle, two triangles.'},
  {from: 322, to: 420, text: 'Step 1 — paint each pixel by its position.'},
  {from: 420, to: 525, text: 'A distance formula turns it into a shape.'},
  {from: 525, to: 632, text: 'Fake the depth and it pops into 3D.'},
  {from: 632, to: 738, text: "The field's slope is the normal — now we can light it."},
  {from: 738, to: 844, text: 'Noise warps the surface into living, organic shapes.'},
  {from: 844, to: 906, text: 'A single living blob.'},
  {from: 916, to: 1040, text: "One blob… let's add another."},
  {from: 1040, to: 1170, text: 'Join them with min() — see the hard seam?'},
  {from: 1170, to: 1320, text: 'smin() melts the seam. That is a metaball. 🫧'},
  {from: 1320, to: 1432, text: 'Now let them drift, add a few more…'},
];
const Narration = ({frame}) => {
  const n = NARR.find((x) => frame >= x.from && frame < x.to);
  if (!n) return null;
  const o = interpolate(frame, [n.from, n.from + 16, n.to - 16, n.to], [0, 1, 1, 0], Ce);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 92, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: SANS, color: '#fff', fontSize: 40, fontWeight: 700, lineHeight: 1.25, textShadow: '0 2px 16px rgba(0,0,0,0.85)'}}>{n.text}</div>
    </div>
  );
};

// ---------- code panel ----------
const MCODE = [
  ['vec2 uv = fragCoord / iResolution.xy;', 'col = vec3(uv, 0.5);'],
  ['float d = length(uv) - 0.4;', 'col = d < 0.0 ? fill : bg;'],
  ['float z = sqrt(R*R - dot(uv,uv));', 'vec3  n = normalize(vec3(uv, z));'],
  ['float diff = max(dot(n, L), 0.0);', 'col = albedo*diff + specular;'],
  ['float k = fbm(n * 3.0);', 'albedo = palette(k);'],
  ['R += fbm(uv*3.0 + iTime) * 0.12;', '// a living blob'],
];
const CodePanel = ({frame}) => {
  const morph = frame >= 300 && frame < 906;
  const meta = frame >= 916 && frame < 1432;
  if (!morph && !meta) return null;
  let label, a, b, startF, o;
  if (morph) {
    const idx = Math.max(0, Math.min(5, Math.round(stageJ(frame))));
    label = ['Paint by pixel', 'Distance → shape', 'Fake depth → sphere', 'Light the normal', 'Noise → texture', 'Displace → blob'][idx];
    [a, b] = MCODE[idx];
    startF = 320 + (idx - 0.5) * 105;
    o = lerp(frame, [300, 334], [0, 1]) * lerp(frame, [884, 906], [1, 0]);
  } else {
    label = 'smin → metaballs';
    a = 'float smin(float a,float b,float k){ ... }';
    b = 'd = smin(d, ball, k);   // melt them together';
    startF = 948;
    o = lerp(frame, [916, 950], [0, 1]) * lerp(frame, [1402, 1432], [1, 0]);
  }
  if (o <= 0) return null;
  const full = a + '\n' + b;
  const shown = typed(full, startF, frame, 1.35, 4);
  const blink = (Math.floor(frame / 16) % 2 === 0) ? 1 : 0.25;
  return (
    <div style={{position: 'absolute', left: 48, right: 48, bottom: 48, opacity: o, background: 'rgba(8,10,16,0.82)',
      border: '1px solid #2a2d39', borderRadius: 14, padding: '20px 28px', minHeight: 132}}>
      <div style={{fontFamily: MONO, color: ACCENT, fontSize: 22, letterSpacing: 1, marginBottom: 12}}>// {label}</div>
      <div style={{fontFamily: MONO, color: '#d6e9c0', fontSize: 28, lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>
        {shown}<span style={{opacity: blink, color: ACCENT}}>▍</span>
      </div>
    </div>
  );
};

const Closing = ({frame}) => {
  const o = lerp(frame, [1724, 1774], [0, 1]);
  if (o <= 0) return null;
  const sub = lerp(frame, [1774, 1810], [0, 1]);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: o, padding: 90, background: 'rgba(10,12,18,0.5)'}}>
      <div style={{fontFamily: SANS, color: '#fff', fontSize: 56, fontWeight: 800, textAlign: 'center', lineHeight: 1.12, textShadow: '0 2px 20px #000'}}>
        Geometry, light & noise.<br/><span style={{color: ACCENT}}>All in one fragment shader.</span>
      </div>
      <div style={{opacity: sub, marginTop: 38, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: '#1c2030', color: INK, padding: '18px 28px', borderRadius: 22,
          fontFamily: SANS, fontSize: 32, boxShadow: '0 6px 24px rgba(0,0,0,0.35)'}}>
          full demo + code in the comments 👇
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Journey = ({
  chatA = 'hey claude, I want to learn shader art',
  chatB = 'Sure! It all starts with one fragment, code that runs on every pixel.',
  heroSrc = LAVA_HERO,
} = {}) => {
  const frame = useCurrentFrame();
  useVideoConfig();

  const OFF = 90;           // extra hold so the chat is readable after it finishes typing
  const lf = frame - OFF;   // lab-phase clock; the chat keeps the real frame

  const stage = stageJ(lf);
  const chatO  = interpolate(frame, [0, 16, 252, 274], [0, 1, 1, 0], Ce);  // ~3.5s pause after typing
  const chatBgO = interpolate(frame, [0, 20, 252, 276], [0, 1, 1, 0], Ce); // final result as the chat backdrop
  const scrimO = interpolate(lf, [188, 252, 312], [1, 1, 0], Ce);
  // the quad: stays inset, then eases out to full screen (after ~3 steps)
  const box = lerp(lf, [620, 752], [560, 1080]);
  const bx = (1080 - box) / 2;
  const frameO = lerp(lf, [196, 224], [0, 1]) * lerp(lf, [620, 716], [1, 0]);

  const buildO = lerp(lf, [890, 990], [0, 1]) * lerp(lf, [1440, 1512], [1, 0]);
  const heroO  = lerp(lf, [1440, 1514], [0, 1]);

  const uBalls = lf < 1080 ? lerp(lf, [1000, 1080], [1, 2]) : lerp(lf, [1280, 1380], [2, 6]);
  const uK = interpolate(lf, [910, 1120, 1260], [0.02, 0.02, 0.42], Ce);
  const uMotion = lerp(lf, [1300, 1420], [0, 1]);

  return (
    <AbsoluteFill style={{background: BG}}>
      {/* all shaders live INSIDE the animated quad box (inset → full screen) */}
      <div style={{position: 'absolute', left: bx, top: bx, width: box, height: box, overflow: 'hidden', borderRadius: 8}}>
        {lf < 1005 && <Shader source={MORPH2} uniforms={{uStage: stage}} />}
        {buildO > 0 && lf < 1520 && (
          <AbsoluteFill style={{opacity: buildO}}><Shader source={LAVA_BUILD} uniforms={{uBalls, uK, uMotion}} /></AbsoluteFill>
        )}
        {heroO > 0 && <AbsoluteFill style={{opacity: heroO}}><Shader source={heroSrc} /></AbsoluteFill>}
      </div>

      <AbsoluteFill style={{background: BG, opacity: Math.max(scrimO, chatO > 0 ? 1 : 0)}} />
      {/* the final result, playing as the chat's backdrop */}
      {chatBgO > 0 && (
        <AbsoluteFill style={{opacity: chatBgO}}>
          <Shader source={heroSrc} />
          <AbsoluteFill style={{background: 'rgba(7,8,13,0.58)'}} />
        </AbsoluteFill>
      )}
      {chatO > 0 && <AbsoluteFill style={{opacity: chatO}}><Chat frame={frame} userText={chatA} botText={chatB} /></AbsoluteFill>}
      <Geometry frame={lf} box={box} bx={bx} frameO={frameO} />

      <Narration frame={lf} />
      <CodePanel frame={lf} />
      <Closing frame={lf} />
    </AbsoluteFill>
  );
};

export const JOURNEY_TOTAL = 1990;
