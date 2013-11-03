module Projectiles {

    /**
     * Basic projectile that everyone receives
     */
    export class Missile extends Projectile {

        private static _explodeSound: Media.ISound = new Media.Sound("/Sounds/Explosion-Small.wav")

        constructor(x: number, y: number, angle: number, power: number) {
            super(x, y, 2, 2, Colors.Projectile, angle, power, 10);
        }

        public onCollision(engine: Engine): void {
            super.onCollision(engine);

            // play sound
            Missile._explodeSound.play();

            // play explosion animation
            var splosion = new Explosion(this.x, this.y, this.explodeRadius, 5);

            // add explosion to engine
            engine.addChild(splosion);
        }
    }
}