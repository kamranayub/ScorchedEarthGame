/// <reference path="GameConfig.ts" />
/// <reference path="GraphicUtils.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Projectile.ts" />
/// <reference path="Healthbar.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="Projectiles/MissileProjectile.ts" />
/// <reference path="Projectiles/BigMissileProjectile.ts" />

class Tank extends CollisionActor {

    barrelAngle: number;

    firepower: number;

    landmass: Landmass;

    angle: number;

    private healthbar: Healthbar;

    constructor(x?: number, y?: number, color?: ex.Color) {
        super(x, y, Config.tankWidth, Config.tankHeight, color);        

        this.barrelAngle = (Math.PI / 4) + Math.PI;
        this.firepower = Config.defaultFirepower;
        this.healthbar = new Healthbar(100);
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {
        this.drawInternal(ctx, delta, false);        
    }

    public drawCollisionMap(ctx: CanvasRenderingContext2D, delta: number): void {
        this.drawInternal(ctx, delta, true);
    }

    /**
     * Internal draw
     * @param ctx Canvas to draw on
     * @param delta Delta for time-based movement
     * @param collision Whether or not we're in a collision context
     */
    private drawInternal(ctx: CanvasRenderingContext2D, delta: number, collision: boolean): void {
        ctx.fillStyle = collision
            ? Colors.Black.toString()
            : this.color.toString();

        ctx.save();
        ctx.translate(this.landmass.x + this.landmass.radius, this.landmass.y + this.landmass.radius);

        // account for phase shifting with canvas
        ctx.rotate(this.angle + (Math.PI / 2));
        ctx.fillRect(-this.getWidth() / 2, -this.landmass.radius - this.getHeight(), this.getWidth(), this.getHeight());                     

        if (!collision) {
            // get center
            var centerX: number = 0;
            var centerY: number = -this.landmass.radius - this.getHeight() / 2;

            // translate coord system to center of tank
            ctx.save();
            ctx.translate(centerX, centerY);

            // draw healthbar
            this.healthbar.x = -(this.getWidth() / 2);
            this.healthbar.y = -30;
            this.healthbar.rotation = this.angle + (Math.PI / 2);
            this.healthbar.draw(ctx, delta);
            
            // draw barrel       
            ctx.fillStyle = this.color.toString(); 
            ctx.rotate(this.barrelAngle);
            ctx.fillRect(0, -(Config.barrelWidth / 2), Config.barrelHeight, Config.barrelWidth);
            ctx.restore();
        }

        // draw on landmass/scale/rotate
        ctx.restore();
    }

    public placeOn(landmass: Landmass, point: ex.Point, angle: number): void {
        this.landmass = landmass;

        // set x,y
        this.angle = angle;
        this.x = point.x;
        this.y = point.y;
    }

    public moveBarrelLeft(angle: number, delta: number): void {

        // clamp to -180 degrees
        if (this.barrelAngle <= Math.PI - (Math.PI / 7))
            return;

        this.barrelAngle -= angle * delta / 1000;

        // play sound
        Resources.Tanks.moveBarrelSound.sound.play();
    }

    public moveBarrelRight(angle: number, delta: number): void {

        // clamp to 180 degrees
        if (this.barrelAngle >= (Math.PI * 2) + (Math.PI / 7))
            return;

        this.barrelAngle += angle * delta / 1000;

        // play sound
        Resources.Tanks.moveBarrelSound.sound.play();
    }

    public getProjectile(): Projectile {
        var centerX: number = this.x + (this.getHeight() / 2) * Math.cos(this.angle);
        var centerY: number = this.y + (this.getHeight() / 2) * Math.sin(this.angle);

        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle + this.angle + (Math.PI/2)) + centerX;
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle + this.angle + (Math.PI / 2)) + centerY;

        // Play sound
        Resources.Tanks.fireSound.sound.play();

        return new Projectiles.Missile(barrelX, barrelY, this.barrelAngle + this.angle + (Math.PI / 2), this.firepower);
    }

    public damage(value: number) {
        this.healthbar.reduce(value);

        if (this.healthbar.getCurrent() <= 0) {
            this.die();
        }
    }

    public collide(engine: ex.Engine, actor: ex.Actor): void {
        super.collide(engine, actor);

        if (actor instanceof Explosion) {
            this.damage((<Explosion>actor).damage);
        }
    }

    public die(): ex.Actor {

        // play explosions
        var minX = this.x - 15,
            maxX = this.x + 15,
            minY = this.y - 15,
            maxY = this.y + 15;

        // kill
        Game.current.engine.remove(this);

        // badass explode sound
        Resources.Tanks.dieSound.sound.play();

        for (var i = 0; i < 5; i++) {
            var splody = new Explosion(Math.random() * (maxX - minX) + minX, Math.random() * (maxY - minY) + minY, Math.random() * 15, 4, new ex.Vector(0, 0));
            Game.current.engine.add(splody);
            console.log("Added splody", splody.x, splody.y);
        }

        return this;
    }
}

class PlayerTank extends Tank {

    currentFirepowerAccelDelta: number = 0;

    shouldFirepowerAccel: boolean;

    constructor(x?: number, y?: number) {
        super(x, y, Colors.Player);      
    }

    public update(engine: ex.Engine, delta: number): void {
        super.update(engine, delta);

        if (engine.input.keyboard.isKeyDown(ex.Input.Keys.Up) ||
            engine.input.keyboard.isKeyDown(ex.Input.Keys.Down)) {
            this.shouldFirepowerAccel = true;
        }

        if (engine.input.keyboard.isKeyUp(ex.Input.Keys.Up) ||
            engine.input.keyboard.isKeyUp(ex.Input.Keys.Down)) {
            this.shouldFirepowerAccel = false;
        }

        if (this.shouldFirepowerAccel) {
            this.currentFirepowerAccelDelta += Config.firepowerAccel;
        } else {
            this.currentFirepowerAccelDelta = 0;
        }

        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.Left)) {

            this.moveBarrelLeft(Config.barrelRotateVelocity, delta);

        } else if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.Right)) {

            this.moveBarrelRight(Config.barrelRotateVelocity, delta);

        } else if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.Up)) {

            this.incrementFirepower(delta);

        } else if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.Down)) {

            this.decrementFirepower(delta);

        } else if (engine.input.keyboard.isKeyUp(ex.Input.Keys.Space)) {

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

}
