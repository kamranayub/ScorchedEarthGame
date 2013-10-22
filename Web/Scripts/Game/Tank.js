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
        var centerX = this.x + this.width / 2;
        var centerY = this.y + this.height / 2;

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
    return Tank;
})(Actor);

var PlayerTank = (function (_super) {
    __extends(PlayerTank, _super);
    function PlayerTank(x, y) {
        _super.call(this, x, y, Colors.Player);
        this.currentFirepowerAccelDelta = 0;

        // TODO: Make Erik fix this; actors cannot listen to their own events
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

        if (engine.keys.indexOf(Keys.LEFT) > -1) {
            this.moveBarrelLeft(Config.barrelRotateVelocity, delta);
        } else if (engine.keys.indexOf(Keys.RIGHT) > -1) {
            this.moveBarrelRight(Config.barrelRotateVelocity, delta);
        } else if (engine.keys.indexOf(Keys.UP) > -1) {
            this.incrementFirepower(delta);
        } else if (engine.keys.indexOf(Keys.DOWN) > -1) {
            this.decrementFirepower(delta);
        }
    };

    PlayerTank.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);
    };

    PlayerTank.prototype.incrementFirepower = function (delta) {
        if (this.firepower >= Config.firepowerMax)
            return;

        this.firepower += +(this.currentFirepowerAccelDelta * delta / 1000).toFixed(0);
    };

    PlayerTank.prototype.decrementFirepower = function (delta) {
        if (this.firepower <= Config.firepowerMin)
            return;

        this.firepower -= +(this.currentFirepowerAccelDelta * delta / 1000).toFixed(0);
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
