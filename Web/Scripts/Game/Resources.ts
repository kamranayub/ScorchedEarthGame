module Resources {

    export class Projectiles {

        public static explosionDimensions: number = 130;

        public static explosionAnim: Drawing.Animation;

        public static explosionSprite: Drawing.SpriteSheet;

        public static explodeSound: Media.ISound = new Media.Sound("/Sounds/splode.mp3");

        constructor(engine: Engine) {
            Projectiles.explosionSprite = new Drawing.SpriteSheet("/Spritesheets/spritesheet-explosion.png", 5, 5,
                Projectiles.explosionDimensions, Projectiles.explosionDimensions);
            Projectiles.explosionAnim = new Drawing.Animation(engine, Projectiles.explosionSprite.sprites, 0.1);
        }
    }    
}