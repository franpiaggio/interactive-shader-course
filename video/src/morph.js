// ONE fragment shader that morphs across stages via a single uniform `uStage` (0..5):
//   0 flat color · 1 2D circle · 2 fake-depth sphere (normal) · 3 lit · 4 textured · 5 displaced blob.
// Everything is computed per pixel on one quad — the whole point of the video.
export const MORPH = `
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x),f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }

void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv01 = fragCoord/iResolution.xy;
  vec2 c    = (fragCoord-0.5*iResolution.xy)/iResolution.y;   // centered, aspect-correct

  float s = uStage;
  float shape  = smoothstep(0.4, 1.2, s);   // gradient -> circle
  float threeD = smoothstep(1.4, 2.3, s);   // flat -> sphere depth
  float lit    = smoothstep(2.4, 3.3, s);   // normal-color -> lit
  float tex    = smoothstep(3.4, 4.3, s);   // flat albedo -> noise texture
  float wob    = smoothstep(4.4, 5.2, s);   // sphere -> displaced blob

  float R    = 0.62;
  float disp = wob * 0.16 * (fbm(vec3(c*3.0, iTime*0.4))*2.0 - 1.0);
  float rad  = R + disp;
  float dist = length(c) - rad;
  float m    = smoothstep(0.006, -0.006, dist);              // disc mask

  float zz = sqrt(max(0.0, rad*rad - dot(c,c)));
  vec3  n  = normalize(vec3(c, mix(0.0015, zz, threeD)));    // flat disc -> sphere normal

  vec3 grad      = vec3(uv01, 0.5 + 0.5*sin(iTime*0.8));     // stage 0
  vec3 flatCircle= vec3(1.0, 0.82, 0.35);                    // stage 1
  vec3 normalCol = 0.5 + 0.5*n;                              // stage 2

  float te     = fbm(n*3.2 + vec3(0.0,0.0,iTime*0.2));
  vec3  albedo = mix(vec3(1.0,0.55,0.30), palette(0.15+te), tex);
  vec3  L      = normalize(vec3(cos(iTime), 0.7, sin(iTime)));
  float diff   = max(dot(n,L), 0.0);
  float spec   = pow(max(dot(n, normalize(L - vec3(0,0,1))), 0.0), 40.0) * lit;
  vec3  litCol = albedo*(0.16 + diff) + spec*vec3(1.0);

  vec3 surf = mix(normalCol, litCol, lit);
  surf      = mix(flatCircle, surf, threeD);

  vec3 bg     = vec3(0.05, 0.06, 0.10);
  vec3 shaped = mix(bg, surf, m);
  vec3 col    = mix(grad, shaped, shape);

  col = pow(col, vec3(0.4545));
  fragColor = vec4(col, 1.0);
}`;
