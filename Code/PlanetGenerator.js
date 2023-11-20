import { vec4, vec3, vec2 } from '../Libraries/gl-matrix-module.js'

export class Planet {
  constructor(resolution) {
    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.colors = [];
    this.resolution = resolution;

    this.directions = [
      vec3.fromValues(1, 0, 0),
      vec3.fromValues(-1, 0, 0),
      vec3.fromValues(0, 1, 0),
      vec3.fromValues(0, -1, 0),
      vec3.fromValues(0, 0, 1),
      vec3.fromValues(0, 0, -1),
    ];

    this.colors = [
      vec4.fromValues(0, 0, 1, 1),
      vec4.fromValues(0, 1, 0, 1),
      vec4.fromValues(0, 1, 1, 1),
      vec4.fromValues(1, 0, 0, 1),
      vec4.fromValues(1, 0, 1, 1),
      vec4.fromValues(1, 1, 0, 1),
    ];
  }

  generatePlanet() {

    for(let i = 0; i < this.directions.length; i++) {
      const terrainFace = new TerrainFace(this.directions[i], this.resolution, i);
      const terrainFaceData = terrainFace.constructMesh(this.colors[i]);

      this.vertices = this.vertices.concat(terrainFaceData.vertices);
      this.normals = this.normals.concat(terrainFaceData.normals);
      this.indices = this.indices.concat(terrainFaceData.indices);
      this.colors = this.colors.concat(terrainFaceData.colors);
    }
  }
}

class TerrainFace {
  constructor(localUp, resolution, faceIdx) {
    this.localUp = localUp;
    this.resolution = resolution;
    this.faceIdx = faceIdx;
  }

  constructMesh(color) {
    const vertices = [];
    const indices = [];
    const normals = [];
    const colors = [];

    const axisA = vec3.fromValues(this.localUp[1], this.localUp[2], this.localUp[0]);
    const axisB = vec3.create();
    vec3.cross(axisB, this.localUp, axisA);

    for(let y = 0; y < this.resolution; y++) {
      for(let x = 0; x < this.resolution; x++) {
        
        
        const offset = this.faceIdx * (this.resolution - 1) * (this.resolution - 1);
        const idx = x + y * this.resolution + this.faceIdx * this.resolution;

        let percent = vec2.fromValues(x, y);
        vec2.scale(percent, percent, 1.0 / (this.resolution - 1));

        let pointOnCube = vec3.create();
        vec3.scaleAndAdd(pointOnCube, this.localUp, axisA, (percent[0] - 0.5) * 2);
        vec3.scaleAndAdd(pointOnCube, pointOnCube, axisB, (percent[1] - 0.5) * 2);
        vec3.normalize(pointOnCube, pointOnCube);

        vertices.push(vec4.fromValues(...pointOnCube, 1.0));
        normals.push(vec4.fromValues(...this.localUp, 1.0));

        if (x != this.resolution - 1 && y != this.resolution - 1) {
          const current = offset + y * (this.resolution - 1) + x;
          const next = current + (this.resolution - 1);

          // Triangle 1
          indices.push(current);
          indices.push(next + 1);
          indices.push(next);

          // Triangle 2
          indices.push(current);
          indices.push(current + 1);
          indices.push(next + 1);

        }

        colors.push(color);
      }
    }

    return {
      vertices: vertices,
      indices: indices,
      normals: normals,
      colors: colors
    }
  }

  calculateNormals(v1, v2, v3) {
    let edge1 = vec3.create();
    vec3.sub(edge1, v2, v1);

    let edge2 = vec3.create();
    vec3.sub(edge2, v3, v1);

    let normal = vec3.create();
    vec3.cross(normal, edge1, edge2);
    vec3.normalize(normal, normal);

    return normal;
  }

}
