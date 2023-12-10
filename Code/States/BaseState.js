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
    if (currInstance)
      currInstance.onDeleteState();

    let newInstance = new newState();
    console.log(newInstance);
    await newInstance.onEnterState();
  }

}
