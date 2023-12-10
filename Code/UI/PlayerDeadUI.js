import { State } from "../States/BaseState.js";
import { GameState } from "../States/GameState.js";
import { MainMenuState } from "../States/MainMenuState.js";
import { UserInterface } from "./UserInterface.js";

export class PlayerDeadUI extends UserInterface {
    constructor () {
        super();
    }

    createElements () {
        // go to main menu button
        this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, this.canvasHeight / 2 - 150, "", "Main Menu", async () => {
            await State.setState(MainMenuState);
        }, "", true);

        // restart button
        this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, this.canvasHeight / 2 + 50, "", "Restart", async () => {
            await State.setState(GameState);
        }, "", true);
    }
}