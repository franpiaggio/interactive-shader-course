import * as THREE from 'three';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {useRef, useLayoutEffect} from 'react';

// Shows the literal starting point of every shader: ONE quad = 4 vertices = 2 triangles,
// which we then PAINT with a fragment shader (uv gradient), then flatten to "the screen".
// Frame-driven for deterministic Remotion renders.
export const ThreeQuad = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const ref = useRef(null);
  const st = useRef(null);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    if (!st.current) {
      const renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true});
      renderer.setSize(width, height, false);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0c0e15');
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

      const group = new THREE.Group();
      const geo = new THREE.PlaneGeometry(2, 2, 1, 1); // 4 verts, 2 triangles

      // painted face: a uv gradient (the fragment shader "painting" the geometry)
      const fillMat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {uOpacity: {value: 0}, uTime: {value: 0}},
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform float uOpacity; uniform float uTime;
          void main(){ vec3 c=vec3(vUv, 0.5+0.5*sin(uTime)); gl_FragColor=vec4(c, uOpacity); }`,
      });
      const fill = new THREE.Mesh(geo, fillMat);

      // the 2 triangles as wireframe (incl. the shared diagonal edge)
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        new THREE.LineBasicMaterial({color: 0xffd9a0, transparent: true})
      );
      // the 4 corner vertices as dots
      const dots = new THREE.Points(
        geo, new THREE.PointsMaterial({color: 0xe6885f, size: 0.10})
      );

      group.add(fill, wire, dots);
      scene.add(group);
      st.current = {renderer, scene, camera, group, fillMat, wire, dots};
    }

    const {renderer, scene, camera, group, fillMat, wire, dots} = st.current;
    const p = (a, b) => interpolate(frame, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const tilt = 1 - p(dur * 0.62, dur * 0.92);      // 1 = tilted in 3D, 0 = facing camera
    const paint = p(dur * 0.30, dur * 0.55);          // fill (paint) fades in
    const t = frame / fps;

    group.rotation.y = (-0.6 + 0.12 * Math.sin(t * 0.6)) * tilt;
    group.rotation.x = (-0.32) * tilt;
    const s = 1 + 0.92 * (1 - tilt);                  // grow to fill the frame as it faces us
    group.scale.setScalar(s);
    camera.position.set(0, 0, 4.2 - 1.2 * (1 - tilt));
    camera.lookAt(0, 0, 0);

    fillMat.uniforms.uOpacity.value = paint;
    fillMat.uniforms.uTime.value = t;
    wire.material.opacity = 0.35 + 0.65 * tilt;       // wireframe fades a bit once painted/flat
    dots.material.opacity = tilt;
    dots.visible = tilt > 0.02;

    renderer.render(scene, camera);
  }, [frame, dur, fps, width, height]);

  return <canvas ref={ref} width={width} height={height} style={{width: '100%', height: '100%', display: 'block'}} />;
};
