import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useRef, useLayoutEffect} from 'react';

const VERT = `#version 300 es
in vec2 aPos; void main(){ gl_Position=vec4(aPos,0.0,1.0); }`;

const PRE = `#version 300 es
precision highp float;
uniform vec3  iResolution;
uniform float iTime;
uniform vec4  iMouse;
out vec4 _fragColor;
`;
const POST = `
void main(){ mainImage(_fragColor, gl_FragCoord.xy); }`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('shader compile error:\n' + gl.getShaderInfoLog(s));
  }
  return s;
}

// Renders a Shadertoy-style fragment shader, driven deterministically by the
// frame counter (iTime = frame / fps). Optional `uniforms` = { name: number }
// are declared as `uniform float name;` and updated every frame.
export const Shader = ({source, uniforms}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const canvasRef = useRef(null);
  const state = useRef(null);
  const uniRef = useRef(uniforms || {});
  uniRef.current = uniforms || {};

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!state.current || state.current.source !== source) {
      const gl = canvas.getContext('webgl2', {antialias: false, preserveDrawingBuffer: true});
      const names = Object.keys(uniRef.current);
      const decls = names.map((n) => `uniform float ${n};`).join('\n');
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, PRE + decls + '\n' + source + POST));
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error('link error:\n' + gl.getProgramInfoLog(p));
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.useProgram(p);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const custom = {};
      names.forEach((n) => { custom[n] = gl.getUniformLocation(p, n); });
      state.current = {
        gl, p, source, custom,
        iRes: gl.getUniformLocation(p, 'iResolution'),
        iTime: gl.getUniformLocation(p, 'iTime'),
        iMouse: gl.getUniformLocation(p, 'iMouse'),
      };
    }

    const {gl, p, iRes, iTime, iMouse, custom} = state.current;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(p);
    gl.uniform3f(iRes, canvas.width, canvas.height, 1);
    gl.uniform1f(iTime, frame / fps);
    gl.uniform4f(iMouse, 0, 0, 0, 0);
    for (const n in custom) gl.uniform1f(custom[n], uniRef.current[n] ?? 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }, [frame, source, fps]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{width: '100%', height: '100%', display: 'block'}}
    />
  );
};
