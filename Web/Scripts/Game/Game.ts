/// <reference path="Excalibur.d.ts" />
/// <reference path="GameConfig.ts" />
/// <reference path="Starfield.ts" />
/// <reference path="Landmass.ts" />
/// <reference path="Tank.ts" />
/// <reference path="Resources.ts" />
/// <reference path="CollisionActor.ts" />
/// <reference path="MonkeyPatch.ts" />

var game = new Engine(null, null, 'game');

Patches.patchInCollisionMaps(game);

//game.isDebug = true;

// Set background color
game.backgroundColor = Colors.Background;

// create starfield
var starfield = new Starfield(game.canvas.width, game.canvas.height);
game.addChild(starfield);

// create map
var planets: Landmass[] = [];
for (var i = 0; i < Config.maxPlanets; i++) {
    planets.push(new Landmass());
    game.addChild(planets[i]);
}

// position planets
var _planet,
    planetGenMaxX = game.canvas.width - Config.planetGenerationPadding,
    planetGenMinX = Config.planetGenerationPadding,
    planetGenMaxY = game.canvas.height - Config.planetGenerationPadding,
    planetGenMinY = Config.planetGenerationPadding;

for (var i = 0; i < planets.length; i++) {

    _planet = planets[i];

    var placed = false;

    while (!placed) {        
        _planet.x = Math.floor(Math.random() * (planetGenMaxX - planetGenMinX) + planetGenMinX);
        _planet.y = Math.floor(Math.random() * (planetGenMaxY - planetGenMinY) + planetGenMinY);

        var intersecting = false;
        // make sure we're not intersecting some other planet 
        for (var j = 0; j < planets.length; j++) {

            // skip this planet
            if (i === j) continue;

            // use some maths to figure out if this planet touches the other
            var otherPlanet = planets[j],
                oc = otherPlanet.getCenter(),
                mc = _planet.getCenter(),
                distance = Math.sqrt(Math.pow((mc.x - oc.x), 2) + Math.pow((mc.y - oc.y), 2));

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

var placeTank = function (tank: Tank) {
    // create player

    var placed = false;
    var randomPlanet: Landmass = planets[Math.floor(Math.random() * planets.length)];

    while (!placed) {

        var pos = randomPlanet.getRandomPointOnBorder();

        var isInViewport = () => {
            return pos.point.x > 0 &&
                pos.point.x < game.canvas.width - tank.getWidth() &&
                pos.point.y > 0 &&
                pos.point.y < game.canvas.height - tank.getHeight();
        };

        // make sure it's in view port
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
powerIndicator.addEventListener('update', () => {
    powerIndicator.text = "Power: " + playerTank.firepower;
});
game.addChild(powerIndicator);

// run the mainloop
game.start();