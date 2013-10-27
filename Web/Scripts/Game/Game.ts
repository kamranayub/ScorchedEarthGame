/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />
/// <reference path="Resources.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="MonkeyPatch.ts" />

var collisionCanvas = (<any>window).collisionCanvas = document.createElement("canvas");

var game = new Engine(null, null, 'game');

Patches.patchInCollisionMaps(game);

// game.isDebug = true;

// Resources
var bulletResources = new Resources.Projectiles(game);

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
powerIndicator.addEventListener('update', () => {    
    powerIndicator.text = "Power: " + playerTank.firepower;
});
game.addChild(powerIndicator);

// run the mainloop
game.start();