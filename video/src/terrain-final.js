// The FINAL look of the *current* continuous terrain — derived from it directly so it
// always matches the latest "fancy" version (no stale copy). We time-shift it to its
// finished state (all layers on) and tilt the camera up a touch so the volumetric sky shows.
import {CONTINUOUS} from './terrain-continuous';

export const FINAL = CONTINUOUS
  .replace('smoothstep(37.0,41.0,iTime)', '0.0')        // teaser: keep our own framing (ignore body sky-up)
  .replace(/iTime/g, '(iTime + 44.0)')                 // jump to the end state (everything on)
  .replace('vec3(0.0,-1.6,4.0)', 'vec3(0.0,-0.85,4.0)'); // raise the camera -> more sky in frame
