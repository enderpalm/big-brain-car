class NeuralNetwork {
    constructor(neuronsPerLevel) {
        this.score = 0;
        this.layers = [];
        for (let i = 0; i < neuronsPerLevel.length - 1; i++) {
            this.layers.push(
                new Layer(neuronsPerLevel[i], neuronsPerLevel[i + 1])
            );
        }
    }

    static feedForward(networkInstance, inputs) {
        let outputs = Layer.feedForward(networkInstance.layers[0], inputs);
        for (let i = 1; i < networkInstance.layers.length; i++) {
            // previous layer's output is the next layer's input
            outputs = Layer.feedForward(networkInstance.layers[i], outputs);
        }
        return outputs;
    }

    static mutate(networkInstance, mutationRate = 1) {
        networkInstance.layers.map((layer) => {
            // mutate bias
            for (let i = 0; i < layer.biases.length; i++) {
                layer.biases[i] = lerp(
                    layer.biases[i],
                    Math.random() * 2 - 1,
                    mutationRate
                );
            }

            // mutate weights
            for (let i = 0; i < layer.weights.length; i++) {
                for (let j = 0; j < layer.weights[i].length; j++) {
                    layer.weights[i][j] = lerp(
                        layer.weights[i][j],
                        Math.random() * 2 - 1,
                        mutationRate
                    );
                }
            }
        });
    }
}
