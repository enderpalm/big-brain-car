class Sensor {
    constructor(car) {
        this.car = car;

        // raycast param
        this.rayCount = 15;
        this.rayLength = 500;
        this.raySpread = Math.PI * 0.6;
        this.frontOffset = 30;

        this.rayList = [];
        this.rayReadings = [];
    }

    update(roadInstance, traffic) {
        this.#createRays();
        this.rayReadings = [];
        for (let i = 0; i < this.rayList.length; i++) {
            const ray = this.rayList[i];
            const hit = this.#getRayCastResult(
                ray,
                roadInstance.corners,
                traffic
            );
            this.rayReadings.push(hit);
        }
    }

    #createRays() {
        this.rayList = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread * 0.5,
                -this.raySpread * 0.5,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            );

            const rayStart = {
                x: this.car.x + Math.sin(this.car.angle) * this.frontOffset,
                y: this.car.y - Math.cos(this.car.angle) * this.frontOffset,
            };

            const relativeAngle = this.car.angle + rayAngle;

            const rayEnd = {
                x: rayStart.x + this.rayLength * Math.sin(relativeAngle),
                y: rayStart.y - this.rayLength * Math.cos(relativeAngle),
            };

            this.rayList.push([rayStart, rayEnd]);
        }
    }

    #getRayCastResult(ray, roadCorners, traffic) {
        const innerHit = [];
        for (let j = 0; j < 2; j++) {
            const roadHit = getSegmentIntercept(
                ray[0],
                ray[1],
                roadCorners[2 * j],
                roadCorners[2 * j + 1]
            );

            if (roadHit) innerHit.push(roadHit);
        }

        traffic
            .filter((car) => {
                const a = car.x - this.car.x;
                const b = car.y - this.car.y;
                return a * a + b * b < 2 * this.rayLength * this.rayLength;
            })
            .forEach((car) => {
                const vertexList = car.getVertices();
                for (let j = 0; j < vertexList.length; j++) {
                    const carHit = getSegmentIntercept(
                        ray[0],
                        ray[1],
                        vertexList[j],
                        vertexList[(j + 1) % vertexList.length]
                    );
                    if (carHit) innerHit.push(carHit);
                }
            });

        return innerHit.length === 0
            ? null
            : innerHit.reduce((a, b) => (a.offset < b.offset ? a : b));
    }

    renderDebugSensor(ctx) {
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        for (let i = 0; i < this.rayList.length; i++) {
            const ray = this.rayList[i];

            if (this.rayReadings[i]) {
                this.#drawLine(ctx, ray[0], this.rayReadings[i], '#ededed');
                this.#drawLine(ctx, this.rayReadings[i], ray[1], '#dd614a');
                ctx.beginPath();
                ctx.fillStyle = '#dd614a';
                ctx.arc(
                    this.rayReadings[i].x,
                    this.rayReadings[i].y,
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else {
                this.#drawLine(ctx, ray[0], ray[1], '#ededed');
            }
        }
    }

    #drawLine(ctx, start, end, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
}
