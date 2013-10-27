module Resources {

    export class Projectiles {

        public static explosionDimensions: number = 130;

        public static explosionAnim: Drawing.Animation;

        public static explosionSprite: Drawing.SpriteSheet;

        public static explodeSound: Media.ISound = new Media.Sound("/Sounds/Explosion-Small.wav");

        constructor(engine: Engine) {
            Projectiles.explosionSprite = new Drawing.SpriteSheet("/Spritesheets/spritesheet-explosion.png", 5, 5,
                Projectiles.explosionDimensions, Projectiles.explosionDimensions);
            Projectiles.explosionAnim = new Drawing.Animation(engine, Projectiles.explosionSprite.sprites, 0.1);
        }
    }  

    export class Tanks {
        public static fireSound: Media.ISound = new Media.Sound("/Sounds/Fire.wav");
        public static moveBarrelSound: Media.ISound = new Media.Sound("/Sounds/MoveBarrel.wav");
    }  
}