// Metaball construction shader: build a lava lamp step by step via uniforms.
//   uBalls (1..6) how many balls · uK smin radius (small=hard min, big=melt) · uMotion 0..1 drift
export const LAVA_BUILD = `
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0); return mix(b,a,h)-k*h*(1.0-h); }
float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x),f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }

float map(vec3 p){
  float k = max(uK, 0.0001);
  float d = 1e9;
  for(int i=0;i<6;i++){
    if(float(i) > uBalls - 0.5) break;
    float fi=float(i);
    vec3 base = vec3(cos(fi*2.40)*0.7, sin(fi*1.70)*0.55, sin(fi*1.10)*0.45);
    if(i==0) base = vec3(0.0, 0.0, 0.0);
    if(i==1) base = vec3(0.85, 0.0, 0.0);
    vec3 mo = uMotion * vec3(0.6*sin(iTime*0.8+fi*1.7), 0.5*cos(iTime*0.7+fi*2.1), 0.4*sin(iTime*0.6+fi*1.1));
    vec3 c = base + mo;
    float s = length(p - c) - 0.5;
    d = (i==0) ? s : smin(d, s, k);
  }
  d -= 0.06*(fbm(p*1.8 + iTime*0.3) - 0.5);   // organic surface, matches the morph blob & hero
  return d;
}
float march(vec3 ro,vec3 rd){ float t=0.0; for(int i=0;i<120;i++){ float d=map(ro+rd*t); if(d<0.001) return t; if(t>30.0) break; t+=d*0.7; } return -1.0; }
vec3 nrm(vec3 p){ vec2 e=vec2(1.,-1.)*0.5773*0.001; return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx)); }

void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  // gently recentre the pair so it stays framed as balls are added
  float shift = -0.42 * smoothstep(1.5, 2.0, uBalls) * (1.0 - uMotion);
  vec3 ro=vec3(-shift, 0.0, 4.3);
  vec3 rd=normalize(vec3(uv, -1.6));
  vec3 bg=mix(vec3(0.04,0.02,0.08), vec3(0.11,0.04,0.17), uv.y+0.5);
  vec3 col=bg;
  float t=march(ro,rd);
  if(t>0.0){
    vec3 p=ro+rd*t; vec3 n=nrm(p);
    vec3 L=normalize(vec3(0.6,0.8,0.6));
    float diff=max(dot(n,L),0.0);
    float fres=pow(1.0-max(dot(n,-rd),0.0),2.5);
    float spec=pow(max(dot(n,normalize(L-rd)),0.0),32.0);
    vec3 base = palette(0.10 + 0.15*p.y + 0.08*length(p));        // flat colour + bumps, the final look
    col=base*(0.25+diff)+spec*vec3(1.0)+fres*base*1.2;
    col=mix(col,bg,1.0-exp(-t*0.05));
  }
  col=pow(col,vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;

// Hero finale: glossy metaballs lit by two animated, colour-shifting lights.
export const LAVA_HERO = `
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0); return mix(b,a,h)-k*h*(1.0-h); }
float map(vec3 p){
  float k=0.28, d=1e9;
  for(int i=0;i<5;i++){ float fi=float(i);
    vec3 c=vec3(1.15*sin(iTime*0.42+fi*1.7), 0.95*cos(iTime*0.35+fi*2.1), 0.70*sin(iTime*0.30+fi*1.1));
    float s=length(p-c)-0.45;
    d=(i==0)?s:smin(d,s,k);   // low k → they clearly merge AND separate as they drift
  }
  return d;
}
float march(vec3 ro,vec3 rd){ float t=0.0; for(int i=0;i<100;i++){ float d=map(ro+rd*t); if(d<0.001) return t; if(t>30.0) break; t+=d; } return -1.0; }
vec3 nrm(vec3 p){ vec2 e=vec2(1.,-1.)*0.5773*0.001; return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx)); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  vec3 ro=vec3(0.0,0.0,6.8);                 // pulled back → smaller balls, with margin
  vec3 rd=normalize(vec3(uv,-1.7));
  vec3 bg=mix(vec3(0.02,0.03,0.06), vec3(0.07,0.03,0.13), uv.y+0.5);
  vec3 col=bg;
  float t=march(ro,rd);
  if(t>0.0){
    vec3 p=ro+rd*t; vec3 n=nrm(p); vec3 V=-rd;
    vec3 L1=normalize(vec3(sin(iTime*0.6), 0.7, cos(iTime*0.6)));
    vec3 L2=normalize(vec3(cos(iTime*0.4+2.0), -0.35, sin(iTime*0.4+2.0)));
    vec3 c1=0.55+0.45*cos(iTime*0.5+vec3(0.0,2.0,4.0));   // shifting light colours
    vec3 c2=0.55+0.45*cos(iTime*0.45+vec3(4.0,1.0,2.0));
    float d1=max(dot(n,L1),0.0), d2=max(dot(n,L2),0.0);
    float s1=pow(max(dot(n,normalize(L1+V)),0.0),60.0);
    float s2=pow(max(dot(n,normalize(L2+V)),0.0),60.0);
    float fres=pow(1.0-max(dot(n,V),0.0),3.0);
    vec3 albedo=palette(0.1+0.15*p.y+0.08*length(p));
    col = albedo*0.12
        + albedo*(d1*c1*1.1 + d2*c2*0.8)
        + (s1*c1 + s2*c2)*1.5
        + fres*mix(c1,c2,0.5)*0.7;
    col=mix(col,bg,1.0-exp(-t*0.04));
  }
  col *= 1.0 - 0.25*dot(uv,uv);   // vignette
  col=pow(col,vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;

// Hero variant 2: faster motion, slightly bigger balls, noise-warped surface.
export const LAVA_HERO2 = `
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0); return mix(b,a,h)-k*h*(1.0-h); }
float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x),f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }
float map(vec3 p){
  float k=0.30, d=1e9;
  for(int i=0;i<5;i++){ float fi=float(i);
    vec3 c=vec3(1.05*sin(iTime*0.80+fi*1.7), 0.90*cos(iTime*0.66+fi*2.1), 0.65*sin(iTime*0.56+fi*1.1));
    float s=length(p-c)-0.50;
    d=(i==0)?s:smin(d,s,k);
  }
  d -= 0.07*(fbm(p*1.8 + iTime*0.30) - 0.5);   // noise warps the surface → variable, lava-like form
  return d;
}
float march(vec3 ro,vec3 rd){ float t=0.0; for(int i=0;i<120;i++){ float d=map(ro+rd*t); if(d<0.001) return t; if(t>30.0) break; t+=d*0.6; } return -1.0; }
vec3 nrm(vec3 p){ vec2 e=vec2(1.,-1.)*0.5773*0.001; return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx)); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  vec3 ro=vec3(0.0,0.0,6.0);                 // a touch closer -> slightly bigger
  vec3 rd=normalize(vec3(uv,-1.7));
  vec3 bg=mix(vec3(0.02,0.03,0.06), vec3(0.07,0.03,0.13), uv.y+0.5);
  vec3 col=bg;
  float t=march(ro,rd);
  if(t>0.0){
    vec3 p=ro+rd*t; vec3 n=nrm(p); vec3 V=-rd;
    vec3 L1=normalize(vec3(sin(iTime*0.8), 0.7, cos(iTime*0.8)));
    vec3 L2=normalize(vec3(cos(iTime*0.55+2.0), -0.35, sin(iTime*0.55+2.0)));
    vec3 c1=0.55+0.45*cos(iTime*0.7+vec3(0.0,2.0,4.0));
    vec3 c2=0.55+0.45*cos(iTime*0.6+vec3(4.0,1.0,2.0));
    float d1=max(dot(n,L1),0.0), d2=max(dot(n,L2),0.0);
    float s1=pow(max(dot(n,normalize(L1+V)),0.0),60.0);
    float s2=pow(max(dot(n,normalize(L2+V)),0.0),60.0);
    float fres=pow(1.0-max(dot(n,V),0.0),3.0);
    vec3 albedo=palette(0.1+0.15*p.y+0.08*length(p));
    col = albedo*0.12 + albedo*(d1*c1*1.1 + d2*c2*0.8) + (s1*c1 + s2*c2)*1.5 + fres*mix(c1,c2,0.5)*0.7;
    col=mix(col,bg,1.0-exp(-t*0.04));
  }
  col *= 1.0 - 0.25*dot(uv,uv);
  col=pow(col,vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;
