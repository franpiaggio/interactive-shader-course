import {registerRoot, Composition} from 'remotion';
import {ShowcaseTeach, TOTAL} from './showcase-teach';

const Root = () => (
  <Composition id="ShowcaseTeach" component={ShowcaseTeach} durationInFrames={TOTAL} fps={30} width={1080} height={1080} />
);
registerRoot(Root);
