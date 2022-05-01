const MapProfiles = require('../../../client_src/js/maps/mapprofiles.js');
const MapFactory = require('./mapfactory_server.js');
const { v4: uuidv4 } = require('uuid');

class MapManager {

	#nexus_profile = {map_type: "NexusMap", upid: '0', pos: {x: 0, y: 0}, lifetime: 0, op: undefined};

	//Realm list has keys of UPID and holds the actual map
	#number_of_realms = 0;
	#realm_maps = {};

	//Master list has keys of UPID and holds the portal profile for all possible maps
	#master_list = {};
	//Since master list is namespaced checking for UUIDs would become complex
	//Therefore we store them here.
	//With a small benchmark it was found that using an object and checking
	//for keys is faster than an array and includes() (atleast with Chrome)
	#upid_list = {};

	constructor() {
		this.initializeMasterListNamespace();
		this.addProfile(this.#nexus_profile);
		this.generateNewRealm();
		this.generateNewRealm();
		this.generateNewRealm();
	}

	get realm_portals() {
		return this.#master_list["RealmMap"];
	}

	get nexus_portal() {
		return this.#master_list["NexusMap"]['0'];
	}

	get number_of_realms() {
		return this.#number_of_realms;
	}

	getPermenantPortalsFromUPID(upid) {
		if(!(upid in this.#upid_list)) {
			return undefined;
		} else {
			let map_type = this.#upid_list[upid];
			let portal_list = [];
			if(map_type == "NexusMap") {
				for (let i in this.#master_list["RealmMap"]) {
					portal_list.push(this.#master_list["RealmMap"][i]);
				}
			} else if(map_type == "RealmMap") {
				let spawns = this.#realm_maps[upid].spawns;
				for (let i = 0; i < spawns.length; i++) {
					portal_list.push({map_type: "NexusMap", upid: '0', pos: {x: spawns[i].x, y: spawns[i].y}, lifetime: 0, op: undefined});
				}
			}
			return portal_list;
		}
	}

	getProfileFromUPID(upid) {
		if(!(upid in this.#upid_list)) {
			return this.nexus_portal;
		} else {
			return this.#master_list[this.#upid_list[upid]][upid];
		}

	}

	initializeMasterListNamespace() {
		for(let i in MapProfiles) {
			this.#master_list[MapProfiles[i].RegionNamespace] = {};
		}
	}

	addProfile(profile) {
		this.#master_list[profile.map_type][profile.upid] = profile;
		this.#upid_list[profile.upid] = profile.map_type;
	}

	removeProfile(profile) {
		delete(this.#master_list[profile.map_type][profile.upid]);
		delete(this.#upid_list[upid]);
	}

	removeProfileByUPID(upid) {
		this.removeProfile({map_type: this.#upid_list[upid], upid: upid});
	}

	generateNewRealm() {
		let upid = this.getUPID("RealmMap");
		let realm_profile = {map_type: "RealmMap", upid: upid, pos: {x: 2*this.#number_of_realms++, y: -2}, lifetime: 0, op: {seed: upid}};
		this.addProfile(realm_profile);
		this.#realm_maps[upid] = new MapFactory["RealmMap"](realm_profile.op);
	}

	getUPID(map_type) {
		let upid = uuidv4();
		while(1) {
			if(upid in this.#upid_list) {
				upid = uuidv4();
			} else {
				break;
			}
		}
		return upid;
	}
}

module.exports = new MapManager();
