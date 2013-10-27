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
    defaultFirepower: 300,
    // Firepower adjustment delta
    firepowerDelta: 70,
    // Firepower maximum speed
    firepowerMax: 1000,
    // Firepower minimum speed
    firepowerMin: 0,
    // Firepower acceleration
    firepowerAccel: 0.5,
    // Projectile speed modifier
    bulletSpeedModifier: 0.4,
    // Gravity constant
    gravity: 50,
    // # of planets to generate
    maxPlanets: 4,
    // amount of distance from canvas edges to spawn planets
    planetGenerationPadding: 120
};

var Colors = {
    White: Color.fromHex("#ffffff"),
    Background: Color.fromHex("#141414"),
    Player: Color.fromHex("#a73c3c"),
    Enemy: Color.fromHex("#c0b72a"),
    Land: Color.fromHex("#8c8c8c"),
    Projectile: Color.fromHex("#ffffff")
};
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var CollisionActor = (function (_super) {
    __extends(CollisionActor, _super);
    function CollisionActor(x, y, width, height, color) {
        _super.call(this, x, y, width, height, color);
    }
    CollisionActor.prototype.drawCollisionMap = function (ctx, delta) {
        var oldColor = this.color;
        this.color = new Color(0, 0, 0, 255);
        this.draw(ctx, delta);
        this.color = oldColor;
    };
    return CollisionActor;
})(Actor);
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="CollisionActor.ts" />
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
        ctx.drawImage(this.planetCanvas, this.x, this.y);
    };

    Landmass.prototype.drawCollisionMap = function (ctx, delta) {
        ctx.drawImage(this.planetCollisionCanvas, this.x, this.y);
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

    Landmass.prototype.destruct = function (point, radius) {
        this.planetCtx.beginPath();
        this.planetCtx.globalCompositeOperation = 'destination-out';
        this.planetCtx.arc(point.x - this.x, point.y - this.y, radius, 0, Math.PI * 2);
        this.planetCtx.closePath();
        this.planetCtx.fill();

        this.planetCollisionCtx.beginPath();
        this.planetCollisionCtx.globalCompositeOperation = 'destination-out';
        this.planetCollisionCtx.arc(point.x - this.x, point.y - this.y, radius, 0, Math.PI * 2);
        this.planetCollisionCtx.closePath();
        this.planetCollisionCtx.fill();
    };

    Landmass.prototype.generate = function () {
        // get a random radius to use
        this.radius = Math.random() * (this.config.maxRadius - this.config.minRadius) + this.config.minRadius;

        this.setWidth(this.radius * 2);
        this.setHeight(this.radius * 2);

        // create off-screen canvas
        this.planetCanvas = document.createElement('canvas');
        this.planetCollisionCanvas = document.createElement('canvas');
        this.planetCanvas.width = this.radius * 2 + 2;
        this.planetCanvas.height = this.radius * 2 + 2;
        this.planetCollisionCanvas.width = this.radius * 2 + 2;
        this.planetCollisionCanvas.height = this.radius * 2 + 2;

        this.planetCtx = this.planetCanvas.getContext('2d');
        this.planetCollisionCtx = this.planetCollisionCanvas.getContext('2d');

        // draw arc
        this.planetCtx.beginPath();
        this.planetCtx.fillStyle = this.color.toString();
        this.planetCtx.arc(this.radius + 1, this.radius + 1, this.radius, 0, Math.PI * 2);
        this.planetCtx.closePath();
        this.planetCtx.fill();

        this.planetCollisionCtx.beginPath();
        this.planetCollisionCtx.fillStyle = new Color(0, 0, 0, 255);
        this.planetCollisionCtx.arc(this.radius + 1, this.radius + 1, this.radius, 0, Math.PI * 2);
        this.planetCollisionCtx.closePath();
        this.planetCollisionCtx.fill();
    };
    return Landmass;
})(CollisionActor);
var Resources;
(function (Resources) {
    var Projectiles = (function () {
        function Projectiles(engine) {
            Projectiles.explosionSprite = new Drawing.SpriteSheet("/Spritesheets/spritesheet-explosion.png", 5, 5, Projectiles.explosionDimensions, Projectiles.explosionDimensions);
            Projectiles.explosionAnim = new Drawing.Animation(engine, Projectiles.explosionSprite.sprites, 0.1);
        }
        Projectiles.explosionDimensions = 130;

        Projectiles.explodeSound = new Media.Sound("/Sounds/Explosion-Small.wav");
        return Projectiles;
    })();
    Resources.Projectiles = Projectiles;

    var Tanks = (function () {
        function Tanks() {
        }
        Tanks.fireSound = new Media.Sound("/Sounds/Fire.wav");
        Tanks.moveBarrelSound = new Media.Sound("/Sounds/MoveBarrel.wav");
        return Tanks;
    })();
    Resources.Tanks = Tanks;
})(Resources || (Resources = {}));
var Projectile = (function (_super) {
    __extends(Projectile, _super);
    function Projectile(x, y, angle, power) {
        _super.call(this, x, y, 2, 2, Colors.Projectile);

        this.explodeRadius = 20;
        this.startingAngle = angle;
        this.speed = power * Config.bulletSpeedModifier;

        // starts at angle and moves in that direction at power
        this.dx = this.speed * Math.cos(this.startingAngle);
        this.dy = this.speed * Math.sin(this.startingAngle);
    }
    Projectile.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);

        var seconds = delta / 1000;

        // store engine
        this.engine = engine;

        // gravity
        var gravity = Config.gravity * seconds;

        // pulled down by gravity
        this.dy += gravity;

        if (this.y > engine.canvas.height) {
            engine.removeChild(this);
            return;
        }

        var collisionCtx = (engine).collisionCtx;

        // check collision with tanks
        // get projection ahead of where we are currently
        var projectedPixel = new Point(Math.floor(this.x), Math.floor(this.y));
        var projectedPixelData = collisionCtx.getImageData(projectedPixel.x, projectedPixel.y, 1, 1).data;

        if (!this.isColorOf(projectedPixelData, Colors.White)) {
            // collision!
            this.onCollision();

            // exit
            return;
        }
    };

    Projectile.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);
    };

    /**
    * Determines whether or not the given color is present
    * in the given pixel array.
    */
    Projectile.prototype.isColorOf = function (pixels, color) {
        for (var i = 0; i < pixels.length; i += 4) {
            if (pixels[i] === color.r && pixels[i + 1] === color.g && pixels[i + 2] === color.b && pixels[i + 3] === color.a) {
                return true;
            }
        }

        return false;
    };

    Projectile.prototype.onCollision = function () {
        var _this = this;
        // loop through landmasses and destruct
        this.engine.currentScene.children.forEach(function (actor) {
            if (actor instanceof Landmass) {
                (actor).destruct(new Point(_this.x, _this.y), _this.explodeRadius);
            }
        });

        // play sound
        Resources.Projectiles.explodeSound.play();

        // play explosion animation
        Resources.Projectiles.explosionAnim.play(this.x - (Resources.Projectiles.explosionDimensions / 2), this.y - (Resources.Projectiles.explosionDimensions / 2));

        // remove myself
        this.engine.removeChild(this);
    };
    return Projectile;
})(Actor);
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Projectile.ts" />
/// <reference path="CollisionActor.ts" />
var Tank = (function (_super) {
    __extends(Tank, _super);
    function Tank(x, y, color) {
        _super.call(this, x, y, Config.tankWidth, Config.tankHeight, color);
        this.health = 100;

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

        console.log("Barrel Center", centerX, centerY, this.angle);

        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle + this.angle + (Math.PI / 2)) + centerX;
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle + this.angle + (Math.PI / 2)) + centerY;

        // Play sound
        Resources.Tanks.fireSound.play();

        return new Projectile(barrelX, barrelY, this.barrelAngle + this.angle + (Math.PI / 2), this.firepower);
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
/// <reference path="Excalibur.d.ts" />
var Patches;
(function (Patches) {
    function patchInCollisionMaps(game) {
        var collisionCanvas = document.createElement("canvas");

        collisionCanvas.id = "collisionCanvas";
        collisionCanvas.width = game.canvas.width;
        collisionCanvas.height = game.canvas.height;
        var collisionCtx = collisionCanvas.getContext('2d');

        if (game.isDebug) {
            document.body.appendChild(collisionCanvas);
        }

        var oldDraw = Engine.prototype["draw"];
        Engine.prototype["draw"] = function (delta) {
            collisionCtx.fillStyle = 'white';
            collisionCtx.fillRect(0, 0, collisionCanvas.width, collisionCanvas.height);

            oldDraw.apply(this, [delta]);
        };

        SceneNode.prototype.draw = function (ctx, delta) {
            this.children.forEach(function (actor) {
                actor.draw(ctx, delta);

                if (actor instanceof CollisionActor) {
                    (actor).drawCollisionMap(collisionCtx, delta);
                }
            });
        };

        (game).collisionCtx = collisionCtx;
    }
    Patches.patchInCollisionMaps = patchInCollisionMaps;
})(Patches || (Patches = {}));
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />
/// <reference path="Resources.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="MonkeyPatch.ts" />
var game = new Engine(null, null, 'game');

Patches.patchInCollisionMaps(game);

// game.isDebug = true;
// Resources
new Resources.Projectiles(game);
new Resources.Tanks();

// Set background color
game.backgroundColor = Colors.Background;

// create map
var planets = [];
for (var i = 0; i < Config.maxPlanets; i++) {
    planets.push(new Landmass());
    game.addChild(planets[i]);
}

// position planets
var _planet, planetGenMaxX = game.canvas.width - Config.planetGenerationPadding, planetGenMinX = Config.planetGenerationPadding, planetGenMaxY = game.canvas.height - Config.planetGenerationPadding, planetGenMinY = Config.planetGenerationPadding;

for (var i = 0; i < planets.length; i++) {
    _planet = planets[i];
    _planet.x = Math.floor(Math.random() * (planetGenMaxX - planetGenMinX) + planetGenMinX);
    _planet.y = Math.floor(Math.random() * (planetGenMaxY - planetGenMinY) + planetGenMinY);
}

var placeTank = function (tank) {
    // create player
    var placed = false;
    var randomPlanet = planets[Math.floor(Math.random() * planets.length)];

    while (!placed) {
        var pos = randomPlanet.getRandomPointOnBorder();

        if (pos.point.x > 0 && pos.point.x < game.canvas.width && pos.point.y > 0 && pos.point.y < game.canvas.height) {
            placed = true;

            console.log("Placing tank", pos);

            // place player on edge of landmass
            tank.placeOn(randomPlanet, pos.point, pos.angle);
        }
    }
};

var playerTank = new PlayerTank(0, 0);

placeTank(playerTank);

game.addChild(playerTank);

// enemy tank
var enemyTank = new Tank(0, 0, Colors.Enemy);

placeTank(enemyTank);

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
