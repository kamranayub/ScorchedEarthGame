/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Projectile.ts" />
/// <reference path="CollisionActor.ts" />

class Tank extends CollisionActor {

    barrelAngle: number;

    firepower: number;

    landmass: Landmass;

    angle: number;

    health: number = 100;

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

    public getProjectile(): Projectile {
        var centerX: number = this.x + (this.getHeight() / 2) * Math.cos(this.angle);
        var centerY: number = this.y + (this.getHeight() / 2) * Math.sin(this.angle);

        console.log("Barrel Center", centerX, centerY, this.angle);

        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle + this.angle + (Math.PI/2)) + centerX;
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle + this.angle + (Math.PI / 2)) + centerY;

        return new Projectile(barrelX, barrelY, this.barrelAngle + this.angle + (Math.PI / 2), this.firepower);
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

            var bullet = this.getProjectile();

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
