varying vec3 vNormal;
varying vec2 vUv;
uniform vec3 color;

void main() {
  float intensity = pow(0.5 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
  gl_FragColor = vec4(color, 1.0) * intensity + vec4(color, 0.5);
}
