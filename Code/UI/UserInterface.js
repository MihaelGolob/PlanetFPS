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

  createUIElement(src, scale, xPercent, yPercent, id = "", text = "", onClick = null, textbox = "", hover = false, opacity = 1.0) {
    // Create a container for the image and text
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.opacity = opacity;
    container.id = 'ui-container-div';

    const image = document.createElement('img');
    image.src = src;
    image.opacity = opacity;

    image.addEventListener('load', () => {
      const imageScaledWidth = image.naturalWidth * scale;
      const imageScaledHeight = image.naturalHeight * scale;

      image.style.width = `${imageScaledWidth}px`;
      image.style.height = `${imageScaledHeight}px`;

      container.style.left = `${xPercent}%`;
      container.style.top = `${yPercent}%`;
      container.style.transform = 'translate(-50%, -50%)';
      container.style.width = `${imageScaledWidth}px`;
      container.style.height = `${imageScaledHeight}px`;
    });

    if (onClick && typeof onClick === 'function') {
      image.addEventListener('click', onClick);
    }

    if (hover) {
      container.classList.add('hover-effect');
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

      textElement.addEventListener('click', onClick);

      container.appendChild(textElement);
    }

    if (textbox && !text) {
      const textboxElement = document.createElement('input');
      textboxElement.type = 'text';
      textboxElement.value = textbox;
      textboxElement.placeholder = textbox;
      textboxElement.style.position = 'absolute';
      textboxElement.style.top = '50%';
      textboxElement.style.left = '50%';
      textboxElement.style.transform = 'translate(-50%, -50%)';
      textboxElement.style.zIndex = '10';
      textboxElement.style.fontFamily = 'Orbitron';
      textboxElement.style.fontSize = '20px';
      textboxElement.id = id;
      container.appendChild(textboxElement);
    }

    this.uiContainer.appendChild(container);

  }

  createUIDropdownElement(src, scale, xPercent, yPercent, id) {

    let container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.id = 'ui-container-div';

    const image = document.createElement('img');
    image.src = src;

    image.addEventListener('load', () => {
      const imageScaledWidth = image.naturalWidth * scale;
      const imageScaledHeight = image.naturalHeight * scale;

      image.style.width = `${imageScaledWidth}px`;
      image.style.height = `${imageScaledHeight}px`;

      container.style.left = `${xPercent}%`;
      container.style.top = `${yPercent}%`;
      container.style.transform = 'translate(-50%, -50%)';
      container.style.width = `${imageScaledWidth}px`;
      container.style.height = `${imageScaledHeight}px`;
    });

    container.appendChild(image)

    const selectElement = document.createElement('select');
    selectElement.id = id;
    selectElement.style.position = 'absolute';
    selectElement.style.top = '50%';
    selectElement.style.left = '50%';
    selectElement.style.width = '75%';
    selectElement.style.transform = 'translate(-50%, -50%)';
    selectElement.style.zIndex = '10';
    selectElement.style.fontFamily = 'Orbitron';
    selectElement.style.fontSize = '20px';
    selectElement.id = id;

    container.appendChild(selectElement)

    document.getElementById('ui-container').appendChild(container)

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


