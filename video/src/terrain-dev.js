// Dev/validation shaders for the terrain module — rendered as stills to eyeball them.

// Shared terrain functions (height map + march + normal + soft shadow).
// `terrain` is forward-declared here and defined per-variant below (GLSL needs the prototype first).
const COMMON = `
float terrain(vec2 p);
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y); }
const mat2 m2=mat2(0.8,-0.6,0.6,0.8);
float fbm(vec2 p){ float h=0.0,a=0.5; for(int i=0;i<7;i++){ h+=a*noise(p); p=m2*p*2.0; a*=0.5; } return h; }
float castRay(vec3 ro, vec3 rd){
  float t=0.5, dt, lastD=ro.y-terrain(ro.xz);
  for(int i=0;i<240;i++){ vec3 p=ro+rd*t; float d=p.y-terrain(p.xz);
    if(d<0.0) return t-dt+dt*lastD/(lastD-d);
    lastD=d; dt=0.01*t+0.05; t+=dt; if(t>160.0) break; }
  return -1.0;
}
vec3 calcNormal(vec3 p, float t){ float e=0.002*t;
  return normalize(vec3(terrain(p.xz-vec2(e,0.0))-terrain(p.xz+vec2(e,0.0)), 2.0*e,
                        terrain(p.xz-vec2(0.0,e))-terrain(p.xz+vec2(0.0,e)))); }
// soft cast shadow: march toward the sun, dim if terrain rises into the ray
float shadow(vec3 p, vec3 sun){
  float res=1.0, t=0.6;
  for(int i=0;i<24;i++){ vec3 q=p+sun*t; float h=q.y-terrain(q.xz);
    res=min(res, 10.0*h/t); if(h<0.0) return 0.0; t+=clamp(h,0.4,6.0); if(t>50.0) break; }
  return clamp(res,0.0,1.0);
}
float vign(vec2 fc, vec3 res){ vec2 q=fc/res.xy; return 0.5+0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.15); }`;

// ---- HERO: high-contrast alpine ----
export const TERRAIN = COMMON + `
float terrain(vec2 p){ return 7.0*fbm(p*0.13); }
vec3 skyCol(vec3 rd, vec3 sun){
  vec3 col=mix(vec3(0.30,0.55,0.92), vec3(0.05,0.16,0.42), clamp(rd.y*1.4,0.0,1.0));
  float sd=clamp(dot(rd,sun),0.0,1.0);
  col=mix(col, vec3(0.95,0.75,0.55), pow(sd,5.0)*0.5*clamp(1.0-rd.y*2.5,0.0,1.0));
  col+=vec3(1.0,0.85,0.6)*pow(sd,250.0);
  return col;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  vec3 sun=normalize(vec3(-0.7,0.38,0.6));
  vec3 ro=vec3(0.0, 11.0, iTime*3.0);
  vec3 ta=ro+vec3(0.0,-0.9,4.0);
  vec3 ww=normalize(ta-ro), uu=normalize(cross(ww,vec3(0,1,0))), vv=cross(uu,ww);
  vec3 rd=normalize(uu*uv.x+vv*uv.y+ww*1.4);
  float t=castRay(ro,rd);
  vec3 col;
  if(t<0.0){ col=skyCol(rd,sun); }
  else{
    vec3 p=ro+rd*t; vec3 n=calcNormal(p,t);
    float slope=n.y, h01=clamp(terrain(p.xz)/7.0,0.0,1.0);
    vec3 grass=vec3(0.16,0.30,0.08), rock=vec3(0.28,0.22,0.17), snow=vec3(0.95,0.96,1.0);
    vec3 mat=mix(rock,grass,smoothstep(0.55,0.82,slope));
    mat=mix(mat,snow,smoothstep(0.6,0.8,h01)*smoothstep(0.5,0.78,slope));
    float dif=clamp(dot(n,sun),0.0,1.0);
    float sh=shadow(p+n*0.2, sun);
    float sky=clamp(0.5+0.5*n.y,0.0,1.0);
    vec3 lin = vec3(1.4,1.15,0.8)*dif*sh + vec3(0.12,0.22,0.40)*sky;   // warm sun, cool shadow
    col=mat*lin;
    vec3 fogCol=mix(vec3(0.5,0.62,0.8), vec3(0.95,0.72,0.5), pow(clamp(dot(rd,sun),0.0,1.0),5.0));
    col=mix(col, fogCol, 1.0-exp(-0.00055*t*t));
  }
  col*=vign(fragCoord, iResolution);
  col=pow(col, vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;

// ---- VARIANT: sunset / dramatic ----
export const SUNSET = COMMON + `
float terrain(vec2 p){ return 8.5*fbm(p*0.11); }
vec3 skyCol(vec3 rd, vec3 sun){
  vec3 col=mix(vec3(0.95,0.45,0.25), vec3(0.18,0.10,0.30), clamp(rd.y*1.3+0.1,0.0,1.0));
  float sd=clamp(dot(rd,sun),0.0,1.0);
  col=mix(col, vec3(1.0,0.7,0.35), pow(sd,3.0)*0.7);
  col+=vec3(1.0,0.6,0.3)*pow(sd,400.0)*2.0;
  return col;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  vec3 sun=normalize(vec3(-0.85,0.16,0.5));
  vec3 ro=vec3(0.0, 12.0, iTime*3.0);
  vec3 ta=ro+vec3(0.0,-0.7,4.0);
  vec3 ww=normalize(ta-ro), uu=normalize(cross(ww,vec3(0,1,0))), vv=cross(uu,ww);
  vec3 rd=normalize(uu*uv.x+vv*uv.y+ww*1.4);
  float t=castRay(ro,rd);
  vec3 col;
  if(t<0.0){ col=skyCol(rd,sun); }
  else{
    vec3 p=ro+rd*t; vec3 n=calcNormal(p,t);
    float slope=n.y, h01=clamp(terrain(p.xz)/8.5,0.0,1.0);
    vec3 grass=vec3(0.20,0.16,0.10), rock=vec3(0.26,0.18,0.15), snow=vec3(1.0,0.85,0.8);
    vec3 mat=mix(rock,grass,smoothstep(0.6,0.85,slope));
    mat=mix(mat,snow,smoothstep(0.62,0.82,h01)*smoothstep(0.55,0.8,slope));
    float dif=clamp(dot(n,sun),0.0,1.0);
    float sh=shadow(p+n*0.2, sun);
    float sky=clamp(0.5+0.5*n.y,0.0,1.0);
    vec3 lin = vec3(1.8,0.9,0.5)*dif*sh + vec3(0.25,0.15,0.30)*sky;
    col=mat*lin;
    vec3 fogCol=mix(vec3(0.6,0.35,0.4), vec3(1.0,0.6,0.3), pow(clamp(dot(rd,sun),0.0,1.0),3.0));
    col=mix(col, fogCol, 1.0-exp(-0.0007*t*t));
  }
  col*=vign(fragCoord, iResolution);
  col=pow(col, vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;

// ---- VARIANT: desert dunes ----
export const DESERT = COMMON + `
float terrain(vec2 p){ float d=fbm(p*0.10); d=pow(d,1.6); return 6.5*d; }   // rounded dunes
vec3 skyCol(vec3 rd, vec3 sun){
  vec3 col=mix(vec3(0.55,0.72,0.92), vec3(0.20,0.45,0.80), clamp(rd.y*1.4,0.0,1.0));
  float sd=clamp(dot(rd,sun),0.0,1.0);
  col=mix(col, vec3(1.0,0.92,0.7), pow(sd,5.0)*0.4*clamp(1.0-rd.y*2.5,0.0,1.0));
  col+=vec3(1.0,0.9,0.7)*pow(sd,300.0);
  return col;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  vec3 sun=normalize(vec3(-0.6,0.30,0.6));
  vec3 ro=vec3(0.0, 10.5, iTime*3.0);
  vec3 ta=ro+vec3(0.0,-0.85,4.0);
  vec3 ww=normalize(ta-ro), uu=normalize(cross(ww,vec3(0,1,0))), vv=cross(uu,ww);
  vec3 rd=normalize(uu*uv.x+vv*uv.y+ww*1.4);
  float t=castRay(ro,rd);
  vec3 col;
  if(t<0.0){ col=skyCol(rd,sun); }
  else{
    vec3 p=ro+rd*t; vec3 n=calcNormal(p,t);
    vec3 sand=vec3(0.78,0.60,0.36);
    sand *= 0.92+0.08*noise(p.xz*3.0);          // faint ripples
    float dif=clamp(dot(n,sun),0.0,1.0);
    float sh=shadow(p+n*0.2, sun);
    float sky=clamp(0.5+0.5*n.y,0.0,1.0);
    vec3 lin = vec3(1.5,1.25,0.9)*dif*sh + vec3(0.30,0.35,0.45)*sky;
    col=sand*lin;
    vec3 fogCol=vec3(0.8,0.78,0.7);
    col=mix(col, fogCol, 1.0-exp(-0.0006*t*t));
  }
  col*=vign(fragCoord, iResolution);
  col=pow(col, vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;
