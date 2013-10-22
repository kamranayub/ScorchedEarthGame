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

        if (engine.keys.indexOf(Keys.LEFT) > -1) {

            this.moveBarrelLeft(Config.barrelRotateVelocity, delta);

        } else if (engine.keys.indexOf(Keys.RIGHT) > -1) {

            this.moveBarrelRight(Config.barrelRotateVelocity, delta);

        } else if (engine.keys.indexOf(Keys.UP) > -1) {

            this.incrementFirepower(delta);

        } else if (engine.keys.indexOf(Keys.DOWN) > -1) {

            this.decrementFirepower(delta);
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