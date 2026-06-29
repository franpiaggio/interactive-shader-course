import {registerRoot, Composition, AbsoluteFill} from 'remotion';
import {Shader} from './Shader';
import {GREY2} from './grey2-dev';

const Full = ({source}) => (
  <AbsoluteFill style={{background: '#000'}}><Shader source={source} /></AbsoluteFill>
);

const Root = () => (
  <Composition id="Grey2" component={Full} defaultProps={{source: GREY2}}
    durationInFrames={600} fps={30} width={1280} height={720} />
);

registerRoot(Root);
