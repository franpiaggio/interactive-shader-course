import {registerRoot, Composition, AbsoluteFill} from 'remotion';
import {Shader} from './Shader';
import {TERRAIN, SUNSET, DESERT} from './terrain-dev';
import {DEMO} from './terrain-demo';

const Full = ({source}) => (
  <AbsoluteFill style={{background: '#000'}}><Shader source={source} /></AbsoluteFill>
);
const Demo = () => (
  <AbsoluteFill style={{background: '#000'}}><Shader source={DEMO} uniforms={{uMouseX: 0.5, uMouseY: 0.42}} /></AbsoluteFill>
);

const Root = () => (
  <>
    <Composition id="Hero"   component={Full} defaultProps={{source: TERRAIN}} durationInFrames={300} fps={30} width={1280} height={720} />
    <Composition id="Sunset" component={Full} defaultProps={{source: SUNSET}} durationInFrames={300} fps={30} width={1280} height={720} />
    <Composition id="Desert" component={Full} defaultProps={{source: DESERT}} durationInFrames={300} fps={30} width={1280} height={720} />
    <Composition id="Demo"   component={Demo} durationInFrames={300} fps={30} width={1280} height={720} />
  </>
);

registerRoot(Root);
