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
    bulletSpeedModifier: 0.003,
    // Gravity constant
    gravity: 6,
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
var GameSettings = (function () {
    function GameSettings() {
    }
    return GameSettings;
})();

var MapSize;
(function (MapSize) {
    MapSize[MapSize["Small"] = 0] = "Small";
    MapSize[MapSize["Medium"] = 1] = "Medium";
    MapSize[MapSize["Large"] = 2] = "Large";
    MapSize[MapSize["Huge"] = 3] = "Huge";
})(MapSize || (MapSize = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Starfield = (function (_super) {
    __extends(Starfield, _super);
    function Starfield(width, height) {
        _super.call(this, 0, 0, width, height);

        Logger.getInstance().log("Creating starfield, " + width + "x" + height);

        var x, y, a, s, dx1 = -(Math.random() * 5), dx2 = -(Math.random() * 5);

        for (var i = 0; i < 1000; i++) {
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);
            a = Math.random();
            s = new Actor(x, y, 1, 1, new Color(255, 255, 255, a));
            s.dx = Math.floor(Math.random() * 2) === 1 ? dx1 : dx2;

            s.addEventListener('update', this.starOnUpdate(this, s));

            this.addChild(s);
        }

        this.solid = true;
        this.invisible = true;
    }
    Starfield.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);
    };

    Starfield.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
    };

    Starfield.prototype.starOnUpdate = function (field, star) {
        return function (e) {
            if (star.x < 0) {
                star.x = field.getWidth();
            }
        };
    };
    return Starfield;
})(Actor);
var CollisionActor = (function (_super) {
    __extends(CollisionActor, _super);
    function CollisionActor(x, y, width, height, color) {
        _super.call(this, x, y, width, height, color);
    }
    CollisionActor.prototype.drawCollisionMap = function (ctx, delta) {
        var oldColor = this.color;
        this.color = new Color(0, 0, 0, 1);
        this.draw(ctx, delta);
        this.color = oldColor;
    };

    CollisionActor.prototype.isHit = function (engine, x, y) {
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

    CollisionActor.prototype.collide = function (engine, actor) {
    };
    return CollisionActor;
})(Actor);
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="CollisionActor.ts" />
var Landmass = (function (_super) {
    __extends(Landmass, _super);
    function Landmass() {
        _super.call(this, 0, 0, null, null, Colors.Land);
        // clamp velocities because > 2 is too much
        // max x velocity
        this.xm = 1.8;
        // max y velocity
        this.ym = 1.8;

        this.generate();
        this.invisible = true;
    }
    Landmass.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
    };

    Landmass.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);

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
            point: new Point(Math.floor(randomX + this.x + this.radius), Math.floor(randomY + this.y + this.radius))
        };
    };

    Landmass.prototype.collide = function (engine, actor) {
        _super.prototype.collide.call(this, engine, actor);

        if (actor instanceof Explosion) {
            this.destruct(new Point(actor.x, actor.y), (actor).radius);
        }
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

    /**
    * Pseudo orbital calculations
    * Acts on the actor by manipulating its velocities
    */
    Landmass.prototype.actOn = function (actor, delta) {
        var G = Config.gravity;
        var x = this.x + this.radius;
        var y = this.y + this.radius;

        var xdiff = actor.x - x;
        var ydiff = actor.y - y;
        var dSquared = (xdiff * xdiff) + (ydiff * ydiff);
        var d = Math.sqrt(dSquared);
        var a = -G * ((1 * this.radius) / dSquared);
        if (a > 10)
            a = 10;
        var xa = a * ((xdiff) / d);
        var ya = a * ((ydiff) / d);

        actor.dx += xa;
        actor.dy += ya;

        if (Math.abs(actor.dx) > this.xm) {
            actor.dx = actor.dx < 0 ? -this.xm : this.xm;
        }
        if (Math.abs(actor.dy) > this.ym) {
            actor.dy = actor.dy < 0 ? -this.ym : this.ym;
        }

        actor.x += actor.dx;
        actor.y += actor.dy;
    };

    Landmass.prototype.generate = function () {
        // get a random radius to use
        this.radius = Math.random() * (Config.planetMaxRadius - Config.planetMinRadius) + Config.planetMinRadius;

        this.setWidth(this.radius * 2);
        this.setHeight(this.radius * 2);

        // create off-screen canvases
        // draw = what we draw to and copy over to game canvas
        // collision = what we draw to and use for collision checking
        var draw = this.generateCanvas();
        var collision = this.generateCanvas(Colors.Black);

        this.planetCanvas = draw.canvas;
        this.planetCtx = draw.ctx;
        this.planetCollisionCanvas = collision.canvas;
        this.planetCollisionCtx = collision.ctx;
    };

    Landmass.prototype.generateCanvas = function (color) {
        var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');

        canvas.width = this.radius * 2;
        canvas.height = this.radius * 2;

        if (color) {
            // draw arc
            ctx.beginPath();
            ctx.fillStyle = color.toString();
            ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        } else {
            var planetImages = [
                Resources.Planet.planet1Image.image,
                Resources.Planet.planet2Image.image,
                Resources.Planet.planet3Image.image,
                Resources.Planet.planet4Image.image
            ];

            ctx.drawImage(planetImages[Math.round(Math.random() * (planetImages.length - 1))], 0, 0, 500, 500, 0, 0, canvas.width, canvas.height);
        }

        return {
            canvas: canvas,
            ctx: ctx
        };
    };
    return Landmass;
})(CollisionActor);
var GraphicUtils = (function () {
    function GraphicUtils() {
    }
    GraphicUtils.isPixelColorOf = /**
    * Determines whether or not the given color is present
    * in the given pixel array.
    */
    function (pixels, color) {
        for (var i = 0; i < pixels.length; i += 4) {
            if (pixels[i] === color.r && pixels[i + 1] === color.g && pixels[i + 2] === color.b && pixels[i + 3] === Math.floor(color.a * 255)) {
                return true;
            }
        }

        return false;
    };
    return GraphicUtils;
})();
var Resources;
(function (Resources) {
    var Global = (function () {
        function Global() {
        }
        Global.musicAmbient1 = new PreloadedSound("/Music/g33x-space-ambient.mp3");
        return Global;
    })();
    Resources.Global = Global;

    var Tanks = (function () {
        function Tanks() {
        }
        Tanks.dieSound = new PreloadedSound("/Sounds/Die.wav");
        Tanks.fireSound = new PreloadedSound("/Sounds/Fire.wav");
        Tanks.moveBarrelSound = new PreloadedSound("/Sounds/MoveBarrel.wav");
        return Tanks;
    })();
    Resources.Tanks = Tanks;

    var Explosions = (function () {
        function Explosions() {
        }
        Explosions.smallExplosion = new PreloadedSound("/Sounds/Explosion-Small.wav");
        return Explosions;
    })();
    Resources.Explosions = Explosions;

    var Planet = (function () {
        function Planet() {
        }
        Planet.planet1Image = new PreloadedImage('/Textures/planet1.png');
        Planet.planet2Image = new PreloadedImage('/Textures/planet2.png');
        Planet.planet3Image = new PreloadedImage('/Textures/planet3.png');
        Planet.planet4Image = new PreloadedImage('/Textures/planet4.png');
        return Planet;
    })();
    Resources.Planet = Planet;
})(Resources || (Resources = {}));
var Explosion = (function (_super) {
    __extends(Explosion, _super);
    function Explosion(x, y, radius, damage) {
        _super.call(this, x, y, radius, radius, Colors.ExplosionBegin);
        this.radius = radius;
        this.damage = damage;

        this.expansionModifier = 0.15;
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
                if (actor instanceof CollisionActor) {
                    var collActor = (actor);

                    if (collActor.isHit(engine, _this.x, _this.y)) {
                        collActor.collide(engine, _this);
                    }
                }
            });

            engine.removeChild(this);
            return;
        } else {
            // mod current radius by duration
            this._currentRadius += this.expansionModifier * delta;
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
        this._t = 0;

        // set speed
        this.speed = power * Config.bulletSpeedModifier;

        // starts at angle and moves in that direction at power
        this.dx = this.speed * Math.cos(angle);
        this.dy = this.speed * Math.sin(angle);
    }
    Projectile.prototype.update = function (engine, delta) {
        var _this = this;
        // super.update(engine, delta);
        // act on this projectile from all planets
        engine.currentScene.children.forEach(function (actor) {
            if (actor instanceof Landmass) {
                (actor).actOn(_this, delta);
            }
        });

        if (this.y > engine.canvas.height || this.y < 0 || this.x > engine.canvas.width || this.x < 0) {
            engine.removeChild(this);
            return;
        }

        var collisionCtx = (engine).collisionCtx;

        // check collision with tanks
        // get projection ahead of where we are currently
        var collisionPixel = new Point(Math.floor(this.x), Math.floor(this.y));
        var collisionPixelData = collisionCtx.getImageData(collisionPixel.x, collisionPixel.y, 1, 1).data;

        if (!GraphicUtils.isPixelColorOf(collisionPixelData, Colors.White)) {
            // collision!
            this.onCollision(engine);

            // exit
            return;
        }
    };

    Projectile.prototype.onCollision = function (engine) {
        // remove myself
        engine.removeChild(this);
    };
    return Projectile;
})(Actor);
var Healthbar = (function (_super) {
    __extends(Healthbar, _super);
    function Healthbar(max) {
        _super.call(this, 0, 0, Config.tankWidth, 5, Color.Green);
        this.max = max;

        this.invisible = true;
        this.current = max;
    }
    Healthbar.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);

        var startAngle = Math.PI + (Math.PI / 8);
        var endAngle = Math.PI * 2 - (Math.PI / 8);
        var diffAngle = endAngle - startAngle;

        // background
        ctx.strokeStyle = new Color(255, 255, 255, 0.3).toString();
        ctx.beginPath();
        ctx.arc(this.x + this.getWidth() / 2, this.y, 25, startAngle, endAngle);
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // arc
        ctx.strokeStyle = this.color.toString();
        ctx.beginPath();
        ctx.arc(this.x + this.getWidth() / 2, this.y, 25, startAngle, endAngle - (diffAngle * (1 - this.getPercentage())));
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
    };

    Healthbar.prototype.getPercentage = function () {
        return this.current / this.max;
    };

    Healthbar.prototype.setValue = function (value) {
        if (value >= 0) {
            this.current = value;
        }
    };

    Healthbar.prototype.reduce = function (value) {
        this.setValue(this.current - value);
    };

    Healthbar.prototype.getCurrent = function () {
        return this.current;
    };
    return Healthbar;
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
            Resources.Explosions.smallExplosion.sound.play();

            // play explosion animation
            var splosion = new Explosion(this.x, this.y, this.explodeRadius, 5);

            // add explosion to engine
            engine.addChild(splosion);
        };
        return Missile;
    })(Projectile);
    Projectiles.Missile = Missile;
})(Projectiles || (Projectiles = {}));
var Projectiles;
(function (Projectiles) {
    /**
    * Big missile projectile
    */
    var BigMissile = (function (_super) {
        __extends(BigMissile, _super);
        function BigMissile(x, y, angle, power) {
            _super.call(this, x, y, 4, 4, Colors.Projectile, angle, power, 40);
        }
        BigMissile.prototype.onCollision = function (engine) {
            _super.prototype.onCollision.call(this, engine);

            // play sound
            BigMissile._explodeSound.play();

            // play explosion animation
            var splosion = new Explosion(this.x, this.y, this.explodeRadius, 20);

            // add explosion to engine
            engine.addChild(splosion);
        };
        BigMissile._explodeSound = new Media.Sound("/Sounds/Explosion-Small.wav");
        return BigMissile;
    })(Projectile);
    Projectiles.BigMissile = BigMissile;
})(Projectiles || (Projectiles = {}));
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="GraphicUtils.ts" />
/// <reference path="Resources.ts" />
/// <reference path="Projectile.ts" />
/// <reference path="Healthbar.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="Projectiles/MissileProjectile.ts" />
/// <reference path="Projectiles/BigMissileProjectile.ts" />
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
        if (this.barrelAngle <= Math.PI - (Math.PI / 7))
            return;

        this.barrelAngle -= angle * delta / 1000;

        // play sound
        Resources.Tanks.moveBarrelSound.sound.play();
    };

    Tank.prototype.moveBarrelRight = function (angle, delta) {
        if (this.barrelAngle >= (Math.PI * 2) + (Math.PI / 7))
            return;

        this.barrelAngle += angle * delta / 1000;

        // play sound
        Resources.Tanks.moveBarrelSound.sound.play();
    };

    Tank.prototype.getProjectile = function () {
        var centerX = this.x + (this.getHeight() / 2) * Math.cos(this.angle);
        var centerY = this.y + (this.getHeight() / 2) * Math.sin(this.angle);

        var barrelX = Config.barrelHeight * Math.cos(this.barrelAngle + this.angle + (Math.PI / 2)) + centerX;
        var barrelY = Config.barrelHeight * Math.sin(this.barrelAngle + this.angle + (Math.PI / 2)) + centerY;

        // Play sound
        Resources.Tanks.fireSound.sound.play();

        return new Projectiles.Missile(barrelX, barrelY, this.barrelAngle + this.angle + (Math.PI / 2), this.firepower);
    };

    Tank.prototype.damage = function (engine, value) {
        this.healthbar.reduce(value);

        if (this.healthbar.getCurrent() <= 0) {
            this.die(engine);
        }
    };

    Tank.prototype.collide = function (engine, actor) {
        _super.prototype.collide.call(this, engine, actor);

        if (actor instanceof Explosion) {
            this.damage(engine, (actor).damage);
        }
    };

    Tank.prototype.die = function (engine) {
        // play explosions
        var minX = this.x - 15, maxX = this.x + 15, minY = this.y - 15, maxY = this.y + 15;

        // kill
        engine.removeChild(this);

        // badass explode sound
        Resources.Tanks.dieSound.sound.play();

        for (var i = 0; i < 5; i++) {
            var splody = new Explosion(Math.random() * (maxX - minX) + minX, Math.random() * (maxY - minY) + minY, Math.random() * 15, 4);
            engine.addChild(splody);
            console.log("Added splody", splody.x, splody.y);
        }
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
var DOM = (function () {
    function DOM() {
    }
    DOM.id = /**
    * Gets a DOM element by ID
    * @param id The ID to search by
    */
    function (id) {
        return document.getElementById(id);
    };

    DOM.idOf = /**
    * Gets a DOM element by ID
    * @param id The ID to search by
    */
    function (id) {
        return document.getElementById(id);
    };

    DOM.query = /**
    * Gets a single DOM element by a selector
    * @param selector The selector
    * @param ctx A context to search from (default: null)
    */
    function (selector, ctx) {
        if (typeof ctx === "undefined") { ctx = null; }
        ctx = ctx || document;

        return ctx.querySelector(selector);
    };

    DOM.hide = /**
    * Hides a DOM element
    */
    function (element) {
        element.style.display = 'none';
    };

    DOM.show = /**
    * Shows a DOM element
    */
    function (element) {
        element.style.display = 'block';
    };

    DOM.toggleClass = /**
    * Toggles a CSS class on an element
    * @param element The DOM element to manipulate
    * @param cls The CSS class to toggle
    * @returns True if the class existed and false if not
    */
    function (element, cls) {
        if (this.hasClass(element, cls)) {
            this.removeClass(element, cls);
            return true;
        } else {
            this.addClass(element, cls);
            return false;
        }
    };

    DOM.replaceClass = /**
    * Replaces a CSS class on an element
    * @param element The DOM element to manipulate
    * @param search The CSS class to find
    * @param replace The CSS class to replace with
    */
    function (element, search, replace) {
        if (this.hasClass(element, search)) {
            this.removeClass(element, search);
            this.addClass(element, replace);
        }
    };

    DOM.hasClass = /**
    * Whether or not an element has a CSS class present
    * @param element The DOM element to check
    * @param cls The CSS class to check for
    * @returns True if the class exists and false if not
    */
    function (element, cls) {
        return element.classList.contains(cls);
    };

    DOM.addClass = /**
    * Adds a CSS class to a DOM element
    * @param element The DOM element to manipulate
    * @param cls The CSS class to add
    */
    function (element, cls) {
        element.classList.add(cls);
    };

    DOM.removeClass = /**
    * Removes a CSS class to a DOM element
    * @param element The DOM element to manipulate
    * @param cls The CSS class to remove
    */
    function (element, cls) {
        element.classList.remove(cls);
    };

    DOM.onAnimationEnd = function (element, done) {
        var animationEndEvent = typeof AnimationEvent === 'undefined' ? 'webkitAnimationEnd' : 'animationend';

        var handler = function () {
            element.removeEventListener(animationEndEvent, handler);

            done();
        };

        element.addEventListener(animationEndEvent, handler);
    };

    DOM.onTransitionEnd = function (element, done) {
        var transitionEndEvent = typeof AnimationEvent === 'undefined' ? 'webkitTransitionEnd' : 'transitionend';

        var handler = function () {
            element.removeEventListener(transitionEndEvent, handler);

            done();
        };

        element.addEventListener(transitionEndEvent, handler);
    };
    return DOM;
})();
/// <reference path="DOM.ts" />
var UI = (function () {
    function UI(game) {
        this.game = game;
        this.uiGame = DOM.id('game');
        this.uiNewGame = DOM.id('ui-new-game');
        this.newGameBtn = DOM.id('new-game');
        this.toggleMusicBtn = DOM.id('toggle-music');

        // init
        this.init();
    }
    UI.prototype.init = function () {
        // add event listeners
        this.newGameBtn.addEventListener('click', this.showNewGame.bind(this));
        this.toggleMusicBtn.addEventListener('click', this.onToggleMusicClicked.bind(this));
        DOM.query('form', this.uiNewGame).addEventListener('submit', this.onNewGame.bind(this));

        this.showNewGame();
    };

    UI.prototype.showNewGame = function () {
        this.showDialog(this.uiNewGame);
    };

    UI.prototype.onNewGame = function (e) {
        e.preventDefault();

        var settings = new GameSettings();

        var mapSizeElement = DOM.idOf('mapsize');
        var enemyElement = DOM.idOf('enemies');
        var enemies = parseInt(enemyElement.value, 10);

        settings.mapSize = parseInt(mapSizeElement.value, 10);

        switch (settings.mapSize) {
            case MapSize.Small:
                settings.enemies = Math.min(2, enemies);
                break;
            case MapSize.Medium:
                settings.enemies = Math.min(5, enemies);
                break;
            case MapSize.Large:
                settings.enemies = Math.min(9, enemies);
                break;
            case MapSize.Huge:
                settings.enemies = Math.min(19, enemies);
                break;
            default:
                alert('Map size is invalid');
                return;
                break;
        }

        this.hideDialog(this.uiNewGame);
        this.game.newGame(settings);
    };

    UI.prototype.onToggleMusicClicked = function () {
        var icon = DOM.query('i', this.toggleMusicBtn);

        if (DOM.hasClass(icon, 'fa-volume-up')) {
            DOM.replaceClass(icon, 'fa-volume-up', 'fa-volume-off');
            this.game.stopMusic();
        } else {
            DOM.replaceClass(icon, 'fa-volume-off', 'fa-volume-up');
            this.game.startMusic();
        }
    };

    UI.prototype.showDialog = function (dialog) {
        DOM.show(dialog);
        setTimeout(function () {
            return DOM.addClass(dialog, 'show');
        }, 10);
    };

    UI.prototype.hideDialog = function (dialog) {
        DOM.onTransitionEnd(dialog, function () {
            return DOM.hide(dialog);
        });
        DOM.removeClass(dialog, 'show');
    };
    return UI;
})();
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="GameSettings.ts" />
/// <reference path="Starfield.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />
/// <reference path="Resources.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="MonkeyPatch.ts" />
/// <reference path="UI.ts" />
var Game = (function () {
    function Game() {
        var _this = this;
        this.game = new Engine(null, null, 'game');

        Patches.patchInCollisionMaps(this.game);

        // debug mode
        // this.game.isDebug = true;
        var loader = this.getLoader();

        // load resources
        this.game.load(loader);

        // HACK: workaround until engine/loader exposes event
        // oncomplete
        var oldOnComplete = loader.oncomplete;

        loader.oncomplete = function () {
            oldOnComplete.apply(loader, arguments);

            _this.init();
        };

        // start game
        this.game.start();
    }
    Game.prototype.getLoader = function () {
        var loader = new Loader();
        loader.addResource('mus-ambient1', Resources.Global.musicAmbient1);
        loader.addResource('snd-die', Resources.Tanks.dieSound);
        loader.addResource('snd-fire', Resources.Tanks.fireSound);
        loader.addResource('snd-explode-small', Resources.Explosions.smallExplosion);
        loader.addResource('snd-moveBarrel', Resources.Tanks.moveBarrelSound);
        loader.addResource('img-planet1', Resources.Planet.planet1Image);
        loader.addResource('img-planet2', Resources.Planet.planet2Image);
        loader.addResource('img-planet3', Resources.Planet.planet3Image);
        loader.addResource('img-planet4', Resources.Planet.planet4Image);

        return loader;
    };

    Game.prototype.init = function () {
        // init UI
        this.ui = new UI(this);

        // play bg music
        Resources.Global.musicAmbient1.sound.setLoop(true);
        Resources.Global.musicAmbient1.sound.setVolume(0.05);
        this.startMusic();

        // Set background color
        this.game.backgroundColor = Colors.Background;

        // create starfield
        var starfield = new Starfield(this.game.canvas.width, this.game.canvas.height);
        this.game.addChild(starfield);
    };

    /**
    * Starts a new game with the given settings
    */
    Game.prototype.newGame = function (settings) {
        // reset
        var children = this.game.currentScene.children.length, child;
        for (var i = 0; i < children; i++) {
            child = this.game.currentScene.children[i];

            if (!(child instanceof Starfield)) {
                this.game.currentScene.removeChild(child);
            }
        }

        // create map
        this.planets = [];

        for (var i = 0; i < Config.maxPlanets; i++) {
            this.planets.push(new Landmass());
            this.game.addChild(this.planets[i]);
        }

        // position planets
        var _planet, planetGenMaxX = this.game.canvas.width - Config.planetGenerationPadding, planetGenMinX = Config.planetGenerationPadding, planetGenMaxY = this.game.canvas.height - Config.planetGenerationPadding, planetGenMinY = Config.planetGenerationPadding;

        for (var i = 0; i < this.planets.length; i++) {
            _planet = this.planets[i];

            var placed = false;

            while (!placed) {
                _planet.x = Math.floor(Math.random() * (planetGenMaxX - planetGenMinX) + planetGenMinX);
                _planet.y = Math.floor(Math.random() * (planetGenMaxY - planetGenMinY) + planetGenMinY);

                var intersecting = false;

                for (var j = 0; j < this.planets.length; j++) {
                    if (i === j)
                        continue;

                    // use some maths to figure out if this planet touches the other
                    var otherPlanet = this.planets[j], oc = otherPlanet.getCenter(), mc = _planet.getCenter(), distance = Math.sqrt(Math.pow((mc.x - oc.x), 2) + Math.pow((mc.y - oc.y), 2));

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

        var playerTank = new PlayerTank(0, 0);

        this.placeTank(playerTank);

        this.game.addChild(playerTank);

        for (var i = 0; i < settings.enemies; i++) {
            var enemyTank = new Tank(0, 0, Colors.Enemy);

            this.placeTank(enemyTank);

            this.game.addChild(enemyTank);
        }

        // draw HUD
        var powerIndicator = new Label("Power: " + playerTank.firepower, 10, 20);
        powerIndicator.color = Colors.Player;
        powerIndicator.scale = 1.5;
        powerIndicator.addEventListener('update', function () {
            powerIndicator.text = "Power: " + playerTank.firepower;
        });
        this.game.addChild(powerIndicator);
    };

    Game.prototype.startMusic = function () {
        Resources.Global.musicAmbient1.sound.play();
    };

    Game.prototype.stopMusic = function () {
        Resources.Global.musicAmbient1.sound.stop();
    };

    Game.prototype.placeTank = function (tank) {
        var _this = this;
        var placed = false;
        var randomPlanet = this.planets[Math.floor(Math.random() * this.planets.length)];

        while (!placed) {
            var pos = randomPlanet.getRandomPointOnBorder();

            var isInViewport = function () {
                return pos.point.x > 0 && pos.point.x < _this.game.canvas.width - tank.getWidth() && pos.point.y > 0 && pos.point.y < _this.game.canvas.height - tank.getHeight();
            };

            if (isInViewport()) {
                placed = true;

                // place player on edge of landmass
                tank.placeOn(randomPlanet, pos.point, pos.angle);
            }
        }
    };
    return Game;
})();
//# sourceMappingURL=game.js.map
