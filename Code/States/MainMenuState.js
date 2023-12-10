import { MainMenuUI } from "../UI/MainMenuUI.js";
import { UserInterface } from "../UI/UserInterface.js";
import { State } from "./BaseState.js";

export class MainMenuState extends State {
  constructor() {
    super();
  }

  async onEnterState() {

    const response = await fetch('https://benjaminlipnik.eu/public/pages/planet_runner/?servers');
    const data = await response.json();

    UserInterface.setInstance(MainMenuUI);

    const ipListElement = document.getElementById('ip-list');

    data.push('ws://localhost:8080')
    data.push('ws://localhost:8088')
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;

      ipListElement.appendChild(option);
    });
  }

  onDeleteState() {
    const ipListElement = document.getElementById('ip-list');
    this.ip = ipListElement.value;
  }
}
