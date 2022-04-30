const ProfileAnimator = require('./profileanimator.js');

class BulletAnimator extends ProfileAnimator {
    //Please always use my setter for x and y, the bounding rect gets :( when
    //you don't
    #active = false;
    #angle = 0;
    #speed_y = 0;
    #speed_x = 0;
    #damage = 0;
    #lifetime = 0;
    #lifetime_counter = 0;
    #player_fired = false;

    #bounding_rectangle = {top: undefined, bottom: undefined, left: undefined, right: undefined};

    constructor(profile) {
        super(profile)
        super.defineAnimationLoop(profile.animation);
        this.#bounding_rectangle.top = this.position.y - profile.sprite_height*profile.default_scale/2;
        this.#bounding_rectangle.bottom = this.position.y + profile.sprite_height*profile.default_scale/2;
        this.#bounding_rectangle.left = this.position.x - profile.sprite_width*profile.default_scale/2;
        this.#bounding_rectangle.right = this.position.x + profile.sprite_width*profile.default_scale/2;
    }

    get active() {
        return this.#active;
    }

    get bounding_rectangle() {
        return this.#bounding_rectangle;
    }

    set x(xn) {
        this.#bounding_rectangle.left += xn-this.position.x;
        this.#bounding_rectangle.right += xn-this.position.x;
        this.position.x = xn;
    }

    set y(yn) {
        this.#bounding_rectangle.top += yn-this.position.y;
        this.#bounding_rectangle.bottom += yn-this.position.y;
        this.position.y = yn;
    }

    set position(posn) {
        this.x = posn.x;
        this.y = posn.y;
    }

    activate(angle, x, y, sx, sy, damage, lifetime, player_fired) {
        this.rotation = angle;
        super.restartAnimationLoop();
        this.x = x;
        this.y = y;
        this.#speed_x = sx;
        this.#speed_y = sy;
        this.#damage = damage;
        this.#lifetime = lifetime;
        this.#lifetime_counter = 0;
        this.#player_fired = player_fired;
        this.#active = true;
    }

    update() {
        //draw it
        super.drawNext();
        //update it
        this.x = this.position.x + this.#speed_x;
        this.y = this.position.y + this.#speed_y;

        this.#lifetime_counter++;
        if(this.#lifetime_counter == this.#lifetime) {
            this.#active = false;
        }
    }
}

module.exports = BulletAnimator;
