const BulletAnimator = require('../animators/bulletanimator.js');
const PoolProfiles = require('./poolprofiles.js');
const AnimationProfiles = require('../animators/animationprofiles.js');
const SocketManager = require('../socketmanager.js');
const AnimationLoopSubscribers = require('../animators/animationloopsubscribers.js');

class BulletPool {
    #_pool = [];

    constructor(ts) {
        for(var i = 0; i < PoolProfiles.BulletPool.pool_size; i++) {
            this.#_pool.push(new BulletAnimator(AnimationProfiles.PlayerBulletProfiles.BlueBullet));
        }
        this.draw = this.draw.bind(this);
        AnimationLoopSubscribers.subscribe(this.draw, AnimationLoopSubscribers.priority_list["bullet_pool"]);
        SocketManager.registerModule("bullet_pool", this);
    }

    fire(angle, x, y, speed_x, speed_y, damage, lifetime, player_fired) {
        for(var i = 0; i < PoolProfiles.BulletPool.pool_size; i++) {
            if(!this.#_pool[i].active){
                this.#_pool[i].activate(angle,x,y,speed_x,speed_y,damage,lifetime,player_fired);
                return;
            }
        }
        throw new Error("Out of bullets!");
    }

    draw(game_events={}) {
        for(var i = 0; i < PoolProfiles.BulletPool.pool_size; i++) {
            if(this.#_pool[i].active){
                this.#_pool[i].update();
            }
        }
        return game_events;
    }
}

module.exports = new BulletPool();
