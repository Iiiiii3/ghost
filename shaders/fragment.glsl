precision mediump float;

uniform float time;
uniform float audioLevel;
uniform vec2 resolution;
uniform vec2 mouse;
varying vec3 vNormal;

void main() {
  float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
  float breath = 0.6 + 0.4 * sin(time * 2.0 + audioLevel * 6.0);
  vec3 baseColor = mix(vec3(0.2, 0.5, 1.0), vec3(1.0, 0.6, 0.9), fresnel);
  gl_FragColor = vec4(baseColor * breath, 1.0);
}