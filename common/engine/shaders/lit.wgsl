struct VertexInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition : vec4f,
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct FragmentInput {
    @location(0) position : vec3f,
    @location(1) texcoords : vec2f,
    @location(2) normal : vec3f,
}

struct FragmentOutput {
    @location(0) color : vec4f,
}

struct CameraUniforms {
    viewMatrix : mat4x4f,
    projectionMatrix : mat4x4f,
    position : vec3f,
}

struct ModelUniforms {
    modelMatrix : mat4x4f,
    normalMatrix : mat3x3f,
}

struct MaterialUniforms {
    baseFactor : vec4f,
}

struct LightUniforms {
    position : vec3f,
    ambient : f32,
    shininess : f32,
}

@group(0) @binding(0) var<uniform> camera : CameraUniforms;

@group(1) @binding(0) var<uniform> model : ModelUniforms;

@group(2) @binding(0) var<uniform> material : MaterialUniforms;
@group(2) @binding(1) var baseTexture : texture_2d<f32>;
@group(2) @binding(2) var baseSampler : sampler;

@group(3) @binding(0) var<uniform> light0 : LightUniforms;
@group(3) @binding(1) var<uniform> light1 : LightUniforms;

@vertex
fn vertex(input : VertexInput) -> VertexOutput {
    var output : VertexOutput;

    output.clipPosition = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    output.position = (model.modelMatrix * vec4(input.position, 1)).xyz;
    output.texcoords = input.texcoords;
    output.normal = model.normalMatrix * input.normal;
    
    return output;
}

@fragment
fn fragment(input : FragmentInput) -> FragmentOutput {
    var output : FragmentOutput;

    let N = normalize(input.normal);
    let L0 = normalize(light0.position - input.position);
    let L1 = normalize(light1.position - input.position);
    let lambert0 = max(dot(N, L0), 0);
    let lambert1 = max(dot(N, L1), 0);

    let R0 = reflect(-L0, N);
    let R1 = reflect(-L1, N);

    let materialColor = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseFactor;
    let lambertFactor0 = vec3(lambert0);
    let lambertFactor1 = vec3(lambert1);
    let ambientFactor = vec3(light0.ambient);
    
    let lightColor = vec3(0.73, 0.70, 0.84);

    output.color = vec4(materialColor.rgb * (lightColor * (lambertFactor0 + lambertFactor1 + ambientFactor)), 1);

    return output;
}
