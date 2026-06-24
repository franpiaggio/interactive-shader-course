import {registerRoot, Composition} from 'remotion';
import {TerrainRecap, RECAP_TOTAL} from './TerrainRecap';

const Root = () => (
  <Composition id="TerrainRecap" component={TerrainRecap} durationInFrames={RECAP_TOTAL} fps={30} width={1080} height={1080} />
);
registerRoot(Root);
