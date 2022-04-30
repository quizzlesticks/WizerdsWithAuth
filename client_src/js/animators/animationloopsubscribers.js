class AnimationLoopSubscribers {
    #animation_loop_subscribers = [];

    priority_list = {
        character_controller: 0,
        map_manager: 1,
        portal_manager: 2,
        character_manager: 3,
        bullet_pool: 4,
        slime_pool: 5,
        item_gui: 6,
        map_render: 7
    };

    get list() {
        return this.#animation_loop_subscribers;
    }

    subscribe(f, priority) {
        if(this.#animation_loop_subscribers[priority] == undefined) {
            this.#animation_loop_subscribers[priority] = [];
        }
        this.#animation_loop_subscribers[priority].push(f);
    }
}

module.exports = new AnimationLoopSubscribers();
