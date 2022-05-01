const MapProfiles = require('../../../client_src/js/maps/mapprofiles.js');

class NexusManager {
    #_profile_name = "NexusMap";
    #_profile;

    constructor() {
        this.#_profile = MapProfiles[this.#_profile_name];
    }
}

module.exports = NexusManager;
