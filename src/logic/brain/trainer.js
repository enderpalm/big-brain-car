const currentLaneBias = 0.5;
let remainingAgentCount = 0;

const trafficCap = 6;
let trafficCount = 0;
let spawnedCoords = new Array(trafficCap);

function saveBestBrain(bestCar) {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
}

function resetBestBrain() {
    alert('Best brain reset');
    localStorage.removeItem('bestBrain');
}

function generateBatchCars(count) {
    remainingAgentCount = count;
    const cars = [];
    for (let i = 0; i < count; i++) {
        cars.push(
            new Car(
                road.laneCenter[1],
                -Math.random() * 100,
                50,
                80,
                4,
                0,
                DriveMode.Brain
            )
        );
    }
    return cars;
}

function newBatch() {
    const agentCar = generateBatchCars(50);

    let bestCar = agentCar[0];
    let storedBrain = localStorage.getItem('bestBrain');
    if (storedBrain) {
        for (let i = 0; i < agentCar.length; i++) {
            agentCar[i].brain = JSON.parse(storedBrain);
            if (i != 0) {
                NeuralNetwork.mutate(agentCar[i].brain, 0.3);
            }
        }
    }

    return { agentCar, bestCar };
}

/**
 * @param {Car} bestCar
 * @param {Car[]} traffic
 * @param {Road} road
 * @param {float} spawnRate
 * @param {boolean} shouldSpawn
 * @returns
 */
function trafficSpawn(bestCar, traffic, road, spawnRate, shouldSpawn, offScreen) {
    if (traffic.length >= trafficCap || !shouldSpawn || Math.random() > spawnRate)
        return;

    const spawnY = bestCar.y - window.innerHeight * 0.6;

    const bestCarLane = road.getClosestCurrentLane(bestCar);
    const spawnX =
        Math.random() <= currentLaneBias
            ? road.laneCenter[bestCarLane]
            : road.laneCenter[Math.floor(Math.random() * road.laneCount)];
    traffic.push(
        new Car(spawnX, spawnY, 50, 80, 2, 0, DriveMode.Dummy)
    );

}