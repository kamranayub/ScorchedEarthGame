/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Tank.ts" />
var game = new Engine(640, 480, 'game');

// Set background color
game.backgroundColor = Colors.Background;

// create map
var landmassHeight = game.canvas.height / 4;
var landmass = new Actor(0, game.canvas.height - landmassHeight, game.canvas.width, landmassHeight, Colors.Land);
game.addChild(landmass);

// create player
var playerTank = new PlayerTank(50, 0);
playerTank.y = landmass.y - playerTank.height;
game.addChild(playerTank);

// enemy tank
var enemyTank = new Tank(300, 0, Colors.Enemy);
enemyTank.y = landmass.y - enemyTank.height;
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
