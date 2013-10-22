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
    firepowerDelta: 5,
    // Firepower maximum speed
    firepowerMax: 100,
    // Firepower minimum speed
    firepowerMin: 0,
    // Firepower acceleration
    firepowerAccel: 1
};

var Colors = {
    Background: new Color(48, 198, 230),
    Player: new Color(255, 0, 0),
    Enemy: new Color(0, 0, 255),
    Land: new Color(234, 233, 163)
};
