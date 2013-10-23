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
    gravity: 50
};

var Colors = {

    Background: Color.fromHex("#30c6e6"),
    Player: new Color(255, 0, 0), // red
    Enemy: new Color(0, 0, 255), // blue
    Land: Color.fromHex("#eae9a3"),
    Bullet: new Color(255, 0, 0)

};