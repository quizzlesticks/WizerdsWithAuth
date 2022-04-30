const ProfileAnimator = require('./profileanimator.js');
const AnimationProfiles = require('./animationprofiles.js');
const SSM = require('../sprites/spritesheetmanager.js');

class SuperProfileAnimator {
    #animators_list = [];
    #profile_key_to_index_mapping = {};
    #profile_key_to_ssm_key_mapping = {};
    #index_to_profile_key_mapping = {};
    #cur_animatable;
    #cur_profile_key;
    #cur_ssm_key;

    position = {x: undefined, y: undefined};
    #rotation = 0;

    constructor(namespace, animation_profile, px=0, py=0, scale=undefined) {
        var profileKeys = Object.keys(AnimationProfiles[namespace][animation_profile]);
        //check if single or multi profile
        if(profileKeys.id == undefined) {
            //multi profile
            var prof;
            for(var i = 0; i < profileKeys.length; i++) {
                prof = AnimationProfiles[namespace][animation_profile][profileKeys[i]];
                this.#animators_list.push(new ProfileAnimator(prof, px, py, scale));
                this.#profile_key_to_index_mapping[profileKeys[i]] = i;
                this.#profile_key_to_ssm_key_mapping[profileKeys[i]] = prof.id;
                this.#index_to_profile_key_mapping[i] = profileKeys[i];
            }
        } else {
            console.error("Don't use the SuperProfileAnimator for single profiles. Use the ProfileAnimator instead.");
        }
        this._x = px;
        this._y = py;
        this.changeProfileByIndex(0);
    }

    //Uses profile key
    getSSMIDByProfileKey(key) {
        return this.#profile_key_to_ssm_key_mapping[key];
    }

    //Uses profile key
    changeProfileByKey(key) {
        this.#cur_animatable = this.#animators_list[this.#profile_key_to_index_mapping[key]];
        this.#cur_profile_key = key;
        this.#cur_ssm_key = this.#profile_key_to_ssm_key_mapping[this.#cur_profile_key];
    }

    //Uses profile key
    changeProfileByIndex(index) {
        this.#cur_animatable = this.#animators_list[index];
        this.#cur_profile_key = this.#index_to_profile_key_mapping[index];
        this.#cur_ssm_key = this.#profile_key_to_ssm_key_mapping[this.#cur_profile_key];
    }

    //Uses animations key
    defineAnimationLoopFromKey(key, reset) {
        this.#cur_animatable.defineAnimationLoopFromKey(key, reset);
    }

    defineAnimationLoop(loop, reset=true) {
        this.#cur_animatable.defineAnimationLoop(loop, reset);
    }

    restartAnimationLoop() {
        this.#cur_animatable.restartAnimationLoop();
    }

    draw() {
        const sp = SSM.viewport.camera.worldToScreenSpace({x: this.position.x, y: this.position.y});
        SSM.drawSprite(this.#cur_ssm_key, this.#cur_animatable.frame, sp.x, sp.y, this.#rotation, this.scale);
    }

    drawNext() {
        this.draw();
        this.#cur_animatable.incrementFrame();
    }

    drawPrev() {
        this.#cur_animatable.drawPrev();
        this.#cur_animatable.decrementFrame();
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    get rotation() {
        return this.#rotation;
    }

    get scale() {
        return this.#cur_animatable.scale;
    }

    get frame_index() {
        return this.#cur_animatable.frame_index;
    }

    get frame() {
        return this.#cur_animatable.frame;
    }

    set _x(xn) {
        this.position.x = xn;
    }

    set _y(yn) {
        this.position.y = yn;
    }

    set _rotation(r) {
        this.#rotation = r;
    }
}

module.exports = SuperProfileAnimator;
