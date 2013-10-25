var Config = {
    // width of tanks
    tankWidth: 32,
    // height of a tank
    tankHeight: 32,
    // Barrel rotation speed in radians
    barrelRotateVelocity: Math.PI / 8,
    // Length of barrel
    barrelHeight: 45,
    // Width of barrel
    barrelWidth: 2,
    // Default firing power
    defaultFirepower: 25,
    // Firepower adjustment delta
    firepowerDelta: 15,
    // Firepower maximum speed
    firepowerMax: 100,
    // Firepower minimum speed
    firepowerMin: 0,
    // Firepower acceleration
    firepowerAccel: 0.5,
    // Bullet speed modifier
    bulletSpeedModifier: 2,
    // Gravity constant
    gravity: 50
};

var Colors = {
    Background: Color.fromHex("#30c6e6"),
    Player: new Color(255, 0, 0),
    Enemy: new Color(0, 0, 255),
    Land: Color.fromHex("#eae9a3"),
    Bullet: new Color(255, 0, 0)
};
/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Point = (function () {
    function Point(x, y) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }
    return Point;
})();

var Landmass = (function (_super) {
    __extends(Landmass, _super);
    function Landmass(ctxWidth, ctxHeight) {
        _super.call(this, 0, 0, null, null, Colors.Land);
        this.ctxWidth = ctxWidth;
        this.ctxHeight = ctxHeight;
        // config
        this.config = {
            // Number of points resolved between edge points
            // to generate terrain
            terrainResolution: 2
        };
        this.border = [];

        this.pixelBuffer = new Array(ctxWidth * ctxHeight);
        this.ctxHeight = ctxHeight;
        this.ctxWidth = ctxWidth;
        this.generate();
    }
    Landmass.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
    };

    Landmass.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);

        ctx.fillStyle = Colors.Land.toString();

        // Fill in the landmass
        var _ref;
        for (var col = 0; col < this.ctxWidth; col++) {
            for (var row = 0; row < this.ctxHeight; row++) {
                _ref = this.pixelBuffer[col + row * this.ctxWidth];

                if (_ref === 1) {
                    ctx.fillRect(col, row, 1, 1);
                }
            }
        }
    };

    Landmass.prototype.generate = function () {
        var _this = this;
        // land goes to bottom of screen (for now)
        var lowerBounds = 300;
        var upperBounds = Math.random() * (this.ctxHeight - 330) + 330;

        var leftY = Math.random() * (upperBounds - lowerBounds) + lowerBounds;
        var rightY = Math.random() * (upperBounds - lowerBounds) + lowerBounds;

        // bisect
        var bisect = function (minX, maxX, minY, maxY, maxDepth) {
            if (maxDepth < 0)
                return;

            var middleX = (minX + maxX) / 2.0;
            var newY = Math.random() * (maxY - minY) + minY;
            var point = new Point(middleX, newY);

            // push point
            _this.border.push(point);

            // bisect
            bisect(minX, middleX, minY, newY, maxDepth - 1);
            bisect(middleX, maxX, minY, newY, maxDepth - 1);
        };

        // kick it off
        this.border.push(new Point(0, leftY));
        bisect(0, this.ctxWidth, lowerBounds, upperBounds, this.config.terrainResolution);
        this.border.push(new Point(this.ctxWidth, rightY));

        // sort the border by X coordiate
        this.border.sort(function (a, b) {
            return a.x - b.x;
        });

        // fill in the border
        var filledBorder = [];

        // draw line
        var drawLine = function (x0, y0, x1, y1) {
            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0);
            var sx = (x0 < x1) ? 1 : -1;
            var sy = (y0 < y1) ? 1 : -1;
            var err = dx - dy;

            while (true) {
                filledBorder.push(new Point(x0, y0));

                if ((x0 == x1) && (y0 == y1))
                    break;
                var e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x0 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y0 += sy;
                }
            }
        };

        for (var i = 0; i < this.border.length - 1; i++) {
            var me = this.border[i];
            var nx = this.border[i + 1];

            // this includes me and nx
            drawLine(me.x, me.y, nx.x, nx.y);
        }

        for (var col = 0; col < this.ctxWidth; col++) {
            for (var row = 0; row < this.ctxHeight - filledBorder[col].y; row++) {
                // offset row because it starts at origin (0) and we need
                // it to be at the right offset
                this.pixelBuffer[col + (row + filledBorder[col].y) * this.ctxWidth] = 1;
            }
        }
    };
    return Landmass;
})(Actor);
/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />
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
/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />
var game = new Engine(640, 480, 'game');

// Set background color
game.backgroundColor = Colors.Background;

// create map
var landmass = new Landmass(game.canvas.width, game.canvas.height);
game.addChild(landmass);

// create player
//var playerTank = new PlayerTank(50, 0);
//playerTank.y = landmass.y - playerTank.getHeight();
//game.addChild(playerTank);
// enemy tank
//var enemyTank = new Tank(300, 0, Colors.Enemy);
//enemyTank.y = landmass.y - enemyTank.getHeight();
//game.addChild(enemyTank);
// draw HUD
//var powerIndicator = new Label("Power: " + playerTank.firepower, 10, 20);
//powerIndicator.color = Colors.Player;
//powerIndicator.scale = 1.5;
//powerIndicator.addEventListener('update', () => {
//    powerIndicator.text = "Power: " + playerTank.firepower;
//});
//game.addChild(powerIndicator);
// run the mainloop
game.start();
//# sourceMappingURL=game.js.map
