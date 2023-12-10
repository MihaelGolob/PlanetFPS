import { State } from "../States/BaseState.js";
import { GameState } from "../States/GameState.js";
import { UserInterface } from "./UserInterface.js"

export class MainMenuUI extends UserInterface {
  constructor() {
    super();
  }

  createElements() {
    // background
    const background = document.createElement('div');
    background.style.position = 'absolute';
    background.style.top = '0';
    background.style.left = '0';
    background.style.width = '100%';
    background.style.height = '100%';
    background.style.backgroundImage = 'url("../../Assets/backgrounds/bkg1_left2.png")'; // Replace with your image path
    background.style.backgroundSize = 'cover';
    background.style.backgroundPosition = 'center';
    background.style.backgroundRepeat = 'no-repeat';
    background.style.zIndex = '-1';
    this.uiContainer.appendChild(background);
    // title
    const header = document.createElement('h1');
    header.textContent = "Planet FPS";
    header.style.textAlign = 'center';
    header.style.color = 'white';
    header.style.fontFamily = 'Orbitron, sans-serif';
    header.style.fontSize = '72px';
    header.style.position = 'absolute';
    header.style.width = '100%';
    header.style.top = '50px';
    this.uiContainer.appendChild(header);
    // enter Name
    this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, this.canvasHeight / 2 - 150, "enter-name", "", null, "Vnesi ime", true);
    // ip
    this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, this.canvasHeight / 2 + 50, "ip", "", null, "127.0.0.1:8080", true);
    // play button
    this.createUIElement('../../Assets/ui_elements/Blue_button_3_big.png', 0.2, this.canvasWidth / 2, this.canvasHeight / 2 + 250, "", "Play", async () => {
      // play background mucic
      const backgroundMusic = document.getElementById('background-music');
      backgroundMusic.volume = 0.1;
      backgroundMusic.loop = true;
      backgroundMusic.play();
      
      await State.setState(GameState);
    }, "", true);
  }
}
