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

    public radius: number;

    private planetCanvas: HTMLCanvasElement;
    private planetCollisionCanvas: HTMLCanvasElement;

    private planetCtx: CanvasRenderingContext2D;
    private planetCollisionCtx: CanvasRenderingContext2D;

    constructor() {
        super(0, 0, null, null, Colors.Land);
            
        this.generate();
        this.invisible = true;
    }

    public update(engine: Engine, delta: number) {
        super.update(engine, delta);
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number) {
        super.draw(ctx, delta);

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

    public collide(engine: Engine, actor: Actor) {
        super.collide(engine, actor);

        if (actor instanceof Explosion) {
            this.destruct(new Point(actor.x, actor.y), (<Explosion>actor).radius);
        }
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

    // clamp velocities because > 2 is too much
    // max x velocity
    xm: number = 1.8;
    // max y velocity
    ym: number = 1.8;

    /**
     * Pseudo orbital calculations
     * Acts on the actor by manipulating its velocities
     */
    public actOn(actor: Actor, delta: number): void {

        var G = Config.gravity;
        var x = this.x + this.radius;
        var y = this.y + this.radius;

        var xdiff = actor.x - x;
        var ydiff = actor.y - y;
        var dSquared = (xdiff * xdiff) + (ydiff * ydiff);
        var d = Math.sqrt(dSquared);
        var a = -G * ((1 * this.radius) / dSquared); // f = ma, f = 1 * a, f = a
        if (a > 10) a = 10; // max accel clamp
        var xa = a * ((xdiff) / d); // cos theta = adjacent / hypotenuse
        var ya = a * ((ydiff) / d); // sin theta = opposite / hypotenuse

        actor.dx += xa;
        actor.dy += ya;

        if (Math.abs(actor.dx) > this.xm) {
            actor.dx = actor.dx < 0 ? -this.xm : this.xm;
        }
        if (Math.abs(actor.dy) > this.ym) {
            actor.dy = actor.dy < 0 ? -this.ym : this.ym;
        }

        actor.x += actor.dx;
        actor.y += actor.dy;
    }

    private generate(): void {       

        // get a random radius to use
        this.radius = Math.random() * (Config.planetMaxRadius - Config.planetMinRadius) + Config.planetMinRadius;

        this.setWidth(this.radius * 2);
        this.setHeight(this.radius * 2);

        // create off-screen canvases
        // draw = what we draw to and copy over to game canvas
        // collision = what we draw to and use for collision checking
        var draw = this.generateCanvas();
        var collision = this.generateCanvas(Colors.Black);

        this.planetCanvas = draw.canvas;
        this.planetCtx = draw.ctx;    
        this.planetCollisionCanvas = collision.canvas;
        this.planetCollisionCtx = collision.ctx;      
    }

    private generateCanvas(color?: Color) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        
        canvas.width = this.radius * 2 + 2;
        canvas.height = this.radius * 2 + 2;        

        if (color) {
            // draw arc
            ctx.beginPath();
            ctx.fillStyle = color.toString();
            ctx.arc(this.radius + 1, this.radius + 1, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        } else {      
            var planetImages = [
                Resources.Planet.planet1Image,
                Resources.Planet.planet2Image,
                Resources.Planet.planet3Image,
                Resources.Planet.planet4Image
            ];

            ctx.drawImage(planetImages[Math.floor(Math.random() * planetImages.length)], 0, 0, 500, 500, 0, 0, canvas.width, canvas.height);
        }

        return {
            canvas: canvas,
            ctx: ctx
        };
    }
}