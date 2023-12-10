import { ResizeSystem } from '../common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../common/engine/systems/UpdateSystem.js';
import { Renderer } from './Renderer.js';
import { Scene } from './Scene.js';
import { Collider } from './Components/Collider.js';
import {
  Camera,
  Model,
  Node,
  Transform,
} from '../common/engine/core.js';
import { NetworkManager } from './Network.js';
import { UserInterface } from './UI/UserInterface.js';
import { GameState } from './States/GameState.js';
import { State } from './States/BaseState.js';
import { MainMenuState } from './States/MainMenuState.js';

function click(element) {
  console.log('clicked on', element);
}

// global variables
export let debug_objects = [];
let oldTime = Date.now();

const canvas = document.querySelector('canvas');

document.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');
  const canvas = document.getElementById('canvas');

  // Function to lock the pointer
  function lockPointer() {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
  }

  // Event listener for canvas click
  canvas.addEventListener('click', () => {
    // if (/* condition to check if pointer should be locked, e.g., not in game menu */) {
    lockPointer();
    // }
  });

  // Event listener for pointer lock change
  document.addEventListener('pointerlockchange', lockPointerChange, false);
  document.addEventListener('mozpointerlockchange', lockPointerChange, false);

  function lockPointerChange() {
    if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
      console.log('The pointer lock status is now locked');
      // Add your logic for when the cursor is locked
    } else {
      console.log('The pointer lock status is now unlocked');
      // Add your logic for when the cursor is unlocked
    }
  }
});

// play background mucic
const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.1;
backgroundMusic.loop = true;
backgroundMusic.play();

State.setState(MainMenuState);
