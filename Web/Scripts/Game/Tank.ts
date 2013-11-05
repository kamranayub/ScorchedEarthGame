/// <reference path="Excalibur.d.ts" />
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

    constructor(x?: number, y?: number, color?: Color) {
        super(x, y, Config.tankWidth, Config.tankHeight, color);        

        this.barrelAngle = (Math.PI / 4) + Math.PI;
        this.firepower = Config.defaultFirepower;
        this.invisible = true;
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

        // super
        super.draw(ctx, delta);
    }

    public placeOn(landmass: Landmass, point: Point, angle: number): void {
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

    public damage(engine: Engine, value: number) {
        this.healthbar.reduce(value);

        if (this.healthbar.getCurrent() <= 0) {
            this.die(engine);
        }
    }

    public collide(engine: Engine, actor: Actor): void {
        super.collide(engine, actor);

        if (actor instanceof Explosion) {
            this.damage(engine, (<Explosion>actor).damage);
        }
    }

    private die(engine: Engine): void {

        // play explosions
        var minX = this.x - 15,
            maxX = this.x + 15,
            minY = this.y - 15,
            maxY = this.y + 15;

        // kill
        engine.removeChild(this);

        // badass explode sound
        Resources.Tanks.dieSound.sound.play();

        for (var i = 0; i < 5; i++) {
            var splody = new Explosion(Math.random() * (maxX - minX) + minX, Math.random() * (maxY - minY) + minY, Math.random() * 15, 4);
            engine.addChild(splody);
            console.log("Added splody", splody.x, splody.y);
        }
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
