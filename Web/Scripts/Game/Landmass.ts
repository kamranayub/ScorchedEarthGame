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

        minRadius: 35,

        maxRadius: 200
    };

    // private vars

    planetCanvas: HTMLCanvasElement;

    planetCtx: CanvasRenderingContext2D;

    radius: number;

    constructor() {
        super(0, 0, null, null, Colors.Land);
            
        this.generate();
    }

    public update(engine: Engine, delta: number) {
        super.update(engine, delta);


    }

    public draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta);

        ctx.drawImage(this.planetCanvas, this.x, this.y);
    }

    public getRandomPointOnBorder() {

        var randomAngle = Math.random() * Math.PI * 2;        
        var randomX = this.radius * Math.cos(randomAngle);
        var randomY = this.radius * Math.sin(randomAngle);

        return {
            angle: randomAngle,
            point: new Point(randomX + this.x + this.radius, randomY + this.y + this.radius)
        };
    }

    private generate(): void {       

        // get a random radius to use
        this.radius = Math.random() * (this.config.maxRadius - this.config.minRadius) + this.config.minRadius;

        //this.width = this.radius * 2;
        //this.height = this.radius * 2;

        // create off-screen canvas
        this.planetCanvas = document.createElement('canvas');
        this.planetCanvas.width = this.radius * 2 + 2;
        this.planetCanvas.height = this.radius * 2 + 2;

        this.planetCtx = this.planetCanvas.getContext('2d');    

        // draw arc
        this.planetCtx.beginPath();
        this.planetCtx.fillStyle = this.color.toString();
        this.planetCtx.arc(this.radius + 1, this.radius + 1, this.radius, 0, Math.PI * 2);
        this.planetCtx.closePath();
        this.planetCtx.fill();
    }


}