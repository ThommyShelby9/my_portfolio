/** Particle helix. Positions for each state are attributes; uIntro morphs the cloud into the helix. */
export const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform float uFocus;
uniform float uPixelRatio;
uniform float uSize;
attribute vec3 aCloud;
attribute float aRole;
attribute float aPair;
attribute float aSeed;
varying float vAlpha;
varying float vHot;

void main() {
  // Staggered condensation: each particle arrives at its own moment.
  float k = clamp(uIntro * 1.25 - aSeed * 0.25, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  vec3 p = mix(aCloud, position, k);
  // Breathing: a few hundredths of a unit, never a visible wobble.
  p += 0.03 * vec3(sin(uTime * 0.7 + aSeed * 40.0), cos(uTime * 0.5 + aSeed * 31.0), sin(uTime * 0.6 + aSeed * 17.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dust = step(2.5, aRole);
  gl_PointSize = uSize * uPixelRatio * mix(1.0, 0.6, dust) / max(0.35, -mv.z * 0.12);
  vHot = (uFocus > -0.5 && abs(aPair - uFocus) < 0.5) ? 1.0 : 0.0;
  float depth = clamp(-mv.z / 16.0, 0.0, 1.0);
  vAlpha = mix(0.85, 0.22, dust) * (1.0 - depth * 0.5);
}
`;

export const FRAGMENT = /* glsl */ `
uniform vec3 uIvory;
uniform vec3 uSignal;
varying float vAlpha;
varying float vHot;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d) * vAlpha;
  gl_FragColor = vec4(mix(uIvory, uSignal, vHot), a);
}
`;
