/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="CollisionActor.ts" />

class Point {

    x: number;

    y: number;

    constructor(x: number, y: number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }
}

class Landmass extends CollisionActor {

    // config
    config: any = {

        minRadius: 35,

        maxRadius: 200
    };

    // private vars

    planetCanvas: HTMLCanvasElement;
    planetCollisionCanvas: HTMLCanvasElement;

    planetCtx: CanvasRenderingContext2D;
    planetCollisionCtx: CanvasRenderingContext2D;

    radius: number;

    constructor() {
        super(0, 0, null, null, Colors.Land);
            
        this.generate();
    }

    public update(engine: Engine, delta: number) {
        super.update(engine, delta);


    }

    public draw(ctx: CanvasRenderingContext2D, delta: number) {
        ctx.drawImage(this.planetCanvas, this.x, this.y);
    }

    public drawCollisionMap(ctx: CanvasRenderingContext2D, delta: number) {
        ctx.drawImage(this.planetCollisionCanvas, this.x, this.y);
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

    public destruct(point: Point, radius: number) {
       
        this.planetCtx.beginPath();
        this.planetCtx.globalCompositeOperation = 'destination-out';        
        this.planetCtx.arc(point.x - this.x, point.y - this.y, radius, 0, Math.PI * 2);
        this.planetCtx.closePath();
        this.planetCtx.fill();

        this.planetCollisionCtx.beginPath();
        this.planetCollisionCtx.globalCompositeOperation = 'destination-out';
        this.planetCollisionCtx.arc(point.x - this.x, point.y - this.y, radius, 0, Math.PI * 2);
        this.planetCollisionCtx.closePath();
        this.planetCollisionCtx.fill();
    }

    private generate(): void {       

        // get a random radius to use
        this.radius = Math.random() * (this.config.maxRadius - this.config.minRadius) + this.config.minRadius;

        this.setWidth(this.radius * 2);
        this.setHeight(this.radius * 2);

        // create off-screen canvas
        this.planetCanvas = document.createElement('canvas');
        this.planetCollisionCanvas = document.createElement('canvas');
        this.planetCanvas.width = this.radius * 2 + 2;
        this.planetCanvas.height = this.radius * 2 + 2;
        this.planetCollisionCanvas.width = this.radius * 2 + 2;
        this.planetCollisionCanvas.height = this.radius * 2 + 2;

        this.planetCtx = this.planetCanvas.getContext('2d');    
        this.planetCollisionCtx = this.planetCollisionCanvas.getContext('2d');

        // draw arc
        this.planetCtx.beginPath();
        this.planetCtx.fillStyle = this.color.toString();
        this.planetCtx.arc(this.radius + 1, this.radius + 1, this.radius, 0, Math.PI * 2);
        this.planetCtx.closePath();
        this.planetCtx.fill();

        this.planetCollisionCtx.beginPath();
        this.planetCollisionCtx.fillStyle = new Color(0, 0, 0, 255);
        this.planetCollisionCtx.arc(this.radius + 1, this.radius + 1, this.radius, 0, Math.PI * 2);
        this.planetCollisionCtx.closePath();
        this.planetCollisionCtx.fill();
    }


}