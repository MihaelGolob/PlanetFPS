import { Bullet } from "./Components/FPS/Bullet.js";
import { NetworkPlayer } from "./NetworkPlayer.js";
import { Transform } from "../common/engine/core/Transform.js";
import { NetworkPlayerInterpolationComponent } from "./Components/NetworkPlayerInterpolationComponent.js";

const Formats = {
  FmtCreatePlayer: 0,
  FmtDestroyPlayer: 1,
  FmtCreateBullet: 2,
  FmtSendPlayerTransform: 3,
};
export let NetworkPlayers = {};

export class NetworkManager {

  constructor(ip) {
    console.log(ip);
    this.id = Math.floor(10000 * Math.random() + 1);
    this._instance = null;
    this.socket = new WebSocket(ip);
    this.socket.onmessage = async (event) => {
      try {
        await this.onNetMsg(JSON.parse(event.data));
      }
      catch {
        console.log("Error parsing message: ", event.data);
      }
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
    if (np) {
      np.lastUpdate = time;
    }

    if (!(msg.target_id == this.id || msg.target_id == 0)) {
      return;
    }
    if (msg.sender_id == this.id) {
      return;
    }
    if (this.sceneNode == null) {
      return;
    }

    // console.log(msg);

    switch (msg.msgFormat) {
      case Formats.FmtCreateBullet: {
        let bullet = new Bullet(this.sceneNode, msg.data.origin, msg.data.direction, msg.sender_id);
        bullet.initialize();
        break;
      }
      case Formats.FmtCreatePlayer: {
        if (NetworkPlayers[msg.sender_id] != null) {
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
        if (!player)
          break;

        // player.setTransform(msg.data.position, msg.data.rotation);
        let updateTransform = player.playerNode.getComponentOfType(NetworkPlayerInterpolationComponent);
        updateTransform.updateTransform(msg.data.position, msg.data.rotation);

        break;
      }
      case Formats.FmtDestroyPlayer: {
        let player = NetworkPlayers[msg.sender_id];

        if (!player)
          break;

        console.log(msg.data.killedBy)
        if (msg.data.killedBy == this.id) {
          let killCount = document.getElementById('kill-count');
          let curKillCount = killCount.textContent;
          killCount.textContent = curKillCount + 1;
        }

        console.log('destroying player');
        this.sceneNode.removeChild(player.playerNode);
        delete NetworkPlayers[player.id];
        break;
      }
    }
  }

  _send() {
    let time = Date.now();

    for (let i in NetworkPlayers) {
      let player = NetworkPlayers[i];
      if (Date.now() - player.lastUpdate > 1000) {
        this.sceneNode.removeChild(player.playerNode);
        delete NetworkPlayers[player.id];
      }
    }

    if (this.socket.readyState != WebSocket.OPEN)
      return;

    if (time - this.lastSendTime < 1000.0 / this.sendFrequency) {
      return;
    }
    this.lastSendTime = time;

    if (this.sendTransformBuffer) {
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
    if (format == Formats.FmtSendPlayerTransform) {
      this.sendTransformBuffer = msg;
    } else {
      this.sendQueue.push(msg);
    }
  }

  sendCreateBullet(origin, direction) {
    this.send(0, Formats.FmtCreateBullet, { origin: origin, direction: direction });
  }
  sendCreateNetPlayer() {
    this.send(0, Formats.FmtCreatePlayer, null);
  }
  sendDestroyNetPlayer(killer) {
    this.send(0, Formats.FmtDestroyPlayer, { killedBy: killer });
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

  static instance(ip = "127.0.0.1:8080") {
    if (!NetworkManager._instance) {
      NetworkManager._instance = new NetworkManager(ip);
    }

    //sendout
    NetworkManager._instance._send();

    return NetworkManager._instance;
  }
}
