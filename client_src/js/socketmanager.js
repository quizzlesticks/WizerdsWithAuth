const io = require('socket.io/client-dist/socket.io.js');

class SocketManager {
    #_sock;
	#_id;
    #_upid = "0";

    #module_list = {}; //"character_manager", "auth_gui", "bullet_pool", "game", "map_manager", "portal_manager"

    constructor() {
        this.#_sock = io();

        this.updateConnectedList = this.updateConnectedList.bind(this);
		this.#_sock.on('update_connected_list', this.updateConnectedList);

        this.newNetworkCharactor = this.newNetworkCharactor.bind(this);
        this.#_sock.on('new_player_connected', this.newNetworkCharactor);

        this.deleteNetworkCharactor = this.deleteNetworkCharactor.bind(this);
        this.#_sock.on('player_left', this.deleteNetworkCharactor);

        this.updateNetworkCharactor = this.updateNetworkCharactor.bind(this);
        this.#_sock.on('player_move', this.updateNetworkCharactor);

        this.onConnection = this.onConnection.bind(this);
        this.#_sock.on('connect', this.onConnection);

        this.onDisconnection = this.onDisconnection.bind(this);
        this.#_sock.on('disconnect', this.onDisconnection);

        this.#_sock.on('message', this.printMessage);
        this.#_sock.on('bullet_fire', this.bulletFire);

        this.onLoginStatus = this.onLoginStatus.bind(this);
		this.#_sock.on('login_status', this.onLoginStatus);
		this.#_sock.on('register_status', this.onLoginStatus);
		this.#_sock.on('cookie_login_status', this.onLoginStatus);

        this.sendEnterPortal = this.sendEnterPortal.bind(this);
        this.onNewPortal = this.onNewPortal.bind(this);
        this.#_sock.on('spawn_new_portal', this.onNewPortal);

        this.onLoadMap = this.onLoadMap.bind(this);
        this.#_sock.on('load_map', this.onLoadMap);
    }

    get upid() {
        return this.#_upid;
    }

	get id() {
        return this.#_sock.id;
    }

    registerModule(who, instance) {
        this.#module_list[who] = instance;
    }

    sendEnterPortal(upid=undefined) {
        this.#_sock.emit('enter_portal', {upid: upid});
    }

    sendCharSelect(char_select, pos, last_state) {
        this.#_sock.emit('player_selected', {char_select: char_select, pos: pos, last_state: last_state});
    }

    sendPlayerPos(pos, last_state) {
        this.#_sock.emit("player_move", {last_state: last_state, pos: pos});
    }


    sendBulletFire(angle, x, y, speed_x, speed_y, lifetime) {
        this.#_sock.emit("bullet_fire", {angle: angle, x: x, y: y, sx: speed_x, sy: speed_y, life: lifetime});
    }

	sendLogin(username, passwd) {
		this.#_sock.emit("login", {uname: username, pswd: passwd});
	}

	sendRegister(username, passwd) {
		this.#_sock.emit("register", {uname: username, pswd: passwd});
	}

    printMessage(data){
        console.log("Data: " + data);
    }

    onConnection() {
        this.#module_list['game'].start();
    }

	onNewPortal(data) {
        this.#module_list['portal_manager'].addPortal(data.map_type, data.upid, data.pos, data.lifetime);
	}

    onLoadMap(data) {
        this.#_upid = data.upid;
        const new_pos = this.#module_list['map_manager'].loadMap(data.map_type, this.#module_list['game'].loop, data.op);
        if(this.#module_list['character_manager']) {
            this.#module_list['character_manager'].player_position = new_pos;
        }
    }

	onLoginStatus(msg) {
		if(msg.status == "success") {
			this.#setCookie("UUID", msg.uuid, 1);
			this.#module_list['character_manager'].username = msg.username;
			this.#module_list['auth_gui'].loginStatus(1);
		} else {
			this.#module_list['auth_gui'].loginStatus(msg.reason);
		}
	}

    onDisconnection() {
        this.#module_list['game'].handleDisconnect();
        this.#module_list['character_manager'].flushCharacterList();
    }

    newNetworkCharactor(data){
        this.#module_list['character_manager'].addNetworkCharacter(data.char_select, data.id, data.pos.x, data.pos.y, data.last_state);
    }

    updateConnectedList(data){
        var keys = Object.keys(data);
        var cur;
        for(var i = 0; i < keys.length; i++) {
            if(keys[i] != this.id) {
                cur = data[keys[i]];
                this.#module_list['character_manager'].addNetworkCharacter(cur.char_select, cur.id, cur.pos.x, cur.pos.y, cur.last_state);
            }
        }
    }

    deleteNetworkCharactor(data){
        this.#module_list['character_manager'].removeNetworkCharacter(data);
    }

    updateNetworkCharactor(data){
        this.#module_list['character_manager'].updateNetworkCharactorPosition(data.id, data.last_state, data.pos);
    }

    bulletFire(data){
        this.#module_list['bullet_pool'].fire(data.angle, data.x, data.y, data.sx, data.sy, 0, data.life, false);
    }

	#setCookie(cname, cvalue, exdays) {
		const d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		let expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/";
	}
}

module.exports = new SocketManager();
