uniform float time;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec2 st = vUv;
    float r = random(st);
    float stars = step(0.995, r); // Threshold for stars

    // Twinkle effect
    float twinkle = sin(time * 2.0 + r * 100.0) * 0.5 + 0.5;

    vec3 color = vec3(stars * twinkle);
    gl_FragColor = vec4(color, 1.0);
}
