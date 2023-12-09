import { Bullet } from "./Components/FPS/Bullet.js";
import { NetworkPlayer } from "./NetworkPlayer.js";
import { Transform } from "../common/engine/core/Transform.js";

const Formats = {
    FmtCreatePlayer: 0,
    FmtDestroyPlayer: 1,
    FmtCreateBullet: 2,
    FmtSendPlayerTransform: 3,
};
export let NetworkPlayers = {};

export class NetworkManager {

    constructor() {
        this.id = Math.floor(10000 * Math.random() + 1);
        this._instance = null;
        this.socket = new WebSocket("ws://127.0.0.1:8088");
        this.socket.onmessage = async (event) => {
            await this.onNetMsg(JSON.parse(event.data));
        };       
        this.sendQueue = [];
        this.sendTransformBuffer = null;
        this.lastSendTime = 0; //za frekvenco pislijanja
        this.sendFrequency = 20; 
        this.sceneNode = null;
    }
    async onNetMsg(msg) {
        let time = Date.now();        

        let np = NetworkPlayers[msg.sender_id];
        if(np) {
            np.lastUpdate = time;
        }
        
        if(!(msg.target_id == this.id || msg.target_id == 0)) {
            return;
        }
        if(msg.sender_id == this.id) {
            return;
        }
        if(this.sceneNode == null) {   
            return;
        }

        // console.log(msg);

        switch(msg.msgFormat) {
            case Formats.FmtCreateBullet: {
                let bullet = new Bullet(this.sceneNode, msg.data.origin, msg.data.direction);
                bullet.initialize();
                break;
            }
            case Formats.FmtCreatePlayer: {
                if(NetworkPlayers[msg.sender_id] != null) {
                    return;
                }

                //poslji nazaj
                let newNetPlayer = new NetworkPlayer(msg.sender_id, "Player");
                await newNetPlayer.createPlayer();
                NetworkPlayers[msg.sender_id] = newNetPlayer;

                //poslji nazaj
                this.send(msg.sender_id, Formats.FmtCreatePlayer, null);
                break;
            }
            case Formats.FmtSendPlayerTransform: {
                let player = NetworkPlayers[msg.sender_id];
                if(!player)
                    break;

                player.setTransform(msg.data.position, msg.data.rotation);
                break;
            }
            case Formats.FmtDestroyPlayer: {
                let player = NetworkPlayers[msg.sender_id];
                if(!player)
                    break;

                console.log('destroying player');
                this.sceneNode.removeChild(player.playerNode);
                delete NetworkPlayers[player.id];
                break;
            }
        }
    }

    _send() {
        let time = Date.now();
        
        for(let i in NetworkPlayers) {
            let player = NetworkPlayers[i];
            if(Date.now() - player.lastUpdate > 1000) {
                this.sceneNode.removeChild(player.playerNode);
                delete NetworkPlayers[player.id];
            }
        }

        if(this.socket.readyState != WebSocket.OPEN)
            return;

        if(time - this.lastSendTime < 1000.0 / this.sendFrequency) {
            return;
        }
        this.lastSendTime = time;

        if(this.sendTransformBuffer) {
            this.socket.send(this.sendTransformBuffer);
            this.sendTransformBuffer = null;
        }
        this.sendQueue.forEach(msg => {
            this.socket.send(msg);
        });
        this.sendQueue = [];
    }


    send(target, format, data) {
        let msg = {
            sender_id: this.id,
            target_id: target,
            msgFormat: format, 
            data: data
        };
        msg = JSON.stringify(msg);
        if(format == Formats.FmtSendPlayerTransform) {
            this.sendTransformBuffer = msg;
        }else {
            this.sendQueue.push(msg);
        }
    }

    sendCreateBullet(origin, direction) {
        this.send(0, Formats.FmtCreateBullet, {origin: origin, direction: direction});
    }
    sendCreateNetPlayer() {
        this.send(0, Formats.FmtCreatePlayer, null);
    }
    sendDestroyNetPlayer() {
        this.send(0, Formats.FmtDestroyPlayer, null);
    }
    sendPlayerTransform(globalPos, globalRot) {
        this.send(0, Formats.FmtSendPlayerTransform, {
            position: globalPos,
            rotation: globalRot
        });
    }

    setSceneNode(sceneNode) {
        this.sceneNode = sceneNode;
    }

   static instance() {
        if (!NetworkManager._instance) {
            NetworkManager._instance = new NetworkManager();
        }

        //sendout
        NetworkManager._instance._send();

        return NetworkManager._instance;
    }
}