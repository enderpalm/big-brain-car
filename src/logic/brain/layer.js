class Layer {
    constructor(inCnt, OutCnt) {
        // Neurons setup
        this.inputs = new Array(inCnt);
        this.outputs = new Array(OutCnt);
        this.biases = new Array(OutCnt);

        this.weights = [];
        for (let i = 0; i < inCnt; i++) {
            this.weights[i] = new Array(OutCnt);
        }


        Layer.#initialize(this);
    }

    static #initialize(instance) {
        // Initialize weights and biases
        for (let i = 0; i < instance.inputs.length; i++) {
            for (let j = 0; j < instance.outputs.length; j++) {
                instance.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < instance.biases.length; i++) {
            instance.biases[i] = Math.random() * 2 - 1;
        }
    }

    /**
     * Propagate signal through the layer
     * @param {Layer} instance 
     * @param {Array} inputs 
     */
    static feedForward(instance, inputs) {
        for (let i = 0; i < instance.inputs.length; i++) {
            instance.inputs[i] = inputs[i];
        }

        for (let i = 0; i < instance.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < instance.inputs.length; j++) {
                sum += instance.inputs[j] * instance.weights[j][i];
            }
            
            instance.outputs[i] = sum > instance.biases[i] ? 1 : 0;
        }

        return instance.outputs;
    }
}
