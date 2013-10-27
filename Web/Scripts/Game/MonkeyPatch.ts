/// <reference path="Excalibur.d.ts" />

module Patches {
    export function patchInCollisionMaps(game: Engine) {
        var collisionCanvas = <HTMLCanvasElement>(<any>window).collisionCanvas;

        collisionCanvas.id = "collisionCanvas";
        collisionCanvas.width = game.canvas.width;
        collisionCanvas.height = game.canvas.height;
        var collisionCtx = collisionCanvas.getContext('2d');
        (<any>window).collisionCtx = collisionCtx;

        if (game.isDebug) {
            document.body.appendChild(collisionCanvas);
        }

        var oldDraw = Engine.prototype["draw"];
        Engine.prototype["draw"] = function (delta) {

            var collisionCtx = (<CanvasRenderingContext2D>(<any>window).collisionCtx);
            collisionCtx.fillStyle = 'white';
            collisionCtx.fillRect(0, 0, collisionCanvas.width, collisionCanvas.height);

            oldDraw.apply(this, [delta]);
        };

        SceneNode.prototype.draw = function (ctx: CanvasRenderingContext2D, delta: number) {
            var collisionCtx = (<CanvasRenderingContext2D>(<any>window).collisionCtx);

            this.children.forEach(function (actor: Actor) {
                actor.draw(ctx, delta);

                if (actor instanceof CollisionActor) {

                    var oldColor = actor.color;
                    actor.color = new Color(0, 0, 0, 255);
                    actor.draw(collisionCtx, delta);
                    actor.color = oldColor;
                }
            });
        };
    }
}