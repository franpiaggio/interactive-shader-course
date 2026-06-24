// The course's showpiece fragment shaders, with slider values baked in as consts.
// Each defines `void mainImage(out vec4 fragColor, in vec2 fragCoord)` and uses
// iResolution / iTime — exactly like Shadertoy.

export const KALEIDO = `
const float uSeg=6.0, uScale=3.0, uPhase=0.0;
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x),f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
    float seg=floor(uSeg);
    float a=atan(uv.y,uv.x), r=length(uv), w=6.28318/seg;
    a=mod(a,w); a=abs(a-w*0.5);
    vec2 p=r*vec2(cos(a),sin(a));
    float v=fbm(vec3(p*uScale, iTime*0.25));
    vec3 col=palette(uPhase + v*1.2 + r*0.5);
    col*=smoothstep(1.3,0.1,r)*1.1;
    col=pow(col,vec3(0.4545));
    fragColor=vec4(col,1.0);
}`;

export const LAVA = `
const float uSpeed=0.55, uBlend=0.65, uPhase=0.12;
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0); return mix(b,a,h)-k*h*(1.0-h); }
float map(vec3 p){
    float d=1e9;
    for(int i=0;i<6;i++){ float fi=float(i);
        vec3 c=vec3(1.4*sin(iTime*uSpeed+fi*1.7), 1.1*cos(iTime*uSpeed*0.8+fi*2.3), 1.0*sin(iTime*uSpeed*0.6+fi*1.1));
        d=smin(d, length(p-c)-0.55, uBlend); }
    return d;
}
float march(vec3 ro,vec3 rd){ float t=0.0; for(int i=0;i<90;i++){ float d=map(ro+rd*t); if(d<0.001) return t; if(t>30.0) break; t+=d; } return -1.0; }
vec3 nrm(vec3 p){ vec2 e=vec2(1.0,-1.0)*0.5773*0.001; return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx)); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
    vec3 ro=vec3(0.0,0.0,5.0);
    vec3 rd=normalize(vec3(uv,-1.4));
    vec3 bg=mix(vec3(0.04,0.02,0.08), vec3(0.11,0.04,0.17), uv.y+0.5);
    vec3 col=bg;
    float t=march(ro,rd);
    if(t>0.0){
        vec3 p=ro+rd*t; vec3 n=nrm(p);
        vec3 L=normalize(vec3(0.6,0.8,0.6));
        float diff=max(dot(n,L),0.0);
        float fres=pow(1.0-max(dot(n,-rd),0.0), 2.5);
        float spec=pow(max(dot(n,normalize(L-rd)),0.0), 32.0);
        vec3 base=palette(uPhase + 0.15*p.y + 0.1*length(p));
        col=base*(0.25+diff) + spec*vec3(1.0) + fres*base*1.3;
        col=mix(col,bg,1.0-exp(-t*0.06));
    }
    col=pow(col,vec3(0.4545));
    fragColor=vec4(col,1.0);
}`;

export const TUNNEL = `
const float uSpeed=1.6, uBend=0.5, uPhase=0.0;
vec3 palette(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
    float t = iTime*uSpeed;
    vec2 turn = vec2(sin(t*0.6), cos(t*0.45)) * uBend;
    vec2 p = uv - turn;
    float r = length(p);
    float a = atan(p.y, p.x);
    float depth = 0.35/r + t;
    float rings  = 0.5+0.5*sin(depth*12.0);
    float flutes = 0.5+0.5*sin(a*10.0);
    float pat = rings*(0.55+0.45*flutes);
    vec3 col = palette(uPhase + depth*0.12) * (0.25 + pat);
    col += palette(uPhase+0.5) * smoothstep(0.55,0.0,r) * 0.25;
    col *= smoothstep(0.0,0.16,r);
    col = col/(1.0+col*0.5);
    col = pow(col, vec3(0.4545));
    fragColor=vec4(col,1.0);
}`;

export const CLOUDS = `
const float uCov=0.42, uSunX=0.55, uSunY=0.45;
float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }
vec3 skyCol(vec2 uv){ float h=clamp(uv.y*0.6+0.5,0.0,1.0); return mix(vec3(0.74,0.83,0.93), vec3(0.23,0.47,0.85), h); }
float cloud(vec3 p, float cov){ float f=fbm(p*0.45+vec3(0.0,0.0,iTime*0.15)); return clamp((f-(0.85-cov))*3.0,0.0,1.0); }
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv=(fragCoord-0.5*iResolution.xy)/iResolution.y;
    vec3 ro=vec3(0.0,0.0,0.0);
    vec3 rd=normalize(vec3(uv,1.0));
    vec3 sun=normalize(vec3(uSunX,uSunY,1.0));
    vec4 sum=vec4(0.0);
    float t=1.0;
    for(int i=0;i<90;i++){
        if(sum.a>0.99) break;
        vec3 p=ro+rd*t;
        float d=cloud(p, uCov);
        if(d>0.01){
            float dif=clamp((d - cloud(p+0.3*sun, uCov))/0.3, 0.0, 1.0);
            vec3 lin=mix(vec3(0.40,0.44,0.55), vec3(1.0,0.97,0.90), dif);
            vec4 col=vec4(lin, d);
            col.rgb*=col.a;
            sum+=col*(1.0-sum.a);
        }
        t+=max(0.15, 0.045*t);
        if(t>50.0) break;
    }
    vec3 sky=skyCol(uv);
    float sd=clamp(dot(rd,sun),0.0,1.0);
    sky += vec3(1.0,0.85,0.6)*pow(sd,16.0)*0.5;
    vec3 col=sky*(1.0-sum.a)+sum.rgb;
    col=pow(col, vec3(0.4545));
    fragColor=vec4(col,1.0);
}`;
