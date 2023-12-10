// interfaces = [MainMenuUI, InGameUI]

export class UserInterface {

  constructor() {
    this.uiContainer = document.getElementById("ui-container")

    const canvas = document.getElementById("canvas");
    this.canvasStyle = getComputedStyle(canvas);
    this.canvasWidth = parseInt(this.canvasStyle.width);
    this.canvasHeight = parseInt(this.canvasStyle.height);

    this.createElements();
    UserInterface.instance = this;
  }

  removeAllcomponents() {
    while (this.uiContainer.firstChild) {
      this.uiContainer.removeChild(this.uiContainer.firstChild);
    }
  }
  //
  // updatePos() {
  //
  //   console.log("UI change pos");
  //
  //   for (let i = 0; i < this.uiContainer.children.length; i++) {
  //     let image = this.uiContainer.children[i];
  //
  //     image.style.position = 'absolute';
  //
  //     x = x - (image.width) / 2;
  //     y = y - (image.height) / 2;
  //
  //     image.style.left = `${x}px`;
  //     image.style.top = `${y}px`;
  //   }
  // }

  createUIElement(src, scale, x, y, id = "", text = "", onClick = null, textbox = "") {
    // Create a container for the image and text
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

    const image = document.createElement('img');
    image.src = src;

    image.addEventListener('load', () => {
      const imageScaledWidth = image.naturalWidth * scale;
      const imageScaledHeight = image.naturalHeight * scale;

      image.style.width = `${imageScaledWidth}px`;
      image.style.height = `${imageScaledHeight}px`;

      const xRatio = ((x - imageScaledWidth / 2) / this.canvasWidth) * 100;
      const yRatio = ((y - imageScaledHeight / 2) / this.canvasHeight) * 100;

      container.style.left = `${xRatio}%`;
      container.style.top = `${yRatio}%`;
      container.style.width = `${imageScaledWidth}px`;
      container.style.height = `${imageScaledHeight}px`;
    });

    if (onClick && typeof onClick === 'function') {
      image.addEventListener('click', onClick);
    }

    container.appendChild(image);

    if (text) {
      const textElement = document.createElement('span');
      textElement.textContent = text;
      textElement.style.position = 'absolute';
      textElement.style.color = 'white';
      textElement.style.fontSize = '20px';
      textElement.style.fontFamily = 'Orbitron';
      textElement.id = id;

      container.appendChild(textElement);
    }

    if (textbox) {
      const textboxElement = document.createElement('input');
      textboxElement.type = 'text';
      textboxElement.placeholder = textbox;
      textboxElement.style.position = 'absolute';
      textboxElement.style.top = '50%';
      textboxElement.style.left = '50%';
      textboxElement.style.transform = 'translate(-50%, -50%)';
      textboxElement.style.zIndex = '10';
      textboxElement.style.fontFamily = 'Orbitron';
      textboxElement.style.fontSize = '20px';
      container.appendChild(textboxElement);
    }

    this.uiContainer.appendChild(container);
  }

  createElements() { return; }

  static getInstance() {
    if (!UserInterface.instance) {
      new UserInterface();
    }

    return UserInterface.instance;
  }

  static setInstance(newInstance) {

    // if (!(newInstance.prototype instanceof UserInterface)) throw Error("The UI you tried to change to is not a child class of the base UI");

    const currInstance = UserInterface.getInstance();
    currInstance.removeAllcomponents();

    new newInstance();
  }
}


