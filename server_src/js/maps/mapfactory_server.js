const RealmMap = require('./realmmap_server.js');
const NexusMap = require('./nexusmap_server.js');

const MapFactory = {
    RealmMap: RealmMap,
    NexusMap: NexusMap
};

module.exports = MapFactory;
