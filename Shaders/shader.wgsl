struct VertexInput {
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) normal: vec4f,
}

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) lighting: vec3f,
}

struct FragmentInput {
    @location(0) color: vec4f,
    @location(1) lighting: vec3f,
    @builtin(position) position: vec4f,
}

struct FragmentOutput {
    @location(0) color: vec4f,
}

// uniform means that this variable is the same for all vertices
@group(0) @binding(0) var<uniform> matrix: mat4x4<f32>;
@group(0) @binding(1) var<uniform> normalMatrix: mat4x4<f32>;

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    output.position = matrix * input.position;
    output.color = input.color;

    // light calculation
    let ambientColor = vec3f(0.2, 0.2, 0.2);
    let directionalLightColor = vec3f(1, 1, 1);
    let lightSource = matrix * vec4f(0, 0, 2, 1.0);
    let directionalVector = normalize(lightSource.xyz - output.position.xyz);

    let transformedNormal = normalMatrix * input.normal;
    let directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);

    output.lighting = ambientColor + (directionalLightColor * directional);

    return output;
}

@fragment
fn fragment(input: FragmentInput) -> FragmentOutput {
    var output: FragmentOutput;

    output.color = input.color * vec4f(input.lighting, 1.0);

    return output;
}