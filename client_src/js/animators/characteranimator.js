const SuperProfileAnimator = require('./SuperProfileAnimator.js');

class CharacterAnimator extends SuperProfileAnimator {
    #last_state = {state: "Idle", key: "KeyS"}; //idle, attack, move + key

    constructor(namespace, animation_super_profile, px=0, py=0, scale=undefined) {
        super(namespace, animation_super_profile, px, py, scale);
        super.changeProfileByKey("Idle");
        super.defineAnimationLoopFromKey("KeyS");
    }

    get last_state() {
        return this.#last_state;
    }

    update() {
        super.drawNext();
    }

    animate(type, key) {
        if(type == this.#last_state.state && key == this.#last_state.key){
            return;
        }
        else if(this.#last_state.state == type) {
            super.defineAnimationLoopFromKey(key, false);
        } else {
            super.changeProfileByKey(type);
            super.defineAnimationLoopFromKey(key);
            this.#last_state.state = type;
        }
        this.#last_state.key = key;
    }

    set pos(p) {
        this.x = p.x;
        this.y = p.y;
    }

    set x(x) {
        this._x = x;
    }

    set y(y) {
        this._y = y;
    }

    set rotation(r) {
        this_.rotation = r;
    }
}

module.exports = CharacterAnimator;
