/**
 * Particle DNA. Every state is an attribute (see src/lib/dna/layout.ts STATE): uState in [1, 5]
 * blends two consecutive states with a per-particle stagger; uIntro condenses the cloud into the
 * current state once, on load; uFocus lights one group of the current state in signal orange.
 */
export const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform float uState;
uniform float uFocus;
uniform float uSignatures;
uniform float uPixelRatio;
uniform float uSize;
attribute vec3 aCloud;
attribute vec3 aLayers;
attribute vec3 aSign;
attribute vec3 aClust;
attribute vec3 aCalm;
attribute float aRole;
attribute float aPair;
attribute float aGroup;
attribute float aSeed;
varying float vAlpha;
varying float vHot;

vec3 statePos(float s) {
  if (s < 1.5) return position;
  if (s < 2.5) return aLayers;
  if (s < 3.5) return aSign;
  if (s < 4.5) return aClust;
  return aCalm;
}

float stateGroup(float s) {
  if (s < 1.5) return aPair;
  if (s < 2.5) return mod(aGroup, 5.0);
  if (s < 3.5) return mod(aGroup, uSignatures);
  if (s < 4.5) return mod(aGroup, 4.0);
  return -1.0;
}

float ease(float k) {
  k = clamp(k, 0.0, 1.0);
  return k * k * (3.0 - 2.0 * k);
}

void main() {
  float s = clamp(uState, 1.0, 5.0);
  float a = floor(s);
  float b = min(a + 1.0, 5.0);
  float t = s - a;
  // Each particle leaves a little before or after its neighbours: the shape dissolves, never jumps.
  vec3 target = mix(statePos(a), statePos(b), ease(t * 1.4 - aSeed * 0.4));
  vec3 p = mix(aCloud, target, ease(uIntro * 1.25 - aSeed * 0.25));
  // Breathing: a few hundredths of a unit, never a visible wobble.
  p += 0.03 * vec3(sin(uTime * 0.7 + aSeed * 40.0), cos(uTime * 0.5 + aSeed * 31.0), sin(uTime * 0.6 + aSeed * 17.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float dust = step(2.5, aRole);
  gl_PointSize = uSize * uPixelRatio * mix(1.0, 0.6, dust) / max(0.35, -mv.z * 0.12);
  float g = stateGroup(t < 0.5 ? a : b);
  vHot = (uFocus > -0.5 && dust < 0.5 && abs(g - uFocus) < 0.5) ? 1.0 : 0.0;
  float depth = clamp(-mv.z / 16.0, 0.0, 1.0);
  vAlpha = mix(0.85, 0.22, dust) * (1.0 - depth * 0.5);
  // The focused group reads as signal orange, not a dark red: full opacity, slightly larger points.
  vAlpha = mix(vAlpha, 1.0, vHot);
  gl_PointSize *= mix(1.0, 1.35, vHot);
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
