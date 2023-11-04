struct VertexInput {
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) normal: vec4f,
}

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) normal: vec4f,
}

struct FragmentInput {
    @location(0) color: vec4f,
    @location(1) normal: vec4f,
    @builtin(position) position: vec4f,
}

struct FragmentOutput {
    @location(0) color: vec4f,
}

// uniform means that this variable is the same for all vertices
@group(0) @binding(0) var<uniform> matrix: mat4x4<f32>; 

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    output.position = matrix * input.position;
    output.color = input.color;
    output.normal = input.normal;

    return output;
}

@fragment
fn fragment(input: FragmentInput) -> FragmentOutput {
    var output: FragmentOutput;

    // light calculation
    let normal = normalize(input.normal.xyz);
    let lightSource = vec3f(0.0, 5.0, 0.0);
    let lightDirection = normalize(lightSource - input.position.xyz);
    let lightColor = vec3f(1.0, 1.0, 0.9);

    output.color = vec4f(lightColor * dot(normal, lightDirection), 1.0);

    return output;
}