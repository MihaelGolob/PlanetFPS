import { UserInterface } from "./UserInterface.js"

export class InGameUI extends UserInterface {

  constructor() {
    super();
  }

  createElements() {
    // kill count
    this.createUIElement("../Assets/ui_elements/Kill_count.png", 0.2, 50, 93, "kill-count", "0")
    // ammo count
    this.createUIElement("../Assets/ui_elements/Ammo_count.png", 0.2, 10, 93, "ammo-count", "1000");
    // lifecount
    this.createUIElement("../Assets/ui_elements/Life_count.png", 0.2, 90, 93, "life-count", "100");
    // crosshair
    this.createUIElement("../Assets/ui_elements/crosshair062.png", 1, 50, 50, "", "", null, "", false, 0.7);
  }
}

