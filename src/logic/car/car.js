// physic constants
const friction = 0.02;
const acceleration = 0.2;
const steeringAngle = 0.05;

class Car {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     */
    constructor(
        x,
        y,
        width,
        height,
        maxSpeed = 2,
        initialAngle = 0,
        driveMode = DriveMode.Dummy
    ) {
        // pos & size
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vertices = this.#createVertex();

        // motions
        this.controls = new CarControls(driveMode);
        this.maxSpeed = maxSpeed;
        this.speed = 0;
        this.angle = initialAngle;

        // sensor
        if (driveMode !== DriveMode.Dummy) {
            this.sensor = new Sensor(this);

            if (driveMode === DriveMode.Brain)
                this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }
        this.crashState = 0;
        this.discarded = false;
    }

    update(roadInstance, traffic = [], offScreen) {

        if (this.crashState === 2) {
            if (!this.discarded) {
                this.discarded = true;
                remainingAgentCount--;
            }
            return;
        }

        // check collision
        this.crashState = 0;
        const roughCollide =
            isAABBCollide([this.getAABB()], roadInstance.getAABB()) ||
            isAABBCollide(
                [this.getAABB()],
                traffic.map((t) => t.getAABB())
            );
        if (roughCollide) {
            this.crashState = 1;
            roadInstance.getBorderVertices().forEach((v) => {
                if (isPolygonsCollide(this.vertices, v)) this.crashState = 2;
            });
            traffic.forEach((t) => {
                if (isPolygonsCollide(this.vertices, t.getVertices()))
                    this.crashState = 2;
            });
        }

        if (this.y > offScreen && this.crashState != 2) this.crashState = 2; 

        this.#updatePhysics();
        this.vertices = this.#createVertex();
        if (this.sensor) {
            this.sensor.update(roadInstance, traffic);

            if (this.brain) {
                const prox = this.sensor.rayReadings.map((r) => {
                    return r == null ? 0 : 1 - r.offset;
                });
                const outputs = NeuralNetwork.feedForward(this.brain, prox);
                this.controls.forward = outputs[0];
                this.controls.backward = outputs[1];
                this.controls.left = outputs[2];
                this.controls.right = outputs[3];
            }
        }
    }

    #updatePhysics() {
        // Euler integration
        if (this.controls.forward) {
            this.speed += acceleration;
            this.speed = Math.min(this.speed, this.maxSpeed);
        }
        if (this.controls.backward) {
            this.speed -= acceleration;
            this.speed = Math.max(this.speed, -this.maxSpeed);
        }

        // adding friction
        if (this.speed > 0) {
            this.speed -= friction;
        } else if (this.speed < 0) {
            this.speed += friction;
        }

        // fix ghost friction
        if (Math.abs(this.speed) < friction) {
            this.speed = 0;
        }

        // steer only when moving
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle -= steeringAngle * flip;
            }
            if (this.controls.right) {
                this.angle += steeringAngle * flip;
            }

            if (this.angle > Math.PI * 2) {
                this.angle -= Math.PI * 2;
            }

            if (this.angle < 0) {
                this.angle += Math.PI * 2;
            }
        }

        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }

    #createVertex() {
        const verts = [];
        const halfDiag = Math.hypot(this.width, this.height) * 0.5;
        const alpha = Math.atan2(this.width, this.height);
        const sinAngSubAlphaDiag = Math.sin(this.angle - alpha) * halfDiag;
        const cosAngSubAlphaDiag = Math.cos(this.angle - alpha) * halfDiag;
        const sinAngAddAlphaDiag = Math.sin(this.angle + alpha) * halfDiag;
        const cosAngAddAlphaDiag = Math.cos(this.angle + alpha) * halfDiag;

        verts.push(
            {
                x: this.x + sinAngSubAlphaDiag,
                y: this.y - cosAngSubAlphaDiag,
            },
            {
                x: this.x + sinAngAddAlphaDiag,
                y: this.y - cosAngAddAlphaDiag,
            },
            {
                x: this.x - sinAngSubAlphaDiag,
                y: this.y + cosAngSubAlphaDiag,
            },
            {
                x: this.x - sinAngAddAlphaDiag,
                y: this.y + cosAngAddAlphaDiag,
            }
        );
        return verts;
    }

    getVertices() {
        return this.vertices;
    }

    /**
     * Get AABB of the car
     * @returns [x, y, width, height]
     */
    getAABB() {
        const x = this.vertices.map((v) => v.x);
        const y = this.vertices.map((v) => v.y);
        return {
            x: Math.min(...x),
            y: Math.min(...y),
            width: Math.max(...x) - Math.min(...x),
            height: Math.max(...y) - Math.min(...y),
        };
    }

    renderCar(ctx, renderSensor) {
        // car body
        ctx.beginPath();
        ctx.fillStyle = this.crashState === 2 ? 'gray' : '#0f8b8d';
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        this.vertices.forEach((v) => {
            ctx.lineTo(v.x, v.y);
        });
        ctx.fill();

        if (this.crashState == 2) return;

        // vertices
        this.vertices.forEach((v) => {
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.arc(v.x, v.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // AABB
        const aabb = this.getAABB();
        ctx.strokeStyle = this.crashState ? '#dd614a' : '#ededed';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.lineCap = 'round';
        ctx.strokeRect(aabb.x, aabb.y, aabb.width, aabb.height);
        ctx.setLineDash([]);

        if (this.sensor) {
            // debug text
            ctx.fillStyle = 'white';
            ctx.font = '10px Jetbrains Mono';
            ctx.fillText('v ' + this.speed.toFixed(2), this.x - 18, this.y - 5);
            ctx.fillText(
                'h ' + this.angle.toFixed(2),
                this.x - 18,
                this.y + 10
            );

            if (!renderSensor) return;

            // render rays
            this.sensor.renderDebugSensor(ctx);
        }
    }
}

const DriveMode = {
    Dummy: Symbol('Dummy'),
    Player: Symbol('Player'),
    Brain: Symbol('Brain'),
};
