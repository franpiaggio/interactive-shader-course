import {registerRoot, Composition, AbsoluteFill} from 'remotion';
import {ThreeQuad} from './ThreeQuad';
import {ThreeExplainer, EXPL_TOTAL} from './ThreeExplainer';
import {ContinuousTerrain, FPS, TOTAL_FRAMES} from './Continuous';

const QuadTest = () => (
  <AbsoluteFill style={{background: '#0c0e15'}}><ThreeQuad dur={120} /></AbsoluteFill>
);

const Root = () => (
  <>
    <Composition id="ContinuousTerrain" component={ContinuousTerrain} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1080} />
    <Composition id="PipelineExplainer" component={ThreeExplainer} durationInFrames={EXPL_TOTAL} fps={30} width={1080} height={1080} />
    <Composition id="QuadTest" component={QuadTest} durationInFrames={120} fps={30} width={1080} height={1080} />
  </>
);
registerRoot(Root);
