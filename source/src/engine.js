// =====================================================================
// engine.js — 軽量WebGLエンジン（外部ライブラリ不要）
// =====================================================================
const PI = Math.PI, TAU = Math.PI * 2, DEG = Math.PI / 180;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));
const wrapAngle = a => { while (a > PI) a -= TAU; while (a < -PI) a += TAU; return a; };
function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
function rgbToHex(c) { return '#' + c.map(v => ('0' + Math.round(clamp(v, 0, 1) * 255).toString(16)).slice(-2)).join(''); }
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const scalec = (a, s) => [a[0] * s, a[1] * s, a[2] * s];

// ---------------- 行列（列優先） ----------------
const M4 = {
  create() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  perspective(o, fovy, asp, n, f) { const t = 1 / Math.tan(fovy / 2); o.fill(0); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; },
  lookAt(o, ex, ey, ez, tx, ty, tz) {
    let zx = ex - tx, zy = ey - ty, zz = ez - tz; let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    let xx = zz, xy = 0, xz = -zx; l = Math.hypot(xx, xz) || 1e-6; xx /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0; o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0; o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
    o[12] = -(xx * ex + xy * ey + xz * ez); o[13] = -(yx * ex + yy * ey + yz * ez); o[14] = -(zx * ex + zy * ey + zz * ez); o[15] = 1; return o;
  },
  multiply(o, a, b) {
    const r = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let w = 0; w < 4; w++) r[c * 4 + w] = a[w] * b[c * 4] + a[4 + w] * b[c * 4 + 1] + a[8 + w] * b[c * 4 + 2] + a[12 + w] * b[c * 4 + 3];
    o.set(r); return o;
  },
  // R = Ry(yaw) * Rx(pitch) * Rz(roll)
  fromTRS(o, px, py, pz, yaw, pitch, roll, s) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch), cz = Math.cos(roll), sz = Math.sin(roll);
    o[0] = (cy * cz + sy * sx * sz) * s; o[1] = (cx * sz) * s; o[2] = (-sy * cz + cy * sx * sz) * s; o[3] = 0;
    o[4] = (-cy * sz + sy * sx * cz) * s; o[5] = (cx * cz) * s; o[6] = (sy * sz + cy * sx * cz) * s; o[7] = 0;
    o[8] = (sy * cx) * s; o[9] = (-sx) * s; o[10] = (cy * cx) * s; o[11] = 0;
    o[12] = px; o[13] = py; o[14] = pz; o[15] = 1; return o;
  },
  invert(o, a) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!det) return null; det = 1 / det;
    o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det; o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det; o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det; o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det; o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det; return o;
  }
};

// ---------------- ジオメトリビルダー ----------------
// 頂点: pos3 nor3 col3 ext2(emissive, sunVis) uv2 = 13 floats
const VSTRIDE = 13;
class GB {
  constructor() { this.a = []; this.e = 0; this.s = 1; this.minY = 1e9; }
  v(x, y, z, nx, ny, nz, c, u = 0, w = 0) { this.a.push(x, y, z, nx, ny, nz, c[0], c[1], c[2], this.e, this.s, u, w); }
  tri(p0, p1, p2, c, uv) {
    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2], vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    uv = uv || [0, 0, 0, 0, 0, 0];
    this.v(p0[0], p0[1], p0[2], nx, ny, nz, c, uv[0], uv[1]); this.v(p1[0], p1[1], p1[2], nx, ny, nz, c, uv[2], uv[3]); this.v(p2[0], p2[1], p2[2], nx, ny, nz, c, uv[4], uv[5]);
  }
  quad(p0, p1, p2, p3, c, uv) { // p0..p3 反時計回り
    if (uv) { this.tri(p0, p1, p2, c, [uv[0], uv[1], uv[2], uv[3], uv[4], uv[5]]); this.tri(p0, p2, p3, c, [uv[0], uv[1], uv[4], uv[5], uv[6], uv[7]]); }
    else { this.tri(p0, p1, p2, c); this.tri(p0, p2, p3, c); }
  }
  // 中心・サイズ・Y回転のボックス
  box(cx, cy, cz, sx, sy, sz, c, yaw = 0, top = null) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2, co = Math.cos(yaw), si = Math.sin(yaw);
    const P = (x, y, z) => [cx + x * co + z * si, cy + y, cz - x * si + z * co];
    const p = [P(-hx, -hy, -hz), P(hx, -hy, -hz), P(hx, hy, -hz), P(-hx, hy, -hz), P(-hx, -hy, hz), P(hx, -hy, hz), P(hx, hy, hz), P(-hx, hy, hz)];
    const t = top || c;
    this.quad(p[0], p[3], p[2], p[1], c); this.quad(p[4], p[5], p[6], p[7], c);
    this.quad(p[0], p[4], p[7], p[3], c); this.quad(p[1], p[2], p[6], p[5], c);
    this.quad(p[3], p[7], p[6], p[2], t); this.quad(p[0], p[1], p[5], p[4], c);
  }
  // 任意の8頂点ボックス（テーパー用）: bottom 4 (ccw from top view), top 4
  hexa(p, c) {
    this.quad(p[0], p[3], p[2], p[1], c); this.quad(p[4], p[5], p[6], p[7], c);
    this.quad(p[0], p[1], p[5], p[4], c); this.quad(p[1], p[2], p[6], p[5], c); this.quad(p[2], p[3], p[7], p[6], c); this.quad(p[3], p[0], p[4], p[7], c);
  }
  // X軸方向シリンダー（ホイール用）
  cylX(cx, cy, cz, r, len, seg, c, caps = true, capC = null) {
    const h = len / 2;
    for (let i = 0; i < seg; i++) {
      const a0 = i / seg * TAU, a1 = (i + 1) / seg * TAU;
      const y0 = Math.cos(a0) * r, z0 = Math.sin(a0) * r, y1 = Math.cos(a1) * r, z1 = Math.sin(a1) * r;
      const n0 = [0, Math.cos(a0), Math.sin(a0)], n1 = [0, Math.cos(a1), Math.sin(a1)];
      this.v(cx - h, cy + y0, cz + z0, ...n0, c); this.v(cx + h, cy + y0, cz + z0, ...n0, c); this.v(cx + h, cy + y1, cz + z1, ...n1, c);
      this.v(cx - h, cy + y0, cz + z0, ...n0, c); this.v(cx + h, cy + y1, cz + z1, ...n1, c); this.v(cx - h, cy + y1, cz + z1, ...n1, c);
      if (caps) {
        const cc = capC || c;
        this.tri([cx + h, cy, cz], [cx + h, cy + y0, cz + z0], [cx + h, cy + y1, cz + z1], cc);
        this.tri([cx - h, cy, cz], [cx - h, cy + y1, cz + z1], [cx - h, cy + y0, cz + z0], cc);
      }
    }
  }
  // Y軸シリンダー / コーン
  cylY(cx, cy, cz, r0, r1, h, seg, c, capTop = true) {
    for (let i = 0; i < seg; i++) {
      const a0 = i / seg * TAU, a1 = (i + 1) / seg * TAU, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const ny = (r0 - r1) / h;
      const b0 = [cx + c0 * r0, cy, cz + s0 * r0], b1 = [cx + c1 * r0, cy, cz + s1 * r0], t0 = [cx + c0 * r1, cy + h, cz + s0 * r1], t1 = [cx + c1 * r1, cy + h, cz + s1 * r1];
      const n0 = [c0, ny, s0], n1 = [c1, ny, s1];
      this.v(...b0, ...n0, c); this.v(...t1, ...n1, c); this.v(...b1, ...n1, c);
      this.v(...b0, ...n0, c); this.v(...t0, ...n0, c); this.v(...t1, ...n1, c);
      if (capTop && r1 > 0) this.tri([cx, cy + h, cz], t1, t0, c);
    }
  }
  sphere(cx, cy, cz, r, c, seg = 6) {
    for (let i = 0; i < seg; i++) for (let j = 0; j < seg * 2; j++) {
      const P = (ii, jj) => { const t = ii / seg * PI, p = jj / (seg * 2) * TAU; return [Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)]; };
      const a = P(i, j), b = P(i + 1, j), d = P(i + 1, j + 1), e = P(i, j + 1);
      const S = n => [cx + n[0] * r, cy + n[1] * r, cz + n[2] * r];
      this.v(...S(a), ...a, c); this.v(...S(d), ...d, c); this.v(...S(b), ...b, c);
      this.v(...S(a), ...a, c); this.v(...S(e), ...e, c); this.v(...S(d), ...d, c);
    }
  }
  // 側面プロファイル（z,y点列）をX方向に押し出し。capsはUV(livery)付き
  extrude(pts, x0, x1, c, L, H, z0, sideOnly = null) {
    const tris = earClip(pts);
    // 左側 (+X)  u = 1 - (z - z0)/L で文字が正しく読める
    if (sideOnly !== 'walls') {
      for (const [i, j, k] of tris) {
        const A = pts[i], B = pts[j], C = pts[k];
        const uv = s => s > 0 ? [1 - (A[0] - z0) / L, A[1] / H, 1 - (B[0] - z0) / L, B[1] / H, 1 - (C[0] - z0) / L, C[1] / H]
          : [(A[0] - z0) / L, A[1] / H, (B[0] - z0) / L, B[1] / H, (C[0] - z0) / L, C[1] / H];
        // +X side: normal +X
        this.triN([x1, A[1], A[0]], [x1, C[1], C[0]], [x1, B[1], B[0]], [1, 0, 0], c, reorder(uv(1)));
        this.triN([x0, A[1], A[0]], [x0, B[1], B[0]], [x0, C[1], C[0]], [-1, 0, 0], c, uv(-1));
      }
    }
    if (sideOnly !== 'caps') {
      const n = pts.length, area = polyArea(pts);
      for (let i = 0; i < n; i++) {
        const A = pts[i], B = pts[(i + 1) % n];
        let nz = (B[1] - A[1]), ny = -(B[0] - A[0]); if (area < 0) { nz = -nz; ny = -ny; }
        const l = Math.hypot(nz, ny) || 1; nz /= l; ny /= l;
        const p0 = [x0, A[1], A[0]], p1 = [x1, A[1], A[0]], p2 = [x1, B[1], B[0]], p3 = [x0, B[1], B[0]];
        this.v(...p0, 0, ny, nz, c); this.v(...p1, 0, ny, nz, c); this.v(...p2, 0, ny, nz, c);
        this.v(...p0, 0, ny, nz, c); this.v(...p2, 0, ny, nz, c); this.v(...p3, 0, ny, nz, c);
      }
    }
    function reorder(u) { return [u[0], u[1], u[4], u[5], u[2], u[3]]; }
  }
  triN(p0, p1, p2, n, c, uv) { uv = uv || [0, 0, 0, 0, 0, 0]; this.v(...p0, ...n, c, uv[0], uv[1]); this.v(...p1, ...n, c, uv[2], uv[3]); this.v(...p2, ...n, c, uv[4], uv[5]); }
  get count() { return this.a.length / VSTRIDE; }
}
function polyArea(p) { let a = 0; for (let i = 0; i < p.length; i++) { const j = (i + 1) % p.length; a += p[i][0] * p[j][1] - p[j][0] * p[i][1]; } return a / 2; }
function earClip(pts) {
  const n = pts.length; const idx = [...Array(n).keys()]; if (polyArea(pts) < 0) idx.reverse();
  const out = []; let guard = 0;
  const inside = (p, a, b, c) => { const s = (u, v, w) => (u[0] - w[0]) * (v[1] - w[1]) - (v[0] - w[0]) * (u[1] - w[1]); const d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
  while (idx.length > 3 && guard++ < 1000) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const a = pts[idx[(i + idx.length - 1) % idx.length]], b = pts[idx[i]], c = pts[idx[(i + 1) % idx.length]];
      const cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); if (cr <= 1e-9) continue;
      let ok = true; for (const k of idx) { const p = pts[k]; if (p === a || p === b || p === c) continue; if (inside(p, a, b, c)) { ok = false; break; } }
      if (!ok) continue;
      out.push([idx[(i + idx.length - 1) % idx.length], idx[i], idx[(i + 1) % idx.length]]); idx.splice(i, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}

// ---------------- シェーダー ----------------
const LIT_VS = `
attribute vec3 aPos; attribute vec3 aNor; attribute vec3 aCol; attribute vec2 aExt; attribute vec2 aUV;
uniform mat4 uVP; uniform mat4 uModel;
varying vec3 vW; varying vec3 vN; varying vec3 vC; varying vec2 vE; varying vec2 vUV;
void main(){ vec4 w=uModel*vec4(aPos,1.0); vW=w.xyz; vN=mat3(uModel)*aNor; vC=aCol; vE=aExt; vUV=aUV; gl_Position=uVP*w; }`;
const LIT_FS = `
precision highp float;
varying vec3 vW; varying vec3 vN; varying vec3 vC; varying vec2 vE; varying vec2 vUV;
uniform vec3 uCam,uSunDir,uSunCol,uSkyCol,uGroundCol,uFogCol,uZenith,uHorizon,uTint;
uniform float uFogDen,uEmis,uRefl,uSpec,uShin,uAlpha,uTexMode,uNight,uSunScale,uWet;
uniform sampler2D uTex;
uniform vec4 uPL[8]; uniform vec3 uPLC[8];
uniform vec3 uSpotPos,uSpotDir,uSpotCol; uniform vec3 uSpot2Pos;
vec3 sky(vec3 d){ float t=clamp(d.y,0.0,1.0); vec3 c=mix(uHorizon,uZenith,pow(t,0.55)); if(d.y<0.0) c=mix(uHorizon,uGroundCol*0.8,clamp(-d.y*4.0,0.0,1.0)); return c; }
void main(){
  vec3 N=normalize(vN); vec3 V=normalize(uCam-vW); if(dot(N,V)<0.0) N=-N;
  vec3 base=vC*uTint; float em=vE.x*uEmis; vec3 add=vec3(0.0);
  if(uTexMode>0.5){ vec4 t=texture2D(uTex,vUV); if(uTexMode>2.5){ if(t.a<0.5) discard; base=t.rgb*uTint; } else if(uTexMode<1.5){ base=t.rgb*uTint; } else { base*=t.rgb; add+=vec3(1.0,0.82,0.5)*(1.0-t.a)*2.0*uNight; } }
  float sv=vE.y*uSunScale;
  vec3 L=mix(uGroundCol,uSkyCol,N.y*0.5+0.5)*(0.35+0.65*vE.y) + uSunCol*max(dot(N,uSunDir),0.0)*sv;
  for(int i=0;i<8;i++){ vec3 d=uPL[i].xyz-vW; float dist=length(d)+0.001; float att=clamp(1.0-dist/uPL[i].w,0.0,1.0); att*=att; L+=uPLC[i]*att*(max(dot(N,d/dist),0.0)*0.75+0.25); }
  for(int k=0;k<2;k++){ vec3 sp = k==0?uSpotPos:uSpot2Pos; vec3 d=sp-vW; float dist=length(d)+0.001; vec3 ld=d/dist; float cs=dot(-ld,uSpotDir); float cone=smoothstep(0.80,0.95,cs); float att=cone/(1.0+dist*dist*0.0035); L+=uSpotCol*att*(max(dot(N,ld),0.0)*0.8+0.2); }
  vec3 col=base*L;
  vec3 H=normalize(uSunDir+V); col+=uSunCol*pow(max(dot(N,H),0.0),uShin)*uSpec*sv;
  float refl=uRefl+uWet*step(0.9,N.y)*0.0;
  if(refl>0.0){ vec3 R=reflect(-V,N); float fr=0.04+0.96*pow(1.0-max(dot(N,V),0.0),5.0); vec3 env=sky(R);
     env+=uSpotCol*0.0; col=mix(col, env*1.05, clamp(refl*(0.3+fr),0.0,0.95)); }
  col+=base*em*2.2+add;
  float fd=length(uCam-vW); float f=1.0-exp(-fd*uFogDen);
  col=mix(col,uFogCol,clamp(f,0.0,1.0));
  gl_FragColor=vec4(col,uAlpha);
}`;
const PT_VS = `
attribute vec3 aPos; attribute float aSize; attribute vec4 aCol;
uniform mat4 uVP; uniform float uScale; uniform vec3 uCam;
varying vec4 vC; varying float vD;
void main(){ vec4 p=uVP*vec4(aPos,1.0); gl_Position=p; float d=max(length(aPos-uCam),0.5); vD=d; gl_PointSize=clamp(aSize*uScale/d,1.0,256.0); vC=aCol; }`;
const PT_FS = `
precision mediump float; varying vec4 vC; varying float vD; uniform vec3 uFogCol; uniform float uFogDen; uniform float uSoft;
void main(){ vec2 c=gl_PointCoord-0.5; float r=length(c); if(r>0.5) discard; float a = uSoft>0.5 ? smoothstep(0.5,0.0,r) : (r<0.35?1.0:smoothstep(0.5,0.35,r));
  float f=clamp(1.0-exp(-vD*uFogDen),0.0,1.0); vec3 col = mix(vC.rgb, uFogCol, f*0.85);
  gl_FragColor=vec4(col, vC.a*a*(1.0-f*0.6)); }`;
const SKY_VS = `attribute vec2 aPos; varying vec2 vP; void main(){ vP=aPos; gl_Position=vec4(aPos,0.9999,1.0); }`;
const SKY_FS = `
precision highp float; varying vec2 vP; uniform mat4 uInvVP; uniform vec3 uCam,uZenith,uHorizon,uSunDir,uSunCol,uGroundCol,uFogCol; uniform float uStars,uFogMix;
float h(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
void main(){ vec4 a=uInvVP*vec4(vP,1.0,1.0); vec3 d=normalize(a.xyz/a.w-uCam);
  float t=clamp(d.y,0.0,1.0); vec3 c=mix(uHorizon,uZenith,pow(t,0.55));
  if(d.y<0.0) c=mix(uHorizon,uGroundCol*0.8,clamp(-d.y*4.0,0.0,1.0));
  float s=max(dot(d,uSunDir),0.0); c+=uSunCol*(pow(s,800.0)*4.0+pow(s,12.0)*0.25)*(1.0-uStars*0.5);
  if(uStars>0.0 && d.y>0.0){ vec3 q=floor(d*300.0); float st=step(0.9975,h(q)); c+=vec3(st)*uStars*t; }
  c=mix(c,uFogCol,uFogMix*(1.0-t*0.7));
  gl_FragColor=vec4(c,1.0); }`;

function compile(gl, vs, fs) {
  const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
  const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); const nm = info.name.replace('[0]', ''); u[nm] = gl.getUniformLocation(p, info.name); }
  const at = {}; const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < na; i++) { const info = gl.getActiveAttrib(p, i); at[info.name] = gl.getAttribLocation(p, info.name); }
  return { p, u, at };
}

class Mesh {
  constructor(gl, data) {
    this.gl = gl; this.count = data.length / VSTRIDE; this.buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, data instanceof Float32Array ? data : new Float32Array(data), gl.STATIC_DRAW);
    let cx = 0, cy = 0, cz = 0; const n = this.count || 1;
    let mnx = 1e9, mny = 1e9, mnz = 1e9, mxx = -1e9, mxy = -1e9, mxz = -1e9;
    for (let i = 0; i < data.length; i += VSTRIDE) { const x = data[i], y = data[i + 1], z = data[i + 2]; if (x < mnx) mnx = x; if (x > mxx) mxx = x; if (y < mny) mny = y; if (y > mxy) mxy = y; if (z < mnz) mnz = z; if (z > mxz) mxz = z; }
    cx = (mnx + mxx) / 2; cy = (mny + mxy) / 2; cz = (mnz + mxz) / 2;
    this.center = [cx, cy, cz]; this.radius = Math.hypot(mxx - cx, mxy - cy, mxz - cz);
  }
  dispose() { this.gl.deleteBuffer(this.buf); }
}

function Mat(o = {}) { return Object.assign({ tint: [1, 1, 1], emis: 1, refl: 0, spec: 0.15, shin: 24, alpha: 1, tex: null, texMode: 0, sunScale: 1, blend: false, depthWrite: true, night: 0 }, o); }

class Node {
  constructor() { this.pos = [0, 0, 0]; this.rot = [0, 0, 0]; this.scale = 1; this.children = []; this.parts = []; this.visible = true; this.local = M4.create(); this.world = M4.create(); }
  add(c) { this.children.push(c); return c; }
  addMesh(mesh, mat) { this.parts.push({ mesh, mat }); return this; }
  update(parentWorld) {
    M4.fromTRS(this.local, this.pos[0], this.pos[1], this.pos[2], this.rot[0], this.rot[1], this.rot[2], this.scale);
    if (parentWorld) M4.multiply(this.world, parentWorld, this.local); else this.world.set(this.local);
    for (const c of this.children) c.update(this.world);
  }
}

// ---------------- パーティクル ----------------
class Particles {
  constructor(gl, max, additive = false, soft = true) {
    this.gl = gl; this.max = max; this.add = additive; this.soft = soft; this.n = 0;
    this.data = new Float32Array(max * 8); // pos3 size1 col4
    this.p = []; // CPU sim: {x,y,z,vx,vy,vz,life,max,size,grow,r,g,b,a}
    this.buf = gl.createBuffer(); this.head = 0;
  }
  spawn(o) {
    if (this.p.length < this.max) this.p.push(o); else { this.p[this.head] = o; this.head = (this.head + 1) % this.max; }
  }
  update(dt, gravity = 0) {
    const P = this.p; let w = 0;
    for (let i = 0; i < P.length; i++) {
      const q = P[i]; q.life += dt; if (q.life >= q.max) continue;
      q.vy += gravity * (q.grav || 0) * dt; const dr = q.drag || 0; if (dr) { const k = Math.exp(-dr * dt); q.vx *= k; q.vy *= k; q.vz *= k; }
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; P[w++] = q;
    }
    P.length = w; if (this.head >= w) this.head = 0;
  }
  upload() {
    const P = this.p, d = this.data; let n = 0;
    for (const q of P) {
      const t = q.life / q.max; const o = n * 8;
      d[o] = q.x; d[o + 1] = q.y; d[o + 2] = q.z; d[o + 3] = q.size + q.grow * q.life;
      const fade = q.fadeIn ? Math.min(1, t * 6) * (1 - t) : (1 - t);
      d[o + 4] = q.r; d[o + 5] = q.g; d[o + 6] = q.b; d[o + 7] = q.a * fade; n++;
    }
    this.n = n; const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, d.subarray(0, n * 8), gl.DYNAMIC_DRAW);
  }
  clear() { this.p.length = 0; this.n = 0; }
}
// 静的グロー（街灯など）
class StaticPoints {
  constructor(gl, arr) { this.gl = gl; this.n = arr.length / 8; this.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); this.add = true; this.soft = true; }
  dispose() { this.gl.deleteBuffer(this.buf); }
}

// ---------------- レンダラー ----------------
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    const opts = { antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
    if (!gl) throw new Error('WebGLが利用できません');
    this.gl = gl;
    this.lit = compile(gl, LIT_VS, LIT_FS); this.pt = compile(gl, PT_VS, PT_FS); this.sky = compile(gl, SKY_VS, SKY_FS);
    this.skyBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.skyBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.white = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.white); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    this.view = M4.create(); this.proj = M4.create(); this.vp = M4.create(); this.inv = M4.create();
    this.cam = { pos: [0, 5, -10], target: [0, 0, 0], fov: 60, near: 0.1, far: 2000 };
    this.env = null; this.pixelRatio = 1; this.frustum = new Float32Array(24);
    this.lights = new Float32Array(32); this.lightCols = new Float32Array(24);
    this.spot = { pos: [0, -1000, 0], pos2: [0, -1000, 0], dir: [0, 0, 1], col: [0, 0, 0] };
    this.stats = { draws: 0 };
    gl.enable(gl.DEPTH_TEST);
  }
  resize(pr) {
    this.pixelRatio = pr; const w = Math.floor(this.canvas.clientWidth * pr), h = Math.floor(this.canvas.clientHeight * pr);
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
  }
  texFromCanvas(cv, tex, clampEdge = true, mip = true) {
    const gl = this.gl; tex = tex || gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const pot = (cv.width & (cv.width - 1)) === 0 && (cv.height & (cv.height - 1)) === 0;
    const wrap = clampEdge || !pot ? gl.CLAMP_TO_EDGE : gl.REPEAT;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    if (mip && pot) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }
  setupCamera() {
    const c = this.cam, w = this.canvas.width, h = this.canvas.height;
    M4.perspective(this.proj, c.fov * DEG, w / Math.max(1, h), c.near, c.far); this.proj[8] = -(c.shiftX || 0); this.proj[9] = -(c.shiftY || 0);
    M4.lookAt(this.view, c.pos[0], c.pos[1], c.pos[2], c.target[0], c.target[1], c.target[2]);
    M4.multiply(this.vp, this.proj, this.view); M4.invert(this.inv, this.vp);
    const m = this.vp, f = this.frustum;
    const planes = [[m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]], [m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]], [m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]], [m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]], [m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]], [m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]]];
    planes.forEach((p, i) => { const l = Math.hypot(p[0], p[1], p[2]); f[i * 4] = p[0] / l; f[i * 4 + 1] = p[1] / l; f[i * 4 + 2] = p[2] / l; f[i * 4 + 3] = p[3] / l; });
  }
  visible(cx, cy, cz, r) { const f = this.frustum; for (let i = 0; i < 6; i++) if (f[i * 4] * cx + f[i * 4 + 1] * cy + f[i * 4 + 2] * cz + f[i * 4 + 3] < -r) return false; return true; }
  begin() {
    const gl = this.gl; gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    const e = this.env; gl.clearColor(e.fogCol[0], e.fogCol[1], e.fogCol[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.setupCamera(); this.stats.draws = 0;
    // sky
    const s = this.sky; gl.useProgram(s.p); gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
    gl.uniformMatrix4fv(s.u.uInvVP, false, this.inv); gl.uniform3fv(s.u.uCam, this.cam.pos); gl.uniform3fv(s.u.uZenith, e.zenith); gl.uniform3fv(s.u.uHorizon, e.horizon);
    gl.uniform3fv(s.u.uSunDir, e.sunDir); gl.uniform3fv(s.u.uSunCol, e.sunCol); gl.uniform3fv(s.u.uGroundCol, e.groundCol); gl.uniform3fv(s.u.uFogCol, e.fogCol);
    gl.uniform1f(s.u.uStars, e.stars || 0); gl.uniform1f(s.u.uFogMix, e.skyFog || 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.skyBuf); gl.enableVertexAttribArray(s.at.aPos); gl.vertexAttribPointer(s.at.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(s.at.aPos);
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
    // lit program globals
    const L = this.lit; gl.useProgram(L.p);
    gl.uniformMatrix4fv(L.u.uVP, false, this.vp); gl.uniform3fv(L.u.uCam, this.cam.pos);
    gl.uniform3fv(L.u.uSunDir, e.sunDir); gl.uniform3fv(L.u.uSunCol, e.sunCol); gl.uniform3fv(L.u.uSkyCol, e.skyCol); gl.uniform3fv(L.u.uGroundCol, e.groundCol);
    gl.uniform3fv(L.u.uFogCol, e.fogCol); gl.uniform1f(L.u.uFogDen, e.fogDen); gl.uniform3fv(L.u.uZenith, e.zenith); gl.uniform3fv(L.u.uHorizon, e.horizon);
    gl.uniform1f(L.u.uNight, e.night || 0); gl.uniform1f(L.u.uWet, e.wet || 0);
    gl.uniform4fv(L.u.uPL, this.lights); gl.uniform3fv(L.u.uPLC, this.lightCols);
    gl.uniform3fv(L.u.uSpotPos, this.spot.pos); gl.uniform3fv(L.u.uSpot2Pos, this.spot.pos2); gl.uniform3fv(L.u.uSpotDir, this.spot.dir); gl.uniform3fv(L.u.uSpotCol, this.spot.col);
    gl.uniform1i(L.u.uTex, 0);
    this._blend = null; this._list = []; this._trans = [];
  }
  setLights(arr) { // [{p:[x,y,z], r, c:[r,g,b]}] max 8
    this.lights.fill(0); this.lightCols.fill(0);
    for (let i = 0; i < 8; i++) { const l = arr[i]; if (!l) { this.lights[i * 4 + 1] = -9999; this.lights[i * 4 + 3] = 1; continue; } this.lights.set([l.p[0], l.p[1], l.p[2], l.r], i * 4); this.lightCols.set(l.c, i * 3); }
  }
  drawMesh(mesh, mat, model, cull = true) {
    if (!mesh || mesh.count === 0) return;
    if (cull) { const c = mesh.center; const x = model[0] * c[0] + model[4] * c[1] + model[8] * c[2] + model[12], y = model[1] * c[0] + model[5] * c[1] + model[9] * c[2] + model[13], z = model[2] * c[0] + model[6] * c[1] + model[10] * c[2] + model[14]; const s = Math.hypot(model[0], model[1], model[2]); if (!this.visible(x, y, z, mesh.radius * s)) return; }
    if (mat.blend) { this._trans.push([mesh, mat, model]); return; }
    this._draw(mesh, mat, model);
  }
  _draw(mesh, mat, model) {
    const gl = this.gl, L = this.lit, u = L.u, at = L.at;
    gl.uniformMatrix4fv(u.uModel, false, model); gl.uniform3fv(u.uTint, mat.tint); gl.uniform1f(u.uEmis, mat.emis); gl.uniform1f(u.uRefl, mat.refl);
    gl.uniform1f(u.uSpec, mat.spec); gl.uniform1f(u.uShin, mat.shin); gl.uniform1f(u.uAlpha, mat.alpha); gl.uniform1f(u.uTexMode, mat.tex ? mat.texMode : 0); gl.uniform1f(u.uSunScale, mat.sunScale);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, mat.tex || this.white);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf); const S = VSTRIDE * 4;
    gl.enableVertexAttribArray(at.aPos); gl.vertexAttribPointer(at.aPos, 3, gl.FLOAT, false, S, 0);
    gl.enableVertexAttribArray(at.aNor); gl.vertexAttribPointer(at.aNor, 3, gl.FLOAT, false, S, 12);
    gl.enableVertexAttribArray(at.aCol); gl.vertexAttribPointer(at.aCol, 3, gl.FLOAT, false, S, 24);
    gl.enableVertexAttribArray(at.aExt); gl.vertexAttribPointer(at.aExt, 2, gl.FLOAT, false, S, 36);
    gl.enableVertexAttribArray(at.aUV); gl.vertexAttribPointer(at.aUV, 2, gl.FLOAT, false, S, 44);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count); this.stats.draws++;
  }
  drawNode(node) {
    if (!node.visible) return;
    for (const p of node.parts) this.drawMesh(p.mesh, p.mat, node.world, true);
    for (const c of node.children) this.drawNode(c);
  }
  flushTransparent() {
    const gl = this.gl; if (!this._trans.length) return;
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.useProgram(this.lit.p);
    const cp = this.cam.pos;
    this._trans.sort((a, b) => { const da = (a[2][12] - cp[0]) ** 2 + (a[2][14] - cp[2]) ** 2, db = (b[2][12] - cp[0]) ** 2 + (b[2][14] - cp[2]) ** 2; return db - da; });
    for (const [m, mat, model] of this._trans) { gl.depthMask(mat.depthWrite); this._draw(m, mat, model); }
    gl.depthMask(true); gl.disable(gl.BLEND); this._trans = [];
  }
  drawPoints(ps, scaleMul = 1) {
    if (!ps.n) return; const gl = this.gl, P = this.pt;
    gl.useProgram(P.p); gl.enable(gl.BLEND); gl.depthMask(false);
    if (ps.add) gl.blendFunc(gl.SRC_ALPHA, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniformMatrix4fv(P.u.uVP, false, this.vp); gl.uniform1f(P.u.uScale, this.canvas.height * 0.6 * scaleMul); gl.uniform3fv(P.u.uCam, this.cam.pos);
    gl.uniform3fv(P.u.uFogCol, this.env.fogCol); gl.uniform1f(P.u.uFogDen, this.env.fogDen); gl.uniform1f(P.u.uSoft, ps.soft ? 1 : 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, ps.buf);
    gl.enableVertexAttribArray(P.at.aPos); gl.vertexAttribPointer(P.at.aPos, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(P.at.aSize); gl.vertexAttribPointer(P.at.aSize, 1, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(P.at.aCol); gl.vertexAttribPointer(P.at.aCol, 4, gl.FLOAT, false, 32, 16);
    gl.drawArrays(gl.POINTS, 0, ps.n);
    gl.disableVertexAttribArray(P.at.aSize); gl.disableVertexAttribArray(P.at.aCol);
    gl.depthMask(true); gl.disable(gl.BLEND); gl.useProgram(this.lit.p); this.stats.draws++;
  }
}

// 環境プリセット（時間帯×天候）
function makeEnv(time, weather) {
  const E = {
    day: { zenith: [0.22, 0.42, 0.78], horizon: [0.68, 0.78, 0.9], sunCol: [1.05, 0.98, 0.88], skyCol: [0.42, 0.48, 0.58], groundCol: [0.26, 0.23, 0.2], sunDir: [0.45, 0.75, 0.35], fogDen: 0.0014, night: 0, stars: 0 },
    evening: { zenith: [0.18, 0.2, 0.42], horizon: [1.0, 0.56, 0.32], sunCol: [1.1, 0.62, 0.34], skyCol: [0.36, 0.3, 0.38], groundCol: [0.22, 0.15, 0.12], sunDir: [-0.7, 0.16, 0.5], fogDen: 0.0016, night: 0.35, stars: 0 },
    night: { zenith: [0.008, 0.012, 0.035], horizon: [0.05, 0.06, 0.1], sunCol: [0.18, 0.22, 0.34], skyCol: [0.06, 0.07, 0.11], groundCol: [0.03, 0.03, 0.04], sunDir: [0.3, 0.8, -0.4], fogDen: 0.0016, night: 1, stars: 1 }
  }[time] || null;
  const e = JSON.parse(JSON.stringify(E || {}));
  const l = Math.hypot(...e.sunDir); e.sunDir = e.sunDir.map(v => v / l);
  e.fogCol = e.horizon.slice(); e.wet = 0; e.skyFog = 0; e.grip = 1; e.time = time; e.weather = weather;
  if (weather === 'rain') {
    e.zenith = mixc(e.zenith, [0.3, 0.32, 0.36], 0.7); e.horizon = mixc(e.horizon, [0.42, 0.45, 0.5], 0.6); e.sunCol = scalec(e.sunCol, 0.35); e.skyCol = scalec(e.skyCol, 0.85);
    if (time === 'night') { e.zenith = [0.02, 0.025, 0.035]; e.horizon = [0.05, 0.055, 0.07]; }
    e.fogCol = e.horizon.slice(); e.fogDen = 0.0042; e.wet = 1; e.grip = 0.74; e.skyFog = 0.6; e.stars = 0;
  } else if (weather === 'snow') {
    e.zenith = mixc(e.zenith, [0.6, 0.65, 0.72], 0.6); e.horizon = mixc(e.horizon, [0.78, 0.82, 0.88], 0.6); e.sunCol = scalec(e.sunCol, 0.5);
    if (time === 'night') { e.zenith = [0.03, 0.035, 0.06]; e.horizon = [0.1, 0.11, 0.16]; e.sunCol = [0.15, 0.17, 0.25]; }
    e.skyCol = mixc(e.skyCol, [0.6, 0.64, 0.7], time === 'night' ? 0.15 : 0.5); e.groundCol = mixc(e.groundCol, [0.6, 0.62, 0.66], time === 'night' ? 0.1 : 0.6);
    e.fogCol = e.horizon.slice(); e.fogDen = 0.0036; e.grip = 0.52; e.skyFog = 0.5; e.stars = time === 'night' ? 0.3 : 0;
  } else if (weather === 'fog') {
    e.fogCol = mixc(e.horizon, [0.7, 0.72, 0.75], time === 'night' ? 0.05 : 0.6); if (time === 'night') e.fogCol = [0.06, 0.065, 0.08];
    e.fogDen = 0.009; e.skyFog = 0.9; e.sunCol = scalec(e.sunCol, 0.6); e.grip = 0.95; e.stars = 0;
  }
  return e;
}
