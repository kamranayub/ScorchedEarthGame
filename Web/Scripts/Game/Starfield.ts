class Starfield extends ex.Actor {

    constructor(width: number, height: number) {
        super(0, 0, width, height);

        ex.Logger.getInstance().info("Creating starfield, " + width + "x" + height);

        var x, y, a, s,
            dx1 = -(Math.random() * 5),
            dx2 = -(Math.random() * 5);

        for (var i = 0; i < 1000; i++) {
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);
            a = Math.random();
            s = new ex.Actor(x, y, 1, 1, new ex.Color(255, 255, 255, a));
            s.dx = Math.floor(Math.random() * 2) === 1 ? dx1 : dx2;

            s.addEventListener('update', this.starOnUpdate(this, s));

            this.addChild(s);
        }
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {
        super.draw(ctx, delta);
    }

    public update(engine: ex.Engine, delta: number): void {
        super.update(engine, delta);
    }

    private starOnUpdate(field: Starfield, star: ex.Actor) {
        return (e) => {
            if (star.x < 0) {
                star.x = field.getWidth();
            }
        };
    }
}