const ProfileAnimator = require('./profileanimator.js');

class PortalAnimator extends ProfileAnimator {
    #upid = "0";
    #lifetime = 0;
    #lifetime_counter = 0;
    bounding_rectangle = {top: 0, bottom: 0, left: 0, right: 0};
    #active = false;
    #blinking = false;

    //This can take any profile, it will be unused till
    //activate is called
    constructor(profile){
        super(profile);
    }

    activate(profile, upid, pos, lifetime) {
        this.setProfile(profile, pos.x, pos.y);
        this.#upid = upid;
        this.#lifetime = lifetime;
        this.#lifetime_counter = 0;
        this.#active = true;
        this.#blinking = false;
        this.defineAnimationLoopFromKey("Normal");

        this.bounding_rectangle.right = pos.x + profile.sprite_width*this.scale/2;
        this.bounding_rectangle.left = pos.x - profile.sprite_width*this.scale/2;
        this.bounding_rectangle.up = pos.y - profile.sprite_height*this.scale/2;
        this.bounding_rectangle.bottom = pos.y + profile.sprite_height*this.scale/2;
    }

    deactivate() {
        this.#upid = "0";
        this.#lifetime = 0;
        this.#lifetime_counter = 0;
        this.#active = false;
        this.#blinking = false;
        this.bounding_rectangle = {top: 0, bottom: 0, left: 0, right: 0};
    }

    update() {
        super.drawNext();

        if(this.#lifetime == 0) {
            return;
        }
        this.#lifetime_counter += 1;
        if(!this.#blinking && this.#lifetime_counter/this.#lifetime > 0.83) {
            this.#blinking = true;
            this.defineAnimationLoopFromKey("Blinking", false);
        }
        if(this.#lifetime_counter >= this.#lifetime) {
            this.#upid = "0";
            this.#lifetime = 0;
            this.#lifetime_counter = 0;
            this.#active = false;
            this.#blinking = false;
            this.bounding_rectangle = {top: 0, bottom: 0, left: 0, right: 0};
        }
    }

    get upid() {
        return this.#upid;
    }

    get active() {
        return this.#active;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get position() {
        return {x: this.x, y: this.y};
    }
}

module.exports = PortalAnimator;
