class Explosion extends ex.Actor {

    /**
     * The higher this number, the faster the explosion radius expands
     */
    public expansionModifier: number;

    private _currentRadius: number;

    private _colorDiffR: number;
    private _colorDiffG: number;
    private _colorDiffB: number;

    constructor(x: number, y: number, public radius: number, public damage: number, public dir: ex.Vector) {
        super(x, y, radius, radius, Colors.ExplosionBegin);
        
        this.expansionModifier = 0.15;
        this._currentRadius = 0;        
        this._colorDiffR = Colors.ExplosionEnd.r - Colors.ExplosionBegin.r;
        this._colorDiffG = Colors.ExplosionEnd.g - Colors.ExplosionBegin.g;
        this._colorDiffB = Colors.ExplosionEnd.b - Colors.ExplosionBegin.b;
    }

    public update(engine: ex.Engine, delta: number) {
        super.update(engine, delta);

        // adjust color based on current radius
        var percRadius = this._currentRadius / this.radius;

        this.color = new ex.Color(
            Math.floor(Colors.ExplosionBegin.r + (this._colorDiffR * percRadius)),
            Math.floor(Colors.ExplosionBegin.g + (this._colorDiffG * percRadius)),
            Math.floor(Colors.ExplosionBegin.b + (this._colorDiffB * percRadius)));
        
        // elapsed finished?
        if (this._currentRadius >= this.radius) {

            // loop through landmasses and destruct
            engine.currentScene.children.forEach((actor: ex.Actor) => {
                if (actor instanceof CollisionActor) {
                    var collActor = (<CollisionActor>actor);

                    if (collActor.isHit(engine, this.x, this.y)) {
                        collActor.collide(engine, this);
                    }
                }
            });

            engine.removeChild(this);
            return;
        } else {
            // mod current radius by duration 
            this._currentRadius += this.expansionModifier * delta;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, delta: number) {             
        ctx.beginPath();
        ctx.fillStyle = this.color.toString();
        ctx.arc(this.x, this.y, this._currentRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

    }    
}