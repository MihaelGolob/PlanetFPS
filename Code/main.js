import { State } from './States/BaseState.js';
import { MainMenuState } from './States/MainMenuState.js';

// global variables
export let debug_objects = [];
let oldTime = Date.now();

const canvas = document.querySelector('canvas');

State.setState(MainMenuState);
