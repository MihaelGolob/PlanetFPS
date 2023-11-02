// libraries
import { quat, mat4 } from '../Libraries/gl-matrix-module.js';
import { Transform } from './Components/Transform.js';
import { Camera } from './Components/Camera.js';
import { Node } from './Node.js';
import {
    getGlobalModelMatrix,
    getGlobalViewMatrix,
    getProjectionMatrix,
} from './Utility/./SceneUtils.js';

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

// create vertex buffer
const vertices = new Float32Array([
    // positions         // colors         // index
    -1, -1, -1,  1,      0,  0,  0,  1,    //   0
    -1, -1,  1,  1,      0,  0,  1,  1,    //   1
    -1,  1, -1,  1,      0,  1,  0,  1,    //   2
    -1,  1,  1,  1,      0,  1,  1,  1,    //   3
     1, -1, -1,  1,      1,  0,  0,  1,    //   4
     1, -1,  1,  1,      1,  0,  1,  1,    //   5
     1,  1, -1,  1,      1,  1,  0,  1,    //   6
     1,  1,  1,  1,      1,  1,  1,  1,    //   7
]);


const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, 0, vertices)

// create index buffer
const indices = new Uint32Array([
    0, 1, 2,    2, 1, 3,
    4, 0, 6,    6, 0, 2,
    5, 4, 7,    7, 4, 6,
    1, 5, 3,    3, 5, 7,
    6, 2, 7,    7, 2, 3,
    1, 0, 5,    5, 0, 4,
]);

const indexBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(indexBuffer, 0, indices)

// create vertex buffer layout
const vertexBufferLayout = {
    arrayStride: 8 * 4,
    attributes: [
        {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x4'
        },
        {
            shaderLocation: 1,
            offset: 4 * 4,
            format: 'float32x4'
        }
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
    size: 4 * 4 * 4,
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

// SCENE SETUP
const model = new Node();
model.addComponent(new Transform());
model.addComponent({
    update() {
        const time = performance.now() / 1000;
        const transform = model.getComponentOfType(Transform);
        const rotation = transform.rotation;

        quat.identity(rotation);
        quat.rotateX(rotation, rotation, time * 0.6);
        quat.rotateY(rotation, rotation, time * 0.7);
    }
});

const camera = new Node();
camera.addComponent(new Camera());
camera.addComponent(new Transform({
    translation: [0, 0, 5],
}));

const scene = new Node();
scene.addChild(model);
scene.addChild(camera);

function update() {
    const time = performance.now() / 1000;

    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time);
        }
    });
}

function render() {
    // Clear the canvas
    const encoder = device.createCommandEncoder();
    
    // buffer transform matrix
    const modelMatrix = getGlobalModelMatrix(model);
    const viewMatrix = getGlobalViewMatrix(camera);
    const projectionMatrix = getProjectionMatrix(camera);
    
    let resultMatrix = mat4.create();
    mat4.multiply(resultMatrix, viewMatrix, modelMatrix);
    mat4.multiply(resultMatrix, projectionMatrix, resultMatrix);
    // write the data into the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, resultMatrix);

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
    renderPass.drawIndexed(36);
    renderPass.end();

    device.queue.submit([encoder.finish()]);
}    

function frame() {
    update(); // update animations, user inputs, etc.
    render(); // render the scene

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);