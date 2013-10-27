/// <reference path="Explosion.ts" />

class Projectile extends Actor {

    startingAngle: number;

    speed: number;

    engine: Engine;

    explodeRadius: number;

    constructor(x: number, y: number, angle: number, power: number) {
        super(x, y, 2, 2, Colors.Projectile);

        this.explodeRadius = 20;
        this.startingAngle = angle;
        this.speed = power * Config.bulletSpeedModifier;

        // starts at angle and moves in that direction at power        
        this.dx = this.speed * Math.cos(this.startingAngle);
        this.dy = this.speed * Math.sin(this.startingAngle);
    }

    public update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        var seconds = delta / 1000;        

        // store engine
        this.engine = engine;

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
        var projectedPixel = new Point(Math.floor(this.x), Math.floor(this.y));
        var projectedPixelData = collisionCtx.getImageData(projectedPixel.x, projectedPixel.y, 1, 1).data;

        // collide with planets, enemies, and ourselves
        if (!this.isColorOf(projectedPixelData, Colors.White)) {

            // collision!
            this.onCollision();

            // exit
            return;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {
        super.draw(ctx, delta);
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

    private onCollision(): void {        

        // play sound
        Resources.Projectiles.explodeSound.play();

        // play explosion animation
        var splosion = new Explosion(this.x, this.y, this.explodeRadius);

        // add explosion to engine
        this.engine.addChild(splosion);

        // remove myself
        this.engine.removeChild(this);
    }

}