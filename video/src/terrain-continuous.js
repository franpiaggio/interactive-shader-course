// v3 — terrain core rebuilt on Inigo Quilez's "Elevated" technique (the one the user referenced):
//   * STATIONARY height (function of world xz only, fixed octaves) -> no morphing.
//   * MEDIUM-detail terrainM for the marcher + shadow -> a stable silhouette (no peak flicker).
//   * HIGH-detail terrainH only for the normal, sampled with a DISTANCE-SCALED epsilon -> the
//     shading detail is band-limited automatically -> no sub-pixel sparkle.
//   * ADAPTIVE raymarch (t += 0.4*h) -> never overshoots thin peaks -> no trembling.
// The b&w noise shown earlier uses the SAME shape function as the elevation, so they correspond.
export const CONTINUOUS = `
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y); }
const mat2 m2=mat2(0.8,-0.6,0.6,0.8);
float fbm2(vec2 p){ float h=0.0,a=0.5; for(int i=0;i<5;i++){ h+=a*noise(p); p=m2*p*2.0; a*=0.5; } return h; }

// value noise + analytic derivatives (quintic interpolation, smooth)
vec3 noised(vec2 x){
  vec2 i=floor(x), f=fract(x);
  vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  vec2 du=30.0*f*f*(f*(f-2.0)+1.0);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  return vec3(a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y,
              du*(vec2(b-a,c-a)+(a-b-c+d)*u.yx));
}
const float uHeight=16.0;
float lift(){ return smoothstep(11.0, 16.0, iTime); }
vec2 warp(vec2 x){ vec2 w=vec2(noise(x*0.012), noise(x*0.012+vec2(31.4,12.1))); return x + (w-0.5)*22.0; }

// eroded fBM shape in 0..1. LOW base frequency -> big, broad mountains (not a field of spikes).
// Same recipe at two octave counts; both STATIONARY.
float shapeM(vec2 x){            // medium -> marcher silhouette (stable)
  vec2 p=warp(x)*0.022; float a=0.0,b=1.0; vec2 d=vec2(0.0);
  for(int i=0;i<7;i++){ vec3 n=noised(p); d+=n.yz; a+=b*n.x/(1.0+dot(d,d)); b*=0.5; p=m2*p*2.0; }
  return a;
}
float shapeH(vec2 x){            // high -> normal detail (band-limited by distance eps)
  vec2 p=warp(x)*0.022; float a=0.0,b=1.0; vec2 d=vec2(0.0);
  for(int i=0;i<11;i++){ vec3 n=noised(p); d+=n.yz; a+=b*n.x/(1.0+dot(d,d)); b*=0.5; p=m2*p*2.0; }
  return a;
}
float terrainM(vec2 x){ return uHeight*shapeM(x)*lift(); }
float terrainH(vec2 x){ return uHeight*shapeH(x)*lift(); }

// adaptive heightfield marcher: step a fraction of the vertical gap -> no overshoot, no flicker
float castRay(vec3 ro, vec3 rd){
  float t=0.5, tmax=520.0;
  for(int i=0;i<300;i++){
    vec3 p=ro+t*rd;
    float h=p.y - terrainM(p.xz);
    if(h < 0.0015*t || t>tmax) break;
    t += 0.4*h;
  }
  return (t>tmax) ? -1.0 : t;
}
// normal from the HIGH terrain, epsilon scaled with distance -> no sparkle on far slopes
vec3 calcNormal(vec3 p, float t){ vec2 e=vec2(0.0015*t+0.01, 0.0);
  return normalize(vec3(terrainH(p.xz-e.xy)-terrainH(p.xz+e.xy), 2.0*e.x,
                        terrainH(p.xz-e.yx)-terrainH(p.xz+e.yx))); }
float shadow(vec3 ro, vec3 rd){
  float res=1.0, t=0.5;
  for(int i=0;i<40;i++){ vec3 p=ro+t*rd; float h=p.y-terrainM(p.xz);
    res=min(res, 12.0*h/t); t+=max(0.5,h); if(res<0.01 || p.y>uHeight*1.5) break; }
  return clamp(res,0.0,1.0);
}
float grid(vec2 xz, float dist){ vec2 g=abs(fract(xz*0.5)-0.5); float line=min(g.x,g.y);
  return 1.0 - smoothstep(0.0, 0.04+0.006*dist, line); }

vec3 skyAndClouds(vec3 ro, vec3 rd, vec3 sun, float wCloud, float wSun){
  vec3 col=mix(vec3(0.34,0.56,0.9), vec3(0.06,0.18,0.46), clamp(rd.y*1.3,0.0,1.0));
  float sd=clamp(dot(rd,sun),0.0,1.0);
  col=mix(col, vec3(0.95,0.78,0.6), pow(sd,5.0)*0.55*clamp(1.0-rd.y*2.5,0.0,1.0)*wSun);
  col+=vec3(1.0,0.9,0.65)*pow(sd,180.0)*wSun;
  col+=vec3(1.0,0.7,0.4)*pow(sd,8.0)*0.25*wSun;
  if(rd.y>0.005){
    float tp=(95.0-ro.y)/rd.y;
    vec2 cp=(ro+rd*tp).xz*0.006 + vec2(iTime*0.012,0.0);
    float cl=smoothstep(0.34,0.62,fbm2(cp*1.3));
    float li=smoothstep(0.34,0.62,fbm2((cp+sun.xz*0.10)*1.3));
    vec3 cc=mix(vec3(0.6,0.64,0.76), vec3(1.0,0.99,0.96), clamp((cl-li)*3.0+0.7,0.0,1.0));
    col=mix(col, cc, cl*smoothstep(0.0,0.12,rd.y)*wCloud*0.95);
  }
  return col;
}

vec3 scene(vec2 fc){
  vec2 uv=(fc-0.5*iResolution.xy)/iResolution.y;
  vec3 sun=normalize(vec3(-0.95,0.28,0.2));

  float w3D    = smoothstep(3.5, 6.5,  iTime);
  float wNoise = smoothstep(6.8,9.8,iTime)*(1.0-smoothstep(14.0,17.0,iTime));
  float wSun   = smoothstep(16.5,19.5, iTime);
  float wLight = smoothstep(20.0,24.0, iTime);
  float wMat   = smoothstep(24.0,29.0, iTime);
  float wShad  = smoothstep(29.0,34.0, iTime);
  float wFog   = smoothstep(33.0,38.0, iTime);
  float wCloud = smoothstep(37.0,43.0, iTime);
  float gw     = smoothstep(4.5,6.0,iTime) * (1.0 - smoothstep(9.0,12.0,iTime));

  vec3 gradientCol=vec3(fc/iResolution.xy, 0.5+0.5*sin(iTime*0.8));

  float reveal=smoothstep(15.5,17.5,iTime)*(1.0-smoothstep(20.5,23.0,iTime));
  vec3 ro=vec3(0.0, 30.0, iTime*2.6);
  vec3 baseTa=ro+vec3(0.0,-1.6,4.0);
  vec3 ta=mix(baseTa, ro+sun*6.0, reveal);
  float skyUp=smoothstep(37.0,41.0,iTime);                 // clouds stage: lift the camera to show the sky
  ta=mix(ta, ro+vec3(0.0,0.55,4.0), skyUp);                // a touch less -> sky + mountains both in frame
  vec3 ww=normalize(ta-ro),uu=normalize(cross(ww,vec3(0,1,0))),vv=cross(uu,ww);
  vec3 rd=normalize(uu*uv.x+vv*uv.y+ww*1.4);

  vec3 col3D;
  float t=castRay(ro,rd);
  if(t<0.0){ col3D=skyAndClouds(ro,rd,sun,wCloud,wSun); }
  else{
    vec3 p=ro+rd*t; vec3 n=calcNormal(p,t);
    float slope=n.y, h01=clamp(p.y/uHeight,0.0,1.0);
    vec3 heightCol=mix(vec3(0.20,0.23,0.30), vec3(0.78,0.74,0.58), h01);
    float nz=smoothstep(0.2, 0.7, shapeM(p.xz));            // SAME shape as the elevation, as b&w
    vec3 baseCol=mix(heightCol, vec3(nz), wNoise);
    vec3 grass=vec3(0.13,0.27,0.07), rock=vec3(0.30,0.24,0.18), snow=vec3(0.95,0.96,1.0);
    vec3 matCol=mix(rock,grass,smoothstep(0.55,0.82,slope));
    matCol=mix(matCol,snow,smoothstep(0.55,0.78,h01)*smoothstep(0.45,0.75,slope));
    vec3 albedo=mix(baseCol, matCol, wMat);
    float dif=clamp(dot(n,sun),0.0,1.0);
    float sh=mix(1.0, 0.28+0.72*shadow(p+n*0.2+sun*0.3, sun), wShad);
    float skyl=clamp(0.5+0.5*n.y,0.0,1.0);
    float ao=clamp(0.4+0.6*h01,0.0,1.0);
    vec3 lit=albedo*(vec3(1.45,1.18,0.85)*dif*sh + vec3(0.24,0.32,0.48)*skyl*ao);
    col3D=mix(albedo*(0.7+0.3*skyl), lit, wLight);
    col3D=mix(col3D, vec3(1.0,0.86,0.55), grid(p.xz,t)*gw*0.8);
    vec3 fogCol=mix(vec3(0.55,0.66,0.82), vec3(0.95,0.72,0.5), pow(clamp(dot(rd,sun),0.0,1.0),5.0)*wSun);
    fogCol=mix(fogCol, skyAndClouds(ro,rd,sun,wCloud,wSun), 0.6);
    col3D=mix(col3D, fogCol, (1.0-exp(-0.00009*t*t))*wFog);
  }

  return mix(gradientCol, col3D, w3D);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec3 col = scene(fragCoord);
  col=col/(1.0+col*0.32)*1.18;
  vec2 q=fragCoord/iResolution.xy;
  col*=0.5+0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.13);
  col=pow(col, vec3(0.4545));
  fragColor=vec4(col,1.0);
}`;
