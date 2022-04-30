const CharacterAnimator = require('../animators/characteranimator.js');
const AnimationProfiles = require('../animators/animationprofiles.js');

class NetworkCharacterController{
    #_mousedown = false;
    #position = {x: undefined, y: undefined};

    #_animator;

    constructor(player_class, id, x=0, y=0, scale=0) {
        this.#_animator = new CharacterAnimator(CharacterProfiles, player_class, x, y);
        this.x = x;
        this.y = y;
        this.draw = this.draw.bind(this);
    }

    get x() {
        return this.#position.x;
    }

    get y() {
        return this.#position.y;
    }

    get position() {
        return this.#position;
    }

    set x(x) {
        this.#position.x = x;
        this.#_animator.x = x;
    }

    set y(y) {
        this.#position.y = y;
        this.#_animator.y = y;
    }

    set position(p) {
        this.x = p.x;
        this.y = p.y;
    }

    draw() {
        this.#_animator.update();
    }

    updateAnimationAndPosition(last_state, pos) {
        this.#_animator.animate(last_state.state, last_state.key);
        this.position = pos;
    }
}

module.exports = NetworkCharacterController;
