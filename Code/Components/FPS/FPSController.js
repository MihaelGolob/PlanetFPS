export class FPSController{
    constructor(transform) {
        this.transform = transform;

        // setup functions
        this.initInputHandler();

        // movement parameter initialization
        this.movementSpeed = 10;
    }

    initInputHandler() {
        this.keysDictionary = {};
        this.keysToTrack = [65, 87, 68, 83];
        this.setupKeysDictionary();

        document.addEventListener('keydown', (event) => {
            this.keysToTrack.forEach((key, index) => {
                if (key == event.keyCode) {
                    // track key down
                    this.keysDictionary[key] = 1;
                }
            });
        });

        document.addEventListener('keyup', (event) => {
            this.keysToTrack.forEach((key, index) => {
                if (key == event.keyCode) {
                    // track key down
                    this.keysDictionary[key] = 0;
                }
            });
        });
    }

    setupKeysDictionary() {
        this.keysToTrack.forEach((key, _) => {
            this.keysDictionary[key] = 0;
        });
    }

    update(deltaTime) {
    }
}