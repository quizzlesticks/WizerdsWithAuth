const MapProfiles = require('./mapprofiles.js');
const SSM = require('../sprites/spritesheetmanager.js');

class NexusManager {
    #_profile_name = "NexusMap";
    #_profile;

    constructor() {
        this.#_profile = MapProfiles[this.#_profile_name];
    }

    load(ts) {
        for(var i = 0; i < this.#_profile.RegionFilenames.length; i++) {
            if(this.#_profile.RegionFilenames[i] != undefined) {
                ts.registerTask();
                SSM.load(this.#_profile.RegionFilenames[i], this.#_profile.RegionNamespace + i, SSM.viewport.camera.tile_size, SSM.viewport.camera.tile_size, 0, 0, 1, 1, ts.task_finish_callback);
            }
        }
    }

    getStartingPos() {
        return {x: 0, y: 0};
    }

    regionAtPoint(x,y) {
        if(Math.abs(x) > 6 || Math.abs(y) > 5) {
            return this.#_profile.RegionDescriptors.deepocean;
        } else if(Math.abs(x) > 5 || Math.abs(y) > 4) {
            return this.#_profile.RegionDescriptors.ocean;
        } else {
            return this.#_profile.RegionDescriptors.marble_floor;
        }
    }
}

module.exports = NexusManager;
