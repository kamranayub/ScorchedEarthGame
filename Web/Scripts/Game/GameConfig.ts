/// <reference path="../Excalibur.d.ts" />

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
    defaultFirepower: 300,

    // Firepower adjustment delta
    firepowerDelta: 70,

    // Firepower maximum speed
    firepowerMax: 1000,

    // Firepower minimum speed
    firepowerMin: 0,

    // Firepower acceleration
    firepowerAccel: 0.5,

    // Projectile speed modifier
    bulletSpeedModifier: 0.003,

    // Gravity constant
    gravity: 6,

    // amount of distance from canvas edges to spawn planets
    planetGenerationPadding: 120
};

var Colors = {
    Black: ex.Color.fromHex("#000000"),
    White: ex.Color.fromHex("#ffffff"),

    Background: ex.Color.fromHex("#141414"),
    Player: ex.Color.fromHex("#a73c3c"),
    Enemy: ex.Color.fromHex("#c0b72a"),
    Land: ex.Color.fromHex("#8c8c8c"),
    Projectile: ex.Color.fromHex("#ffffff"),
    ExplosionBegin: ex.Color.fromHex("#ddd32f"),
    ExplosionEnd: ex.Color.fromHex("#c12713")
};