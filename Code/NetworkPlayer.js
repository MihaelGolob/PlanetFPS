import { NetworkManager } from "./Network.js";
import { GLTFLoader } from "../common/engine/loaders/GLTFLoader.js";
import {
  Camera,
  Model,
  Node,
  Transform,
} from '../common/engine/core.js';
import { NetworkPlayerInterpolationComponent } from "./Components/NetworkPlayerInterpolationComponent.js";

export class NetworkPlayer {
    constructor(id, name) {
        this.position = [0,20,0];
        this.rotation = [0,0,0,1];
        this.name = name;
        this.id = id;
        this.playerNode = null;
        this.transform = null;
        this.lastUpdate = Date.now();
    }

    async createPlayer() {
        let loader = new GLTFLoader();
        await loader.load('../Assets/Models/netPlayer.gltf');
        this.playerNode = loader.loadNode(0);
        this.playerNode.id = this.id;
        
        // transform
        this.transform = this.playerNode.getComponentOfType(Transform);
        this.transform.translation = this.position;
        this.transform.rotation = this.rotation;
        NetworkManager.instance().sceneNode.addChild(this.playerNode);

        // transform updater
        this.playerNode.addComponent(new NetworkPlayerInterpolationComponent(this.transform));
    }    

    setTransform(position, rotation) {
        this.transform.translation = position;
        this.transform.rotation = rotation;
    }

}