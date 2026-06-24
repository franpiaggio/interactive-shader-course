// Progressive INTERMEDIATE stages that all build the SAME terrain — so the explainer
// flows continuously from noise to a finished landscape (no unrelated jumps).
// Shadertoy-style: void mainImage(out vec4, in vec2) using iResolution / iTime.

const CORE = `
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y); }
const mat2 m2=mat2(0.8,-0.6,0.6,0.8);
float fbm(vec2 p){ float h=0.0,a=0.5; for(int i=0;i<7;i++){ h+=a*noise(p); p=m2*p*2.0; a*=0.5; } return h; }`;

// 3D terrain helpers (terrain defined first so the marcher can call it).
const TER = CORE + `
float terrain(vec2 p){ return 7.0*fbm(p*0.13); }
float castRay(vec3 ro, vec3 rd){ float t=0.5, dt, lastD=ro.y-terrain(ro.xz);
  for(int i=0;i<240;i++){ vec3 p=ro+rd*t; float d=p.y-terrain(p.xz);
    if(d<0.0) return t-dt+dt*lastD/(lastD-d); lastD=d; dt=0.01*t+0.05; t+=dt; if(t>160.0) break; } return -1.0; }
vec3 calcNormal(vec3 p, float t){ float e=0.002*t;
  return normalize(vec3(terrain(p.xz-vec2(e,0.0))-terrain(p.xz+vec2(e,0.0)), 2.0*e,
                        terrain(p.xz-vec2(0.0,e))-terrain(p.xz+vec2(0.0,e)))); }
float shadow(vec3 p, vec3 sun){ float res=1.0,t=0.6;
  for(int i=0;i<24;i++){ vec3 q=p+sun*t; float h=q.y-terrain(q.xz);
    res=min(res,10.0*h/t); if(h<0.0) return 0.0; t+=clamp(h,0.4,6.0); if(t>50.0) break; } return clamp(res,0.0,1.0); }
vec3 skyCol(vec3 rd, vec3 sun){
  vec3 c=mix(vec3(0.30,0.55,0.92), vec3(0.05,0.16,0.42), clamp(rd.y*1.4,0.0,1.0));
  float sd=clamp(dot(rd,sun),0.0,1.0);
  c=mix(c, vec3(0.95,0.75,0.55), pow(sd,5.0)*0.5*clamp(1.0-rd.y*2.5,0.0,1.0));
  c+=vec3(1.0,0.85,0.6)*pow(sd,250.0); return c; }
#define CAMERA vec3 sun=normalize(vec3(-0.7,0.38,0.6)); \
  vec3 ro=vec3(0.0,11.0,iTime*3.0); vec3 ta=ro+vec3(0.0,-0.9,4.0); \
  vec3 ww=normalize(ta-ro),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww); \
  vec3 rd=normalize(uu*uv.x+vv*uv.y+ww*1.4);`;

// 3 — value noise summed in octaves (fBM), top-down
export const NOISE2D = CORE + `
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 p=(fragCoord/iResolution.y)*7.0 + vec2(iTime*0.3,0.0);
  float n=fbm(p);
  vec3 col=vec3(n);
  col=pow(col,vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;

// 4 — read that noise as a HEIGHT MAP (top-down hillshade: water / grass / snow)
export const HEIGHTMAP = CORE + `
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 p=(fragCoord/iResolution.y)*7.0 + vec2(iTime*0.3,0.0);
  float h=fbm(p);
  vec2 e=vec2(0.03,0.0);
  float hx=fbm(p+e.xy)-fbm(p-e.xy), hy=fbm(p+e.yx)-fbm(p-e.yx);
  vec3 n=normalize(vec3(-hx,-hy,0.18));
  float sh=clamp(dot(n,normalize(vec3(-0.5,0.6,0.6))),0.0,1.0);
  vec3 ramp=mix(vec3(0.12,0.28,0.5), vec3(0.2,0.45,0.18), smoothstep(0.32,0.42,h));
  ramp=mix(ramp, vec3(0.4,0.34,0.26), smoothstep(0.55,0.65,h));
  ramp=mix(ramp, vec3(0.95), smoothstep(0.72,0.85,h));
  vec3 col=ramp*(0.45+0.8*sh);
  col=pow(col,vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;

// 5 — RAYMARCH the height field (height-coloured, no lighting yet)
export const TERRAIN_MARCH = TER + `
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y; CAMERA
  float t=castRay(ro,rd); vec3 col;
  if(t<0.0) col=skyCol(rd,sun);
  else { vec3 p=ro+rd*t; float h01=clamp(terrain(p.xz)/7.0,0.0,1.0);
    col=mix(vec3(0.24,0.20,0.16), vec3(0.82,0.78,0.6), h01);
    col=mix(col, skyCol(rd,sun), 1.0-exp(-0.0007*t*t)); }
  col=pow(col,vec3(0.4545)); fragColor=vec4(col,1.0);
}`;

// 6 — normals from the height map → diffuse light (single material)
export const TERRAIN_LIT = TER + `
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y; CAMERA
  float t=castRay(ro,rd); vec3 col;
  if(t<0.0) col=skyCol(rd,sun);
  else { vec3 p=ro+rd*t; vec3 n=calcNormal(p,t);
    float dif=clamp(dot(n,sun),0.0,1.0), amb=clamp(0.5+0.5*n.y,0.0,1.0);
    col=vec3(0.30,0.40,0.20)*(vec3(1.3,1.1,0.8)*dif + vec3(0.18,0.30,0.5)*amb);
    col=mix(col, skyCol(rd,sun), 1.0-exp(-0.0007*t*t)); }
  col=pow(col,vec3(0.4545)); fragColor=vec4(col,1.0);
}`;

// 7 — materials by slope & height (grass / rock / snow)
export const TERRAIN_MAT = TER + `
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y; CAMERA
  float t=castRay(ro,rd); vec3 col;
  if(t<0.0) col=skyCol(rd,sun);
  else { vec3 p=ro+rd*t; vec3 n=calcNormal(p,t);
    float slope=n.y, h01=clamp(terrain(p.xz)/7.0,0.0,1.0);
    vec3 grass=vec3(0.16,0.30,0.08), rock=vec3(0.28,0.22,0.17), snow=vec3(0.95,0.96,1.0);
    vec3 mat=mix(rock,grass,smoothstep(0.55,0.82,slope));
    mat=mix(mat,snow,smoothstep(0.6,0.8,h01)*smoothstep(0.5,0.78,slope));
    float dif=clamp(dot(n,sun),0.0,1.0), amb=clamp(0.5+0.5*n.y,0.0,1.0);
    col=mat*(vec3(1.3,1.1,0.8)*dif + vec3(0.16,0.26,0.45)*amb);
    col=mix(col, skyCol(rd,sun), 1.0-exp(-0.0007*t*t)); }
  col=pow(col,vec3(0.4545)); fragColor=vec4(col,1.0);
}`;

// 8 — atmosphere: cast shadows + warm/cool light + fog + vignette = a landscape
export const TERRAIN_FULL = TER + `
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y; CAMERA
  float t=castRay(ro,rd); vec3 col;
  if(t<0.0) col=skyCol(rd,sun);
  else { vec3 p=ro+rd*t; vec3 n=calcNormal(p,t);
    float slope=n.y, h01=clamp(terrain(p.xz)/7.0,0.0,1.0);
    vec3 grass=vec3(0.16,0.30,0.08), rock=vec3(0.28,0.22,0.17), snow=vec3(0.95,0.96,1.0);
    vec3 mat=mix(rock,grass,smoothstep(0.55,0.82,slope));
    mat=mix(mat,snow,smoothstep(0.6,0.8,h01)*smoothstep(0.5,0.78,slope));
    float dif=clamp(dot(n,sun),0.0,1.0), sh=shadow(p+n*0.2,sun), sky=clamp(0.5+0.5*n.y,0.0,1.0);
    col=mat*(vec3(1.4,1.15,0.8)*dif*sh + vec3(0.12,0.22,0.40)*sky);
    vec3 fogCol=mix(vec3(0.5,0.62,0.8), vec3(0.95,0.72,0.5), pow(clamp(dot(rd,sun),0.0,1.0),5.0));
    col=mix(col, fogCol, 1.0-exp(-0.00055*t*t)); }
  vec2 q=fragCoord/iResolution.xy; col*=0.5+0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.15);
  col=pow(col,vec3(0.4545)); fragColor=vec4(col,1.0);
}`;
