import {registerRoot, Composition} from 'remotion';
import {RecapPlus, RECAP_TOTAL} from './RecapPlus';

const Root = () => (
  <Composition id="RecapPlus" component={RecapPlus} durationInFrames={RECAP_TOTAL} fps={30} width={1080} height={1080} />
);
registerRoot(Root);
