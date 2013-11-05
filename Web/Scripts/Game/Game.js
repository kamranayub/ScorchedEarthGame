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
