import { UserInterface } from "./UserInterface.js"

export class InGameUI extends UserInterface {

  constructor() {
    super();
  }

  createElements() {
    // kill count
    this.createUIElement("../Assets/ui_elements/Kill_count.png", 0.2, this.canvasWidth / 2, this.canvasHeight - 50, "100")
    // ammo count
    this.createUIElement("../Assets/ui_elements/Ammo_count.png", 0.2, 50, this.canvasHeight - 50, "100");
    // lifecount
    this.createUIElement("../Assets/ui_elements/Life_count.png", 0.2, this.canvasWidth - 50, this.canvasHeight - 50, "life-count", "100");
    // crosshair
    this.createUIElement("../Assets/ui_elements/crosshair062.png", 1, this.canvasWidth / 2, this.canvasHeight / 2, "", "", null, "", false, 0.7);
  }
}

