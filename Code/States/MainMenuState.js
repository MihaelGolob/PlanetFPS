import { MainMenuUI } from "../UI/MainMenuUI.js";
import { UserInterface } from "../UI/UserInterface.js";
import { State } from "./BaseState.js";

export class MainMenuState extends State {
  constructor() {
    super();
  }

  async onEnterState() {
    UserInterface.setInstance(MainMenuUI);
  }

  onDeleteState() {

  }
}
