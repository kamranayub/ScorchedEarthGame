/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />

class Point {

    x: number;

    y: number;

    constructor(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }
}

class Landmass extends Actor {

    // config
    config: any = {
        
    };

    // private vars

    pixelBuffer: number[];

    border: Point[] = [];

    constructor(public ctxWidth: number, public ctxHeight: number) {
        super(0, 0, null, null, Colors.Land);

        this.pixelBuffer = new Array<number>(ctxWidth * ctxHeight);
        this.ctxHeight = ctxHeight;
        this.ctxWidth = ctxWidth;
        this.generate();
    }

    public update(engine: Engine, delta: number) {
        super.update(engine, delta);


    }

    public draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta);

        ctx.fillStyle = Colors.Land.toString();

        // Fill in the landmass
        var _ref;
        for (var col = 0; col < this.ctxWidth; col++) {
            for (var row = 0; row < this.ctxHeight; row++) {

                _ref = this.pixelBuffer[col + row * this.ctxWidth];

                if (_ref === 1) {
                    ctx.fillRect(col, row, 1, 1);
                }
            }
        }
    }

    private generate(): void {

        // land goes to bottom of screen (for now)
        var lowerBounds: number = 300;
        var upperBounds: number = Math.random() * (this.ctxHeight - 330) + 330;

        var leftY: number = Math.random() * (upperBounds - lowerBounds) + lowerBounds;
        var rightY: number = Math.random() * (upperBounds - lowerBounds) + lowerBounds;

        // bisect
        var bisect = (minX, maxX, minY, maxY, maxDepth) => {
            if (maxDepth < 0) return;

            var middleX = (minX + maxX) / 2.0;
            var newY = Math.random() * (maxY - minY) + minY;
            var point = new Point(middleX, newY);

            // push point
            this.border.push(point);

            // bisect
            bisect(minX, middleX, minY, newY, maxDepth - 1);
            bisect(middleX, maxX, minY, newY, maxDepth - 1);
        };

        // kick it off
        this.border.push(new Point(0, leftY));
        bisect(0, this.ctxWidth, lowerBounds, upperBounds, 2);
        this.border.push(new Point(this.ctxWidth, rightY));

        // sort the border by X coordiate
        this.border.sort((a: Point, b: Point) => {
            return a.x - b.x;
        });

        // fill in the border
        var filledBorder: Array<Point> = [];

        // draw line
        var drawLine = (x0, y0, x1, y1) => {
            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0);
            var sx = (x0 < x1) ? 1 : -1;
            var sy = (y0 < y1) ? 1 : -1;
            var err = dx - dy;

            while (true) {
                filledBorder.push(new Point(x0, y0));

                if ((x0 == x1) && (y0 == y1)) break;
                var e2 = 2 * err;
                if (e2 > -dy) { err -= dy; x0 += sx; }
                if (e2 < dx) { err += dx; y0 += sy; }
            }
        };

        // loop through and create filled border
        for (var i = 0; i < this.border.length - 1; i++) {

            var me = this.border[i];
            var nx = this.border[i + 1];

            // this includes me and nx
            drawLine(me.x, me.y, nx.x, nx.y);
        }

        // fill in pixel buffer

        // march across the border pixels
        for (var col = 0; col < filledBorder.length; col++) {

            // move down and fill in every y pixel underneath us
            for (var row = 0; row < this.ctxHeight - filledBorder[col].y; row++) {

                // offset row because it starts at origin (0) and we need
                // it to be at the right offset
                this.pixelBuffer[col + (row + filledBorder[col].y) * this.ctxWidth] = 1;

            }
        }
    }

    
}