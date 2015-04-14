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
        this.collisionCanvas = document.createElement("canvas");
        this.collisionCtx = this.collisionCanvas.getContext('2d');
        this.collisionCanvas.width = Game.current.mapConfig.width;
        this.collisionCanvas.height = Game.current.mapConfig.height;
    }
    CollisionActor.prototype.drawCollisionMap = function (ctx, delta) {
        var oldColor = this.color;
        this.color = new Color(0, 0, 0, 1);
        this.draw(ctx, delta);
        this.color = oldColor;
        this.draw(this.collisionCtx, delta);
        this.collisionData = this.collisionCtx.getImageData(0, 0, this.collisionCanvas.width, this.collisionCanvas.height).data;
    };
    CollisionActor.prototype.isHit = function (engine, x, y) {
        if (!this.collisionData)
            return false;
        //collisionCtx.fillStyle = 'white';
        //collisionCtx.fillRect(0, 0, Game.current.mapConfig.width, Game.current.mapConfig.height);
        //this.drawCollisionMap(this.collisionCtx, 0);
        var collisionPixelIndex = this.translateTo1DArrayCoords(Math.floor(x), Math.floor(y), this.collisionCanvas.width);
        return !GraphicUtils.isPixelColorOf([
            this.collisionData[collisionPixelIndex],
            this.collisionData[collisionPixelIndex + 1],
            this.collisionData[collisionPixelIndex + 2],
            this.collisionData[collisionPixelIndex + 3]
        ], Colors.White);
        //return false;
    };
    CollisionActor.prototype.translateTo1DArrayCoords = function (x, y, width) {
        return (y * width + x) * 4;
    };
    CollisionActor.prototype.collide = function (engine, actor) {
    };
    return CollisionActor;
})(Actor);
var DOM = (function () {
    function DOM() {
    }
    /**
     * Gets a DOM element by ID
     * @param id The ID to search by
     */
    DOM.id = function (id) {
        return document.getElementById(id);
    };
    /**
     * Gets a DOM element by ID
     * @param id The ID to search by
     */
    DOM.idOf = function (id) {
        return document.getElementById(id);
    };
    /**
     * Gets a single DOM element by a selector
     * @param selector The selector
     * @param ctx A context to search from (default: null)
     */
    DOM.query = function (selector, ctx) {
        if (ctx === void 0) { ctx = null; }
        ctx = ctx || document.body;
        return ctx.querySelector(selector);
    };
    /**
     * Hides a DOM element
     */
    DOM.hide = function (element) {
        element.style.display = 'none';
    };
    /**
     * Shows a DOM element
     */
    DOM.show = function (element) {
        element.style.display = 'block';
    };
    /**
     * Toggles a CSS class on an element
     * @param element The DOM element to manipulate
     * @param cls The CSS class to toggle
     * @returns True if the class existed and false if not
     */
    DOM.toggleClass = function (element, cls) {
        if (this.hasClass(element, cls)) {
            this.removeClass(element, cls);
            return true;
        }
        else {
            this.addClass(element, cls);
            return false;
        }
    };
    /**
     * Replaces a CSS class on an element
     * @param element The DOM element to manipulate
     * @param search The CSS class to find
     * @param replace The CSS class to replace with
     */
    DOM.replaceClass = function (element, search, replace) {
        if (this.hasClass(element, search)) {
            this.removeClass(element, search);
            this.addClass(element, replace);
        }
    };
    /**
     * Whether or not an element has a CSS class present
     * @param element The DOM element to check
     * @param cls The CSS class to check for
     * @returns True if the class exists and false if not
     */
    DOM.hasClass = function (element, cls) {
        return element.classList.contains(cls);
    };
    /**
     * Adds a CSS class to a DOM element
     * @param element The DOM element to manipulate
     * @param cls The CSS class to add
     */
    DOM.addClass = function (element, cls) {
        element.classList.add(cls);
    };
    /**
     * Removes a CSS class to a DOM element
     * @param element The DOM element to manipulate
     * @param cls The CSS class to remove
     */
    DOM.removeClass = function (element, cls) {
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
        // elapsed finished?
        if (this._currentRadius >= this.radius) {
            // loop through landmasses and destruct
            engine.currentScene.children.forEach(function (actor) {
                if (actor instanceof CollisionActor) {
                    var collActor = actor;
                    if (collActor.isHit(engine, _this.x, _this.y)) {
                        collActor.collide(engine, _this);
                    }
                }
            });
            engine.removeChild(this);
            return;
        }
        else {
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
var MapConfigurationFactory = (function () {
    function MapConfigurationFactory() {
    }
    MapConfigurationFactory.getMapConfiguration = function (mapSize) {
        switch (mapSize) {
            case 0 /* Small */:
                return new SmallMapConfiguration();
            case 1 /* Medium */:
                return new MediumMapConfiguration();
            case 2 /* Large */:
                return new LargeMapConfiguration();
            case 3 /* Huge */:
                return new HugeMapConfiguration();
            default:
                throw new Error("Could not find configuration for that map size");
        }
    };
    return MapConfigurationFactory;
})();
var SmallMapConfiguration = (function () {
    function SmallMapConfiguration() {
        this.maxPlanets = 8;
        this.planetMinRadius = 35;
        this.planetMaxRadius = 150;
        this.width = 2048;
        this.height = 2048;
    }
    return SmallMapConfiguration;
})();
var MediumMapConfiguration = (function () {
    function MediumMapConfiguration() {
        this.maxPlanets = 15;
        this.planetMinRadius = 50;
        this.planetMaxRadius = 200;
        this.width = 3072;
        this.height = 3072;
    }
    return MediumMapConfiguration;
})();
var LargeMapConfiguration = (function () {
    function LargeMapConfiguration() {
        this.maxPlanets = 20;
        this.planetMinRadius = 50;
        this.planetMaxRadius = 200;
        this.width = 4608;
        this.height = 4608;
    }
    return LargeMapConfiguration;
})();
var HugeMapConfiguration = (function () {
    function HugeMapConfiguration() {
        this.maxPlanets = 30;
        this.planetMinRadius = 50;
        this.planetMaxRadius = 200;
        this.width = 13824;
        this.height = 13824;
    }
    return HugeMapConfiguration;
})();
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
/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="CollisionActor.ts" />
var Landmass = (function (_super) {
    __extends(Landmass, _super);
    function Landmass(mapConfig) {
        _super.call(this, 0, 0, null, null, Colors.Land);
        this.mapConfig = mapConfig;
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
            this.destruct(new Point(actor.x, actor.y), actor.radius);
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
        var a = -G * ((1 * this.radius) / dSquared); // f = ma, f = 1 * a, f = a
        if (a > 10)
            a = 10; // max accel clamp
        var xa = a * ((xdiff) / d); // cos theta = adjacent / hypotenuse
        var ya = a * ((ydiff) / d); // sin theta = opposite / hypotenuse
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
        this.radius = Math.random() * (this.mapConfig.planetMaxRadius - this.mapConfig.planetMinRadius) + this.mapConfig.planetMinRadius;
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
        }
        else {
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
    /**
     * Determines whether or not the given color is present
     * in the given pixel array.
     */
    GraphicUtils.isPixelColorOf = function (pixels, color) {
        for (var i = 0; i < pixels.length; i += 4) {
            if (pixels[i] === color.r && pixels[i + 1] === color.g && pixels[i + 2] === color.b && pixels[i + 3] === Math.floor(color.a * 255)) {
                return true;
            }
        }
        return false;
    };
    return GraphicUtils;
})();
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
        // super.update(engine, delta);
        var _this = this;
        // act on this projectile from all planets
        engine.currentScene.children.forEach(function (actor) {
            if (actor instanceof Landmass) {
                actor.actOn(_this, delta);
            }
        });
        // out of bounds
        if (this.y > Game.current.mapConfig.height || this.y < 0 || this.x > Game.current.mapConfig.width || this.x < 0) {
            engine.removeChild(this);
            return;
        }
        var collisionCtx = engine.collisionCtx;
        // check collision with tanks
        // get projection ahead of where we are currently
        var collisionPixel = new Point(Math.floor(this.x), Math.floor(this.y));
        var collisionPixelData = collisionCtx.getImageData(collisionPixel.x, collisionPixel.y, 1, 1).data;
        // detect collision using pixel data on off-screen
        // collision map
        if (!GraphicUtils.isPixelColorOf(collisionPixelData, Colors.White)) {
            // debug
            console.log("Projectile collided with pixel (x, y, data)", collisionPixel.x, collisionPixel.y, collisionPixelData);
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
        // clamp to -180 degrees
        if (this.barrelAngle <= Math.PI - (Math.PI / 7))
            return;
        this.barrelAngle -= angle * delta / 1000;
        // play sound
        Resources.Tanks.moveBarrelSound.sound.play();
    };
    Tank.prototype.moveBarrelRight = function (angle, delta) {
        // clamp to 180 degrees
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
            this.damage(engine, actor.damage);
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
        }
        else {
            this.currentFirepowerAccelDelta = 0;
        }
        if (engine.isKeyPressed(37 /* LEFT */)) {
            this.moveBarrelLeft(Config.barrelRotateVelocity, delta);
        }
        else if (engine.isKeyPressed(39 /* RIGHT */)) {
            this.moveBarrelRight(Config.barrelRotateVelocity, delta);
        }
        else if (engine.isKeyPressed(38 /* UP */)) {
            this.incrementFirepower(delta);
        }
        else if (engine.isKeyPressed(40 /* DOWN */)) {
            this.decrementFirepower(delta);
        }
        else if (engine.isKeyUp(32 /* SPACE */)) {
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
        if (event.key === 38 /* UP */ || event.key === 40 /* DOWN */) {
            this.shouldFirepowerAccel = true;
        }
    };
    PlayerTank.prototype.handleKeyUp = function (event) {
        if (event === null)
            return;
        if (event.key === 38 /* UP */ || event.key === 40 /* DOWN */) {
            this.shouldFirepowerAccel = false;
        }
    };
    return PlayerTank;
})(Tank);
/// <reference path="Excalibur.d.ts" />
var Patches;
(function (Patches) {
    /**
     * Patch in collision maps
     *
     * This takes into account adjustable map sizes that might expand beyond the canvas.
     * Since `ctx.getImageData` returns black for any pixels out of the canvas, we need
     * to ensure the canvas size matches the map size. Alternatively, we could probably
     * transform it before we check for collisions, but this is easier!
     */
    function patchInCollisionMaps(engine, widthAccessor, heightAccessor) {
        var collisionCanvas = document.createElement("canvas");
        collisionCanvas.id = "collisionCanvas";
        collisionCanvas.width = widthAccessor();
        collisionCanvas.height = heightAccessor();
        var collisionCtx = collisionCanvas.getContext('2d');
        // DEBUG
        // document.body.appendChild(collisionCanvas);
        var oldUpdate = Engine.prototype["update"];
        Engine.prototype["update"] = function (delta) {
            var width = widthAccessor();
            var height = heightAccessor();
            if (collisionCanvas.width !== width || collisionCanvas.height !== height) {
                collisionCanvas.width = widthAccessor();
                collisionCanvas.height = heightAccessor();
                collisionCtx = collisionCanvas.getContext('2d');
            }
            oldUpdate.apply(this, [delta]);
        };
        var oldDraw = Engine.prototype["draw"];
        Engine.prototype["draw"] = function (delta) {
            var width = widthAccessor();
            var height = heightAccessor();
            collisionCtx.fillStyle = 'white';
            collisionCtx.fillRect(0, 0, width, height);
            oldDraw.apply(this, [delta]);
        };
        SceneNode.prototype.draw = function (ctx, delta) {
            this.children.forEach(function (actor) {
                actor.draw(ctx, delta);
                if (actor instanceof CollisionActor) {
                    actor.drawCollisionMap(collisionCtx, delta);
                }
            });
        };
        engine.collisionCtx = collisionCtx;
    }
    Patches.patchInCollisionMaps = patchInCollisionMaps;
})(Patches || (Patches = {}));
/// <reference path="DOM.ts" />
var UI = (function () {
    function UI(game) {
        this.game = game;
        this.uiGame = DOM.id('game');
        this.uiNewGame = DOM.id('ui-new-game');
        this.btnToolbarNewGame = DOM.id('toolbar-new-game');
        this.btnToolbarToggleMusic = DOM.id('toolbar-toggle-music');
        this.btnStartGame = DOM.id('btn-start-game');
        // hud
        this.hudTop = DOM.id('game-hud-top');
        this.hudPower = DOM.query('#game-hud-power span');
        // init
        this.init();
    }
    UI.prototype.init = function () {
        // add event listeners
        this.btnToolbarNewGame.addEventListener('click', this.showNewGame.bind(this));
        this.btnToolbarToggleMusic.addEventListener('click', this.onToggleMusicClicked.bind(this));
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
            case 0 /* Small */:
                settings.enemies = Math.min(2, enemies);
                break;
            case 1 /* Medium */:
                settings.enemies = Math.min(5, enemies);
                break;
            case 2 /* Large */:
                settings.enemies = Math.min(9, enemies);
                break;
            case 3 /* Huge */:
                settings.enemies = Math.min(19, enemies);
                break;
            default:
                alert('Map size is invalid');
                return;
                break;
        }
        this.btnStartGame.blur();
        this.hideDialog(this.uiNewGame);
        this.game.newGame(settings);
    };
    UI.prototype.onToggleMusicClicked = function () {
        var icon = DOM.query('i', this.btnToolbarToggleMusic);
        if (DOM.hasClass(icon, 'fa-volume-up')) {
            DOM.replaceClass(icon, 'fa-volume-up', 'fa-volume-off');
            this.game.stopMusic();
        }
        else {
            DOM.replaceClass(icon, 'fa-volume-off', 'fa-volume-up');
            this.game.startMusic();
        }
    };
    UI.prototype.showHUD = function () {
        DOM.show(this.hudTop);
    };
    UI.prototype.updateFirepower = function (power) {
        this.hudPower.innerText = power.toString();
    };
    UI.prototype.showDialog = function (dialog) {
        DOM.show(dialog);
        setTimeout(function () { return DOM.addClass(dialog, 'show'); }, 10);
    };
    UI.prototype.hideDialog = function (dialog) {
        DOM.onTransitionEnd(dialog, function () { return DOM.hide(dialog); });
        DOM.removeClass(dialog, 'show');
    };
    return UI;
})();
/// <reference path="Game.ts" />
/**
 * Invisible actor that lets user move camera around
 * and allows us to "animate" the camera
 */
var FocalPoint = (function (_super) {
    __extends(FocalPoint, _super);
    function FocalPoint() {
        _super.call(this);
        this.invisible = true;
    }
    FocalPoint.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
        var mapWidth = Game.current.mapConfig.width, mapHeight = Game.current.mapConfig.height, moveSpeed = 5;
        // Make sure new x, y isn't out of bounds
        // Camera is centered on (x, y)
        var viewCenter = new Point(engine.canvas.width / 2, engine.canvas.height / 2), isOnRightEdge = (this.x + viewCenter.x + moveSpeed >= mapWidth), isOnLeftEdge = (this.x - viewCenter.x - moveSpeed <= 0), isOnTopEdge = (this.y - viewCenter.y - moveSpeed <= 0), isOnBottomEdge = (this.y + viewCenter.y + moveSpeed >= mapHeight);
        if (isOnRightEdge) {
            this.x = mapWidth - viewCenter.x - 1;
        }
        if (isOnLeftEdge) {
            this.x = viewCenter.x + 1;
        }
        if (isOnBottomEdge) {
            this.y = mapHeight - viewCenter.y - 1;
        }
        if (isOnTopEdge) {
            this.y = viewCenter.y + 1;
        }
        if (engine.isKeyPressed(87 /* W */) && !isOnTopEdge) {
            this.y -= moveSpeed;
        }
        if (engine.isKeyPressed(83 /* S */) && !isOnBottomEdge) {
            this.y += moveSpeed;
        }
        if (engine.isKeyPressed(65 /* A */) && !isOnLeftEdge) {
            this.x -= moveSpeed;
        }
        if (engine.isKeyPressed(68 /* D */) && !isOnRightEdge) {
            this.x += moveSpeed;
        }
    };
    FocalPoint.prototype.draw = function (ctx, delta) {
        _super.prototype.draw.call(this, ctx, delta);
        ctx.strokeStyle = 'red';
        ctx.strokeRect(0, 0, Game.current.mapConfig.width, Game.current.mapConfig.height);
    };
    return FocalPoint;
})(Actor);
/// <reference path="Excalibur.d.ts" />
/// <reference path="Resources.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="GameSettings.ts" />
/// <reference path="MapConfiguration.ts" />
/// <reference path="Starfield.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />
/// <reference path="Projectile.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="FocalPoint.ts" />
/// <reference path="MonkeyPatch.ts" />
/// <reference path="UI.ts" />
var Game = (function () {
    function Game() {
        var _this = this;
        this.engine = new Engine(null, null, 'game');
        Patches.patchInCollisionMaps(this.engine, function () { return _this.mapConfig ? _this.mapConfig.width : _this.engine.canvas.width; }, function () { return _this.mapConfig ? _this.mapConfig.height : _this.engine.canvas.height; });
        // debug mode
        // this.game.isDebug = true;
        var loader = this.getLoader();
        // load resources
        this.engine.load(loader);
        // HACK: workaround until engine/loader exposes event
        // oncomplete
        var oldOnComplete = loader.oncomplete;
        loader.oncomplete = function () {
            oldOnComplete.apply(loader, arguments);
            _this.init();
        };
        // start game
        this.engine.start();
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
        this.engine.backgroundColor = Colors.Background;
        // create starfield
        //var starfield = new Starfield(this.engine.canvas.width, this.engine.canvas.height);
        //this.engine.addChild(starfield);        
    };
    /**
     * Starts a new game with the given settings
     */
    Game.prototype.newGame = function (settings) {
        var _this = this;
        // reset
        var children = this.engine.currentScene.children.length, child;
        for (var i = 0; i < children; i++) {
            child = this.engine.currentScene.children[i];
            if (!(child instanceof Starfield)) {
                this.engine.currentScene.removeChild(child);
            }
        }
        // create camera
        this.focalCamera = new Camera.TopCamera(this.engine);
        this.engine.camera = this.focalCamera;
        // Generate the map
        this.generateMap(settings);
        // Place players
        this.playerTank = new PlayerTank(0, 0);
        this.placeTank(this.playerTank);
        this.engine.addChild(this.playerTank);
        for (var i = 0; i < settings.enemies; i++) {
            var enemyTank = new Tank(0, 0, Colors.Enemy);
            this.placeTank(enemyTank);
            this.engine.addChild(enemyTank);
        }
        // draw HUD
        this.ui.showHUD();
        // update power
        this.playerTank.addEventListener('update', function () {
            _this.ui.updateFirepower(_this.playerTank.firepower);
        });
        // create focal point
        this.focalPoint = new FocalPoint();
        this.engine.addChild(this.focalPoint);
        this.focalCamera.setActorToFollow(this.focalPoint);
        // focus on player on start
        this.focusOn(this.playerTank);
    };
    Game.prototype.startMusic = function () {
        Resources.Global.musicAmbient1.sound.play();
    };
    Game.prototype.stopMusic = function () {
        Resources.Global.musicAmbient1.sound.stop();
    };
    Game.prototype.generateMap = function (settings) {
        // get map config
        this.mapConfig = MapConfigurationFactory.getMapConfiguration(settings.mapSize);
        // create map
        this.planets = [];
        for (var i = 0; i < this.mapConfig.maxPlanets; i++) {
            this.planets.push(new Landmass(this.mapConfig));
            this.engine.addChild(this.planets[i]);
        }
        // position planets
        var _planet, planetGenMaxX = this.mapConfig.width - Config.planetGenerationPadding, planetGenMinX = Config.planetGenerationPadding, planetGenMaxY = this.mapConfig.height - Config.planetGenerationPadding, planetGenMinY = Config.planetGenerationPadding;
        for (var i = 0; i < this.planets.length; i++) {
            _planet = this.planets[i];
            var placed = false;
            var maxIterations = 2000;
            var currentIteration = 0;
            while (!placed && currentIteration < maxIterations) {
                _planet.x = Math.floor(Math.random() * (planetGenMaxX - planetGenMinX) + planetGenMinX);
                _planet.y = Math.floor(Math.random() * (planetGenMaxY - planetGenMinY) + planetGenMinY);
                var intersecting = false;
                for (var j = 0; j < this.planets.length; j++) {
                    // skip this planet
                    if (i === j)
                        continue;
                    // use some maths to figure out if this planet touches the other
                    var otherPlanet = this.planets[j], oc = otherPlanet.getCenter(), mc = _planet.getCenter(), distance = Math.sqrt(Math.pow((mc.x - oc.x), 2) + Math.pow((mc.y - oc.y), 2));
                    if (_planet.radius + otherPlanet.radius > distance) {
                        intersecting = true;
                        break;
                    }
                }
                currentIteration++;
                if (!intersecting) {
                    placed = true;
                }
            }
        }
    };
    Game.prototype.placeTank = function (tank) {
        var _this = this;
        var placed = false;
        var randomPlanet = this.planets[Math.floor(Math.random() * this.planets.length)];
        while (!placed) {
            var pos = randomPlanet.getRandomPointOnBorder();
            var isInViewport = function () {
                return pos.point.x > 0 && pos.point.x < _this.mapConfig.width - tank.getWidth() && pos.point.y > 0 && pos.point.y < _this.mapConfig.height - tank.getHeight();
            };
            // make sure it's in view port
            if (isInViewport()) {
                placed = true;
                // place player on edge of landmass
                tank.placeOn(randomPlanet, pos.point, pos.angle);
            }
        }
    };
    Game.prototype.focusOn = function (actor) {
        console.log("Focusing on actor", actor, actor.x, actor.y);
        this.focalPoint.x = actor.x;
        this.focalPoint.y = actor.y;
    };
    /**
     * Singleton instance of the game
     */
    Game.current = new Game();
    return Game;
})();
//# sourceMappingURL=game.js.map