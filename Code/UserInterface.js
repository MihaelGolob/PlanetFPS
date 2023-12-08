class UserInterface {

  constructor() {
    this.uiContainer = document.getElementById("ui-container")

    const canvas = document.getElementById("canvas");
    this.canvasStyle = getComputedStyle(canvas);
    this.canvasWidth = parseInt(this.canvasStyle.width);
    this.canvasHeight = parseInt(this.canvasStyle.height);

    //this.removeAllcomponents();
    this.createElements();
  }

  removeAllcomponents() {
    while (this.uiContainer.firstChild) {
      this.uiContainer.removeChild(this.uiContainer.firstChild);
    }
  }

  createUIElement(src, scale, x, y, onClick = null) {

    const image = document.createElement('img');
    image.src = src;

    image.addEventListener('load', () => {

      image.style.width = `${scale * 100}%`;
      image.style.height = `${scale * 100}%`;
      image.style.position = 'absolute';

      x = x - (image.width) / 2;
      y = y - (image.height) / 2;

      image.style.left = `${x}px`;
      image.style.top = `${y}px`;

    });

    image.addEventListener('click', () => {
      if (onClick && typeof onClick === 'function') {
        onClick();
      }
    });

    this.uiContainer.appendChild(image);
  }

  createElements() { throw new Error("Not implemented for class UserInterface.") }
}

export class InGameUI extends UserInterface {

  constructor() {
    super();
  }

  createElements() {
    // kill count
    this.createUIElement("../Assets/ui_elements/Kill_count.png", 0.1, this.canvasWidth / 2, this.canvasHeight)
    // ammo count
    this.createUIElement("../Assets/ui_elements/Ammo_count.png", 0.1, 0, this.canvasHeight);
    // lifecount
    this.createUIElement("../Assets/ui_elements/Life_count.png", 0.1, this.canvasWidth, this.canvasHeight);
    // crosshair
    this.createUIElement("../Assets/ui_elements/crosshair062.png", 0.025, this.canvasWidth / 2, this.canvasHeight / 2);
  }
}

export class MainMenuUI extends UserInterface {

  constructor() {
    throw new Error("Not implemented");
    super();
  }
}
