const CharacterAnimator = require('../animators/characteranimator.js');
const Camera = require('../viewport/camera.js');

class EnemyController {
    #position = {x: 0, y: 0};
    #bounding_rectangle = {top: undefined, bottom: undefined, left: undefined, right: undefined};
    #_animator;
    #active;
    #speed=3;
    constructor(profile) {
        this.#_animator = new CharacterAnimator("EnemyProfiles", profile, this.#position.x, this.#position.y);
        this.#bounding_rectangle.top = this.#position.y - profile.sprite_height*profile.default_scale/2;
        this.#bounding_rectangle.bottom = this.#position.y + profile.sprite_height*profile.default_scale/2;
        this.#bounding_rectangle.left = this.#position.x - profile.sprite_width*profile.default_scale/2;
        this.#bounding_rectangle.right = this.#position.x + profile.sprite_width*profile.default_scale/2;
    }

    set x(x) {
        this.#bounding_rectangle.left += x-this.#position.x;
        this.#bounding_rectangle.right += x-this.#position.x;
        this.#position.x = x;
        this.#_animator.x = x;
    }

    set y(y) {
        this.#bounding_rectangle.top += y-this.#position.y;
        this.#bounding_rectangle.bottom += y-this.#position.y;
        this.#position.y = y;
        this.#_animator.y = y;
    }

    get bounding_rectangle() {
        return this.#bounding_rectangle;
    }

    get active() {
        return this.#active;
    }

    activate(x,y) {
        this.#_animator.animate("Idle", "KeyS");
        this.x = x;
        this.y = y;
        this.#active = true;
    }

    update(game_events={}) {
        const x_delta = this.#position.x - game_events.player_pos.x;
        const y_delta = this.#position.y - game_events.player_pos.y;
        const distance = Math.pow(x_delta, 2) +  Math.pow(y_delta, 2);
        const zone = Camera.findDiagonalZone(Camera.worldToScreenSpace(this.#position), true);
        //if player is less than or 200 pixels away attack
        if(distance <= 40000) {
            if(this.#_animator.last_state.state != "Attack" || this.#_animator.last_state.key != zone) {
                this.#_animator.animate("Attack", zone);
            }
        }
        //otherwise if the player is less than or 400 pixels away move at them
        else if(distance <= 160000) {
            //only move during hop frames
            if(this.#_animator.last_state.state == "Move" && this.#_animator.frame != 0) {
                const angle = Math.atan2(y_delta, x_delta);
                this.x = this.#position.x - Math.cos(angle)*this.#speed;
                this.y = this.#position.y - Math.sin(angle)*this.#speed;
            }
            if(this.#_animator.last_state.state != "Move" || this.#_animator.last_state.key != zone) {
                this.#_animator.animate("Move", zone);
            }
        }
        //if not just idle and randomly move
        else {
            if(this.#_animator.last_state.state != "idle" || this.#_animator.last_state.key != zone) {
                this.#_animator.animate("Idle", "KeyS");
            }
        }
        return game_events;
    }

    draw() {
        this.#_animator.update();
    }
}

module.exports = EnemyController;
