import {registerRoot, Composition, AbsoluteFill} from 'remotion';
import {Shader} from './Shader';
import {GREY} from './grey-dev';

const Full = ({source}) => (
  <AbsoluteFill style={{background: '#000'}}><Shader source={source} /></AbsoluteFill>
);

const Root = () => (
  <Composition id="Grey" component={Full} defaultProps={{source: GREY}}
    durationInFrames={300} fps={30} width={1280} height={720} />
);

registerRoot(Root);
