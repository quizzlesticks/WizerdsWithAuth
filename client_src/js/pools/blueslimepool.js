const EnemyController = require('../controllers/enemycontroller.js');
const AnimationProfiles = require('../animators/animationprofiles.js');
const PoolProfiles = require('./poolprofiles.js');
const AnimationLoopSubscribers = require('../animators/animationloopsubscribers.js');

class BlueSlimePool {
    #_pool = [];

    constructor() {
        for(var i = 0; i < PoolProfiles.Enemies.BlueSlime.pool_size; i++) {
            this.#_pool.push(new EnemyController("BlueSlime"))
        }
        this.draw = this.draw.bind(this);
        AnimationLoopSubscribers.subscribe(this.draw, AnimationLoopSubscribers.priority_list["slime_pool"]);
    }

    spawn(x, y) {
        for(var i = 0; i < PoolProfiles.Enemies.BlueSlime.pool_size; i++) {
            if(!this.#_pool[i].active){
                this.#_pool[i].activate(x,y);
                return;
            }
        }
        throw new Error("Out of blue slimes!");
    }

    draw(game_events={}) {
        for(var i = 0; i < PoolProfiles.Enemies.BlueSlime.pool_size; i++) {
            if(this.#_pool[i].active){
                this.#_pool[i].update(game_events);
                this.#_pool[i].draw();
            }
        }
        return game_events;
    }
}

module.exports = new BlueSlimePool();
