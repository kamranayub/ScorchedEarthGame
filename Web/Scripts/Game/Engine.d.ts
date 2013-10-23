/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
must display the following acknowledgement:
This product includes software developed by the GameTS Team.
4. Neither the name of the creator nor the
names of its contributors may be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE GAMETS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE GAMETS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
declare class Util {
    static Equals(x: number, y: number, delta: number): boolean;
}
declare class Vector {
    public x: number;
    public y: number;
    constructor(x: number, y: number);
    public distance(v?: Vector): number;
    public normalize(): Vector;
    public scale(size): Vector;
    public add(v: Vector): Vector;
    public minus(v: Vector): Vector;
    public dot(v: Vector): number;
    public cross(v: Vector): number;
}
declare class Overlap {
    public x: number;
    public y: number;
    constructor(x: number, y: number);
}
declare class SceneNode {
    public children: Actor[];
    constructor(actors?: Actor[]);
    public publish(eventType: string, event: ActorEvent): void;
    public update(engine: Engine, delta: number): void;
    public draw(ctx: CanvasRenderingContext2D, delta: number): void;
    public debugDraw(ctx: CanvasRenderingContext2D): void;
    public addChild(actor: Actor): void;
    public removeChild(actor: Actor): void;
}
declare enum Side {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
    NONE,
}
declare class Actor {
    public x: number;
    public y: number;
    private height;
    private width;
    public rotation: number;
    public rx: number;
    public scale: number;
    public sx: number;
    public dx: number;
    public dy: number;
    public ax: number;
    public ay: number;
    public invisible: boolean;
    private actionQueue;
    private eventDispatcher;
    private sceneNode;
    public solid: boolean;
    public animations: {
        [key: string]: Drawing.Animation;
    };
    public currentAnimation: Drawing.Animation;
    public color: Color;
    constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
    public addChild(actor: Actor): void;
    public removeChild(actor: Actor): void;
    public playAnimation(key): void;
    public addEventListener(eventName: string, handler: (event?: ActorEvent) => void): void;
    public triggerEvent(eventName: string, event?: ActorEvent): void;
    public getCenter(): Vector;
    public getWidth(): number;
    public getHeight(): number;
    public getLeft(): number;
    public getRight(): number;
    public getTop(): number;
    public getBottom(): number;
    private getOverlap(box);
    public collides(box: Actor): Side;
    public within(actor: Actor, distance: number): boolean;
    public addAnimation(key: any, animation: Drawing.Animation): void;
    public moveTo(x: number, y: number, speed: number): Actor;
    public moveBy(x: number, y: number, time: number): Actor;
    public rotateTo(angleRadians: number, speed: number): Actor;
    public rotateBy(angleRadians: number, time: number): Actor;
    public scaleTo(size: number, speed: number): Actor;
    public scaleBy(size: number, time: number): Actor;
    public blink(frequency: number, duration: number): Actor;
    public delay(seconds: number): Actor;
    public repeat(times?: number): Actor;
    public repeatForever(): Actor;
    public update(engine: Engine, delta: number): void;
    public draw(ctx: CanvasRenderingContext2D, delta: number): void;
    public debugDraw(ctx: CanvasRenderingContext2D): void;
}
declare class Label extends Actor {
    public text: string;
    public spriteFont: Drawing.SpriteFont;
    constructor(text?: string, x?: number, y?: number, spriteFont?: Drawing.SpriteFont);
    public update(engine: Engine, delta: number): void;
    public draw(ctx: CanvasRenderingContext2D, delta: number): void;
    public debugDraw(ctx: CanvasRenderingContext2D): void;
}
interface IAction {
    x: number;
    y: number;
    update(delta: number): void;
    isComplete(actor: Actor): boolean;
    reset(): void;
}
declare class MoveTo implements IAction {
    private actor;
    public x: number;
    public y: number;
    private start;
    private end;
    private dir;
    private speed;
    private distance;
    private _started;
    constructor(actor: Actor, destx: number, desty: number, speed: number);
    public update(delta: number): void;
    public isComplete(actor: Actor): boolean;
    public reset(): void;
}
declare class MoveBy implements IAction {
    private actor;
    public x: number;
    public y: number;
    private distance;
    private speed;
    private time;
    private start;
    private end;
    private dir;
    private _started;
    constructor(actor: Actor, destx: number, desty: number, time: number);
    public update(delta: Number): void;
    public isComplete(actor: Actor): boolean;
    public reset(): void;
}
declare class RotateTo implements IAction {
    private actor;
    public x: number;
    public y: number;
    private start;
    private end;
    private speed;
    private distance;
    private _started;
    constructor(actor: Actor, angleRadians: number, speed: number);
    public update(delta: number): void;
    public isComplete(actor: Actor): boolean;
    public reset(): void;
}
declare class RotateBy implements IAction {
    private actor;
    public x: number;
    public y: number;
    private start;
    private end;
    private time;
    private distance;
    private _started;
    private speed;
    constructor(actor: Actor, angleRadians: number, time: number);
    public update(delta: number): void;
    public isComplete(actor: Actor): boolean;
    public reset(): void;
}
declare class ScaleTo implements IAction {
    private actor;
    public x: number;
    public y: number;
    private start;
    private end;
    private speed;
    private distance;
    private _started;
    constructor(actor: Actor, scale: number, speed: number);
    public update(delta: number): void;
    public isComplete(actor: Actor): boolean;
    public reset(): void;
}
declare class ScaleBy implements IAction {
    private actor;
    public x: number;
    public y: number;
    private start;
    private end;
    private time;
    private distance;
    private _started;
    private speed;
    constructor(actor: Actor, scale: number, time: number);
    public update(delta: number): void;
    public isComplete(actor: Actor): boolean;
    public reset(): void;
}
declare class Delay implements IAction {
    public x: number;
    public y: number;
    private actor;
    private elapsedTime;
    private delay;
    private _started;
    constructor(actor: Actor, delay: number);
    public update(delta: number): void;
    public isComplete(actor: Actor): boolean;
    public reset(): void;
}
declare class Blink implements IAction {
    public x: number;
    public y: number;
    private frequency;
    private duration;
    private actor;
    private numBlinks;
    private _started;
    private nextBlink;
    private elapsedTime;
    private isBlinking;
    constructor(actor: Actor, frequency: number, duration: number);
    public update(delta): void;
    public isComplete(actor: Actor): boolean;
    public reset(): void;
}
declare class Repeat implements IAction {
    public x: number;
    public y: number;
    private actor;
    private actionQueue;
    private repeat;
    private originalRepeat;
    constructor(actor: Actor, repeat: number, actions: IAction[]);
    public update(delta): void;
    public isComplete(): boolean;
    public reset(): void;
}
declare class RepeatForever implements IAction {
    public x: number;
    public y: number;
    private actor;
    private actionQueue;
    constructor(actor: Actor, actions: IAction[]);
    public update(delta): void;
    public isComplete(): boolean;
    public reset(): void;
}
declare class ActionQueue {
    private actor;
    private _actions;
    private _currentAction;
    private _completedActions;
    constructor(actor: Actor);
    public add(action: IAction): void;
    public remove(action: IAction): void;
    public getActions(): IAction[];
    public hasNext(): boolean;
    public reset(): void;
    public update(delta: number): void;
}
/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
must display the following acknowledgement:
This product includes software developed by the ExcaliburJS Team.
4. Neither the name of the creator nor the
names of its contributors may be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE EXCALIBURJS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE EXCALIBURJS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSIENSS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
declare enum Log {
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL,
}
interface IAppender {
    log(message: string, level: Log);
}
declare class ConsoleAppender implements IAppender {
    constructor();
    public log(message: string, level: Log): void;
}
declare class ScreenAppender implements IAppender {
    private _messages;
    private canvas;
    private ctx;
    constructor(width?: number, height?: number);
    public log(message: string, level: Log): void;
}
declare class Logger {
    private static _instance;
    private appenders;
    public defaultLevel: Log;
    constructor();
    static getInstance(): Logger;
    public addAppender(appender: IAppender): void;
    public log(message: string, level?: Log): void;
}
declare enum EventType {
    KEYDOWN,
    KEYUP,
    KEYPRESS,
    MOUSEDOWN,
    MOUSEUP,
    MOUSECLICK,
    USEREVENT,
    COLLISION,
    BLUR,
    FOCUS,
    UPDATE,
}
declare class ActorEvent {
    constructor();
}
declare class CollisonEvent extends ActorEvent {
    public actor: Actor;
    public other: Actor;
    public side: Side;
    constructor(actor: Actor, other: Actor, side: Side);
}
declare class UpdateEvent extends ActorEvent {
    public delta: number;
    constructor(delta: number);
}
declare class KeyEvent extends ActorEvent {
    public actor: Actor;
    public key: Keys;
    constructor(actor: Actor, key: Keys);
}
declare class KeyDown extends ActorEvent {
    public key: Keys;
    constructor(key: Keys);
}
declare class KeyUp extends ActorEvent {
    public key: Keys;
    constructor(key: Keys);
}
declare class KeyPress extends ActorEvent {
    public key: Keys;
    constructor(key: Keys);
}
declare class EventDispatcher {
    private _handlers;
    private queue;
    private target;
    constructor(target);
    public publish(eventName: string, event?: ActorEvent): void;
    public subscribe(eventName: string, handler: (event?: ActorEvent) => void): void;
    public update(): void;
}
/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
must display the following acknowledgement:
This product includes software developed by the GameTS Team.
4. Neither the name of the creator nor the
names of its contributors may be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE GAMETS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE GAMETS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
declare module Drawing {
    interface IDrawable {
        setScale(scale: number);
        setRotation(radians: number);
        draw(ctx: CanvasRenderingContext2D, x: number, y: number);
    }
    class SpriteSheet {
        public path: string;
        private columns;
        private rows;
        public sprites: Sprite[];
        private internalImage;
        constructor(path: string, columns: number, rows: number, spWidth: number, spHeight: number);
        public getAnimationForRow(rowIndex: number, start: number, count: number, speed: number): Animation;
        public getAnimationByIndices(indices: number[], speed: number): Animation;
    }
    class SpriteFont extends SpriteSheet {
        public path: string;
        private alphabet;
        private caseInsensitive;
        private spriteLookup;
        constructor(path: string, alphabet: string, caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number);
        public draw(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void;
    }
    class Sprite implements IDrawable {
        public sx: number;
        public sy: number;
        public swidth: number;
        public sheight: number;
        private internalImage;
        private scale;
        private rotation;
        constructor(image: HTMLImageElement, sx: number, sy: number, swidth: number, sheight: number);
        public setRotation(radians: number): void;
        public setScale(scale: number): void;
        public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
    }
    enum AnimationType {
        CYCLE,
        PINGPONG,
        ONCE,
    }
    class Animation implements IDrawable {
        private sprites;
        private speed;
        private maxIndex;
        private currIndex;
        private oldTime;
        private rotation;
        private scale;
        public type: AnimationType;
        private direction;
        constructor(images: Sprite[], speed: number);
        public setRotation(radians: number): void;
        public setScale(scale: number): void;
        private cycle();
        private pingpong();
        private once();
        public reset(): void;
        public tick(): void;
        public draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
    }
}
/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
must display the following acknowledgement:
This product includes software developed by the GameTS Team.
4. Neither the name of the creator nor the
names of its contributors may be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE GAMETS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE GAMETS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
declare module Common {
    interface IEngine {
        getKeys();
        getKeyMap(): {
            [key: string]: number;
        };
        getActors(): IActor[];
        getLevel(): IActor[];
        getGraphicsCtx(): CanvasRenderingContext2D;
        getCanvas(): HTMLCanvasElement;
        update(engine: IEngine, delta: number);
        draw(ctx: CanvasRenderingContext2D, delta: number);
    }
    interface IPhysicsSystem {
        update(delta: number);
        addActor(actor: IActor): void;
        removeActor(actor: IActor): void;
        getProperty(key: string): any;
        setProperty(key: string, value: any): void;
    }
    interface IColor {
        r: number;
        g: number;
        b: number;
        a: number;
        toString(): string;
    }
    interface IOverlap {
        x: number;
        y: number;
    }
    interface ICollidable {
        collides(primitive: ICollidable): boolean;
        collidesWithBox(box: IBoundingBox): boolean;
        collidesWithCircle(circle: IBoundingCircle): boolean;
        collidesWithPoly(poly: IBoundingPoly): boolean;
        collidesWithPixels(pixels: IBoundingPixels): boolean;
        getOverlapWithBox(box: IBoundingBox): IOverlap;
        getOverlapWithCircle(circle: IBoundingCircle): IOverlap;
        getOverlapWithPoly(poly: IBoundingPoly): IOverlap;
        getOverlapWithPixels(pixels: IBoundingPixels): IOverlap;
    }
    interface IBoundingBox extends ICollidable {
    }
    interface IBoundingCircle extends ICollidable {
    }
    interface IBoundingPoly extends ICollidable {
    }
    interface IBoundingPixels extends ICollidable {
    }
    interface IBox {
        getLeft(): number;
        setLeft(left: number);
        getRight(): number;
        setRight(right: number);
        getTop(): number;
        setTop(top: number);
        getBottom(): number;
        setBottom(bottom: number);
        getOverlap(box: IBox): IOverlap;
        collides(box: IBox): boolean;
    }
    interface IActor {
        getX(): number;
        setX(x: number);
        getY(): number;
        setY(y: number);
        getDx(): number;
        setDx(dx: number);
        getDy(): number;
        setDy(dy: number);
        getAx(): number;
        setAx(ax: number);
        getAy(): number;
        setAy(ay: number);
        adjustX(x: number);
        adjustY(y: number);
        setPhysicsSystem(IPhysicsSystem);
        getPhysicsSystem(): IPhysicsSystem;
        setBox(box: IBox);
        getBox(): IBox;
        setColor(color: IColor);
        getColor(): IColor;
        update(engine: IEngine, delta: number);
        draw(ctx: CanvasRenderingContext2D, delta: number);
    }
}
declare module Camera {
    interface ICamera {
        applyTransform(engine: Engine, delta: number): void;
    }
    class SideCamera implements ICamera {
        public follow: Actor;
        constructor();
        public setActorToFollow(actor: Actor): void;
        public applyTransform(engine: Engine, delta: number): void;
    }
    class TopCamera implements ICamera {
        public follow: Actor;
        constructor();
        public setActorToFollow(actor: Actor): void;
        public applyTransform(engine: Engine, delta: number): void;
    }
}
declare module Media {
    interface ISound {
        setVolume(volume: number);
        setLoop(loop: boolean);
        play();
        stop();
    }
    class Sound implements ISound {
        private soundImpl;
        private log;
        constructor(path: string, volume?: number);
        public setVolume(volume: number): void;
        public setLoop(loop: boolean): void;
        public play(): void;
        public stop(): void;
    }
}
declare class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;
    static Yellow: Color;
    static Orange: Color;
    static Red: Color;
    static Vermillion: Color;
    static Rose: Color;
    static Magenta: Color;
    static Violet: Color;
    static Blue: Color;
    static Azure: Color;
    static Cyan: Color;
    static Viridian: Color;
    static Green: Color;
    static Chartreuse: Color;
    constructor(r: number, g: number, b: number, a?: number);
    static fromRGB(r: number, g: number, b: number, a?: number): Color;
    static fromHex(hex: string): Color;
    public toString(): string;
}
declare enum Keys {
    NUM_1 = 97,
    NUM_2 = 98,
    NUM_3 = 99,
    NUM_4 = 100,
    NUM_5 = 101,
    NUM_6 = 102,
    NUM_7 = 103,
    NUM_8 = 104,
    NUM_9 = 105,
    NUM_0 = 96,
    NUM_LOCK = 144,
    SEMICOLON = 186,
    A = 65,
    B = 66,
    C = 67,
    D = 68,
    E = 69,
    F = 70,
    G = 71,
    H = 72,
    I = 73,
    J = 74,
    K = 75,
    L = 76,
    M = 77,
    N = 78,
    O = 79,
    P = 80,
    Q = 81,
    R = 82,
    S = 83,
    T = 84,
    U = 85,
    V = 86,
    W = 87,
    X = 88,
    Y = 89,
    Z = 90,
    SHIFT = 16,
    ALT = 18,
    UP = 38,
    DOWN = 40,
    LEFT = 37,
    RIGHT = 39,
    SPACE = 32,
    ESC = 27,
}
declare class Engine {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public width: number;
    public height: number;
    private hasStarted;
    private eventDispatcher;
    public keys: number[];
    public keysDown: number[];
    public keysUp: number[];
    public camera: Camera.ICamera;
    public currentScene: SceneNode;
    public rootScene: SceneNode;
    public isFullscreen: boolean;
    public isDebug: boolean;
    public debugColor: Color;
    public backgroundColor: Color;
    private logger;
    constructor(width?: number, height?: number, canvasElementId?: string);
    public addEventListener(eventName: string, handler: (event?: ActorEvent) => void): void;
    public addChild(actor: Actor): void;
    public removeChild(actor: Actor): void;
    public getWidth(): number;
    public getHeight(): number;
    private init();
    public isKeyDown(key: Keys): boolean;
    public isKeyPressed(key: Keys): boolean;
    public isKeyUp(key: Keys): boolean;
    private update(delta);
    private draw(delta);
    public start(): void;
    public stop(): void;
}
