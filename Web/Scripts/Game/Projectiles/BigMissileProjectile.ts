module Projectiles {

    /**
     * Big missile projectile
     */
    export class BigMissile extends Projectile {

        constructor(x: number, y: number, angle: number, power: number) {
            super(x, y, 4, 4, Colors.Projectile, angle, power, 40);
        }

        public onCollision(engine: ex.Engine): void {
            super.onCollision(engine);

            // play sound
            Resources.Explosions.smallExplosion.play();

            // play explosion animation
            var splosion = new Explosion(this.x, this.y, this.explodeRadius, 20, new ex.Vector(this.dx, this.dy));

            // add explosion to engine
            engine.addChild(splosion);
        }
    }
}