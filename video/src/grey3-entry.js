import {registerRoot, Composition, AbsoluteFill} from 'remotion';
import {Shader} from './Shader';
import {GREY3} from './grey3-dev';

const Full = ({source}) => (
  <AbsoluteFill style={{background: '#000'}}><Shader source={source} /></AbsoluteFill>
);

const Root = () => (
  <Composition id="Grey3" component={Full} defaultProps={{source: GREY3}}
    durationInFrames={600} fps={30} width={1280} height={720} />
);

registerRoot(Root);
