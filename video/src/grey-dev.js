// "Inner Lattice" — an ORIGINAL shader that evokes Alex Grey.
// We FLY THROUGH an endless fractal cathedral: mandala-symmetric KIFS "gates"
// repeated down a corridor, with a clear central tube so the camera always has a
// path. The fractal MUTATES as we travel (KIFS params drift with distance), it's
// lit like warm copper bas-relief (diffuse + ambient occlusion, not neon), and the
// frame stays full of fractal receding into warm darkness — no flat black.
export const GREY = `
#define TAU 6.28318530718
#define FOLDS 6.0      // mandala symmetry order (lower -> rounder, less star-like)
#define NITER 5        // KIFS iterations (fewer -> bolder forms, less fine texture, less aliasing)
#define STEPS 150       // moderate budget; far pop-in is masked by fog, not brute steps
#define FAR 48.0        // render distance
#define CELL 3.6       // spacing between gates down the corridor (closer = denser rhythm)
#define SPEED 2.4      // how fast we fly

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

// smooth max -> rounded intersections give the walls body/volume (not razor edges)
float smax(float a, float b, float k){
    float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
    return mix(b, a, h) + k*h*(1.0-h);
}

vec3 gTrap;            // orbit trap (kept for subtle hue variation)

float map(vec3 p){
    float r  = length(p.xy);                 // radial distance (for the central tube)
    float wz = p.z;                          // continuous world z -> drives the mutation
    float a0 = atan(p.y, p.x);               // original angle (for the wall relief)

    // --- endless corridor: repeat the gate down the travel axis ---
    p.z = mod(p.z + CELL*0.5, CELL) - CELL*0.5;

    // --- mandala symmetry: fold the angle into FOLDS mirrored wedges ---
    float a = atan(p.y, p.x);
    float seg = TAU/FOLDS;
    a = mod(a + seg*0.5, seg) - seg*0.5;
    a = abs(a);
    p.xy = vec2(cos(a), sin(a))*r;           // isometric reflection -> DE stays valid

    // --- the fractal MUTATES along the journey: KIFS params drift with distance ---
    float mut = wz*0.020;
    vec3  off = vec3(1.00,1.25,0.70) + 0.18*vec3(sin(mut), cos(mut*0.8), sin(mut*1.3+1.0));
    float fr  = 0.05 + 0.10*sin(mut*0.6);

    // --- octahedral KIFS: folds the gate into fractal cathedral tracery ---
    vec3 trap = vec3(1e9);
    float scale = 1.0;
    const float S = 2.00;                    // bigger step per fold -> chunkier, blockier forms
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
    float gate = (length(p) - 1.0)/scale;

    // carve the central flight tube. The wall steps in and out in broad TERRACES
    // along the corridor (ancient-temple tiers). Smooth sine (NO fract) so there is
    // no derivative seam for the marcher to overshoot -> no flicker in the rings.
    float terrace = 0.08*(0.5 + 0.5*sin(wz*1.6));   // smooth periodic tiers (gentler reveal)
    float swell   = 0.040*sin(wz*0.5);              // gentle breathing width
    float tube = (0.44 + terrace + swell) - r;      // >0 inside the tube => empty space
    return smax(gate, tube, 0.07);
}

// 4-tap tetrahedron normal (2 fewer map() calls than the 6-tap version)
vec3 calcNormal(vec3 p){
    const vec2 k = vec2(1.0, -1.0);
    const float e = 0.0015;
    return normalize(
        k.xyy*map(p + k.xyy*e) +
        k.yyx*map(p + k.yyx*e) +
        k.yxy*map(p + k.yxy*e) +
        k.xxx*map(p + k.xxx*e));
}

// cheap ambient occlusion (IQ): darkens the deep crevices -> bas-relief look
float calcAO(vec3 p, vec3 n){
    float ao = 0.0, sca = 1.0;
    for(int i=0;i<4;i++){                    // 4 taps (was 5)
        float h = 0.015 + 0.15*float(i)/3.0;
        float d = map(p + n*h);
        ao += (h - d)*sca;
        sca *= 0.7;
    }
    return clamp(1.0 - 2.4*ao, 0.0, 1.0);    // stronger -> deep crevices go near-black
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord - 0.5*iResolution.xy)/iResolution.y;
    float t = iTime;

    // --- camera flies forward down the corridor, swaying gently to navigate ---
    vec3 ro = vec3(0.22*sin(t*0.40), 0.16*sin(t*0.33), t*SPEED);
    vec3 ta = vec3(0.22*sin((t+0.7)*0.40), 0.16*sin((t+0.7)*0.33), ro.z + 3.0);

    vec3 fwd = normalize(ta - ro);
    vec3 rgt = normalize(cross(vec3(0,1,0), fwd));
    vec3 up  = cross(fwd, rgt);
    vec2 m = (iMouse.z>0.5) ? (iMouse.xy/iResolution.xy-0.5) : vec2(0.0);
    fwd = normalize(fwd + 1.1*m.x*rgt + 1.1*m.y*up);
    rgt = normalize(cross(vec3(0,1,0), fwd));
    up  = cross(fwd, rgt);
    float roll = 0.22*sin(t*0.18);
    vec3 upr  = up*cos(roll) + rgt*sin(roll);
    vec3 rgtr = rgt*cos(roll) - up*sin(roll);
    vec3 rd = normalize(uv.x*rgtr + uv.y*upr + 1.3*fwd);

    // warm hue drift along the journey, kept inside the copper/amber family
    float journey = ro.z*0.012;
    vec3 hueLo = mix(vec3(0.85,0.16,0.06), vec3(0.80,0.10,0.14), 0.5+0.5*sin(journey));      // deep crimson/copper
    vec3 hueHi = mix(vec3(1.00,0.62,0.26), vec3(1.00,0.74,0.40), 0.5+0.5*sin(journey*0.8));  // amber/gold

    // --- march --- adaptive (cone) epsilon: far surfaces need a looser hit test,
    // which kills the grazing-angle speckle on the tube wall.
    float d=0.0, tt=0.0; bool hit=false; vec3 hp;
    for(int i=0;i<STEPS;i++){
        hp = ro + rd*tt;
        d  = map(hp);
        float eps = 0.0009 + 0.0007*tt;       // tighter -> crisper contours
        if(d<eps){ hit=true; break; }
        tt += d*0.45;                         // safer step -> no overshoot flicker deep in the rings
        if(tt>FAR) break;
    }

    // warm near-black base (NOT pure black): structure recedes into this
    vec3 col = vec3(0.030, 0.009, 0.005);

    if(hit){
        vec3 n   = calcNormal(hp);
        float ao = calcAO(hp, n);

        vec3 keyDir = normalize(vec3(0.45, 0.65, 0.45));   // warm key light
        float dif   = max(dot(n, keyDir), 0.0);
        float amb   = 0.18 + 0.18*n.y;                     // dim sky fill (low -> high contrast)
        float fres  = pow(1.0 - max(dot(n,-rd),0.0), 3.0);

        // luminance of the relief: occlusion gates everything (deep folds go near-black)
        float v = ao*(0.22*amb + 1.35*dif) + 0.28*fres*ao;
        v *= v*(1.7 - 0.7*v);                              // contrast curve: crush darks, lift edges

        // copper bas-relief ramp: dark crimson -> amber by brightness
        vec3 base = mix(hueLo, hueHi, smoothstep(0.05, 0.95, v)) * v;

        // a faint warm specular sheen (the "wet" Grey lacquer look)
        vec3 h = normalize(keyDir - rd);
        base += vec3(1.0,0.72,0.40) * pow(max(dot(n,h),0.0), 42.0) * ao * 0.35;

        col = base;
    }

    // depth fog into warm darkness. A bit denser so far surfaces are already deep in
    // haze by the time the step budget reaches them -> reveals emerge softly, no pop.
    vec3 fogCol = vec3(0.035, 0.010, 0.006);
    col = mix(col, fogCol, 1.0 - exp(-tt*0.052));

    // a faint warm ember toward the vanishing point (depth cue, very contained)
    col += hueHi * 0.04 * exp(-dot(uv,uv)*4.5);

    // tonemap + gamma
    col = col/(1.0+col);
    col = pow(col, vec3(0.4545));

    // vignette
    col *= 1.0 - 0.5*dot(uv,uv);

    fragColor = vec4(col, 1.0);
}
`;
