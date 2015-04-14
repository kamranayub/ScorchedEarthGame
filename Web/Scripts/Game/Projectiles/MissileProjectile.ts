module Projectiles {

    /**
     * Basic projectile that everyone receives
     */
    export class Missile extends Projectile {

        constructor(x: number, y: number, angle: number, power: number) {
            super(x, y, 2, 2, Colors.Projectile, angle, power, 10);
        }

        public onCollision(engine: ex.Engine): void {
            super.onCollision(engine);

            // play sound
            Resources.Explosions.smallExplosion.play();

            // play explosion animation
            var splosion = new Explosion(this.x, this.y, this.explodeRadius, 5, new ex.Vector(this.dx, this.dy));

            // add explosion to engine
            engine.addChild(splosion);
        }
    }
}