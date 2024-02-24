const bestMutation = {
    brain: null,
    distance: null,
    time: null,
    score: null,
}

function saveBestMutation(bestCar) {
    localStorage.setItem('bestMutation', JSON.stringify(bestCar.brain));
}

function getBestMutation() {
    localStorage.getItem('bestMutation');
}

function resetMutation() {
    alert('Best brain reset');
    localStorage.removeItem('bestMutation');
}

function scoreBrain(car, road) {

}

