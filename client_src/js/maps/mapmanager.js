const MapProfiles = require('./mapprofiles.js');
const MapFactory = require('./mapfactory.js');
const TaskScheduler = require('../taskscheduler.js');
const MapLoadScreen = require('../guis/maploadscreen.js');
const AnimationLoopSubscribers = require('../animators/animationloopsubscribers.js');
const SocketManager = require('../socketmanager.js');
const SSM = require('../sprites/spritesheetmanager.js');

class MapManager {
	#map;
	#_profile;
	#map_rendering = false;
	#map_type;

	constructor() {
		this.loadMapAsCallback = this.loadMapAsCallback.bind(this);
		this.loadMap = this.loadMap.bind(this);
		this.draw = this.draw.bind(this);
		this.render = this.render.bind(this);
		AnimationLoopSubscribers.subscribe(this.draw, AnimationLoopSubscribers.priority_list["map_manager"]);
		AnimationLoopSubscribers.subscribe(this.render, AnimationLoopSubscribers.priority_list["map_render"]);
		SocketManager.registerModule("map_manager", this);
	}

	loadMapAsCallback(op) {
		this.loadMap(op.map_type, op.callback, op.op);
	}

	//callback is something passed by the SocketManager
	loadMap(map_type, callback, op=undefined) {
		this.#map_type = map_type;
		this.#map_rendering = false;
		this.#_profile = MapProfiles[map_type];
		if(op != undefined) {
			this.#map = new MapFactory[map_type](op);
		} else {
			this.#map = new MapFactory[map_type]();
		}
		const map_loader_ts = new TaskScheduler();
		this.#map.load(map_loader_ts);
		MapLoadScreen.start(this.#_profile.LoadScreenText, this.#_profile.TextSizeInPx, this.#_profile.tombstones, map_loader_ts, callback);
		map_loader_ts.callback = MapLoadScreen.close;
		return this.#map.getStartingPos();
	}

	draw(game_events={}) {
		//Since we draw one Game.tile_size size tile for every pixel
		//of the map we need to convert the players position to the map
		//position
		const map_pos = SSM.viewport.camera.worldToMapSpace(SSM.viewport.camera.camera_position.world_space);
		const start_map_pos = {x: Math.floor(map_pos.x) - Math.floor(SSM.viewport.camera.num_tiles_horizontal/2), y: Math.floor(map_pos.y) - Math.floor(SSM.viewport.camera.num_tiles_vertical/2)};
		SSM.viewport.context.strokeStyle = "#000000";
		for (var j = 0; j < SSM.viewport.camera.num_tiles_vertical; j++) {
			for (var i = 0; i < SSM.viewport.camera.num_tiles_horizontal; i++) {
				const cur_region = this.#map.regionAtPoint(start_map_pos.x + i, start_map_pos.y + j);
				if(this.#_profile.RegionFilenames[cur_region] != undefined) {
					const np = SSM.viewport.camera.worldToScreenSpace(SSM.viewport.camera.mapToWorldSpace({x: start_map_pos.x + i, y: start_map_pos.y + j}));
					SSM.drawSprite(this.#_profile.RegionNamespace + cur_region, 0, np.x, np.y, undefined, 0, 0, false);
				} else {
					const np = SSM.viewport.camera.worldToScreenSpace(SSM.viewport.camera.mapToWorldSpace({x: start_map_pos.x + i, y: start_map_pos.y + j}));
					SSM.viewport.context.fillStyle = this.#_profile.RegionColors[cur_region];
					SSM.viewport.context.fillRect(np.x, np.y, SSM.viewport.camera.tile_size, SSM.viewport.camera.tile_size);
					SSM.viewport.context.strokeRect(np.x, np.y, SSM.viewport.camera.tile_size, SSM.viewport.camera.tile_size);
				}
			}
		}
		return game_events;
	}

	render(game_events={}) {
		if (this.#map_type == "RealmMap") {
			if (game_events.misc_key_states.KeyM == 1) {
				delete(game_events.misc_key_states.KeyM);
				this.#map_rendering = !this.#map_rendering;
			}
			if (this.#map_rendering) {
				this.#map.render(game_events.player_pos);
			}
		}
	}
}

module.exports = new MapManager();
