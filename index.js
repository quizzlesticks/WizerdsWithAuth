//We use npm version 8.1.2
const path = require('path');
var express = require('express');
var https = require('https');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const cookie_parser = require('cookie');
var fs = require('fs');

const https_port = 4000;
const salt_rounds = 12;

const server_ip = "https://localhost";

const client = new MongoClient("mongodb://127.0.0.1:27017");

var https_options = {
	key: fs.readFileSync('ssl/key.pem'),
	cert: fs.readFileSync('ssl/cert.pem')
};

var socket_options = {
	serveClient: false
}

var app = express();

app.use('/Spritesheets', express.static(path.join(__dirname, '/client_src/assets/spritesheets')));

app.get('/', (req, res) => {
	console.log("Doing the root html thing");
	res.sendFile(__dirname + "/client_src/index.html");
});

app.get('/js/bundle.js', (req, res) => {
	res.sendFile(__dirname + '/client_src/js/build/bundle.js');
});

app.get('/fav/favicon.png', (req, res) => {
	res.sendFile(__dirname + '/client_src/assets/favicon/favicon.png');
});

app.get('/html/css/wizerds.css', (req, res) => {
	res.sendFile(__dirname + '/client_src/css/wizerds.css');
});

const https_server = https.createServer(https_options, app);
const io = new Server(https_server, socket_options);
var login_collection;

const map_seed = {seed: "RealmOfTheMattGod", radius: 30, relax_count: 6, width: 1000, height: 800};

function blankDBProfile() {
	return {mongo_id: undefined, uuid: undefined};
}

function blankPlayerProfile(id) {
	return {id: id, username: "", pos: {x: 0, y: 0}, last_state: undefined, char_select: ""};
}

io.on('connection', async (socket) => {
	console.log('a user put on their https socks');
	socket.player_profile = blankPlayerProfile(socket.id);
	socket.current_room;
	socket.db_profile = blankDBProfile();
	if(socket.handshake.headers.cookie) {
		var cookies = cookie_parser.parse(socket.handshake.headers.cookie);
		if(cookies.UUID) {
			var db_result = await login_collection.findOne({uuid: cookies.UUID});
			if(!db_result) {
				console.log("Failed cookie login with UUID: " + cookies.UUID);
				socket.emit('cookie_login_status', {status: "failed", reason: "Bad UUID"});
			}else {
				console.log("Cookie login for user: " + db_result.uname);
				socket.emit('cookie_login_status', {status: "success", uuid: cookies.UUID, username: db_result.uname});
				socket.player_profile.username = db_result.uname;
				socket.db_profile.uuid = cookies.UUID;
				socket.db_profile.mongo_id = db_result._id;
			}
		}
	}

	socket.on('register', async (msg) => {
		socket.db_profile = blankDBProfile()
		socket.player_profile = blankPlayerProfile(socket.id);
		//make sure uname and pswd aren't blank
		const uname = msg.uname;
		var pswd = msg.pswd;
		if(!(uname && pswd)) {
			console.log("Could not register user " + uname + " because username or password was blank.");
			socket.emit('register_status', {status: "failed", reason: "Username or password left blank"});
			return;
		}
		//make sure uname is available
		var result = await login_collection.findOne({uname: uname});
		if(result) {
			console.log("Could not register user " + uname + " because username already taken.");
			socket.emit('register_status', {status: "failed", reason: "Username taken"});
			return;
		}
		//hash their password
		const salt = await bcrypt.genSalt(salt_rounds);
		pswd = await bcrypt.hash(pswd, salt);
		//make a UUID
		var UUID = uuidv4();
		result = await login_collection.findOne({uuid: UUID});
		while(1) {
			if(result) {
				result = await login_collection.findOne({uuid: UUID});
			} else {
				break;
			}
		}
		result = await login_collection.updateOne({uuid: UUID},
												  {
													$currentDate: {uuid_timestamp: {$type: "date"}},
													$set: {uuid: UUID, uname: uname, pswd: pswd}
												  }, {upsert: true});
		if(!result) {
			console.log("Could not register user " + uname + " error at updateOne in register function.");
			socket.emit('register_status', {status: "failed", reason: "Internal Error"});
			return;
		}
		console.log('User registered with username: ' + uname);
		socket.emit('register_status', {status: "success", uuid: UUID, username: uname});
		socket.db_profile.mongo_id = result.upsertedId;
		socket.db_profile.uuid = UUID;
		socket.player_profile.username = uname;
	});

	socket.on('login', async (msg) => {
		socket.db_profile = blankDBProfile()
		socket.player_profile = blankPlayerProfile(socket.id);
		const uname = msg.uname;
		var pswd = msg.pswd;
		if(!(uname && pswd)) {
			console.log("Could not register user " + uname + " because username or password was blank.");
			socket.emit('register_status', {status: "failed", reason: "Username or password left blank"});
			return;
		}
		//make sure uname exists
		const result = await login_collection.findOne({uname: uname});
		if(!result) {
			console.log("Could not login user " + uname + " because username doesn't exist.");
			socket.emit('login_status', {status: "failed", reason: "Username or password incorrect."});
			return;
		}
		//compare their password
		const bcrypt_result = await bcrypt.compare(msg.pswd, result.pswd);
		if(!bcrypt_result) {
			console.log("Could not login user " + uname + " because password incorrect for user " + msg.uname + ".");
			socket.emit('login_status', {status: "failed", reason: "Username or password incorrect."});
			return;
		}
		//make a new UUID since the UUID timer should refresh for logins
		var UUID = uuidv4();
		var UUID_result = await login_collection.findOne({uuid: UUID});
		while(1) {
			if(UUID_result) {
				UUID_result = await login_collection.findOne({uuid: UUID});
			} else {
				break;
			}
		}
		const update_result = await login_collection.updateOne({"_id": result._id},
		                                                       {
																	$currentDate: {uuid_timestamp: {$type: "date"}},
																	$set: {uuid: UUID}
															   });
		if(!update_result) {
			console.log("Could not login user " + uname + " error at updateOne in login function.");
			socket.emit('login_status', {status: "failed", reason: "Internal Error"});
			return;
		}
		console.log('User logged in with username: ' + uname);
		socket.emit('login_status', {status: "success", uuid: UUID, username: uname});
		socket.db_profile.mongo_id = result._id;
		socket.db_profile.uuid = UUID;
		socket.player_profile.username = uname;
	});

	socket.on('player_selected', (data) => {
		socket.player_profile.char_select = data.char_select;
		socket.player_profile.last_state = data.last_state;
		socket.player_profile.pos = data.pos;
		//build current player list
		const connected_users = {};
		for (let [id, other_sockets] of io.of("/").sockets) {
			//we need the socket to have made it past char select
			//otherwise they aren't really logged in
			//their profile will be sent once they select a char
			if(other_sockets.player_profile.char_select) {
				//ignore our own updateConnectedList makes networkcharcontrollers
				if(socket.id != other_sockets.id) {
					connected_users[id] = other_sockets.player_profile;
				}
			}
		}
		socket.emit('update_connected_list', connected_users);
		//socket.to discludes self
		socket.join('everyone');
		socket.to('everyone').emit('new_player_connected', socket.player_profile);
	});

	socket.on('player_move', (data) => {
		socket.player_profile.pos = data.pos;
		socket.player_profile.last_state = data.last_state;
		data['id'] = socket.id;
		socket.to(socket.current_room).emit('player_move', data);
	});

	socket.on('bullet_fire', (data) => {
        socket.to(socket.current_room).emit('bullet_fire', data);
    });

	socket.portal_list = {'0': {map_type: "NexusMap", upid: 0, pos: {x: 0, y: 0}, lifetime: 0, op: undefined}, 'ASS': {map_type: "PortalMap", upid: "ASS", pos: {x: 0, y: 64}, lifetime: 0, op: map_seed}};

	//all we receive back is the upid
	socket.on('enter_portal', (data) => {
		var new_map = {};
		if(socket.portal_list[data.upid] == undefined) {
			data.upid = '0';
		}
		new_map.map_type = socket.portal_list[data.upid].map_type;
		new_map.upid = data.upid;
		new_map.op = socket.portal_list[data.upid].op;
		socket.leave(socket.current_room);
		socket.current_room = new_map.upid;
		socket.join(socket.current_room);
		socket.emit('load_map', new_map);
		if(new_map.upid == '0') {
			socket.emit('spawn_new_portal', socket.portal_list['ASS']);
		}
	});

	socket.on('disconnect', () => {
        console.log(socket.player_profile.username + ' disconnected');
		socket.leave(socket.current_room);
        socket.leave("everyone");
        socket.to('everyone').emit('player_left', socket.id);
	});
});

https_server.listen(https_port, async () => {
	try {
		await client.connect();
		login_collection = client.db("wizerds_test").collection("user_profiles");
		console.log(`Listening at ${server_ip}:${https_port}`)
	} catch (e) {
		console.error(e);
	}
});
