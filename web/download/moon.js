// The live Moon on the download page. NASA's LRO colour map wrapped on a sphere and lit for any day
// of the lunar month: Lommel-Seeliger shading (why a full Moon looks flat rather than ball-shaped),
// a soft terminator, earthshine on the dark side near new Moon, and a slow libration wobble.
// window.LunarMoon.create(canvas, textureUrl) returns { setDay(day), render(time) }.
(function () {
  const SYNODIC = 29.53;
  // Matches the game's lunar calendar: Day 1 new, 7 to 8 first quarter, 15 full, 22 to 23 third quarter.
  const ANCHORS = [[1, 0], [7.5, 0.5], [15, 1], [22.5, 1.5], [30.53, 2]];
  function phaseAngle(day) {
    const d = Math.min(Math.max(day, 1), 30.53);
    let i = 0;
    while (i < ANCHORS.length - 2 && d > ANCHORS[i + 1][0]) i++;
    const [d0, a0] = ANCHORS[i], [d1, a1] = ANCHORS[i + 1];
    return Math.PI * (a0 + ((d - d0) / (d1 - d0)) * (a1 - a0));
  }

  const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  const FRAG = `
precision highp float;
uniform vec2 uSize;
uniform float uPhase;
uniform vec2 uLib;
uniform sampler2D uMap;
uniform float uReady;
uniform float uIntro;
const float PI = 3.14159265;
vec3 toLinear(vec3 c){ return pow(c, vec3(2.2)); }
vec3 toSrgb(vec3 c){ return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
void main(){
  // The Moon fills 76% of the canvas; the rest holds its glow, which fades out before the edge.
  float radius = 0.38 * min(uSize.x, uSize.y);
  vec2 q = (gl_FragCoord.xy - 0.5 * uSize) / radius;
  float d = length(q);
  float px = 1.0 / radius;
  vec3 L = normalize(vec3(sin(uPhase), 0.06, -cos(uPhase)));
  float lit = 0.5 - 0.5 * cos(uPhase);
  if (d > 1.0) {
    float glow = pow(lit, 1.6) * 0.22 * exp(-(d - 1.0) * 11.0) * (1.0 - smoothstep(1.12, 1.3, d));
    glow *= uIntro;
    gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * glow, glow);
    return;
  }
  vec3 n = vec3(q, sqrt(max(0.0, 1.0 - d * d)));
  // Libration: the near side wobbles a few degrees, so the surface map turns slightly under the light.
  float cy = cos(uLib.x), sy = sin(uLib.x), cx = cos(uLib.y), sx = sin(uLib.y);
  vec3 m = vec3(cy * n.x + sy * n.z, n.y, -sy * n.x + cy * n.z);
  m = vec3(m.x, cx * m.y - sx * m.z, sx * m.y + cx * m.z);
  vec2 uv = vec2(0.5 + atan(m.x, m.z) / (2.0 * PI), 0.5 - asin(clamp(m.y, -1.0, 1.0)) / PI);
  vec3 albedo = mix(vec3(0.42), toLinear(texture2D(uMap, uv).rgb), uReady);
  float mu0 = dot(n, L);
  float mu = n.z;
  float ls = mu0 > 0.0 ? mu0 / (mu0 + mu) : 0.0;
  float term = smoothstep(-0.015, 0.05, mu0);
  vec3 sun = albedo * ls * 2.25 * term;
  float earthshine = 0.034 * (0.5 + 0.5 * cos(uPhase));
  vec3 shade = albedo * earthshine * vec3(0.62, 0.72, 0.95) * (1.0 - term);
  // A cool rim of earthshine keeps the dark limb readable near new Moon.
  vec3 rim = vec3(0.62, 0.72, 0.95) * smoothstep(0.8, 1.0, d) * 0.035 * (1.0 - lit) * (1.0 - term);
  vec3 col = toSrgb((sun + shade + rim) * uIntro);
  float edge = smoothstep(1.0, 1.0 - 1.5 * px, d);
  gl_FragColor = vec4(col * edge, edge);
}`;

  function create(canvas, textureUrl) {
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return create2d(canvas);
    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return create2d(canvas);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (name) => gl.getUniformLocation(prog, name);
    const uSize = u('uSize'), uPhase = u('uPhase'), uLib = u('uLib'), uReady = u('uReady'), uIntro = u('uIntro');

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([150, 150, 150, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    let ready = 0, readyTarget = 0;
    // Opening: the Moon fades up out of the dark over 1.8 s (instant with reduced motion).
    const introStart = performance.now();
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      readyTarget = 1;
      dirty = true;
    };
    img.src = textureUrl;

    let day = 1, dirty = true, w = 0, h = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nw = Math.round(canvas.clientWidth * dpr), nh = Math.round(canvas.clientHeight * dpr);
      if (nw && nh && (nw !== w || nh !== h)) {
        w = canvas.width = nw;
        h = canvas.height = nh;
        gl.viewport(0, 0, w, h);
        dirty = true;
      }
    }
    return {
      setDay(d) { if (d !== day) { day = d; dirty = true; } },
      // Returns true while something on screen is still changing.
      render(time, still) {
        size();
        ready += (readyTarget - ready) * 0.08;
        if (Math.abs(readyTarget - ready) < 0.002) ready = readyTarget;
        const fading = ready !== readyTarget || (!still && time - introStart < 1800);
        if (!dirty && !fading && still) return false;
        const t = still ? 0 : time / 1000;
        gl.uniform2f(uSize, w, h);
        gl.uniform1f(uPhase, phaseAngle(day));
        gl.uniform2f(uLib, 0.07 * Math.sin(t * 0.13), 0.045 * Math.sin(t * 0.09 + 1.3));
        const k = still ? 1 : Math.min(1, (time - introStart) / 1800);
        gl.uniform1f(uReady, ready);
        gl.uniform1f(uIntro, 1 - Math.pow(1 - k, 3));
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        dirty = false;
        return fading || !still;
      },
    };
  }

  // Flat phase disc for the phase track and for browsers without WebGL.
  function drawPhase(ctx, size, day, light, dark) {
    const r = size / 2, a = phaseAngle(day), k = Math.cos(a);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(r, r);
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    // Lit limb: right half while waxing, left half while waning; the terminator is an ellipse.
    const waxing = Math.sin(a) >= 0;
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, !waxing);
    ctx.ellipse(0, 0, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing);
    ctx.fill();
    ctx.restore();
  }

  function create2d(canvas) {
    const ctx = canvas.getContext('2d');
    let day = 1, dirty = true;
    return {
      setDay(d) { if (d !== day) { day = d; dirty = true; } },
      render() {
        if (!dirty) return false;
        const s = canvas.width = canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2);
        canvas.height = s;
        ctx.save();
        ctx.translate(s * 0.08, s * 0.08);
        drawPhase(ctx, s * 0.84, day, '#e9e6df', '#1b1d2e');
        ctx.restore();
        dirty = false;
        return false;
      },
    };
  }

  window.LunarMoon = { create, drawPhase, phaseAngle, SYNODIC };
})();
