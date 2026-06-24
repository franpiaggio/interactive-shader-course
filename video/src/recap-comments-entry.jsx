import {registerRoot, Composition} from 'remotion';
import {RecapPlusComments, RECAP_TOTAL} from './RecapPlusComments';

const Root = () => (
  <Composition id="RecapComments" component={RecapPlusComments} durationInFrames={RECAP_TOTAL} fps={30} width={1080} height={1080} />
);
registerRoot(Root);
