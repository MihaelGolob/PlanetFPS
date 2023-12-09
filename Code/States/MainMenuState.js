import { UserInterface, MainMenuUI } from "../UserInterface.js";
import { BaseState } from "./BaseState.js";

export class MainMenuState extends BaseState {
    constructor() {
        UserInterface.instance() = new MainMenuUI();
    }

    startGame() {

    }
}