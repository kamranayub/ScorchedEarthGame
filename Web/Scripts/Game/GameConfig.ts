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
    defaultFirepower: 25,

    // Firepower adjustment delta
    firepowerDelta: 15,

    // Firepower maximum speed
    firepowerMax: 100,

    // Firepower minimum speed
    firepowerMin: 0,

    // Firepower acceleration
    firepowerAccel: 0.5,

    // Bullet speed modifier
    bulletSpeedModifier: 2,

    // Gravity constant
    gravity: 50,

    // # of planets to generate
    maxPlanets: 1
};

var Colors = {

    Background: Color.fromHex("#141414"),
    Player: Color.fromHex("#a73c3c"),
    Enemy: Color.fromHex("#c0b72a"),
    Land: Color.fromHex("#8c8c8c"),
    Bullet: Color.fromHex("#ffffff")

};