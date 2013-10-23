/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />
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
    }
    Tank.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);

        // get center
        var centerX = this.x + this.getWidth() / 2;
        var centerY = this.y + this.getHeight() / 2;

        // draw barrel
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.barrelAngle);
        ctx.fillStyle = this.color.toString();
        ctx.fillRect(0, -(Config.barrelWidth / 2), Config.barrelHeight, Config.barrelWidth);
        ctx.restore();
    };

    Tank.prototype.moveBarrelLeft = function (angle, delta) {
        if (this.barrelAngle <= Math.PI)
            return;

        this.barrelAngle -= angle * delta / 1000;
    };

    Tank.prototype.moveBarrelRight = function (angle, delta) {
        if (this.barrelAngle >= Math.PI * 2)
            return;

        this.barrelAngle += angle * delta / 1000;
    };

    Tank.prototype.getBullet = function () {
        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle) + this.x + (this.getWidth() / 2);
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle) + this.y + (this.getHeight() / 2);

        return new Bullet(barrelX, barrelY, this.barrelAngle, this.firepower);
    };
    return Tank;
})(Actor);

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
            var bullet = this.getBullet();

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

var Bullet = (function (_super) {
    __extends(Bullet, _super);
    function Bullet(x, y, angle, power) {
        _super.call(this, x, y, 2, 2, Colors.Bullet);
        this.spriteDimensions = 130;

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
    Bullet.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);

        // store engine
        this.engine = engine;

        // gravity
        var gravity = Config.gravity * delta / 1000;

        // pulled down by gravity
        this.dy += gravity;

        if (this.y > engine.canvas.height) {
            engine.removeChild(this);
        }

        if (this.splode) {
            // TODO: Adjust pos for collisions
            this.dx = 0;
            this.dy = 0;
            this.color = new Color(0, 0, 0, 0);
        }
    };

    Bullet.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);

        if (this.splode) {
            // animation
            this.splodeAnim.draw(ctx, this.x - (this.spriteDimensions / 2), this.y - (this.spriteDimensions / 2));
            // TODO: Remove child once animation finishes
            // TODO: MEMORY LEAK
        }
    };

    Bullet.prototype.onCollision = function (e) {
        if (!this.splode) {
            this.splodeSound.play();
        }

        this.splode = true;
    };
    return Bullet;
})(Actor);
