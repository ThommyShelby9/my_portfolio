/**
 * Particle DNA « Volume » (spec §3.4, prototype A). Every state is an attribute (see
 * src/lib/dna/layout.ts STATE): uState in [1, 5] blends two consecutive states with a per-particle
 * stagger; uIntro condenses the cloud into the current state once, on load; uTunnel flies the
 * particles into the traversal (prototype C), where uTunnelZ scrolls them past the camera.
 * Depth: perspective size, a depth of field around uFocalDist, additive glow (bloom in DnaCanvas).
 */
export const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform float uState;
uniform float uFocus;
uniform float uSignatures;
uniform float uTunnel;
uniform float uTunnelZ;
uniform float uTunnelLen;
uniform float uFocalDist;
uniform float uPixelRatio;
uniform float uSize;
attribute vec3 aCloud;
attribute vec3 aLayers;
attribute vec3 aSign;
attribute vec3 aClust;
attribute vec3 aCalm;
attribute vec3 aTunnel;
attribute float aRole;
attribute float aPair;
attribute float aGroup;
attribute float aAlong;
attribute float aSeed;
varying float vAlpha;
varying float vHot;
varying float vPulse;
varying float vBlur;

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

/** Two light pulses running along the helix, one every two seconds on average. */
float pulse(float along) {
  if (along < 0.0) return 0.0;
  float a = smoothstep(0.045, 0.0, abs(fract(uTime * 0.25) - along));
  float b = smoothstep(0.045, 0.0, abs(fract(uTime * 0.25 + 0.5) - along));
  return max(a, b);
}

void main() {
  float s = clamp(uState, 1.0, 5.0);
  float a = floor(s);
  float b = min(a + 1.0, 5.0);
  float t = s - a;
  // Each particle leaves a little before or after its neighbours: the shape dissolves, never jumps.
  vec3 target = mix(statePos(a), statePos(b), ease(t * 1.4 - aSeed * 0.4));

  vec3 tunnel = aTunnel;
  tunnel.z = mod(aTunnel.z - 2.0 + uTunnelZ, uTunnelLen) - uTunnelLen + 2.0;
  target = mix(target, tunnel, ease(uTunnel * 1.3 - aSeed * 0.3));

  vec3 p = mix(aCloud, target, ease(uIntro * 1.25 - aSeed * 0.25));
  // Breathing: a few hundredths of a unit, never a visible wobble.
  p += 0.025 * vec3(sin(uTime * 0.8 + aSeed * 50.0), cos(uTime * 0.6 + aSeed * 31.0), sin(uTime * 0.7 + aSeed * 17.0));

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = max(-mv.z, 0.3);
  float dust = step(2.5, aRole);
  float rung = step(1.5, aRole) * (1.0 - dust);

  // Depth of field: out-of-focus particles grow into soft discs and fade (like a lens bokeh).
  float blur = clamp(abs(d - uFocalDist) * 0.42, 0.0, 3.5);
  vBlur = blur;
  float base = mix(mix(2.6, 2.0, rung), 1.4, dust);
  gl_PointSize = uSize * base * uPixelRatio * (1.0 + blur * 2.0) * (uFocalDist / d);

  float g = stateGroup(t < 0.5 ? a : b);
  vHot = (uFocus > -0.5 && dust < 0.5 && abs(g - uFocus) < 0.5) ? 1.0 : 0.0;
  // The pulses run on the helix states only (hero, sequencing, calm) and in the traversal.
  float onHelix = max(1.0 - clamp(uState - 1.0, 0.0, 1.0), clamp(uState - 4.0, 0.0, 1.0));
  vPulse = pulse(aAlong) * max(onHelix, uTunnel) * (1.0 - dust);

  float fadeNear = smoothstep(0.3, 1.4, d);
  // Additive: dense shapes add up, so each particle stays faint and the sum makes the light.
  // The far end of the traversal would pile up into a white spot: fade the deep particles there.
  float fadeFar = 1.0 - smoothstep(uTunnelLen * 0.3, uTunnelLen * 0.75, d) * uTunnel;
  vAlpha = mix(mix(0.48, 0.3, rung), 0.18, dust) / (1.0 + blur * 2.2) * fadeNear * fadeFar;
}
`;

export const FRAGMENT = /* glsl */ `
uniform vec3 uIvory;
uniform vec3 uSignal;
varying float vAlpha;
varying float vHot;
varying float vPulse;
varying float vBlur;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  // Sharp glowing core in focus, flat soft disc out of focus.
  float core = smoothstep(0.5, mix(0.05, 0.38, clamp(vBlur / 3.5, 0.0, 1.0)), d);
  float heat = max(vHot, vPulse);
  vec3 colour = mix(uIvory, uSignal, heat);
  // Dense lit shapes add up fast: a moderate alpha keeps the orange orange, not yellow-white.
  gl_FragColor = vec4(colour, core * mix(vAlpha, 0.5, heat));
}
`;
