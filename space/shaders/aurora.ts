// Full-screen aurora/plasma background. Cosmic ink base with slow flux of
// indigo → emerald → magenta. Drives off uTime; cheap value-noise FBM so it
// stays light on low-end GPUs.

export const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const fragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0;
  float t = uTime * 0.04;

  float n = fbm(p + vec2(t, t * 0.6) + fbm(p * 1.5 - t));

  vec3 ink     = vec3(0.027, 0.024, 0.071);
  vec3 indigo  = vec3(0.478, 0.361, 0.941);
  vec3 emerald = vec3(0.098, 0.788, 0.549);
  vec3 magenta = vec3(1.000, 0.353, 0.667);

  vec3 col = ink;
  col = mix(col, indigo,  smoothstep(0.35, 0.85, n) * 0.55);
  col = mix(col, emerald, smoothstep(0.55, 0.95, fbm(p * 1.2 + t)) * 0.18);
  col = mix(col, magenta, smoothstep(0.60, 1.00, fbm(p * 0.8 - t * 0.7)) * 0.12);

  float vignette = smoothstep(1.2, 0.2, length(uv - 0.5));
  col = mix(ink, col, vignette);

  gl_FragColor = vec4(col, 1.0);
}
`
