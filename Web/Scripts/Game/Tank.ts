/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />

class Tank extends Actor {

    barrelAngle: number;

    firepower: number;

    constructor(x?: number, y?: number, color?: Color) {
        super(x, y, Config.tankWidth, Config.tankHeight, color);

        this.barrelAngle = (Math.PI / 4) + Math.PI;
        this.firepower = Config.defaultFirepower;
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {

        super.draw(ctx, delta);

        // get center
        var centerX: number = this.x + this.getWidth() / 2;
        var centerY: number = this.y + this.getHeight() / 2;

        // draw barrel
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.barrelAngle);
        ctx.fillStyle = this.color.toString();
        ctx.fillRect(0, -(Config.barrelWidth / 2), Config.barrelHeight, Config.barrelWidth);
        ctx.restore();

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
        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle) + this.x + (this.getWidth() / 2);
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle) + this.y + (this.getHeight() / 2);

        return new Bullet(barrelX, barrelY, this.barrelAngle, this.firepower);
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

    splodeSound: Media.ISound;

    splodeSprite: Drawing.SpriteSheet;

    splodeAnim: Drawing.Animation;

    splode: boolean;

    spriteDimensions: number = 130;

    constructor(x: number, y: number, angle: number, power: number) {
        super(x, y, 2, 2, Colors.Bullet);

        this.splodeSound = new Media.Sound("/Sounds/splode.mp3");
        this.splodeSprite = new Drawing.SpriteSheet("/Spritesheets/spritesheet-explosion.png", 5, 5, this.spriteDimensions, this.spriteDimensions);
        this.splodeAnim = new Drawing.Animation(this.splodeSprite.sprites, 0.1);
        this.splodeAnim.type = Drawing.AnimationType.ONCE;

        this.startingAngle = angle;
        this.speed = power * Config.bulletSpeedModifier;

        // starts at angle and moves in that direction at power        
        this.dx = this.speed * Math.cos(this.startingAngle);
        this.dy = this.speed * Math.sin(this.startingAngle);

        // collisions
        this.addEventListener('collision', this.onCollision);
    }

    public update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        // store engine
        this.engine = engine;

        // gravity
        var gravity = Config.gravity * delta / 1000;

        // pulled down by gravity
        this.dy += gravity;

        // out of bounds
        if (this.y > engine.canvas.height) {
            engine.removeChild(this);
        }

        if (this.splode) {
            // TODO: Adjust pos for collisions
            this.dx = 0;
            this.dy = 0;
            this.color = new Color(0, 0, 0, 0);
        }
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {
        super.draw(ctx, delta);

        if (this.splode) {
            // animation
            this.splodeAnim.draw(ctx, this.x - (this.spriteDimensions / 2), this.y - (this.spriteDimensions / 2));
            // TODO: Remove child once animation finishes
            // TODO: MEMORY LEAK
        }
    }

    private onCollision(e?: CollisonEvent): void {
        if (!this.splode) {
            this.splodeSound.play();
        }

        this.splode = true;        
    }

}