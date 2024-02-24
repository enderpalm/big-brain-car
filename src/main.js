// get ref to roadViewport
const simulationSpeed = 2;
const roadViewport = document.getElementById('roadViewport');
roadViewport.height = window.innerHeight * 0.8;
const roadContext = roadViewport.getContext('2d');

const networkViewport = document.getElementById('neuralNetworkViewport');
const networkContext = networkViewport.getContext('2d');

const road = new Road(
    roadViewport.clientWidth / 2,
    roadViewport.clientWidth,
    INFINITY,
    3
);

let traffic = [];

let { agentCar, bestCar } = newBatch();

function onReBatch() {
    saveBestMutation(bestCar);
    const { agentCar: newAgentCar, bestCar: newBestCar } = newBatch();
    agentCar = newAgentCar;
    bestCar = newBestCar;
    traffic = [];
    trafficCount = 0;
}

tick();

function tick() {

    fixViewPortDpi(roadViewport, roadContext);
    fixViewPortDpi(networkViewport, networkContext);

    // clear canvas
    roadContext.clearRect(0, 0, roadViewport.width, roadViewport.height);
    networkContext.clearRect(
        0,
        0,
        networkViewport.width,
        networkViewport.height
    );
    
    const offScreen = bestCar.y + window.innerHeight * 0.5;

    trafficSpawn(bestCar, traffic, road, 0.007, true, offScreen);
    
    // update agent car
    agentCar = agentCar.filter((car) => {
        car.update(road, traffic, offScreen);
        return car.crashState !== 2;
    });
    

    if (agentCar.length === 0) {
        onReBatch();
    }

    // finding best car
    bestCar = agentCar.reduce((a, b) => (a.y < b.y ? a : b));

    roadContext.save();
    roadContext.translate(0, -bestCar.y + window.innerHeight * 0.6);

    // render call
    road.renderRoadLines(roadContext);
    traffic.forEach((t) => {
        t.renderCar(roadContext);
    });

    traffic = traffic.filter((t) => {
        t.update(road, [], offScreen);
        return t.crashState !== 2;
    });

    agentCar.forEach((car) => {
        let isBestCar = car === bestCar;
        roadContext.globalAlpha = isBestCar ? 1 : 0.25;
        car.renderCar(roadContext, isBestCar);
        roadContext.globalAlpha = 1;
    });

    // offscreen line
    roadContext.beginPath();
    roadContext.strokeStyle = 'white';
    roadContext.moveTo(0, offScreen);
    roadContext.lineTo(roadViewport.width, offScreen);
    roadContext.stroke();

    

    roadContext.restore();

    networkContext.beginPath();
    networkContext.font = '10px Jetbrains Mono';
    networkContext.fillStyle = 'white';
    networkContext.fillText(`remaining: ${agentCar.length}`, 10, 20);
    networkContext.fillText(`bestLane: ${road.getClosestCurrentLane(bestCar)}`, 10, 40);
    networkContext.fillText(`bestY: ${bestCar.y.toFixed(2)}`, 10, 60);
    networkContext.fillText('traffic: ' + traffic.length, 10, 80);

    networkContext.closePath();

    requestAnimationFrame(tick);
}

function fixViewPortDpi(viewPort, viewPortContext) {
    const bound = viewPort.getBoundingClientRect();
    viewPort.width = bound.width * devicePixelRatio;
    viewPort.height = bound.height * devicePixelRatio;
    viewPortContext.scale(devicePixelRatio, devicePixelRatio);
    viewPort.style.width = `${bound.width}px`;
    viewPort.style.height = `${bound.height}px`;
}
