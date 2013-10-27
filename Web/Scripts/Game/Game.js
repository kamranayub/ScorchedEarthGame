﻿/// <reference path="Excalibur.d.ts" />
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
var bulletResources = new Resources.Projectiles(game);

// Set background color
game.backgroundColor = Colors.Background;

// create map
var planets = [];
for (var i = 0; i < Config.maxPlanets; i++) {
    planets.push(new Landmass());
    game.addChild(planets[i]);
}

// position planets
var _planet;
for (var i = 0; i < planets.length; i++) {
    _planet = planets[i];
    _planet.x = Math.floor(Math.random() * game.canvas.width);
    _planet.y = Math.floor(Math.random() * game.canvas.height);
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
