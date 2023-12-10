export class State {

  constructor() {
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
      console.log("deleting state");
      currInstance.onDeleteState();
    }


    let newInstance = new newState();
    State.instance = newInstance;
    await newInstance.onEnterState();
  }

}
