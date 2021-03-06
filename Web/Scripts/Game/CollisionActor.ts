interface ICollidable {

    drawCollisionMap(ctx: CanvasRenderingContext2D, delta: number): void;
    collide(engine: ex.Engine, actor: ex.Actor): void;
}

class CollisionActor extends ex.Actor implements ICollidable {
    constructor(x?: number, y?: number, width?: number, height?: number, color?: ex.Color) {
        super(x, y, width, height, color);
    }

    public drawCollisionMap(ctx: CanvasRenderingContext2D, delta: number): void {
        var oldColor = this.color;
        this.color = new ex.Color(0, 0, 0, 1);
        this.draw(ctx, delta);
        this.color = oldColor;
    }

    public isHit(engine: ex.Engine, x: number, y: number): boolean {
        var collisionCanvas = document.createElement("canvas");
        collisionCanvas.width = Game.current.mapConfig.width;
        collisionCanvas.height = Game.current.mapConfig.height;

        var collisionCtx = collisionCanvas.getContext('2d');
        collisionCtx.fillStyle = 'white';
        collisionCtx.fillRect(0, 0, Game.current.mapConfig.width, Game.current.mapConfig.height);

        this.drawCollisionMap(collisionCtx, 0);

        var collisionPixelData = collisionCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;

        collisionCanvas = null;
        collisionCtx = null;

        return !GraphicUtils.isPixelColorOf(collisionPixelData, Colors.White);
    }

    public collide(engine: ex.Engine, actor: ex.Actor) {
    }
}