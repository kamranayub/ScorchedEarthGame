/// <reference path="Excalibur.d.ts" />
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
    gravity: 50,
    // # of planets to generate
    maxPlanets: 1
};

var Colors = {
    Background: Color.fromHex("#141414"),
    Player: Color.fromHex("#a73c3c"),
    Enemy: Color.fromHex("#c0b72a"),
    Land: Color.fromHex("#8c8c8c"),
    Bullet: Color.fromHex("#ffffff")
};
/// <reference path="Excalibur.d.ts" />
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
    function Landmass() {
        _super.call(this, 0, 0, null, null, Colors.Land);
        // config
        this.config = {
            minRadius: 35,
            maxRadius: 200
        };

        this.generate();
    }
    Landmass.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
    };

    Landmass.prototype.draw = function (ctx, delta) {
        //super.draw(ctx, delta);
        ctx.drawImage(this.planetCanvas, this.x, this.y);
    };

    Landmass.prototype.getRandomPointOnBorder = function () {
        var randomAngle = Math.random() * Math.PI * 2;
        var randomX = this.radius * Math.cos(randomAngle);
        var randomY = this.radius * Math.sin(randomAngle);

        return {
            angle: randomAngle,
            point: new Point(randomX + this.x + this.radius, randomY + this.y + this.radius)
        };
    };

    Landmass.prototype.generate = function () {
        // get a random radius to use
        this.radius = Math.random() * (this.config.maxRadius - this.config.minRadius) + this.config.minRadius;

        this.setWidth(this.radius * 2);
        this.setHeight(this.radius * 2);

        // create off-screen canvas
        this.planetCanvas = document.createElement('canvas');
        this.planetCanvas.width = this.radius * 2 + 2;
        this.planetCanvas.height = this.radius * 2 + 2;

        this.planetCtx = this.planetCanvas.getContext('2d');

        // draw arc
        this.planetCtx.beginPath();
        this.planetCtx.fillStyle = this.color.toString();
        this.planetCtx.arc(this.radius + 1, this.radius + 1, this.radius, 0, Math.PI * 2);
        this.planetCtx.closePath();
        this.planetCtx.fill();
    };
    return Landmass;
})(Actor);
var Resources;
(function (Resources) {
    var Bullets = (function () {
        function Bullets(engine) {
            Bullets.explosionSprite = new Drawing.SpriteSheet("/Spritesheets/spritesheet-explosion.png", 5, 5, Bullets.explosionDimensions, Bullets.explosionDimensions);
            Bullets.explosionAnim = new Drawing.Animation(engine, Bullets.explosionSprite.sprites, 0.1);
        }
        Bullets.explosionDimensions = 130;

        Bullets.explodeSound = new Media.Sound("/Sounds/splode.mp3");
        return Bullets;
    })();
    Resources.Bullets = Bullets;
})(Resources || (Resources = {}));
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Resources.ts" />
var Tank = (function (_super) {
    __extends(Tank, _super);
    function Tank(x, y, color) {
        _super.call(this, x, y, Config.tankWidth, Config.tankHeight, color);

        this.barrelAngle = (Math.PI / 4) + Math.PI;
        this.firepower = Config.defaultFirepower;
    }
    Tank.prototype.draw = function (ctx, delta) {
        ctx.fillStyle = this.color.toString();

        ctx.save();
        ctx.translate(this.landmass.x + this.landmass.radius, this.landmass.y + this.landmass.radius);

        // account for phase shifting with canvas
        ctx.rotate(this.angle + (Math.PI / 2));
        ctx.fillRect(-this.getWidth() / 2, -this.landmass.radius - this.getHeight(), this.getWidth(), this.getHeight());

        // get center
        var centerX = 0;
        var centerY = -this.landmass.radius - this.getHeight() / 2;

        // draw barrel
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.barrelAngle);
        ctx.fillRect(0, -(Config.barrelWidth / 2), Config.barrelHeight, Config.barrelWidth);
        ctx.restore();

        // draw on landmass/scale/rotate
        ctx.restore();
    };

    Tank.prototype.placeOn = function (landmass, point, angle) {
        this.landmass = landmass;

        // set x,y
        this.angle = angle;
        this.x = point.x;
        this.y = point.y;

        console.log("Rotating player", (this.angle * 180) / Math.PI, "degrees");
        console.log("Planet border pos", this.x, this.y);
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
        var centerX = this.x + (this.getHeight() / 2) * Math.cos(this.angle);
        var centerY = this.y + (this.getHeight() / 2) * Math.sin(this.angle);

        console.log("Barrel Center", centerX, centerY, this.angle);

        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle + this.angle + (Math.PI / 2)) + centerX;
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle + this.angle + (Math.PI / 2)) + centerY;

        return new Bullet(barrelX, barrelY, this.barrelAngle + this.angle + (Math.PI / 2), this.firepower);
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

        this.startingAngle = angle;
        this.speed = power * Config.bulletSpeedModifier;

        // starts at angle and moves in that direction at power
        this.dx = this.speed * Math.cos(this.startingAngle);
        this.dy = this.speed * Math.sin(this.startingAngle);
    }
    Bullet.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);

        var seconds = delta / 1000;

        // TODO: This is pretty naive. We should use a collision map!
        // There's a chance the projected pixel will actually be a color
        // of what we can collide with when it may be some anti-aliasing
        // or other color.
        // check collision with tanks
        // get projection ahead of where we are currently
        var projectedPixel = new Point(2 + this.x + this.dx * seconds, 2 + this.y + this.dy * seconds);
        var projectedPixelData = engine.ctx.getImageData(projectedPixel.x, projectedPixel.y, 1, 1).data;

        if (this.isColorOf(projectedPixelData, Colors.Enemy) || this.isColorOf(projectedPixelData, Colors.Land) || this.isColorOf(projectedPixelData, Colors.Player)) {
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

        if (this.y > engine.canvas.height) {
            engine.removeChild(this);
        }
    };

    Bullet.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);
    };

    /**
    * Determines whether or not the given color is present
    * in the given pixel array.
    */
    Bullet.prototype.isColorOf = function (pixels, color) {
        for (var i = 0; i < pixels.length; i += 4) {
            if (pixels[i] === color.r && pixels[i + 1] === color.g && pixels[i + 2] === color.b && pixels[i + 3] === color.a) {
                console.log("Collided with color", color);
                return true;
            }
        }

        return false;
    };

    Bullet.prototype.onCollision = function () {
        // play sound
        Resources.Bullets.explodeSound.play();

        // play explosion animation
        Resources.Bullets.explosionAnim.play(this.x - (Resources.Bullets.explosionDimensions / 2), this.y - (Resources.Bullets.explosionDimensions / 2));

        // remove myself
        this.engine.removeChild(this);
    };
    return Bullet;
})(Actor);
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />
/// <reference path="Resources.ts" />
var game = new Engine(null, null, 'game');

// game.isDebug = true;
// Resources
var bulletResources = new Resources.Bullets(game);

// Set background color
game.backgroundColor = Colors.Background;

// create map
var landmass = new Landmass();
landmass.x = 200;
landmass.y = 200;

game.addChild(landmass);

var landmass2 = new Landmass();
landmass2.x = 500;
landmass2.y = 500;

game.addChild(landmass2);

// create player
var playerTank = new PlayerTank(0, 0);
var playerPos = landmass.getRandomPointOnBorder();

console.log("Placing player", playerPos);

// place player on edge of landmass
playerTank.placeOn(landmass, playerPos.point, playerPos.angle);

game.addChild(playerTank);

// enemy tank
var enemyTank = new Tank(0, 0, Colors.Enemy);
var enemyPos = landmass2.getRandomPointOnBorder();

console.log("Placing enemy", enemyPos);

enemyTank.placeOn(landmass2, enemyPos.point, enemyPos.angle);

game.addChild(enemyTank);

// draw HUD
var powerIndicator = new Label("Power: " + playerTank.firepower, 10, 20);
powerIndicator.color = Colors.Player;
powerIndicator.scale = 1.5;
powerIndicator.addEventListener('update', function () {
    powerIndicator.text = "Power: " + playerTank.firepower;
});
game.addChild(powerIndicator);

// run the mainloop
game.start();
//# sourceMappingURL=game.js.map
