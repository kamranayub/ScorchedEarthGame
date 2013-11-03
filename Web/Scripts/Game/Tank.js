/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="GraphicUtils.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Projectile.ts" />
/// <reference path="Healthbar.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="Projectiles/MissileProjectile.ts" />
/// <reference path="Projectiles/BigMissileProjectile.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Tank = (function (_super) {
    __extends(Tank, _super);
    function Tank(x, y, color) {
        _super.call(this, x, y, Config.tankWidth, Config.tankHeight, color);

        this.barrelAngle = (Math.PI / 4) + Math.PI;
        this.firepower = Config.defaultFirepower;
        this.invisible = true;
        this.healthbar = new Healthbar(100);
    }
    Tank.prototype.draw = function (ctx, delta) {
        this.drawInternal(ctx, delta, false);
    };

    Tank.prototype.drawCollisionMap = function (ctx, delta) {
        this.drawInternal(ctx, delta, true);
    };

    /**
    * Internal draw
    * @param ctx Canvas to draw on
    * @param delta Delta for time-based movement
    * @param collision Whether or not we're in a collision context
    */
    Tank.prototype.drawInternal = function (ctx, delta, collision) {
        ctx.fillStyle = collision ? Colors.Black.toString() : this.color.toString();

        ctx.save();
        ctx.translate(this.landmass.x + this.landmass.radius, this.landmass.y + this.landmass.radius);

        // account for phase shifting with canvas
        ctx.rotate(this.angle + (Math.PI / 2));
        ctx.fillRect(-this.getWidth() / 2, -this.landmass.radius - this.getHeight(), this.getWidth(), this.getHeight());

        if (!collision) {
            // get center
            var centerX = 0;
            var centerY = -this.landmass.radius - this.getHeight() / 2;

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
        _super.prototype.draw.call(this, ctx, delta);
    };

    Tank.prototype.placeOn = function (landmass, point, angle) {
        this.landmass = landmass;

        // set x,y
        this.angle = angle;
        this.x = point.x;
        this.y = point.y;
    };

    Tank.prototype.moveBarrelLeft = function (angle, delta) {
        if (this.barrelAngle <= Math.PI)
            return;

        this.barrelAngle -= angle * delta / 1000;

        // play sound
        Resources.Tanks.moveBarrelSound.play();
    };

    Tank.prototype.moveBarrelRight = function (angle, delta) {
        if (this.barrelAngle >= Math.PI * 2)
            return;

        this.barrelAngle += angle * delta / 1000;

        // play sound
        Resources.Tanks.moveBarrelSound.play();
    };

    Tank.prototype.getProjectile = function () {
        var centerX = this.x + (this.getHeight() / 2) * Math.cos(this.angle);
        var centerY = this.y + (this.getHeight() / 2) * Math.sin(this.angle);

        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle + this.angle + (Math.PI / 2)) + centerX;
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle + this.angle + (Math.PI / 2)) + centerY;

        // Play sound
        Resources.Tanks.fireSound.play();

        return new Projectiles.Missile(barrelX, barrelY, this.barrelAngle + this.angle + (Math.PI / 2), this.firepower);
    };

    Tank.prototype.damage = function (engine, value) {
        this.healthbar.reduce(value);

        if (this.healthbar.getCurrent() <= 0) {
            this.die(engine);
        }
    };

    /**
    * Whether or not the given point has hit this actor
    * Uses an off-screen canvas and pixel data to determine hit test
    */
    Tank.prototype.isHit = function (engine, x, y) {
        var collisionCanvas = document.createElement("canvas");
        collisionCanvas.width = engine.canvas.width;
        collisionCanvas.height = engine.canvas.height;

        var collisionCtx = collisionCanvas.getContext('2d');
        collisionCtx.fillStyle = 'white';
        collisionCtx.fillRect(0, 0, collisionCanvas.width, collisionCanvas.height);

        this.drawCollisionMap(collisionCtx, 0);

        var collisionPixelData = collisionCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;

        collisionCanvas = null;
        collisionCtx = null;

        return !GraphicUtils.isPixelColorOf(collisionPixelData, Colors.White);
    };

    Tank.prototype.die = function (engine) {
        // todo: EXPLODE
        // kill
        engine.removeChild(this);
    };
    return Tank;
})(CollisionActor);

var PlayerTank = (function (_super) {
    __extends(PlayerTank, _super);
    function PlayerTank(x, y) {
        _super.call(this, x, y, Colors.Player);
        this.currentFirepowerAccelDelta = 0;

        this.addEventListener('keydown', this.handleKeyDown);
        this.addEventListener('keyup', this.handleKeyUp);
    }
    PlayerTank.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);

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
    };

    PlayerTank.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);
    };

    PlayerTank.prototype.incrementFirepower = function (delta) {
        if (this.firepower >= Config.firepowerMax) {
            this.firepower = Config.firepowerMax;
            return;
        }

        this.firepower += Math.ceil(this.currentFirepowerAccelDelta * delta / 1000);
    };

    PlayerTank.prototype.decrementFirepower = function (delta) {
        if (this.firepower <= Config.firepowerMin) {
            this.firepower = Config.firepowerMin;
            return;
        }

        this.firepower -= Math.ceil(this.currentFirepowerAccelDelta * delta / 1000);
    };

    PlayerTank.prototype.handleKeyDown = function (event) {
        if (event === null)
            return;

        if (event.key === Keys.UP || event.key === Keys.DOWN) {
            this.shouldFirepowerAccel = true;
        }
    };

    PlayerTank.prototype.handleKeyUp = function (event) {
        if (event === null)
            return;

        if (event.key === Keys.UP || event.key === Keys.DOWN) {
            this.shouldFirepowerAccel = false;
        }
    };
    return PlayerTank;
})(Tank);
