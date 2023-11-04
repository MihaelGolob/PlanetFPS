// libraries
import { mat4 } from '../Libraries/gl-matrix-module.js';
import {
    getGlobalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,
} from './Utility/./SceneUtils.js';
import { Scene } from './Scene.js';

// WebGPU initialization
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const canvas = document.querySelector('canvas');
const format = navigator.gpu.getPreferredCanvasFormat();
const context = canvas.getContext('webgpu');
context.configure({ device, format });

// fetch and compile shaders
const code = await fetch('Shaders/shader.wgsl').then(response => response.text());
const shaderModule = device.createShaderModule({ code });

// create the scene
const scene = new Scene(); 
let [indices, vertices] = scene.bufferArray;

const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, 0, vertices)

const indexBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(indexBuffer, 0, indices)

// create vertex buffer layout
const vertexBufferLayout = {
    arrayStride: 3 * 4 * 4, // 4-positions, 4-colors, 4-normals, 4 bytes per float
    attributes: [
        {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x4'
        },
        {
            shaderLocation: 2,
            offset: 4 * 4,
            format: 'float32x4'
        },
        {
            shaderLocation: 1,
            offset: 8 * 4,
            format: 'float32x4'
        },
    ],
};

// depth buffer
const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
});

// create a pipeline - this is just a configuration
// we never pass in the data into the pipeline, just the 
// format of the data!
const pipeline = device.createRenderPipeline({
    vertex: {
        module: shaderModule,
        entryPoint: 'vertex',
        buffers: [vertexBufferLayout],
    },
    fragment: {
        module: shaderModule,
        entryPoint: 'fragment',
        targets: [{format}],
    },
    depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
    },
    layout: 'auto',
});

// create uniform buffer - after pipeline creation because we need to know the layout
const uniformBuffer = device.createBuffer({
    size: 4 * 4 * 4, // 4x4 matrix, 4 bytes per float
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

// create bind group
const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
        {
            binding: 0,
            resource: {buffer: uniformBuffer},
        },
    ],
});

let lastTime = Date.now();

function update() {
    let now = Date.now();
    let deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    scene.update(deltaTime);
}

function render() {
    // Clear the canvas
    const encoder = device.createCommandEncoder();
    
    // buffer transform matrix
    const camera = scene.camera;
    const viewMatrix = getGlobalViewMatrix(camera);
    const projectionMatrix = getProjectionMatrix(camera);
    
    let resultMatrix = mat4.create();
    mat4.multiply(resultMatrix, projectionMatrix, viewMatrix);
    // write the data into the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, resultMatrix);

    // update the vertex buffer
    let [_, vertices] = scene.bufferArray;
    device.queue.writeBuffer(vertexBuffer, 0, vertices)

    // we set the data in the render pass!
    const renderPass = encoder.beginRenderPass({
        colorAttachments: [
            {
                view: context.getCurrentTexture().createView(),
                loadOp: 'clear', // this can be either 'clear' or 'load'
                clearValue: [0.7, 0.8, 0.9, 1], // RGBA color
                storeOp: 'store' // this can be either 'store' or 'discard'
            }
        ],
        depthStencilAttachment: {
            view: depthTexture.createView(),
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'discard',
        },
    });
    
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setIndexBuffer(indexBuffer, 'uint32');
    renderPass.setBindGroup(0, bindGroup);
    renderPass.drawIndexed(scene.indexCount);
    renderPass.end();

    device.queue.submit([encoder.finish()]);
}    

function frame() {
    update(); // update animations, user inputs, etc.
    render(); // render the scene

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);