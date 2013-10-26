/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />

var game = new Engine(null, null, 'game');

// Set background color
game.backgroundColor = Colors.Background;

// create map
var landmass = new Landmass();
landmass.x = landmass.radius * 2;
landmass.y = landmass.radius * 2;

game.addChild(landmass);

// create player
var playerTank = new PlayerTank(0, 0);
var playerPos = landmass.getRandomPointOnBorder();

console.log("Placing player", playerPos);

// place player on edge of landmass
playerTank.placeOn(landmass, playerPos.point, playerPos.angle);

game.addChild(playerTank);

// enemy tank
//var enemyTank = new Tank(300, 0, Colors.Enemy);
//var enemyPos = landmass.getRandomPointOnBorder();

//console.log("Placing enemy", enemyPos);

//enemyTank.x = enemyPos.x;
//enemyTank.y = enemyPos.y - enemyTank.getHeight();
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