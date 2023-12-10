export class State {

  constructor() {
    this.ip = "";
  }

  static getInstance() {
    if (!State.instance) {
      new State();
    }

    return State.instance;
  }

  static async setState(newState) {

    const currInstance = State.getInstance();
    if (currInstance) {
      currInstance.onDeleteState();
    }

    let newInstance = new newState();
    newInstance.ip = currInstance?.ip;
    console.log(newInstance);
    State.instance = newInstance;
    await newInstance.onEnterState();
  }

}
