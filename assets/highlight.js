/* ============================================================
   highlight.js — tiny, dependency-free syntax highlighter for the
   static <pre><code> showcase blocks (GLSL / JS-ish). No CDN.
   Tokenizes and wraps tokens in <span class="tok-*"> so lesson.css
   can colour them. Idempotent (won't re-process a block).
   ============================================================ */

const KW = new Set([
  'if','else','for','while','do','return','break','continue','switch','case','default',
  'in','out','inout','const','void','struct','discard','uniform','varying','attribute',
  'precision','highp','mediump','lowp','true','false','define','version','include',
  'let','var','function','new','of','export','import','async','await','this',
]);
const TY = new Set([
  'float','int','uint','bool','vec2','vec3','vec4','ivec2','ivec3','ivec4',
  'bvec2','bvec3','bvec4','mat2','mat3','mat4','sampler2D','samplerCube','double',
]);
const BI = new Set([
  'iResolution','iTime','iMouse','iFrame','iDate','iChannel0','iChannelTime',
  'gl_FragCoord','gl_Position','gl_FragColor','mainImage','fragColor','fragCoord',
]);

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlight(code) {
  // 1 comment · 2 string · 3 preprocessor · 4 number · 5 identifier · 6 anything else
  const RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(#[A-Za-z]+)|(\b\d[\d.]*(?:[eE][+-]?\d+)?[fuFU]?\b)|([A-Za-z_]\w*)|([\s\S])/g;
  let out = '', m;
  while ((m = RE.exec(code))) {
    if (m[1])      out += `<span class="tok-com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="tok-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="tok-kw">${esc(m[3])}</span>`;
    else if (m[4]) out += `<span class="tok-num">${esc(m[4])}</span>`;
    else if (m[5]) {
      const id = m[5], after = code[RE.lastIndex];
      let cls = '';
      if (KW.has(id)) cls = 'tok-kw';
      else if (TY.has(id)) cls = 'tok-typ';
      else if (after === '(') cls = 'tok-fn';
      else if (BI.has(id)) cls = 'tok-bi';
      out += cls ? `<span class="${cls}">${esc(id)}</span>` : esc(id);
    } else out += esc(m[6]);
  }
  return out;
}

export function highlightAll(root = document) {
  root.querySelectorAll('pre code, pre.code').forEach((el) => {
    if (el.dataset.hl) return;
    el.dataset.hl = '1';
    el.innerHTML = highlight(el.textContent);
  });
}

if (document.readyState !== 'loading') highlightAll();
else addEventListener('DOMContentLoaded', () => highlightAll());
