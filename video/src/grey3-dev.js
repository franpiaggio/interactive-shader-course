// "Chromatica" — a colour-exploration version of the morphing mandala (Sacred Flux).
// Same forms; the point here is the PALETTE. Six curated Alex-Grey-ish palettes,
// switchable live (keys 1-6 in the demo). In this render build, gPal cycles with
// time so a still at a different second shows a different palette.
export const GREY3 = `
#define TAU 6.28318530718
#define FOLDS 8.0
#define NITER 7
#define STEPS 130
#define FAR 30.0

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

int gPal;   // active palette index

// six curated palettes (IQ cosine form: a + b*cos(2pi*(c*t + d)))
vec3 palette(int idx, float t){
    vec3 a, b, c, d;
    if(idx==0){      a=vec3(0.50);            b=vec3(0.50);            c=vec3(1.0);          d=vec3(0.60,0.45,0.28); } // jewel (warm-cool)
    else if(idx==1){ a=vec3(0.50);            b=vec3(0.50);            c=vec3(1.0);          d=vec3(0.55,0.62,0.85); } // electric blue/gold
    else if(idx==2){ a=vec3(0.50);            b=vec3(0.50);            c=vec3(1.0);          d=vec3(0.80,0.92,0.30); } // oil-slick cyan/magenta
    else if(idx==3){ a=vec3(0.55,0.32,0.22);  b=vec3(0.45,0.30,0.22);  c=vec3(1.0,1.0,0.7);  d=vec3(0.00,0.12,0.22); } // fire / flesh (crimson-gold)
    else if(idx==4){ a=vec3(0.40,0.42,0.55);  b=vec3(0.32,0.34,0.42);  c=vec3(1.0);          d=vec3(0.70,0.82,0.95); } // cosmic blue/teal/violet
    else {           a=vec3(0.45,0.48,0.40);  b=vec3(0.40,0.45,0.35);  c=vec3(1.0);          d=vec3(0.30,0.48,0.62); } // emerald/gold
    return a + b*cos(TAU*(c*t + d));
}

// deepened wrapper used everywhere -> richer gemstone tones
vec3 pal(float t){
    vec3 c = clamp(palette(gPal, t), 0.0, 1.0);
    return c*c*(3.0 - 2.0*c);
}

float h31(vec3 p){ p = fract(p*0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y)*p.z); }

vec3 cosmos(vec3 rd, float t){
    vec3 c = mix(vec3(0.006,0.004,0.013), vec3(0.014,0.007,0.026), 0.5+0.5*rd.y);
    float n1 = smoothstep(0.95, -0.1, length(rd.xy - 0.30*vec2(sin(t*0.030), cos(t*0.041))));
    float n2 = smoothstep(1.05, -0.05, length(rd.xz - 0.40*vec2(cos(t*0.025), sin(t*0.034))));
    c += pal(0.10)*n1*0.035 + pal(0.62)*n2*0.028;
    for(int i=0;i<3;i++){
        float sc = 55.0 + 65.0*float(i);
        vec3 gp = rd*sc;
        vec3 id = floor(gp);
        float rnd = h31(id);
        vec3 off = (vec3(h31(id+1.7), h31(id+5.3), h31(id+9.1)) - 0.5)*0.7;
        float dpt = length(fract(gp) - 0.5 - off);
        float star = step(0.80, rnd) * smoothstep(0.09, 0.0, dpt);
        float tw = 0.5 + 0.5*sin(t*3.0 + rnd*40.0);
        c += star * tw * (1.1 - 0.28*float(i));
    }
    return c;
}

vec3 gTrap;

float map(vec3 p){
    float tm = iTime*0.22;
    p.xz *= rot(iTime*0.16);
    p.yz *= rot(0.22*sin(iTime*0.09));

    float a = atan(p.z, p.x);
    float r = length(p.xz);
    float seg = TAU/FOLDS;
    a = mod(a + seg*0.5, seg) - seg*0.5;
    a = abs(a);
    p.xz = vec2(cos(a), sin(a))*r;

    vec3  off = vec3(1.00,1.30,0.70) + 0.28*vec3(sin(tm), sin(tm*1.3+1.0), sin(tm*0.7+2.0));
    float fr  = 0.10 + 0.35*sin(tm*0.5);

    vec3 trap = vec3(1e9);
    float scale = 1.0;
    const float S = 2.0;
    for(int i=0;i<NITER;i++){
        p = abs(p);
        if(p.x<p.y) p.xy=p.yx;
        if(p.x<p.z) p.xz=p.zx;
        if(p.y<p.z) p.yz=p.zy;
        p.xy *= rot(fr);
        p = p*S - off*(S-1.0);
        trap = min(trap, abs(p));
        scale *= S;
    }
    gTrap = trap;
    vec3 q = abs(p) - vec3(1.0);
    return (min(max(q.x,max(q.y,q.z)),0.0) + length(max(q,0.0)))/scale;
}

vec3 calcNormal(vec3 p){
    const vec2 k = vec2(1.0, -1.0);
    const float e = 0.0016;
    return normalize(
        k.xyy*map(p + k.xyy*e) +
        k.yyx*map(p + k.yyx*e) +
        k.yxy*map(p + k.yxy*e) +
        k.xxx*map(p + k.xxx*e));
}

float calcAO(vec3 p, vec3 n){
    float ao = 0.0, sca = 1.0;
    for(int i=0;i<4;i++){
        float h = 0.015 + 0.16*float(i)/3.0;
        ao += (h - map(p + n*h))*sca;
        sca *= 0.7;
    }
    return clamp(1.0 - 2.2*ao, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord - 0.5*iResolution.xy)/iResolution.y;
    float t = iTime;

    gPal = int(mod(t/3.0, 6.0));               // render build: cycle palettes over time

    float az = t*0.12;
    float el = 0.22 + 0.18*sin(t*0.05);
    float camR = 5.0 + 1.0*sin(t*0.06);
    vec3 ro = camR * vec3(cos(el)*sin(az), sin(el), cos(el)*cos(az));

    vec3 fwd = normalize(vec3(0.0)-ro);
    vec3 rgt = normalize(cross(vec3(0,1,0), fwd));
    vec3 up  = cross(fwd, rgt);
    vec3 rd  = normalize(uv.x*rgt + uv.y*up + 1.25*fwd);

    float d=0.0, tt=0.0; bool hit=false; vec3 hp;
    for(int i=0;i<STEPS;i++){
        hp = ro + rd*tt;
        d  = map(hp);
        float eps = 0.0010 + 0.0009*tt;
        if(d<eps){ hit=true; break; }
        tt += d*0.55;
        if(tt>FAR) break;
    }

    vec3 col = cosmos(rd, t);

    if(hit){
        vec3 n   = calcNormal(hp);
        float ao = calcAO(hp, n);
        float fres = pow(1.0 - max(dot(n,-rd),0.0), 2.5);

        vec3 keyDir = normalize(vec3(0.4,0.7,0.5));
        float dif = max(dot(n, keyDir), 0.0);
        float amb = 0.18 + 0.20*n.y;

        float tc  = fract(gTrap.x*0.7 + gTrap.y*0.5 + gTrap.z*0.3 + 0.04*t);
        vec3 base = pal(tc);
        vec3 irid = pal(tc + 0.22 + 0.25*fres);

        col  = base * ao * (0.16*amb + 0.85*dif);
        col += irid * fres * 0.60;
        col += vec3(1.0,0.97,0.9) * pow(fres,5.0) * 0.18;
        col += base * 0.05;
    }

    col = col/(1.0+col);
    col = pow(col, vec3(0.4545));
    col *= 1.0 - 0.45*dot(uv,uv);
    fragColor = vec4(col, 1.0);
}
`;
