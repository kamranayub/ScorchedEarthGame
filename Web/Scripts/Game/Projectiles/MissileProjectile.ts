module Projectiles {

    /**
     * Basic projectile that everyone receives
     */
    export class Missile extends Projectile {

        constructor(x: number, y: number, angle: number, power: number) {
            super(x, y, 2, 2, Colors.Projectile, angle, power, 10);
        }

        public onCollision(engine: Engine): void {
            super.onCollision(engine);

            // play sound
            Resources.Explosions.smallExplosion.sound.play();

            // play explosion animation
            var splosion = new Explosion(this.x, this.y, this.explodeRadius, 5);

            // add explosion to engine
            engine.addChild(splosion);
        }
    }
}