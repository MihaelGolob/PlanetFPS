import { State } from "../States/BaseState.js";
import { GameState } from "../States/GameState.js";
import { UserInterface } from "./UserInterface.js"

export class MainMenuUI extends UserInterface {
  constructor() {
    super();
  }

  createElements() {
    // Play Button
    this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, 100, "", "Play", async () => {
      await State.setState(GameState);
    });
    // ammo count
    this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, 300)
    // lifecount
    this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, 600)
    // crosshair
    this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, this.canvasHeight - 50)
  }
}
