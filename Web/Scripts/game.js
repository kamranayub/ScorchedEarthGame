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
    // Minimum planet radius
    planetMinRadius: 35,
    // Maximum planet radius
    planetMaxRadius: 200,
    // # of planets to generate
    maxPlanets: 8,
    // amount of distance from canvas edges to spawn planets
    planetGenerationPadding: 120
};

var Colors = {
    Black: Color.fromHex("#000000"),
    White: Color.fromHex("#ffffff"),
    Background: Color.fromHex("#141414"),
    Player: Color.fromHex("#a73c3c"),
    Enemy: Color.fromHex("#c0b72a"),
    Land: Color.fromHex("#8c8c8c"),
    Projectile: Color.fromHex("#ffffff"),
    ExplosionBegin: Color.fromHex("#ddd32f"),
    ExplosionEnd: Color.fromHex("#c12713")
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
        this.radius = Math.random() * (Config.planetMaxRadius - Config.planetMinRadius) + Config.planetMinRadius;

        this.setWidth(this.radius * 2);
        this.setHeight(this.radius * 2);

        // create off-screen canvases
        // draw = what we draw to and copy over to game canvas
        // collision = what we draw to and use for collision checking
        var draw = this.generateCanvas(this.color);
        var collision = this.generateCanvas(Colors.Black);

        this.planetCanvas = draw.canvas;
        this.planetCtx = draw.ctx;
        this.planetCollisionCanvas = collision.canvas;
        this.planetCollisionCtx = collision.ctx;
    };

    Landmass.prototype.generateCanvas = function (color) {
        var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');

        canvas.width = this.radius * 2 + 2;
        canvas.height = this.radius * 2 + 2;

        // draw arc
        ctx.beginPath();
        ctx.fillStyle = color.toString();
        ctx.arc(this.radius + 1, this.radius + 1, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        return {
            canvas: canvas,
            ctx: ctx
        };
    };
    return Landmass;
})(CollisionActor);
var Resources;
(function (Resources) {
    var Tanks = (function () {
        function Tanks() {
        }
        Tanks.fireSound = new Media.Sound("/Sounds/Fire.wav");
        Tanks.moveBarrelSound = new Media.Sound("/Sounds/MoveBarrel.wav");
        return Tanks;
    })();
    Resources.Tanks = Tanks;
})(Resources || (Resources = {}));
var Explosion = (function (_super) {
    __extends(Explosion, _super);
    function Explosion(x, y, radius) {
        _super.call(this, x, y, radius, radius, Colors.ExplosionBegin);
        this.radius = radius;

        this.expansionModifier = 200;
        this._currentRadius = 0;
        this._colorDiffR = Colors.ExplosionEnd.r - Colors.ExplosionBegin.r;
        this._colorDiffG = Colors.ExplosionEnd.g - Colors.ExplosionBegin.g;
        this._colorDiffB = Colors.ExplosionEnd.b - Colors.ExplosionBegin.b;
    }
    Explosion.prototype.update = function (engine, delta) {
        var _this = this;
        _super.prototype.update.call(this, engine, delta);

        // adjust color based on current radius
        var percRadius = this._currentRadius / this.radius;

        this.color = new Color(Math.floor(Colors.ExplosionBegin.r + (this._colorDiffR * percRadius)), Math.floor(Colors.ExplosionBegin.g + (this._colorDiffG * percRadius)), Math.floor(Colors.ExplosionBegin.b + (this._colorDiffB * percRadius)));

        if (this._currentRadius >= this.radius) {
            // loop through landmasses and destruct
            engine.currentScene.children.forEach(function (actor) {
                if (actor instanceof Landmass) {
                    (actor).destruct(new Point(_this.x, _this.y), _this.radius);
                }
            });

            engine.removeChild(this);
            return;
        } else {
            // mod current radius by duration
            this._currentRadius += (this.expansionModifier / 1000) * delta;
        }
    };

    Explosion.prototype.draw = function (ctx, delta) {
        ctx.beginPath();
        ctx.fillStyle = this.color.toString();
        ctx.arc(this.x, this.y, this._currentRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    };
    return Explosion;
})(Actor);
/// <reference path="Explosion.ts" />
var Projectile = (function (_super) {
    __extends(Projectile, _super);
    function Projectile(x, y, width, height, color, angle, power, explodeRadius) {
        _super.call(this, x, y, width, height, color);
        this.angle = angle;
        this.explodeRadius = explodeRadius;

        // set speed
        this.speed = power * Config.bulletSpeedModifier;

        // starts at angle and moves in that direction at power
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
    }
    Projectile.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);

        var seconds = delta / 1000;

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
        var collisionPixel = new Point(Math.floor(this.x), Math.floor(this.y));
        var collisionPixelData = collisionCtx.getImageData(collisionPixel.x, collisionPixel.y, 1, 1).data;

        if (!this.isColorOf(collisionPixelData, Colors.White)) {
            // collision!
            this.onCollision(engine);

            // exit
            return;
        }
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

    Projectile.prototype.onCollision = function (engine) {
        // remove myself
        engine.removeChild(this);
    };
    return Projectile;
})(Actor);
var Projectiles;
(function (Projectiles) {
    /**
    * Basic projectile that everyone receives
    */
    var Missile = (function (_super) {
        __extends(Missile, _super);
        function Missile(x, y, angle, power) {
            _super.call(this, x, y, 2, 2, Colors.Projectile, angle, power, 10);
        }
        Missile.prototype.onCollision = function (engine) {
            _super.prototype.onCollision.call(this, engine);

            // play sound
            Missile._explodeSound.play();

            // play explosion animation
            var splosion = new Explosion(this.x, this.y, this.explodeRadius);

            // add explosion to engine
            engine.addChild(splosion);
        };
        Missile._explodeSound = new Media.Sound("/Sounds/Explosion-Small.wav");
        return Missile;
    })(Projectile);
    Projectiles.Missile = Missile;
})(Projectiles || (Projectiles = {}));
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Projectile.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="Projectiles/MissileProjectile.ts" />
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

        return new Projectiles.Missile(barrelX, barrelY, this.barrelAngle + this.angle + (Math.PI / 2), this.firepower);
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

    var placed = false;

    while (!placed) {
        _planet.x = Math.floor(Math.random() * (planetGenMaxX - planetGenMinX) + planetGenMinX);
        _planet.y = Math.floor(Math.random() * (planetGenMaxY - planetGenMinY) + planetGenMinY);

        var intersecting = false;

        for (var j = 0; j < planets.length; j++) {
            if (i === j)
                continue;

            // use some maths to figure out if this planet touches the other
            var otherPlanet = planets[j], oc = otherPlanet.getCenter(), mc = _planet.getCenter(), distance = Math.sqrt(Math.pow((mc.x - oc.x), 2) + Math.pow((mc.y - oc.y), 2));

            if (_planet.radius + otherPlanet.radius > distance) {
                intersecting = true;
                break;
            }
        }

        if (!intersecting) {
            placed = true;
        }
    }
}

var placeTank = function (tank) {
    // create player
    var placed = false;
    var randomPlanet = planets[Math.floor(Math.random() * planets.length)];

    while (!placed) {
        var pos = randomPlanet.getRandomPointOnBorder();

        var isInViewport = function () {
            return pos.point.x > 0 && pos.point.x < game.canvas.width - tank.getWidth() && pos.point.y > 0 && pos.point.y < game.canvas.height - tank.getHeight();
        };

        if (isInViewport()) {
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
