// ONE fragment shader, smaller object (fits with margin), morphing across stages 0..6.
// Stage 6 uses fract() domain repetition to multiply the object into a grid.
// uStage (0..6) is the only driver; everything is painted per pixel on one quad.
export const MORPH2 = `
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x),f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }

const vec3 FLATC = vec3(1.0, 0.82, 0.35);

// shade one blob at local coord p with given radius; returns (rgb, mask)
vec4 shadeBlob(vec2 p, float radius){
  float s = uStage;
  float threeD = smoothstep(1.4, 2.3, s);
  float lit    = smoothstep(2.4, 3.3, s);
  float tex    = smoothstep(3.4, 4.3, s);
  float wob    = smoothstep(4.4, 5.2, s);

  float disp = wob * 0.12 * (fbm(vec3(p*3.0, iTime*0.4))*2.0 - 1.0);
  float rad  = radius + disp;
  float dist = length(p) - rad;
  float m    = smoothstep(0.006, -0.006, dist);

  float zz = sqrt(max(0.0, rad*rad - dot(p,p)));
  vec3  n  = normalize(vec3(p, mix(0.0015, zz, threeD)));

  vec3  normalCol = 0.5 + 0.5*n;
  float te        = fbm(n*3.2 + vec3(0.0,0.0,iTime*0.2));
  float flatten   = smoothstep(4.6, 5.4, s);                       // displace stage: calm to flat colour
  vec3  albedo    = mix(mix(vec3(1.0,0.55,0.30), palette(0.15+te), tex),
                        palette(0.12 + 0.16*p.y), flatten);          // flat-ish, like the hero/metaballs
  vec3  L         = normalize(vec3(cos(iTime), 0.7, sin(iTime)));
  float diff      = max(dot(n,L), 0.0);
  float spec      = pow(max(dot(n, normalize(L - vec3(0,0,1))), 0.0), 40.0) * lit;
  vec3  litCol    = albedo*(0.16 + diff) + spec*vec3(1.0);

  vec3 surf = mix(normalCol, litCol, lit);
  surf      = mix(FLATC, surf, threeD);
  return vec4(surf, m);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv01 = fragCoord/iResolution.xy;
  vec2 c    = (fragCoord-0.5*iResolution.xy)/iResolution.y;

  float s     = uStage;
  float shape = smoothstep(0.4, 1.2, s);
  float rep   = smoothstep(5.4, 6.3, s);     // multiply into a grid

  float shrink = smoothstep(4.5, 5.3, s);    // shrink to match the metaball that follows
  float R = 0.40 * mix(1.0, 0.5, shrink);
  vec4 single = shadeBlob(c, R);
  vec2 tc     = fract(c*3.0 + 0.5) - 0.5;    // fract() repeats the domain → 3×3 grid
  vec4 grid   = shadeBlob(tc, 0.34);
  vec4 obj    = mix(single, grid, rep);

  vec3 grad   = vec3(uv01, 0.5 + 0.5*sin(iTime*0.8));
  vec3 bg     = vec3(0.05, 0.06, 0.10);
  vec3 shaped = mix(bg, obj.rgb, obj.a);
  vec3 col    = mix(grad, shaped, shape);

  col = pow(col, vec3(0.4545));
  fragColor = vec4(col, 1.0);
}`;
