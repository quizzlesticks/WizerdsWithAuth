const MapProfiles = {
    PortalMap: {
        LoadScreenText: "Portal",
        TextSizeInPx: 40,
        tombstones: 2,
        RegionNamespace: "PortalMap",
        RegionDescriptors: {
            deepocean: 0, ocean: 1, beach: 2, forest: 3,
            grasslands: 4, highlands: 5, lowmountains: 6, mountain_top: 7
        },
        RegionColors: ["#6134eb", "#33ccff", "#ffff66", "#007027",
                       "#7fba25", "#cfcf1b", "#808080", "#6f627f"],
        MinimapColors: ["#6134eb", "#33ccffaa", "#ffff66aa", "#007027aa",
                       "#7fba25aa", "#cfcf1baa", "#808080aa", "#281440aa"],
        RegionFilenames: ["/Spritesheets/DeepOceanWater.png",
                          "/Spritesheets/OceanWater.png",
                          "/Spritesheets/BeachSand.png",
                          undefined,
                          undefined,
                          undefined,
                          undefined,
                          undefined]
	},

    NexusMap: {
        LoadScreenText: "Wizard Halls",
        TextSizeInPx: 40,
        tombstones: 0,
        RegionNamespace: "NexusMap",
        RegionDescriptors: {
            deepocean:0, ocean: 1, marble_floor: 2
        },
        RegionColors: ["#6134eb", "#33ccffaa", "#566d7e"],
        RegionFilenames: ["/Spritesheets/DeepOceanWater.png",
                          "/Spritesheets/OceanWater.png",
                          undefined]
    }
}

module.exports = MapProfiles;
