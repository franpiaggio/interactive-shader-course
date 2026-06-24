// Very-visual teaching shaders for the "flat color → lit 3D" explainer.
// Each is self-contained GLSL ES 3.00 with mainImage(), using iResolution/iTime.

// 0 — the most basic shader: pixel position -> color
export const GRADIENT = `
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv = fragCoord / iResolution.xy;          // 0..1 across the screen
  vec3 col = vec3(uv, 0.5 + 0.5*sin(iTime*0.8)); // x->red, y->green, time->blue
  fragColor = vec4(col, 1.0);
}`;

// 1 — a distance field: a formula becomes a shape (rings show the field)
export const SDF2D = `
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  float d = length(uv) - (0.34 + 0.04*sin(iTime*1.2));   // signed distance to a circle
  vec3 rings = palette(0.55 + d) * (0.5+0.5*cos(d*42.0)); // visualize the field as rings
  float inside = smoothstep(0.004,-0.004,d);
  vec3 col = mix(rings*0.7, vec3(1.0,0.82,0.35), inside);  // fill where d < 0
  col=pow(col,vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;

// 2 — raymarching: one ray per pixel -> 3D. Surface normal shown as RGB.
export const NORMALS3D = `
mat3 rotY(float a){ float c=cos(a),s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }
float map(vec3 p){ return length(p)-1.0; }
float march(vec3 ro,vec3 rd){ float t=0.0; for(int i=0;i<80;i++){ float d=map(ro+rd*t); if(d<0.001) return t; if(t>20.0) break; t+=d; } return -1.0; }
vec3 calcN(vec3 p){ vec2 e=vec2(1.,-1.)*0.5773*0.001; return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx)); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  vec3 ro=vec3(0.,0.,3.2); vec3 rd=normalize(vec3(uv,-1.7));
  vec3 col=vec3(0.05,0.06,0.10);
  float t=march(ro,rd);
  if(t>0.0){ vec3 p=ro+rd*t; vec3 n=calcN(p); n=rotY(iTime*0.8)*n; col=0.5+0.5*n; } // normal = RGB
  fragColor=vec4(col,1.0);
}`;

// 3 — lighting: the field's gradient is the normal -> diffuse + specular, light orbits
export const LIT = `
float map(vec3 p){ return length(p)-1.0; }
float march(vec3 ro,vec3 rd){ float t=0.0; for(int i=0;i<80;i++){ float d=map(ro+rd*t); if(d<0.001) return t; if(t>20.0) break; t+=d; } return -1.0; }
vec3 calcN(vec3 p){ vec2 e=vec2(1.,-1.)*0.5773*0.001; return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx)); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  vec3 ro=vec3(0.,0.,3.2); vec3 rd=normalize(vec3(uv,-1.7));
  vec3 col=vec3(0.04,0.05,0.09);
  float t=march(ro,rd);
  if(t>0.0){
    vec3 p=ro+rd*t; vec3 n=calcN(p);
    vec3 L=normalize(vec3(cos(iTime),0.7,sin(iTime)));   // light orbits the sphere
    float diff=max(dot(n,L),0.0);
    vec3 h=normalize(L-rd); float spec=pow(max(dot(n,h),0.0),40.0);
    vec3 albedo=vec3(0.95,0.45,0.30);
    col=albedo*(0.12+diff)+spec*vec3(1.0);
  }
  col=pow(col,vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;

// 4 — noise: procedural texture on the surface (no image files)
export const TEXTURED = `
float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x),f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0.,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.10,0.20,0.45))); }
float map(vec3 p){ return length(p)-1.0; }
float march(vec3 ro,vec3 rd){ float t=0.0; for(int i=0;i<80;i++){ float d=map(ro+rd*t); if(d<0.001) return t; if(t>20.0) break; t+=d; } return -1.0; }
vec3 calcN(vec3 p){ vec2 e=vec2(1.,-1.)*0.5773*0.001; return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx)); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
  vec3 ro=vec3(0.,0.,3.2); vec3 rd=normalize(vec3(uv,-1.7));
  vec3 col=vec3(0.04,0.05,0.09);
  float t=march(ro,rd);
  if(t>0.0){
    vec3 p=ro+rd*t; vec3 n=calcN(p);
    float tex=fbm(p*3.5 + vec3(0.0,0.0,iTime*0.25));   // procedural texture
    vec3 albedo=palette(0.2+tex);
    vec3 L=normalize(vec3(0.6,0.8,0.5));
    float diff=max(dot(n,L),0.0);
    col=albedo*(0.18+diff);
  }
  col=pow(col,vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;
