const CharacterController = require('./controllers/charactercontroller.js');
const NetworkCharacterController = require('./controllers/networkcharactercontroller.js');
const SocketManager = require('./socketmanager.js');
const AnimationLoopSubscribers = require('./animators/animationloopsubscribers.js');

class CharacterManager {
    #_char_list;
    #_id_list;
    #player;
	#username;
    constructor() {
        this.#_char_list = {};
        this.drawAllCharacters = this.drawAllCharacters.bind(this);
        AnimationLoopSubscribers.subscribe(this.drawAllCharacters, AnimationLoopSubscribers.priority_list["character_manager"]);
        SocketManager.registerModule("character_manager", this);
    }

	get username() {
		this.#username;
	}

	set username(uname) {
		this.#username = uname
	}

    get player() {
        return this.#player;
    }

    getCharacter(id) {
        return this.#_char_list[id];
    }

    addPlayerCharacter(player_class, x=0, y=0) {
        this.#_char_list[SocketManager.id] = new CharacterController(player_class, x, y);
        this.#player = this.#_char_list[SocketManager.id];
    }

    addNetworkCharacter(player_class, id, x, y, last_state) {
        if(Object.keys(this.#_char_list).includes(id)){
            return;
        }
        this.#_char_list[id] = new NetworkCharacterController(player_class, id, x, y);
        this.updateNetworkCharactorPosition(id, last_state, {x: x, y: y});
    }

    updateNetworkCharactorPosition(id, last_state, pos){
        this.#_char_list[id].updateAnimationAndPosition(last_state, pos);
    }

    removeNetworkCharacter(id) {
        delete this.#_char_list[id];
    }

    flushCharacterList() {
        this.#_char_list = {};
    }

    set player_position(pos) {
        this.#player.position = pos;
    }

    get post_update_player_position() {
        return this.#player.post_update_position;
    }

    drawAllCharacters(game_events={}) {
        var keys = Object.keys(this.#_char_list);
        for(var i = 0; i < keys.length; i++) {
            if(keys[i] != SocketManager.id){
                this.#_char_list[keys[i]].draw();
            }
        }
        if(this.#_char_list[SocketManager.id] != undefined) {
            this.#_char_list[SocketManager.id].draw();
        }
        return game_events;
    }
}

module.exports = new CharacterManager();
