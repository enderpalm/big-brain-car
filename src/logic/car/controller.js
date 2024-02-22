class CarControls {
    constructor(driveMode) {
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;

        // add keyboard event listeners
        switch(driveMode) {
            case DriveMode.Dummy:
                this.forward = true;
                break;
            case DriveMode.Player:
                this.#addKeyboardListeners();
                break;
        }
    }

    #addKeyboardListeners() {
        document.onkeydown = (e) => {
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    this.forward = true;
                    break;
                case 's':
                case 'ArrowDown':
                    this.backward = true;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.left = true;
                    break;
                case 'd':
                case 'ArrowRight':
                    this.right = true;
                    break;
            }
        };

        document.onkeyup = (e) => {
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    this.forward = false;
                    break;
                case 's':
                case 'ArrowDown':
                    this.backward = false;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.left = false;
                    break;
                case 'd':
                case 'ArrowRight':
                    this.right = false;
                    break;
            }
        };
    }
}
