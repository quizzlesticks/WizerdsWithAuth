const SSM = require('../sprites/spritesheetmanager.js');

class ProfileAnimator {
    //The _ leading char means it should be accessible in someway from outside
    //Everything else is explicitly private, only applies to this file,
    //cant speak for the rest
    #_animloop;
    #_animloop_cur = 0;
    #_animloop_length = 0;
    #_frame_delay = 0;
    #_frame_delay_cur = 0;

    #sprite_width;
    #sprite_height;
    //This is in world space
    position = {x: undefined, y: undefined};
    bounding_rectangle = {top: undefined, bottom: undefined, left: undefined, right: undefined};
    #rotation = 0;
    #scale;
    #id;
    #animations = {};
    #_ssm;

    //px and py are specifically 0 in constructor to handle default positioning
    constructor(animation_profile, px=0, py=0, scale=undefined) {
        this.#_ssm = SSM;
        this.setProfile(animation_profile, px, py, scale);
    }

    get SSM() {
        return this.#_ssm;
    }

    //they are undefined here in case we dont want to move it if the profile
    //is change by something external
    setProfile(profile, px=undefined, py=undefined, scale=undefined) {
        this.#_frame_delay = profile.frame_delay;
        this.#id = profile.id;
        if(!scale){
            scale = profile.default_scale;
        }
        this.#scale = scale;
        this.#sprite_width = profile.sprite_width;
        this.#sprite_height = profile.sprite_height;
        //we have the constructor set so that no default position has to be given
        //however, if this is called from a controller or pool then we may
        //not want to move the sprite
        if(px!=undefined) {
            this._x = px;
        }
        if(py!=undefined) {
            this._y = py;
        }
        if(profile.animation == undefined) {
            this.#animations = profile.animations;
        } else {
            this.#animations = {};
        }
    }

    set _x(x) {
        this.position.x = x;
        this.bounding_rectangle.left = this.position.x - this.#sprite_width*this.#scale/2;
        this.bounding_rectangle.right = this.position.x + this.#sprite_width*this.#scale/2;
    }

    set _y(y) {
        this.position.y = y;
        this.bounding_rectangle.top = this.position.y - this.#sprite_height*this.#scale/2;
        this.bounding_rectangle.bottom = this.position.y + this.#sprite_height*this.#scale/2;;
    }

    set _position(p) {
        this._x = p.x;
        this._y = p.y;
    }

    get _x() {
        return this.position.x;
    }

    get _y() {
        return this.position.y;
    }

    set rotation(r) {
        this.#rotation = r;
    }

    get scale() {
        return this.#scale;
    }

    get frame_index() {
        return this.#_animloop_cur;
    }

    get frame() {
        return this.#_animloop[this.#_animloop_cur];
    }

    //reset==false is for defining the animation loop with reseting cur
    //this way wiggling the mouse or moving a bunch around enemies
    //doesn't cause the animation to restart constantly
    defineAnimationLoop(loop, reset=true) {
        this.#_animloop = loop;
        this.#_animloop_length = loop.length;
        if(reset || this.#_animloop_cur > this.#_animloop_length) {
            this.#_animloop_cur = 0;
        }
    }

    restartAnimationLoop() {
        this.#_animloop_cur = 0;
    }

    defineAnimationLoopFromKey(key, reset) {
        this.defineAnimationLoop(this.#animations[key], reset);
    }

    draw(index) {
        if(index == undefined) {
            index = this.frame;
        }
        const sp = SSM.viewport.camera.worldToScreenSpace({x: this._x, y: this._y});
        SSM.drawSprite(this.#id, index, sp.x, sp.y, this.#rotation, this.#scale);
        if(SSM.viewport.camera.debug) {
            let top_left = SSM.viewport.camera.worldToScreenSpace({x: this.bounding_rectangle.left, y: this.bounding_rectangle.top});
            let sp = SSM.viewport.camera.worldToScreenSpace(this.position);
            let ctx = SSM.viewport.context;
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "#ffff4d";
            ctx.arc(sp.x, sp.y, 3, 0, 2*Math.PI);
            ctx.fill();

            if(this.#id.includes("RedRidingHood") || this.#id.includes("SciGuy")) {
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.arc(sp.x, sp.y, 50, 0, 2*Math.PI);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.strokeStyle = "#FF0000";
            ctx.rect(top_left.x, top_left.y, this.bounding_rectangle.right-this.bounding_rectangle.left, this.bounding_rectangle.bottom-this.bounding_rectangle.top);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawNext() {
        this.draw(this.frame);
        this.incrementFrame();
    }

    drawPrev() {
        this.draw(this.frame);
        this.decrementFrame();
    }

    incrementFrame() {
        this.#_frame_delay_cur += 1;
        if(this.#_frame_delay_cur > this.#_frame_delay){
            this.#_animloop_cur += 1;
            this.#_frame_delay_cur = 0;
        }
        if(this.#_animloop_cur == this.#_animloop_length){
            this.#_animloop_cur = 0;
        }
    }

    decrementFrame() {
        this.#_frame_delay_cur += 1;
        if(this.#_frame_delay_cur > this.#_frame_delay){
            this.#_animloop_cur -= 1;
            this.#_frame_delay_cur = 0;
        }
        if(this.#_animloop_cur == -1){
            this.#_animloop_cur = this.#_animloop_length-1;
        }
    }

    checkCollision(external_rect) {
        if (this.bounding_rectangle.left < external_rect.right &&
            this.bounding_rectangle.right > external_rect.left &&
            this.bounding_rectangle.top < external_rect.bottom &&
            this.bounding_rectangle.bottom > external_rect.top) {
                return true;
        }
        return false;
    }
}

module.exports = ProfileAnimator;
