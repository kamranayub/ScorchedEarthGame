/// <reference path="Excalibur.d.ts" />

module Patches {
    export function patchInCollisionMaps(game: Engine) {
        var collisionCanvas = document.createElement("canvas");

        collisionCanvas.id = "collisionCanvas";
        collisionCanvas.width = game.canvas.width;
        collisionCanvas.height = game.canvas.height;
        var collisionCtx = collisionCanvas.getContext('2d');

        var oldDraw = Engine.prototype["draw"];
        Engine.prototype["draw"] = function (delta) {

            collisionCtx.fillStyle = 'white';
            collisionCtx.fillRect(0, 0, collisionCanvas.width, collisionCanvas.height);

            oldDraw.apply(this, [delta]);
        };

        SceneNode.prototype.draw = function (ctx: CanvasRenderingContext2D, delta: number) {
            this.children.forEach(function (actor: Actor) {
                actor.draw(ctx, delta);

                if (actor instanceof CollisionActor) {
                    (<CollisionActor>actor).drawCollisionMap(collisionCtx, delta);
                }
            });
        };

        (<any>game).collisionCtx = collisionCtx;
    }
}