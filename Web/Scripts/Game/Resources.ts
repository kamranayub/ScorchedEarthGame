module Resources {
    export class Bullets {

        public static explosionDimensions: number = 130;

        public static explosionAnim: Drawing.Animation;

        public static explosionSprite: Drawing.SpriteSheet;

        public static explodeSound: Media.ISound = new Media.Sound("/Sounds/splode.mp3");

        constructor(engine: Engine) {
            Bullets.explosionSprite = new Drawing.SpriteSheet("/Spritesheets/spritesheet-explosion.png", 5, 5,
                Bullets.explosionDimensions, Bullets.explosionDimensions);
            Bullets.explosionAnim = new Drawing.Animation(engine, Bullets.explosionSprite.sprites, 0.1);
        }
    }    
}