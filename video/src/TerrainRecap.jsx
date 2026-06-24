// Identical to the last terrain video, but it OPENS on the finished shader with a hook
// title, then plays the whole build-up. Imports ContinuousTerrain unchanged (read-only).
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Shader} from './Shader';
import {FINAL} from './terrain-final';
import {ContinuousTerrain, TOTAL_FRAMES, FPS} from './Continuous';

const ACCENT = '#e6885f';
const SANS = 'Helvetica, Arial, sans-serif', MONO = '"SF Mono", ui-monospace, Menlo, monospace';

const TEASER = 6 * FPS;   // 6s opening on the final shader
const OVL = 22;           // crossfade into the build-up

const FadeWrap = ({children, fin = 0, fout = 0, dur}) => {
  const f = useCurrentFrame();
  const oin = fin ? interpolate(f, [0, fin], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const oout = fout ? interpolate(f, [dur - fout, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  return <AbsoluteFill style={{opacity: oin * oout}}>{children}</AbsoluteFill>;
};

// the finished landscape + the question
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
        <div style={{fontFamily: MONO, color: ACCENT, letterSpacing: 6, fontSize: 24, fontWeight: 700,
          opacity: a, textShadow: '0 2px 14px #000'}}>STEP BY STEP</div>
        <div style={{fontFamily: SANS, color: '#fff', fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginTop: 18,
          whiteSpace: 'nowrap', opacity: a, transform: `translateY(${(1 - a) * 26}px)`, textShadow: '0 3px 24px rgba(0,0,0,0.92)'}}>
          How is something like this<br/>rendered in a browser?
        </div>
        <div style={{fontFamily: SANS, color: '#ece9df', fontSize: 32, marginTop: 24, maxWidth: 820,
          opacity: b, textShadow: '0 2px 16px rgba(0,0,0,0.95)'}}>
          From a single triangle to a raymarched world.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const TerrainRecap = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence durationInFrames={TEASER}><FadeWrap dur={TEASER} fout={OVL}><Teaser /></FadeWrap></Sequence>
    <Sequence from={TEASER - OVL} durationInFrames={TOTAL_FRAMES}><FadeWrap dur={TOTAL_FRAMES} fin={OVL}><ContinuousTerrain /></FadeWrap></Sequence>
  </AbsoluteFill>
);
export const RECAP_TOTAL = (TEASER - OVL) + TOTAL_FRAMES;
