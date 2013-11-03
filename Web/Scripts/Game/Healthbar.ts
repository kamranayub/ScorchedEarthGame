class Healthbar extends Actor {

    private current: number;

    constructor(private max: number) {
        super(0, 0, Config.tankWidth, 5, Color.Green);

        this.invisible = true;
        this.current = max;
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number): void {
        super.draw(ctx, delta);

        var startAngle = Math.PI + (Math.PI / 8);
        var endAngle = Math.PI * 2 - (Math.PI / 8);
        var diffAngle = endAngle - startAngle;

        // background
        ctx.strokeStyle = new Color(255, 255, 255, 0.8);
        ctx.beginPath();
        ctx.arc(this.x + this.getWidth() / 2, this.y, 25, startAngle, endAngle);
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();

        // arc
        ctx.strokeStyle = this.color.toString();
        ctx.beginPath();
        ctx.arc(this.x + this.getWidth() / 2, this.y, 25, startAngle, endAngle - (diffAngle * (1 - this.getPercentage())));
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();        
    }    

    public getPercentage(): number {
        return this.current / this.max;
    }

    public setValue(value: number): void {
        if (value >= 0) {
            this.current = value;
        }
    }

    public reduce(value: number): void {        
        this.setValue(this.current - value);
    }

    public getCurrent(): number {
        return this.current;
    }
}