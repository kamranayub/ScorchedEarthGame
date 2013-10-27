/// <reference path="Excalibur.d.ts" />

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
    bulletSpeedModifier: 0.4,

    // Gravity constant
    gravity: 50,

    // # of planets to generate
    maxPlanets: 4,

    // amount of distance from canvas edges to spawn planets
    planetGenerationPadding: 120
};

var Colors = {
    White: Color.fromHex("#ffffff"),
    Background: Color.fromHex("#141414"),
    Player: Color.fromHex("#a73c3c"),
    Enemy: Color.fromHex("#c0b72a"),
    Land: Color.fromHex("#8c8c8c"),
    Projectile: Color.fromHex("#ffffff")

};