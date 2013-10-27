/// <reference path="Explosion.ts" />

class Projectile extends Actor {

    speed: number;

    constructor(x: number, y: number, width: number, height: number, color: Color, public angle: number, power: number, public explodeRadius: number) {
        super(x, y, width, height, color);

        // set speed
        this.speed = power * Config.bulletSpeedModifier;

        // starts at angle and moves in that direction at power        
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
    }

    public update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        var seconds = delta / 1000;        

        // gravity
        var gravity = Config.gravity * seconds;

        // pulled down by gravity
        this.dy += gravity;

        // out of bounds
        if (this.y > engine.canvas.height) {
            engine.removeChild(this);
            return;
        }

        var collisionCtx: CanvasRenderingContext2D = (<any>engine).collisionCtx;

        // check collision with tanks
        // get projection ahead of where we are currently
        var collisionPixel = new Point(Math.floor(this.x), Math.floor(this.y));
        var collisionPixelData = collisionCtx.getImageData(collisionPixel.x, collisionPixel.y, 1, 1).data;

        // detect collision using pixel data on off-screen
        // collision map
        if (!this.isColorOf(collisionPixelData, Colors.White)) {

            // collision!
            this.onCollision(engine);

            // exit
            return;
        }
    }

    /**
     * Determines whether or not the given color is present
     * in the given pixel array.
     */
    private isColorOf(pixels: number[], color: Color): boolean {

        // pixel = 4 sets of RGBA
        for (var i = 0; i < pixels.length; i += 4) {
            if (pixels[i] === color.r &&
                pixels[i + 1] === color.g &&
                pixels[i + 2] === color.b &&
                pixels[i + 3] === color.a) {                
                return true;
            }
        }

        return false;
    }

    public onCollision(engine: Engine): void {        
        // remove myself
        engine.removeChild(this);
    }

}