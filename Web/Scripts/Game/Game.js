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

        Patches.patchInCollisionMaps(this.engine, function () {
            return _this.mapConfig ? _this.mapConfig.width : _this.engine.canvas.width;
        }, function () {
            return _this.mapConfig ? _this.mapConfig.height : _this.engine.canvas.height;
        });

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
        var starfield = new Starfield(this.engine.canvas.width, this.engine.canvas.height);
        this.engine.addChild(starfield);
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
    Game.current = new Game();
    return Game;
})();
