class Projectile extends Actor {

    startingAngle: number;

    speed: number;

    engine: Engine;

    constructor(x: number, y: number, angle: number, power: number) {
        super(x, y, 2, 2, Colors.Projectile);

        this.startingAngle = angle;
        this.speed = power * Config.bulletSpeedModifier;

        // starts at angle and moves in that direction at power        
        this.dx = this.speed * Math.cos(this.startingAngle);
        this.dy = this.speed * Math.sin(this.startingAngle);
    }

    public update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        var seconds = delta / 1000;

        // TODO: This is pretty naive. We should use a collision map!
        // There's a chance the projected pixel will actually be a color
        // of what we can collide with when it may be some anti-aliasing
        // or other color.

        var collisionCtx: CanvasRenderingContext2D = (<any>window).collisionCtx;

        // check collision with tanks
        // get projection ahead of where we are currently
        var projectedPixel = new Point(Math.floor(this.x), Math.floor(this.y));
        var projectedPixelData = collisionCtx.getImageData(projectedPixel.x, projectedPixel.y, 1, 1).data;

        console.log("Projected pixel colors", projectedPixelData);

        // collide with planets, enemies, and ourselves
        if (!this.isColorOf(projectedPixelData, new Color(255, 255, 255, 255))) {

            // collision!
            this.onCollision();
            return;
        }

        // store engine
        this.engine = engine;

        // gravity
        var gravity = Config.gravity * seconds;

        // pulled down by gravity
        this.dy += gravity;

        // out of bounds
        if (this.y > engine.canvas.height) {
            engine.removeChild(this);
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
                console.log("Collided with color", color);
                return true;
            }
        }

        return false;
    }

    private onCollision(): void {

        // play sound
        Resources.Projectiles.explodeSound.play();

        // play explosion animation
        Resources.Projectiles.explosionAnim.play(this.x - (Resources.Projectiles.explosionDimensions / 2), this.y - (Resources.Projectiles.explosionDimensions / 2));

        // remove myself
        this.engine.removeChild(this);
    }

}