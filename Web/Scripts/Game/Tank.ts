/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Resources.ts" />

class Tank extends Actor {

    barrelAngle: number;

    firepower: number;

    landmass: Landmass;

    angle: number;

    constructor(x?: number, y?: number, color?: Color) {
        super(x, y, Config.tankWidth, Config.tankHeight, color);        

        this.barrelAngle = (Math.PI / 4) + Math.PI;
        this.firepower = Config.defaultFirepower;
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {        

        ctx.fillStyle = this.color.toString();

        ctx.save();
        ctx.translate(this.landmass.x + this.landmass.radius, this.landmass.y + this.landmass.radius);

        // account for phase shifting with canvas
        ctx.rotate(this.angle + (Math.PI / 2));         
        ctx.fillRect(-this.getWidth() / 2, -this.landmass.radius - this.getHeight(), this.getWidth(), this.getHeight());
                
        // get center
        var centerX: number = 0;
        var centerY: number = -this.landmass.radius - this.getHeight() / 2;

        // draw barrel
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.barrelAngle);
        ctx.fillRect(0, -(Config.barrelWidth / 2), Config.barrelHeight, Config.barrelWidth);
        ctx.restore();

        // draw on landmass/scale/rotate

        ctx.restore();
    }

    public placeOn(landmass: Landmass, point: Point, angle: number): void {
        this.landmass = landmass;

        // set x,y
        this.angle = angle;
        this.x = point.x;
        this.y = point.y;

        console.log("Rotating player", (this.angle * 180) / Math.PI, "degrees");
        console.log("Planet border pos", this.x, this.y);
    }

    public moveBarrelLeft(angle: number, delta: number): void {

        // clamp to -180 degrees
        if (this.barrelAngle <= Math.PI)
            return;

        this.barrelAngle -= angle * delta / 1000;

    }

    public moveBarrelRight(angle: number, delta: number): void {

        // clamp to 180 degrees
        if (this.barrelAngle >= Math.PI * 2)
            return;

        this.barrelAngle += angle * delta / 1000;

    }

    public getBullet(): Bullet {
        var centerX: number = this.x + (this.getHeight() / 2) * Math.cos(this.angle);
        var centerY: number = this.y + (this.getHeight() / 2) * Math.sin(this.angle);

        console.log("Barrel Center", centerX, centerY, this.angle);

        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle + this.angle + (Math.PI/2)) + centerX;
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle + this.angle + (Math.PI / 2)) + centerY;

        return new Bullet(barrelX, barrelY, this.barrelAngle + this.angle + (Math.PI / 2), this.firepower);
    }
}

class PlayerTank extends Tank {

    currentFirepowerAccelDelta: number = 0;

    shouldFirepowerAccel: boolean;

    constructor(x?: number, y?: number) {
        super(x, y, Colors.Player);

        this.addEventListener('keydown', this.handleKeyDown);
        this.addEventListener('keyup', this.handleKeyUp);        
    }

    public update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        if (this.shouldFirepowerAccel) {
            this.currentFirepowerAccelDelta += Config.firepowerAccel;
        } else {
            this.currentFirepowerAccelDelta = 0;
        }

        if (engine.isKeyPressed(Keys.LEFT)) {

            this.moveBarrelLeft(Config.barrelRotateVelocity, delta);

        } else if (engine.isKeyPressed(Keys.RIGHT)) {

            this.moveBarrelRight(Config.barrelRotateVelocity, delta);

        } else if (engine.isKeyPressed(Keys.UP)) {

            this.incrementFirepower(delta);

        } else if (engine.isKeyPressed(Keys.DOWN)) {

            this.decrementFirepower(delta);

        } else if (engine.isKeyUp(Keys.SPACE)) {

            var bullet = this.getBullet();

            engine.addChild(bullet);
        }
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {
        super.draw(ctx, delta);
    }    

    private incrementFirepower(delta: number): void {

        if (this.firepower >= Config.firepowerMax) {
            this.firepower = Config.firepowerMax;
            return;
        }

        this.firepower += Math.ceil(this.currentFirepowerAccelDelta * delta / 1000);

    }

    private decrementFirepower(delta: number): void {

        if (this.firepower <= Config.firepowerMin) {
            this.firepower = Config.firepowerMin;
            return;
        }

        this.firepower -= Math.ceil(this.currentFirepowerAccelDelta * delta / 1000);

    }

    private handleKeyDown(event?: KeyEvent): void {
        if (event === null) return;

        if (event.key === Keys.UP || event.key === Keys.DOWN) {
            this.shouldFirepowerAccel = true;            
        }
    }

    private handleKeyUp(event?: KeyEvent): void {
        if (event === null) return;

        if (event.key === Keys.UP || event.key === Keys.DOWN) {
            this.shouldFirepowerAccel = false;            
        }
    }
}

class Bullet extends Actor {

    startingAngle: number;

    speed: number;

    engine: Engine;  

    constructor(x: number, y: number, angle: number, power: number) {
        super(x, y, 2, 2, Colors.Bullet);

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

        // check collision with tanks
        // get projection ahead of where we are currently
        var projectedPixel = new Point(2 + this.x + this.dx * seconds, 2 + this.y + this.dy * seconds);
        var projectedPixelData = engine.ctx.getImageData(projectedPixel.x, projectedPixel.y, 1, 1).data;        

        // collide with planets, enemies, and ourselves
        if (this.isColorOf(projectedPixelData, Colors.Enemy) ||
            this.isColorOf(projectedPixelData, Colors.Land) ||
            this.isColorOf(projectedPixelData, Colors.Player)) {

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
        Resources.Bullets.explodeSound.play();

        // play explosion animation
        Resources.Bullets.explosionAnim.play(this.x - (Resources.Bullets.explosionDimensions / 2), this.y - (Resources.Bullets.explosionDimensions / 2));                

        // remove myself
        this.engine.removeChild(this);
    }

}