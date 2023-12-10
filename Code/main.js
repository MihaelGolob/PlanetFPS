import { State } from './States/BaseState.js';
import { MainMenuState } from './States/MainMenuState.js';

// global variables
export let debug_objects = [];
let oldTime = Date.now();

const canvas = document.querySelector('canvas');

// play background mucic
const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.1;
backgroundMusic.loop = true;
backgroundMusic.play();

State.setState(MainMenuState);
