interface ICollidable {

    drawCollisionMap(ctx: CanvasRenderingContext2D, delta: number): void;
    collide(engine: Engine, actor: Actor): void;
}

class CollisionActor extends Actor implements ICollidable {
    constructor(x?: number, y?: number, width?: number, height?: number, color?: Color) {
        super(x, y, width, height, color);
    }

    public drawCollisionMap(ctx: CanvasRenderingContext2D, delta: number): void {
        var oldColor = this.color;
        this.color = new Color(0, 0, 0, 1);
        this.draw(ctx, delta);
        this.color = oldColor;
    }

    public isHit(engine: Engine, x: number, y: number): boolean {
        var collisionCanvas = document.createElement("canvas");
        collisionCanvas.width = engine.canvas.width;
        collisionCanvas.height = engine.canvas.height;

        var collisionCtx = collisionCanvas.getContext('2d');
        collisionCtx.fillStyle = 'white';
        collisionCtx.fillRect(0, 0, collisionCanvas.width, collisionCanvas.height);

        this.drawCollisionMap(collisionCtx, 0);

        var collisionPixelData = collisionCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;

        collisionCanvas = null;
        collisionCtx = null;

        return !GraphicUtils.isPixelColorOf(collisionPixelData, Colors.White);
    }

    public collide(engine: Engine, actor: Actor) {
    }
}