if (typeof window != 'undefined' && !window.requestAnimationFrame) {
    (window).requestAnimationFrame = (window).webkitRequestAnimationFrame || (window).mozRequestAnimationFrame || function (callback) {
        window.setInterval(callback, 1000 / 60);
    };
}

if (typeof window != 'undefined' && !(window).audioContext) {
    (window).audioContext = (window).webkitAudioContext;
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
var MoveTo = (function () {
    function MoveTo(actor, destx, desty, speed) {
        this._started = false;
        this.actor = actor;
        this.end = new Vector(destx, desty);
        this.speed = speed;
    }
    MoveTo.prototype.update = function (delta) {
        if (!this._started) {
            this._started = true;
            this.start = new Vector(this.actor.x, this.actor.y);
            this.distance = this.start.distance(this.end);
            this.dir = this.end.minus(this.start).normalize();
        }
        var m = this.dir.scale(this.speed);
        this.actor.dx = m.x;
        this.actor.dy = m.y;

        if (this.isComplete(this.actor)) {
            this.actor.x = this.end.x;
            this.actor.y = this.end.y;
            this.actor.dy = 0;
            this.actor.dx = 0;
        }
    };

    MoveTo.prototype.isComplete = function (actor) {
        return (new Vector(actor.x, actor.y)).distance(this.start) >= this.distance;
    };

    MoveTo.prototype.reset = function () {
        this._started = false;
    };
    return MoveTo;
})();

var MoveBy = (function () {
    function MoveBy(actor, destx, desty, time) {
        this._started = false;
        this.actor = actor;
        this.end = new Vector(destx, desty);
        if (time <= 0) {
            Logger.getInstance().log("Attempted to moveBy time less than or equal to zero : " + time, Log.ERROR);
            throw new Error("Cannot move in time <= 0");
        }
        this.time = time;
    }
    MoveBy.prototype.update = function (delta) {
        if (!this._started) {
            this._started = true;
            this.start = new Vector(this.actor.x, this.actor.y);
            this.distance = this.start.distance(this.end);
            this.dir = this.end.minus(this.start).normalize();
            this.speed = this.distance / (this.time);
        }

        var m = this.dir.scale(this.speed);
        this.actor.dx = m.x;
        this.actor.dy = m.y;

        if (this.isComplete(this.actor)) {
            this.actor.x = this.end.x;
            this.actor.y = this.end.y;
            this.actor.dy = 0;
            this.actor.dx = 0;
        }
    };

    MoveBy.prototype.isComplete = function (actor) {
        return (new Vector(actor.x, actor.y)).distance(this.start) >= this.distance;
    };

    MoveBy.prototype.reset = function () {
        this._started = false;
    };
    return MoveBy;
})();

var RotateTo = (function () {
    function RotateTo(actor, angleRadians, speed) {
        this._started = false;
        this.actor = actor;
        this.end = angleRadians;
        this.speed = speed;
    }
    RotateTo.prototype.update = function (delta) {
        if (!this._started) {
            this._started = true;
            this.start = this.actor.rotation;
            this.distance = Math.abs(this.end - this.start);
        }
        this.actor.rx = this.speed;

        if (this.isComplete(this.actor)) {
            this.actor.rotation = this.end;
            this.actor.rx = 0;
        }
    };

    RotateTo.prototype.isComplete = function (actor) {
        return Math.abs(this.actor.rotation - this.start) >= this.distance;
    };

    RotateTo.prototype.reset = function () {
        this._started = false;
    };
    return RotateTo;
})();

var RotateBy = (function () {
    function RotateBy(actor, angleRadians, time) {
        this._started = false;
        this.actor = actor;
        this.end = angleRadians;
        this.time = time;
        this.speed = (this.end - this.actor.rotation) / time * 1000;
    }
    RotateBy.prototype.update = function (delta) {
        if (!this._started) {
            this._started = true;
            this.start = this.actor.rotation;
            this.distance = Math.abs(this.end - this.start);
        }
        this.actor.rx = this.speed;

        if (this.isComplete(this.actor)) {
            this.actor.rotation = this.end;
            this.actor.rx = 0;
        }
    };

    RotateBy.prototype.isComplete = function (actor) {
        return Math.abs(this.actor.rotation - this.start) >= this.distance;
    };

    RotateBy.prototype.reset = function () {
        this._started = false;
    };
    return RotateBy;
})();

var ScaleTo = (function () {
    function ScaleTo(actor, scale, speed) {
        this._started = false;
        this.actor = actor;
        this.end = scale;
        this.speed = speed;
    }
    ScaleTo.prototype.update = function (delta) {
        if (!this._started) {
            this._started = true;
            this.start = this.actor.scale;
            this.distance = Math.abs(this.end - this.start);
        }
        var direction = this.end < this.start ? -1 : 1;
        this.actor.sx = this.speed * direction;

        if (this.isComplete(this.actor)) {
            this.actor.scale = this.end;
            this.actor.sx = 0;
        }
    };

    ScaleTo.prototype.isComplete = function (actor) {
        return Math.abs(this.actor.scale - this.start) >= this.distance;
    };

    ScaleTo.prototype.reset = function () {
        this._started = false;
    };
    return ScaleTo;
})();

var ScaleBy = (function () {
    function ScaleBy(actor, scale, time) {
        this._started = false;
        this.actor = actor;
        this.end = scale;
        this.time = time;
        this.speed = (this.end - this.actor.scale) / time * 1000;
    }
    ScaleBy.prototype.update = function (delta) {
        if (!this._started) {
            this._started = true;
            this.start = this.actor.scale;
            this.distance = Math.abs(this.end - this.start);
        }
        var direction = this.end < this.start ? -1 : 1;
        this.actor.sx = this.speed * direction;

        if (this.isComplete(this.actor)) {
            this.actor.scale = this.end;
            this.actor.sx = 0;
        }
    };

    ScaleBy.prototype.isComplete = function (actor) {
        return Math.abs(this.actor.scale - this.start) >= this.distance;
    };

    ScaleBy.prototype.reset = function () {
        this._started = false;
    };
    return ScaleBy;
})();

var Delay = (function () {
    function Delay(actor, delay) {
        this.elapsedTime = 0;
        this._started = false;
        this.actor = actor;
        this.delay = delay;
    }
    Delay.prototype.update = function (delta) {
        if (!this._started) {
            this._started = true;
        }

        this.x = this.actor.x;
        this.y = this.actor.y;

        this.elapsedTime += delta;
    };

    Delay.prototype.isComplete = function (actor) {
        return this.elapsedTime >= this.delay;
    };

    Delay.prototype.reset = function () {
        this.elapsedTime = 0;
        this._started = false;
    };
    return Delay;
})();

var Blink = (function () {
    function Blink(actor, frequency, duration) {
        this._started = false;
        this.nextBlink = 0;
        this.elapsedTime = 0;
        this.isBlinking = false;
        this.actor = actor;
        this.frequency = frequency;
        this.duration = duration;
        this.numBlinks = Math.floor(frequency * duration);
    }
    Blink.prototype.update = function (delta) {
        if (!this._started) {
            this._started = true;
            this.nextBlink += this.duration / this.numBlinks;
        }
        this.x = this.actor.x;
        this.y = this.actor.y;

        this.elapsedTime += delta;
        if (this.elapsedTime + 100 > this.nextBlink && this.nextBlink > this.elapsedTime - 100) {
            this.isBlinking = true;
            this.actor.invisible = true;
        } else {
            if (this.isBlinking) {
                this.isBlinking = false;
                this.nextBlink += this.duration / this.numBlinks;
            }

            this.actor.invisible = false;
            ;
        }

        if (this.isComplete(this.actor)) {
            this.actor.invisible = false;
        }
    };

    Blink.prototype.isComplete = function (actor) {
        return this.elapsedTime >= this.duration;
    };

    Blink.prototype.reset = function () {
        this._started = false;
        this.nextBlink = 0;
        this.elapsedTime = 0;
        this.isBlinking = false;
    };
    return Blink;
})();

var Repeat = (function () {
    function Repeat(actor, repeat, actions) {
        var _this = this;
        this.actor = actor;
        this.actionQueue = new ActionQueue(actor);
        this.repeat = repeat;
        this.originalRepeat = repeat;
        actions.forEach(function (action) {
            action.reset();
            _this.actionQueue.add(action);
        });
    }
    Repeat.prototype.update = function (delta) {
        this.x = this.actor.x;
        this.y = this.actor.y;
        if (!this.actionQueue.hasNext()) {
            this.actionQueue.reset();
            this.repeat--;
        }
        this.actionQueue.update(delta);
    };

    Repeat.prototype.isComplete = function () {
        return this.repeat <= 0;
    };

    Repeat.prototype.reset = function () {
        this.repeat = this.originalRepeat;
    };
    return Repeat;
})();

var RepeatForever = (function () {
    function RepeatForever(actor, actions) {
        var _this = this;
        this.actor = actor;
        this.actionQueue = new ActionQueue(actor);
        actions.forEach(function (action) {
            action.reset();
            _this.actionQueue.add(action);
        });
    }
    RepeatForever.prototype.update = function (delta) {
        this.x = this.actor.x;
        this.y = this.actor.y;
        if (!this.actionQueue.hasNext()) {
            this.actionQueue.reset();
        }
        this.actionQueue.update(delta);
    };

    RepeatForever.prototype.isComplete = function () {
        return false;
    };

    RepeatForever.prototype.reset = function () {
    };
    return RepeatForever;
})();

var ActionQueue = (function () {
    function ActionQueue(actor) {
        this._actions = [];
        this._completedActions = [];
        this.actor = actor;
    }
    ActionQueue.prototype.add = function (action) {
        this._actions.push(action);
    };

    ActionQueue.prototype.remove = function (action) {
        var index = this._actions.indexOf(action);
        this._actions.splice(index, 1);
    };

    ActionQueue.prototype.getActions = function () {
        return this._actions.concat(this._completedActions);
    };

    ActionQueue.prototype.hasNext = function () {
        return this._actions.length > 1;
    };

    ActionQueue.prototype.reset = function () {
        this._actions = this.getActions();
        this._actions.forEach(function (action) {
            action.reset();
        });
        this._completedActions = [];
    };

    ActionQueue.prototype.update = function (delta) {
        if (this._actions.length > 0) {
            this._currentAction = this._actions[0];
            this._currentAction.update(delta);

            if (this._currentAction.isComplete(this.actor)) {
                //Logger.getInstance().log("Action complete!", Log.DEBUG);
                this._completedActions.push(this._actions.shift());
            }
        }
    };
    return ActionQueue;
})();
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
var Util = (function () {
    function Util() {
    }
    Util.Equals = function (x, y, delta) {
        return (((x - delta) <= y) && (y <= (x + delta)));
    };
    return Util;
})();

var Vector = (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.prototype.distance = function (v) {
        if (!v) {
            v = new Vector(0.0, 0.0);
        }
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    };

    Vector.prototype.normalize = function () {
        var d = this.distance();
        if (d > 0) {
            return new Vector(this.x / d, this.y / d);
        } else {
            return new Vector(0, 1);
        }
    };

    Vector.prototype.scale = function (size) {
        return new Vector(this.x * size, this.y * size);
    };

    Vector.prototype.add = function (v) {
        return new Vector(this.x + v.x, this.y + v.y);
    };

    Vector.prototype.minus = function (v) {
        return new Vector(this.x - v.x, this.y - v.y);
    };

    Vector.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };

    // 2d cross product returns a scalar
    Vector.prototype.cross = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    return Vector;
})();
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Drawing;
(function (Drawing) {
    var SpriteSheet = (function () {
        function SpriteSheet(path, columns, rows, spWidth, spHeight) {
            this.path = path;
            this.columns = columns;
            this.rows = rows;
            this.sprites = [];
            this.internalImage = new Image();
            this.internalImage.src = path;
            this.sprites = new Array(columns * rows);

            // TODO: Inspect actual image dimensions with preloading
            /*if(spWidth * columns > this.internalImage.naturalWidth){
            throw new Error("SpriteSheet specified is wider than image width");
            }
            
            if(spHeight * rows > this.internalImage.naturalHeight){
            throw new Error("SpriteSheet specified is higher than image height");
            }*/
            var i = 0;
            var j = 0;
            for (i = 0; i < rows; i++) {
                for (j = 0; j < columns; j++) {
                    this.sprites[j + i * columns] = new Sprite(this.internalImage, j * spWidth, i * spHeight, spWidth, spHeight);
                }
            }
        }
        SpriteSheet.prototype.getAnimationForRow = function (rowIndex, start, count, speed) {
            var begin = start + rowIndex * this.columns;
            return new Animation(this.sprites.slice(begin, begin + count), speed);
        };

        SpriteSheet.prototype.getAnimationByIndices = function (indices, speed) {
            var images = this.sprites.filter(function (sprite, index) {
                return indices.indexOf(index) > -1;
            });
            return new Animation(images, speed);
        };
        return SpriteSheet;
    })();
    Drawing.SpriteSheet = SpriteSheet;

    var SpriteFont = (function (_super) {
        __extends(SpriteFont, _super);
        function SpriteFont(path, alphabet, caseInsensitive, columns, rows, spWidth, spHeight) {
            _super.call(this, path, columns, rows, spWidth, spHeight);
            this.path = path;
            this.alphabet = alphabet;
            this.caseInsensitive = caseInsensitive;
            this.spriteLookup = {};
            for (var i = 0; i < alphabet.length; i++) {
                var char = alphabet[i];
                if (caseInsensitive) {
                    char = char.toLowerCase();
                }
                this.spriteLookup[char] = this.sprites[i];
            }
        }
        SpriteFont.prototype.draw = function (ctx, x, y, text) {
            var currX = x;
            for (var i = 0; i < text.length; i++) {
                var char = text[i];
                if (this.caseInsensitive) {
                    char = char.toLowerCase();
                }
                try  {
                    var charSprite = this.spriteLookup[char];
                    charSprite.draw(ctx, currX, y);
                } catch (e) {
                    Logger.getInstance().log("SpriteFont Error drawing char " + char, Log.ERROR);
                }
                currX += charSprite.swidth;
            }
        };
        return SpriteFont;
    })(SpriteSheet);
    Drawing.SpriteFont = SpriteFont;

    var Sprite = (function () {
        function Sprite(image, sx, sy, swidth, sheight) {
            this.sx = sx;
            this.sy = sy;
            this.swidth = swidth;
            this.sheight = sheight;
            this.scale = 1.0;
            this.rotation = 0.0;
            this.internalImage = image;
        }
        Sprite.prototype.setRotation = function (radians) {
            this.rotation = radians;
        };

        Sprite.prototype.setScale = function (scale) {
            this.scale = scale;
        };

        Sprite.prototype.draw = function (ctx, x, y) {
            ctx.drawImage(this.internalImage, this.sx, this.sy, this.swidth, this.sheight, x, y, this.swidth * this.scale, this.sheight * this.scale);
        };
        return Sprite;
    })();
    Drawing.Sprite = Sprite;

    (function (AnimationType) {
        AnimationType[AnimationType["CYCLE"] = 0] = "CYCLE";
        AnimationType[AnimationType["PINGPONG"] = 1] = "PINGPONG";
        AnimationType[AnimationType["ONCE"] = 2] = "ONCE";
    })(Drawing.AnimationType || (Drawing.AnimationType = {}));
    var AnimationType = Drawing.AnimationType;

    var Animation = (function () {
        function Animation(images, speed) {
            this.currIndex = 0;
            this.oldTime = Date.now();
            this.rotation = 0.0;
            this.scale = 1.0;
            this.type = AnimationType.CYCLE;
            this.direction = 1;
            this.sprites = images;
            this.speed = speed;
            this.maxIndex = images.length;
        }
        Animation.prototype.setRotation = function (radians) {
            this.rotation = radians;
            for (var i in this.sprites) {
                this.sprites[i].setRotation(radians);
            }
        };

        Animation.prototype.setScale = function (scale) {
            this.scale = scale;
            for (var i in this.sprites) {
                this.sprites[i].setScale(scale);
            }
        };

        Animation.prototype.cycle = function () {
            var time = Date.now();
            if ((time - this.oldTime) > this.speed) {
                this.currIndex = (this.currIndex + 1) % this.maxIndex;
                this.oldTime = time;
            }
        };

        Animation.prototype.pingpong = function () {
            var time = Date.now();
            if ((time - this.oldTime) > this.speed) {
                if (this.currIndex + this.direction === this.maxIndex || this.currIndex + this.direction === -1) {
                    this.direction = -1 * this.direction;
                }
                this.currIndex += this.direction;

                this.oldTime = time;
            }
        };

        Animation.prototype.once = function () {
            var time = Date.now();
            if ((time - this.oldTime) > this.speed) {
                if (this.currIndex + 1 < this.maxIndex) {
                    this.currIndex++;
                }
                this.oldTime = time;
            }
        };

        Animation.prototype.reset = function () {
            this.currIndex = 0;
            this.direction = 1;
        };

        Animation.prototype.tick = function () {
            if (this.type === AnimationType.CYCLE) {
                this.cycle();
            } else if (this.type === AnimationType.PINGPONG) {
                this.pingpong();
            } else if (this.type === AnimationType.ONCE) {
                this.once();
            }
        };

        Animation.prototype.draw = function (ctx, x, y) {
            this.tick();
            this.sprites[this.currIndex].draw(ctx, x, y);
        };
        return Animation;
    })();
    Drawing.Animation = Animation;
})(Drawing || (Drawing = {}));
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
/// <reference path="Common.ts" />
var Camera;
(function (Camera) {
    var SideCamera = (function () {
        function SideCamera() {
        }
        SideCamera.prototype.setActorToFollow = function (actor) {
            this.follow = actor;
        };

        SideCamera.prototype.applyTransform = function (engine, delta) {
            engine.ctx.translate(-this.follow.x + engine.width / 2.0, 0);
        };
        return SideCamera;
    })();
    Camera.SideCamera = SideCamera;

    var TopCamera = (function () {
        function TopCamera() {
        }
        TopCamera.prototype.setActorToFollow = function (actor) {
            this.follow = actor;
        };

        TopCamera.prototype.applyTransform = function (engine, delta) {
            engine.ctx.translate(-this.follow.x + engine.width / 2.0, 0);
            engine.ctx.translate(0, -this.follow.y + engine.height / 2.0);
        };
        return TopCamera;
    })();
    Camera.TopCamera = TopCamera;
})(Camera || (Camera = {}));
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
/// <reference path="Common.ts" />
var Physics;
(function (Physics) {
    // Side scroller physics implementation w/o inertia
    var SideScrollerPhysics = (function () {
        function SideScrollerPhysics(actor, engine) {
            this.actor = actor;
            this.engine = engine;
            this.gravity = 4;
            this.onGround = false;
            this.actors = [];
            actor.setPhysicsSystem(this);
        }
        SideScrollerPhysics.prototype.addActor = function (actor) {
            this.actors.push(actor);
            actor.setPhysicsSystem(this);
        };

        SideScrollerPhysics.prototype.removeActor = function (actor) {
            var index = this.actors.indexOf(actor);
            this.actors.splice(index, 1);
        };

        SideScrollerPhysics.prototype.getProperty = function (key) {
            if (key == "onGround") {
                return this.onGround;
            } else {
                return "invalid property";
            }
        };

        SideScrollerPhysics.prototype.setProperty = function (key, value) {
            if (key == "onGround") {
                this.onGround = value;
            }
        };

        SideScrollerPhysics.prototype.setGravity = function (gravity) {
            this.gravity = gravity;
        };

        SideScrollerPhysics.prototype.update = function (delta) {
            this.actor.setAy(this.gravity);

            this.setProperty("onGround", false);

            // Pseudo-Friction
            this.actor.setDx(0);

            for (var i = 0; i < this.engine.getLevel().length; i++) {
                var levelBox = this.engine.getLevel()[i].getBox();

                if (this.actor.getBox().collides(levelBox)) {
                    var overlap = this.actor.getBox().getOverlap(levelBox);
                    if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
                        this.actor.adjustY(overlap.y);
                        this.actor.setDy(0);

                        /// TODO: This isn't quite right since if we collide on the y we are considered "on the ground"
                        this.setProperty("onGround", true);
                    } else {
                        this.actor.adjustX(overlap.x);
                        this.actor.setDx(0);
                    }
                }
            }
        };
        return SideScrollerPhysics;
    })();
    Physics.SideScrollerPhysics = SideScrollerPhysics;

    // Side scroller physics implementation w inertia
    var SideScrollerInertiaPhysics = (function () {
        function SideScrollerInertiaPhysics() {
            this.actors = [];
        }
        SideScrollerInertiaPhysics.prototype.addActor = function (actor) {
            this.actors.push(actor);
            actor.setPhysicsSystem(this);
        };

        SideScrollerInertiaPhysics.prototype.removeActor = function (actor) {
            var index = this.actors.indexOf(actor);
            this.actors.splice(index, 1);
        };
        SideScrollerInertiaPhysics.prototype.getProperty = function (key) {
            return false;
        };
        SideScrollerInertiaPhysics.prototype.setProperty = function (key, value) {
        };
        SideScrollerInertiaPhysics.prototype.update = function (delta) {
        };
        return SideScrollerInertiaPhysics;
    })();
    Physics.SideScrollerInertiaPhysics = SideScrollerInertiaPhysics;

    // Top down game physics implementation
    var TopDownPhysics = (function () {
        function TopDownPhysics(engine) {
            this.engine = engine;
            this.friction = 0;
            this.actors = [];
        }
        TopDownPhysics.prototype.addActor = function (actor) {
            this.actors.push(actor);
            actor.setPhysicsSystem(this);
        };

        TopDownPhysics.prototype.removeActor = function (actor) {
            var index = this.actors.indexOf(actor);
            this.actors.splice(index, 1);
        };

        TopDownPhysics.prototype.setFriction = function (friction) {
            this.friction = friction;
        };
        TopDownPhysics.prototype.getProperty = function (key) {
            return false;
        };

        TopDownPhysics.prototype.setProperty = function (key, value) {
        };

        TopDownPhysics.prototype.update = function (delta) {
            for (var id in this.actors) {
                var actor = this.actors[id];
                if (actor.getDx() != 0) {
                    if (Math.abs(actor.getDx()) <= this.friction) {
                        actor.setDx(0);
                    } else {
                        actor.setDx(actor.getDx() + (actor.getDx() > 0 ? -1 : 1) * this.friction);
                    }
                }

                if (actor.getDy() != 0) {
                    if (Math.abs(actor.getDy()) <= this.friction) {
                        actor.setDy(0);
                    } else {
                        actor.setDy(actor.getDy() + (actor.getDy() > 0 ? -1 : 1) * this.friction);
                    }
                }

                for (var i = 0; i < this.engine.getLevel().length; i++) {
                    var levelBox = this.engine.getLevel()[i].getBox();

                    if (actor.getBox().collides(levelBox)) {
                        var overlap = actor.getBox().getOverlap(levelBox);
                        if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
                            actor.adjustY(overlap.y);
                            actor.setDy(0);
                        } else {
                            actor.adjustX(overlap.x);
                            actor.setDy(0);
                        }
                    }
                }
            }
        };
        return TopDownPhysics;
    })();
    Physics.TopDownPhysics = TopDownPhysics;
})(Physics || (Physics = {}));
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
/// <reference path="./MonkeyPatch.ts" />
var GameAudio;
(function (GameAudio) {
    var Sound = (function () {
        function Sound(soundPath, level) {
            this.context = new (window).audioContext();
            this.volume = this.context.createGain();
            this.buffer = null;
            this.path = "";
            this.isLoaded = false;
            this.path = soundPath;
            if (level) {
                this.volume.gain.value = level;
            } else {
                this.volume.gain.value = 1;
            }

            this.load();
        }
        Sound.prototype.setVolume = function (level) {
            this.volume.gain.value = level;
        };

        Sound.prototype.load = function () {
            var _this = this;
            var request = new XMLHttpRequest();
            request.open('GET', this.path);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                _this.context.decodeAudioData(request.response, function (buffer) {
                    _this.buffer = buffer;
                    _this.isLoaded = true;
                });
            };
            try  {
                request.send();
            } catch (e) {
                console.error("Error loading sound! If this is a cross origin error, you must host your sound with your html and javascript.");
            }
        };

        Sound.prototype.play = function () {
            if (this.isLoaded) {
                var sound = this.context.createBufferSource();
                sound.buffer = this.buffer;
                sound.connect(this.volume);
                this.volume.connect(this.context.destination);
                sound.noteOn(0);
            }
        };
        return Sound;
    })();
    GameAudio.Sound = Sound;

    var SoundManager = (function () {
        function SoundManager() {
        }
        return SoundManager;
    })();
    GameAudio.SoundManager = SoundManager;
})(GameAudio || (GameAudio = {}));
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
LOSS OF USE, DATA, OR PROFITS; OR BUSIENSS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/// <reference path="MonkeyPatch.ts" />
/// <reference path="Action.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Drawing.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Common.ts" />
/// <reference path="Physics.ts" />
/// <reference path="Sound.ts" />
var Color = (function () {
    function Color(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    Color.prototype.toString = function () {
        var result = String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0));
        if (this.a) {
            return "rgba(" + result + ", " + String(this.a) + ")";
        }
        return "rgb(" + result + ")";
    };
    return Color;
})();

var Overlap = (function () {
    function Overlap(x, y) {
        this.x = x;
        this.y = y;
    }
    return Overlap;
})();

var SceneNode = (function () {
    function SceneNode(actors) {
        this.children = actors || [];
    }
    SceneNode.prototype.update = function (engine, delta) {
        this.children.forEach(function (actor) {
            actor.update(engine, delta);
        });
    };

    SceneNode.prototype.draw = function (ctx, delta) {
        this.children.forEach(function (actor) {
            actor.draw(ctx, delta);
        });
    };

    SceneNode.prototype.debugDraw = function (ctx) {
        this.children.forEach(function (actor) {
            actor.debugDraw(ctx);
        });
    };

    SceneNode.prototype.addChild = function (actor) {
        this.children.push(actor);
    };

    SceneNode.prototype.removeChild = function (actor) {
        var index = this.children.indexOf(actor);
        this.children.splice(index, 1);
    };
    return SceneNode;
})();
;

var Side;
(function (Side) {
    Side[Side["TOP"] = 0] = "TOP";
    Side[Side["BOTTOM"] = 1] = "BOTTOM";
    Side[Side["LEFT"] = 2] = "LEFT";
    Side[Side["RIGHT"] = 3] = "RIGHT";
    Side[Side["NONE"] = 4] = "NONE";
})(Side || (Side = {}));

var Actor = (function (_super) {
    __extends(Actor, _super);
    function Actor(x, y, width, height, color) {
        _super.call(this);
        this.x = 0;
        this.y = 0;
        this.height = 0;
        this.width = 0;
        this.rotation = 0;
        this.rx = 0;
        this.scale = 1;
        this.sx = 0;
        this.dx = 0;
        this.dy = 0;
        this.ax = 0;
        this.ay = 0;
        this.invisible = false;
        this.solid = true;
        this.animations = {};
        this.currentAnimation = null;
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
        this.color = color;
        this.actionQueue = new ActionQueue(this);
        this.eventDispatcher = new EventDispatcher(this);
    }
    // Play animation in Actor's list
    Actor.prototype.playAnimation = function (key) {
        if (this.currentAnimation != this.animations[key]) {
            this.animations[key].reset();
        }
        this.currentAnimation = this.animations[key];
    };

    Actor.prototype.addEventListener = function (eventName, handler) {
        this.eventDispatcher.subscribe(eventName, handler);
    };

    Actor.prototype.triggerEvent = function (eventName, event) {
        this.eventDispatcher.publish(eventName, event);
    };

    Actor.prototype.getWidth = function () {
        return this.width * this.scale;
    };

    Actor.prototype.getHeight = function () {
        return this.height * this.scale;
    };

    Actor.prototype.getLeft = function () {
        return this.x;
    };
    Actor.prototype.getRight = function () {
        return this.x + this.getWidth();
    };
    Actor.prototype.getTop = function () {
        return this.y;
    };
    Actor.prototype.getBottom = function () {
        return this.y + this.getHeight();
    };

    Actor.prototype.getOverlap = function (box) {
        var xover = 0;
        var yover = 0;
        if (this.collides(box)) {
            if (this.getLeft() < box.getRight()) {
                xover = box.getRight() - this.getLeft();
            }
            if (box.getLeft() < this.getRight()) {
                var tmp = box.getLeft() - this.getRight();
                if (Math.abs(xover) > Math.abs(tmp)) {
                    xover = tmp;
                }
            }

            if (this.getBottom() > box.getTop()) {
                yover = box.getTop() - this.getBottom();
            }

            if (box.getBottom() > this.getTop()) {
                var tmp = box.getBottom() - this.getTop();
                if (Math.abs(yover) > Math.abs(tmp)) {
                    yover = tmp;
                }
            }
        }
        return new Overlap(xover, yover);
    };

    Actor.prototype.collides = function (box) {
        var w = 0.5 * (this.getWidth() + box.getWidth());
        var h = 0.5 * (this.getHeight() + box.getHeight());

        var dx = (this.x + this.getWidth() / 2.0) - (box.x + box.getWidth() / 2.0);
        var dy = (this.y + this.getHeight() / 2.0) - (box.y + box.getHeight() / 2.0);

        if (Math.abs(dx) < w && Math.abs(dy) < h) {
            // collision detected
            var wy = w * dy;
            var hx = h * dx;

            if (wy > hx) {
                if (wy > -hx) {
                    return Side.TOP;
                } else {
                    return Side.LEFT;
                }
            } else {
                if (wy > -hx) {
                    return Side.RIGHT;
                } else {
                    return Side.BOTTOM;
                }
            }
        }

        return Side.NONE;
    };

    Actor.prototype.within = function (actor, distance) {
        return Math.sqrt(Math.pow(this.x - actor.x, 2) + Math.pow(this.y - actor.y, 2)) <= distance;
    };

    // Add an animation to Actor's list
    Actor.prototype.addAnimation = function (key, animation) {
        this.animations[key] = animation;
        if (!this.currentAnimation) {
            this.currentAnimation = animation;
        }
    };

    // Actions
    Actor.prototype.moveTo = function (x, y, speed) {
        this.actionQueue.add(new MoveTo(this, x, y, speed));
        return this;
    };

    Actor.prototype.moveBy = function (x, y, time) {
        this.actionQueue.add(new MoveBy(this, x, y, time));
        return this;
    };

    Actor.prototype.rotateTo = function (angleRadians, speed) {
        this.actionQueue.add(new RotateTo(this, angleRadians, speed));
        return this;
    };

    Actor.prototype.rotateBy = function (angleRadians, time) {
        this.actionQueue.add(new RotateBy(this, angleRadians, time));
        return this;
    };

    Actor.prototype.scaleTo = function (size, speed) {
        this.actionQueue.add(new ScaleTo(this, size, speed));
        return this;
    };

    Actor.prototype.scaleBy = function (size, time) {
        this.actionQueue.add(new ScaleBy(this, size, time));
        return this;
    };

    Actor.prototype.blink = function (frequency, duration) {
        this.actionQueue.add(new Blink(this, frequency, duration));
        return this;
    };

    Actor.prototype.delay = function (seconds) {
        this.actionQueue.add(new Delay(this, seconds));
        return this;
    };

    Actor.prototype.repeat = function (times) {
        if (!times) {
            this.repeatForever();
            return this;
        }
        this.actionQueue.add(new Repeat(this, times, this.actionQueue.getActions()));

        return this;
    };

    Actor.prototype.repeatForever = function () {
        this.actionQueue.add(new RepeatForever(this, this.actionQueue.getActions()));
        return this;
    };

    Actor.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
        var eventDispatcher = this.eventDispatcher;

        // Update event dispatcher
        eventDispatcher.update();

        // Update action queue
        this.actionQueue.update(delta);

        // Update placements based on linear algebra
        this.x += this.dx * delta / 1000;
        this.y += this.dy * delta / 1000;

        //this.dx += this.ax * delta/1000;
        //this.dy += this.ay * delta/1000;
        //this.dx = 0;
        //this.dy = 0;
        this.rotation += this.rx * delta / 1000;

        this.scale += this.sx * delta / 1000;

        for (var i = 0; i < engine.currentScene.children.length; i++) {
            var other = engine.currentScene.children[i];
            var side = Side.NONE;
            if (other !== this && (side = this.collides(other)) !== Side.NONE) {
                var overlap = this.getOverlap(other);
                eventDispatcher.publish(EventType[EventType.COLLISION], new CollisonEvent(this, (other), side));
                if (!this.solid) {
                    if (Math.abs(overlap.y) < Math.abs(overlap.x)) {
                        this.y += overlap.y;
                        //this.dy = 0;
                        //this.dx += (<Actor>other).dx;
                    } else {
                        this.x += overlap.x;
                        //this.dx = 0;
                        //this.dy += (<Actor>other).dy;
                    }
                }
            }
        }

        // Publish other events
        engine.keys.forEach(function (key) {
            eventDispatcher.publish(Keys[key], new KeyEvent(this, key));
        });

        eventDispatcher.publish(EventType[EventType.UPDATE], new UpdateEvent(delta));
    };

    Actor.prototype.draw = function (ctx, delta) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);

        _super.prototype.draw.call(this, ctx, delta);

        if (!this.invisible) {
            if (this.currentAnimation) {
                this.currentAnimation.draw(ctx, 0, 0);
            } else {
                ctx.fillStyle = this.color ? this.color.toString() : (new Color(0, 0, 0)).toString();
                ctx.fillRect(0, 0, this.width, this.height);
            }
        }
        ctx.restore();
    };

    Actor.prototype.debugDraw = function (ctx) {
        // Meant to draw debug information about actors
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.scale(this.scale, this.scale);

        // Currently collision primitives cannot rotate
        // ctx.rotate(this.rotation);
        _super.prototype.debugDraw.call(this, ctx);

        ctx.beginPath();
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();

        ctx.restore();
    };
    return Actor;
})(SceneNode);

var Label = (function (_super) {
    __extends(Label, _super);
    function Label(text, x, y, spriteFont) {
        _super.call(this, x, y);
        this.text = text || "";
        this.spriteFont = spriteFont;
    }
    Label.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
    };

    Label.prototype.draw = function (ctx, delta) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);
        if (this.spriteFont) {
            this.spriteFont.draw(ctx, 0, 0, this.text);
        } else {
            ctx.fillStyle = 'black';
            ctx.fillText(this.text, 0, 0);
        }

        _super.prototype.draw.call(this, ctx, delta);
        ctx.restore();
    };

    Label.prototype.debugDraw = function (ctx) {
        _super.prototype.debugDraw.call(this, ctx);
    };
    return Label;
})(Actor);

var Keys;
(function (Keys) {
    Keys[Keys["NUM_1"] = 97] = "NUM_1";
    Keys[Keys["NUM_2"] = 98] = "NUM_2";
    Keys[Keys["NUM_3"] = 99] = "NUM_3";
    Keys[Keys["NUM_4"] = 100] = "NUM_4";
    Keys[Keys["NUM_5"] = 101] = "NUM_5";
    Keys[Keys["NUM_6"] = 102] = "NUM_6";
    Keys[Keys["NUM_7"] = 103] = "NUM_7";
    Keys[Keys["NUM_8"] = 104] = "NUM_8";
    Keys[Keys["NUM_9"] = 105] = "NUM_9";
    Keys[Keys["NUM_0"] = 96] = "NUM_0";
    Keys[Keys["NUM_LOCK"] = 144] = "NUM_LOCK";
    Keys[Keys["SEMICOLON"] = 186] = "SEMICOLON";
    Keys[Keys["A"] = 65] = "A";
    Keys[Keys["B"] = 66] = "B";
    Keys[Keys["C"] = 67] = "C";
    Keys[Keys["D"] = 68] = "D";
    Keys[Keys["E"] = 69] = "E";
    Keys[Keys["F"] = 70] = "F";
    Keys[Keys["G"] = 71] = "G";
    Keys[Keys["H"] = 72] = "H";
    Keys[Keys["I"] = 73] = "I";
    Keys[Keys["J"] = 74] = "J";
    Keys[Keys["K"] = 75] = "K";
    Keys[Keys["L"] = 76] = "L";
    Keys[Keys["M"] = 77] = "M";
    Keys[Keys["N"] = 78] = "N";
    Keys[Keys["O"] = 79] = "O";
    Keys[Keys["P"] = 80] = "P";
    Keys[Keys["Q"] = 81] = "Q";
    Keys[Keys["R"] = 82] = "R";
    Keys[Keys["S"] = 83] = "S";
    Keys[Keys["T"] = 84] = "T";
    Keys[Keys["U"] = 85] = "U";
    Keys[Keys["V"] = 86] = "V";
    Keys[Keys["W"] = 87] = "W";
    Keys[Keys["X"] = 88] = "X";
    Keys[Keys["Y"] = 89] = "Y";
    Keys[Keys["Z"] = 90] = "Z";
    Keys[Keys["SHIFT"] = 16] = "SHIFT";
    Keys[Keys["ALT"] = 18] = "ALT";
    Keys[Keys["UP"] = 38] = "UP";
    Keys[Keys["DOWN"] = 40] = "DOWN";
    Keys[Keys["LEFT"] = 37] = "LEFT";
    Keys[Keys["RIGHT"] = 39] = "RIGHT";
    Keys[Keys["SPACE"] = 32] = "SPACE";
    Keys[Keys["ESC"] = 27] = "ESC";
})(Keys || (Keys = {}));
;

var Log;
(function (Log) {
    Log[Log["DEBUG"] = 0] = "DEBUG";
    Log[Log["INFO"] = 1] = "INFO";
    Log[Log["WARN"] = 2] = "WARN";
    Log[Log["ERROR"] = 3] = "ERROR";
    Log[Log["FATAL"] = 4] = "FATAL";
})(Log || (Log = {}));

var ConsoleAppender = (function () {
    function ConsoleAppender() {
    }
    ConsoleAppender.prototype.log = function (message, level) {
        if (level < Log.WARN) {
            console.log("[" + Log[level] + "] : " + message);
        } else if (level < Log.ERROR) {
            console.warn("[" + Log[level] + "] : " + message);
        } else {
            console.error("[" + Log[level] + "] : " + message);
        }
    };
    return ConsoleAppender;
})();

var ScreenAppender = (function () {
    function ScreenAppender(width, height) {
        this._messages = [];
        this.canvas = document.createElement('canvas');
        this.canvas.width = width || window.innerWidth;
        this.canvas.height = height || window.innerHeight;
        this.canvas.style.position = 'absolute';
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    }
    ScreenAppender.prototype.log = function (message, level) {
        //this.ctx.fillStyle = 'rgba(0,0,0,1.0)';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this._messages.unshift("[" + Log[level] + "] : " + message);

        var pos = 10;
        var opacity = 1.0;
        for (var i = 0; i < this._messages.length; i++) {
            this.ctx.fillStyle = 'rgba(255,255,255,' + opacity.toFixed(2) + ')';
            var message = this._messages[i];
            this.ctx.fillText(message, 200, pos);
            pos += 10;
            opacity = opacity > 0 ? opacity - .05 : 0;
        }
    };
    return ScreenAppender;
})();

var Logger = (function () {
    function Logger() {
        this.appenders = [];
        this.defaultLevel = Log.INFO;
        if (Logger._instance) {
            throw new Error("Logger is a singleton");
        }
        Logger._instance = this;
    }
    Logger.getInstance = function () {
        if (Logger._instance == null) {
            Logger._instance = new Logger();
        }
        return Logger._instance;
    };

    Logger.prototype.addAppender = function (appender) {
        this.appenders.push(appender);
    };

    Logger.prototype.log = function (message, level) {
        if (level == null) {
            level = this.defaultLevel;
        }
        var defaultLevel = this.defaultLevel;
        this.appenders.forEach(function (appender) {
            if (level >= defaultLevel) {
                appender.log(message, level);
            }
        });
    };
    Logger._instance = null;
    return Logger;
})();

var EventType;
(function (EventType) {
    EventType[EventType["KEYDOWN"] = 0] = "KEYDOWN";
    EventType[EventType["KEYUP"] = 1] = "KEYUP";
    EventType[EventType["KEYPRESS"] = 2] = "KEYPRESS";
    EventType[EventType["MOUSEDOWN"] = 3] = "MOUSEDOWN";
    EventType[EventType["MOUSEUP"] = 4] = "MOUSEUP";
    EventType[EventType["MOUSECLICK"] = 5] = "MOUSECLICK";
    EventType[EventType["USEREVENT"] = 6] = "USEREVENT";
    EventType[EventType["COLLISION"] = 7] = "COLLISION";
    EventType[EventType["BLUR"] = 8] = "BLUR";
    EventType[EventType["FOCUS"] = 9] = "FOCUS";
    EventType[EventType["UPDATE"] = 10] = "UPDATE";
})(EventType || (EventType = {}));

var ActorEvent = (function () {
    function ActorEvent() {
    }
    return ActorEvent;
})();

var CollisonEvent = (function (_super) {
    __extends(CollisonEvent, _super);
    function CollisonEvent(actor, other, side) {
        _super.call(this);
        this.actor = actor;
        this.other = other;
        this.side = side;
    }
    return CollisonEvent;
})(ActorEvent);

var UpdateEvent = (function (_super) {
    __extends(UpdateEvent, _super);
    function UpdateEvent(delta) {
        _super.call(this);
        this.delta = delta;
    }
    return UpdateEvent;
})(ActorEvent);

var KeyEvent = (function (_super) {
    __extends(KeyEvent, _super);
    function KeyEvent(actor, key) {
        _super.call(this);
        this.actor = actor;
        this.key = key;
    }
    return KeyEvent;
})(ActorEvent);

var KeyDown = (function (_super) {
    __extends(KeyDown, _super);
    function KeyDown(key) {
        _super.call(this);
        this.key = key;
    }
    return KeyDown;
})(ActorEvent);

var KeyUp = (function (_super) {
    __extends(KeyUp, _super);
    function KeyUp(key) {
        _super.call(this);
        this.key = key;
    }
    return KeyUp;
})(ActorEvent);

var KeyPress = (function (_super) {
    __extends(KeyPress, _super);
    function KeyPress(key) {
        _super.call(this);
        this.key = key;
    }
    return KeyPress;
})(ActorEvent);

var EventDispatcher = (function () {
    function EventDispatcher(target) {
        this._handlers = {};
        this.queue = [];
        this.target = target;
    }
    EventDispatcher.prototype.publish = function (eventName, event) {
        eventName = eventName.toLowerCase();
        var queue = this.queue;
        var target = this.target;
        if (this._handlers[eventName]) {
            this._handlers[eventName].forEach(function (callback) {
                queue.push(function () {
                    callback.call(target, event);
                });
            });
        }
    };

    EventDispatcher.prototype.subscribe = function (eventName, handler) {
        eventName = eventName.toLowerCase();
        if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(handler);
    };

    EventDispatcher.prototype.update = function () {
        var callback;
        while (callback = this.queue.shift()) {
            callback();
        }
    };
    return EventDispatcher;
})();

var Engine = (function () {
    function Engine(width, height, canvasElementId) {
        this.hasStarted = false;
        this.keys = [];
        //public camera : ICamera;
        this.isFullscreen = false;
        this.isDebug = false;
        this.debugColor = new Color(255, 255, 255);
        this.backgroundColor = new Color(0, 0, 100);
        this.logger = Logger.getInstance();
        this.logger.addAppender(new ConsoleAppender());
        this.logger.log("Building engine...", Log.DEBUG);

        this.eventDispatcher = new EventDispatcher(this);

        this.rootScene = this.currentScene = new SceneNode();
        if (canvasElementId) {
            this.logger.log("Using Canvas element specified: " + canvasElementId, Log.DEBUG);
            this.canvas = document.getElementById(canvasElementId);
        } else {
            this.logger.log("Using generated canvas element", Log.DEBUG);
            this.canvas = document.createElement('canvas');
        }
        if (width && height) {
            this.logger.log("Engine viewport is size " + width + " x " + height, Log.DEBUG);
            this.width = this.canvas.width = width;
            this.height = this.canvas.height = height;
        } else {
            this.logger.log("Engine viewport is fullscreen", Log.DEBUG);
            this.isFullscreen = true;
        }

        this.init();
    }
    Engine.prototype.addEventListener = function (eventName, handler) {
        this.eventDispatcher.subscribe(eventName, handler);
    };

    Engine.prototype.addChild = function (actor) {
        this.currentScene.addChild(actor);
    };

    Engine.prototype.removeChild = function (actor) {
        this.currentScene.removeChild(actor);
    };

    Engine.prototype.getWidth = function () {
        return this.width;
    };

    Engine.prototype.getHeight = function () {
        return this.height;
    };

    Engine.prototype.init = function () {
        var _this = this;
        if (this.isFullscreen) {
            document.body.style.margin = '0px';
            document.body.style.overflow = 'hidden';
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;

            window.addEventListener('resize', function (ev) {
                _this.logger.log("View port resized", Log.DEBUG);
                _this.width = _this.canvas.width = window.innerWidth;
                _this.height = _this.canvas.height = window.innerHeight;
            });
        }

        window.addEventListener('blur', function (ev) {
            _this.keys.length = 0;
        });

        window.addEventListener('keyup', function (ev) {
            var key = _this.keys.indexOf(ev.keyCode);
            _this.keys.splice(key, 1);
            _this.eventDispatcher.publish(EventType[EventType.KEYUP], new KeyUp(ev.keyCode));
        });

        window.addEventListener('keydown', function (ev) {
            if (_this.keys.indexOf(ev.keyCode) === -1) {
                _this.keys.push(ev.keyCode);
                _this.eventDispatcher.publish(EventType[EventType.KEYDOWN], new KeyDown(ev.keyCode));
            }
        });

        window.addEventListener('mousedown', function () {
            // TODO: Collect events
            _this.eventDispatcher.update();
        });

        window.addEventListener('mouseup', function () {
            // TODO: Collect events
            _this.eventDispatcher.update();
        });

        window.addEventListener('blur', function () {
            _this.eventDispatcher.publish(EventType[EventType.BLUR]);
            _this.eventDispatcher.update();
        });

        window.addEventListener('focus', function () {
            _this.eventDispatcher.publish(EventType[EventType.FOCUS]);
            _this.eventDispatcher.update();
        });

        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };

    Engine.prototype.update = function (delta) {
        this.eventDispatcher.update();
        this.currentScene.update(this, delta);

        var eventDispatcher = this.eventDispatcher;
        this.keys.forEach(function (key) {
            eventDispatcher.publish(Keys[key], new KeyEvent(this, key));
        });
    };

    Engine.prototype.draw = function (delta) {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = this.backgroundColor.toString();
        ctx.fillRect(0, 0, this.width, this.height);

        if (this.isDebug) {
            this.ctx.font = "Consolas";
            this.ctx.fillStyle = this.debugColor.toString();
            for (var j = 0; j < this.keys.length; j++) {
                this.ctx.fillText(this.keys[j].toString() + " : " + (Keys[this.keys[j]] ? Keys[this.keys[j]] : "Not Mapped"), 100, 10 * j + 10);
            }

            var fps = 1.0 / (delta / 1000);
            this.ctx.fillText("FPS:" + fps.toFixed(2).toString(), 10, 10);
        }

        this.ctx.save();

        if (this.camera) {
            this.camera.applyTransform(this, delta);
        }

        this.currentScene.draw(this.ctx, delta);

        if (this.isDebug) {
            this.ctx.strokeStyle = 'yellow';
            this.currentScene.debugDraw(this.ctx);
        }

        this.ctx.restore();
    };

    Engine.prototype.start = function () {
        if (!this.hasStarted) {
            this.hasStarted = true;
            this.logger.log("Starting game...", Log.DEBUG);

            // Mainloop
            var lastTime = Date.now();
            var game = this;
            (function mainloop() {
                if (!game.hasStarted) {
                    return;
                }

                window.requestAnimationFrame(mainloop);

                // Get the time to calculate time-elapsed
                var now = Date.now();
                var elapsed = Math.floor(now - lastTime) || 1;

                game.update(elapsed);

                game.draw(elapsed);

                lastTime = now;
            })();
            this.logger.log("Game started", Log.DEBUG);
        } else {
            // Game already started;
        }
    };

    Engine.prototype.stop = function () {
        if (this.hasStarted) {
            this.hasStarted = false;
            this.logger.log("Game stopped", Log.DEBUG);
        }
    };
    return Engine;
})();
;
