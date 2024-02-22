const padding = 15;

class Road {
    constructor(x, width, height, laneCount = 3) {
        this.x = x;
        this.width = width - 2 * padding;
        this.height = height;
        this.laneCount = laneCount;

        this.left = x - this.width / 2;
        this.right = x + this.width / 2;
        this.top = this.height * -0.5;
        this.bottom = this.height * 0.5;

        this.corners = [
            { x: this.left, y: this.top },
            { x: this.left, y: this.bottom },
            { x: this.right, y: this.top },
            { x: this.right, y: this.bottom },
        ];

        this.borders = [
            { start: this.corners[0], end: this.corners[1] },
            { start: this.corners[2], end: this.corners[3] },
        ];

        this.roadLinesX = new Array(this.laneCount + 1);
        this.roadLinesX[0] = this.borders[0].start.x;
        for (let i = 1; i < this.laneCount; i++) {
            this.roadLinesX[i] = i * (this.width / this.laneCount) + padding;
        }
        this.roadLinesX[this.laneCount] = this.borders[1].start.x;

        this.laneCenter = new Array(this.laneCount);
        for (let i = 0; i < this.laneCount; i++) {
            this.laneCenter[i] = this.getLaneCenter(i);
        }

        console.table(this.roadLinesX);
    }

    renderRoadLines(ctx) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#454545';

        // lane lines
        for (let i = 0; i <= this.laneCount; i++) {
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.setLineDash(i == 0 || i == this.laneCount ? [] : [20, 20]);
            ctx.moveTo(this.roadLinesX[i], -this.height);
            ctx.lineTo(this.roadLinesX[i], this.height);
            ctx.stroke();
        }
    }

    getLaneCenter(idx) {
        return (idx + 0.5) * (this.width / this.laneCount) + padding;
    }

    getClosestCurrentLane(car) {
        return Math.floor((car.x - this.roadLinesX[0]) / (this.roadLinesX[1] - this.roadLinesX[0]))
    }

    getAABB() {
        const collection = [];
        this.borders.map((border) => {
            collection.push({
                x: border.start.x,
                y: border.start.y,
                width: border.end.x - border.start.x,
                height: border.end.y - border.start.y,
            });
        });
        return collection;
    }

    getBorderVertices() {
        const collection = [];
        this.borders.map((border) => {
            collection.push([border.start, border.end]);
        });
        return collection;
    }
}
