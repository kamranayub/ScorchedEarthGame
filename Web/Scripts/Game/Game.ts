/// <reference path="Engine.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />

var game = new Engine(640, 480, 'game');

// Set background color
game.backgroundColor = Colors.Background;

// create map
var landmass = new Landmass(game.canvas.width, game.canvas.height);
game.addChild(landmass);

// create player
//var playerTank = new PlayerTank(50, 0);
//playerTank.y = landmass.y - playerTank.getHeight();
//game.addChild(playerTank);

// enemy tank
//var enemyTank = new Tank(300, 0, Colors.Enemy);
//enemyTank.y = landmass.y - enemyTank.getHeight();
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