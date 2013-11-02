interface ICollidable {

    drawCollisionMap(ctx: CanvasRenderingContext2D, delta: number): void;

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
}