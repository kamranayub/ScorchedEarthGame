module Projectiles {

    /**
     * Big missile projectile
     */
    export class BigMissile extends Projectile {

        private static _explodeSound: Media.ISound = new Media.Sound("/Sounds/Explosion-Small.wav")

        constructor(x: number, y: number, angle: number, power: number) {
            super(x, y, 4, 4, Colors.Projectile, angle, power, 40);
        }

        public onCollision(engine: Engine): void {
            super.onCollision(engine);

            // play sound
            BigMissile._explodeSound.play();

            // play explosion animation
            var splosion = new Explosion(this.x, this.y, this.explodeRadius, 20);

            // add explosion to engine
            engine.addChild(splosion);
        }
    }
}