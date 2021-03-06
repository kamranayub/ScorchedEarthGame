/// <reference path="Game.ts" />

/**
 * Invisible actor that lets user move camera around
 * and allows us to "animate" the camera
 */
class FocalPoint extends ex.Actor {

    constructor() {
        super();

        this.visible = false;
        this.anchor.setTo(0, 0);
    }

    public update(engine: ex.Engine, delta: number): void {
        super.update(engine, delta);

        var mapWidth = Game.current.mapConfig.width,
            mapHeight = Game.current.mapConfig.height,
            moveSpeed = 5;

        // Make sure new x, y isn't out of bounds
        // Camera is centered on (x, y)
        var viewCenter = new ex.Point(engine.canvas.width / 2, engine.canvas.height / 2),
            isOnRightEdge = (this.x + viewCenter.x + moveSpeed >= mapWidth),
            isOnLeftEdge = (this.x - viewCenter.x - moveSpeed <= 0),
            isOnTopEdge = (this.y - viewCenter.y - moveSpeed <= 0),
            isOnBottomEdge = (this.y + viewCenter.y + moveSpeed >= mapHeight);

        if (isOnRightEdge) {
            this.x = mapWidth - viewCenter.x - 1;
        }
        if (isOnLeftEdge) {
            this.x = viewCenter.x + 1;
        }
        if (isOnBottomEdge) {
            this.y = mapHeight - viewCenter.y - 1;
        }
        if (isOnTopEdge) {
            this.y = viewCenter.y + 1;
        }

        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.W) && !isOnTopEdge) {
            this.y -= moveSpeed;
        }
        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.S) && !isOnBottomEdge) {
            this.y += moveSpeed;
        }
        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.A) && !isOnLeftEdge) {
            this.x -= moveSpeed;
        }
        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.D) && !isOnRightEdge) {
            this.x += moveSpeed;
        }

        
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {
        super.draw(ctx, delta);

        if (Game.current.engine.isDebug) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(0, 0, Game.current.mapConfig.width, Game.current.mapConfig.height);
        }
    }
}