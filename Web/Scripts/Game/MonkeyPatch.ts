/// <reference path="../Excalibur.d.ts" />

module Patches {

    /**
     * Patch in collision maps
     *
     * This takes into account adjustable map sizes that might expand beyond the canvas.
     * Since `ctx.getImageData` returns black for any pixels out of the canvas, we need
     * to ensure the canvas size matches the map size. Alternatively, we could probably
     * transform it before we check for collisions, but this is easier!
     */
    export function patchInCollisionMaps(engine: ex.Engine, widthAccessor: () => number, heightAccessor: () => number) {
        var collisionCanvas = document.createElement("canvas");

        collisionCanvas.id = "collisionCanvas";
        collisionCanvas.width = widthAccessor();
        collisionCanvas.height = heightAccessor();
        var collisionCtx = collisionCanvas.getContext('2d');

        // DEBUG
        // document.body.appendChild(collisionCanvas);

        var oldUpdate = ex.Engine.prototype["update"];
        ex.Engine.prototype["update"] = function (delta) {

            var width = widthAccessor();
            var height = heightAccessor();

            if (collisionCanvas.width !== width ||
                collisionCanvas.height !== height) {
                collisionCanvas.width = widthAccessor();
                collisionCanvas.height = heightAccessor();

                collisionCtx = collisionCanvas.getContext('2d');
            }

            oldUpdate.apply(this, [delta]);
        };

        var oldDraw = ex.Engine.prototype["draw"];
        ex.Engine.prototype["draw"] = function (delta) {

            var width = widthAccessor();
            var height = heightAccessor();

            collisionCtx.fillStyle = 'white';
            collisionCtx.fillRect(0, 0, width, height);

            oldDraw.apply(this, [delta]);
        };

        ex.Scene.prototype.draw = function (ctx: CanvasRenderingContext2D, delta: number) {
            ctx.save();

            if (this.camera) {
                this.camera.update(ctx, delta);
            }

            var i: number, len: number;
            for (i = 0, len = this.children.length; i < len; i++) {

                // only draw actors that are visible
                if (this.children[i].visible) {
                    this.children[i].draw(ctx, delta);
                }

                if (this.children[i] instanceof CollisionActor) {
                    (<CollisionActor>this.children[i]).drawCollisionMap(collisionCtx, delta);
                }
            }

            ctx.restore();
        };

        (<any>engine).collisionCtx = collisionCtx;
    }
}