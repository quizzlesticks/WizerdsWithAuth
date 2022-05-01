const AnimationProfiles = {
    CharacterProfiles: {
        RedRidingHood: {
            Move: {
                id: "RedRidingHoodMove",
                filename: "/Spritesheets/RedRidingHoodMovement.png",
                sprite_width: 34,
                sprite_height: 34,
                sprite_columns: 8,
                sprite_rows: 1,
                offset_x: 0,
                offset_y: 0,
                default_scale: 1,
                frame_delay: 8,
                animations: {"KeyS": [0, 1],
                             "KeyD": [2, 3],
                             "KeyA": [4, 5],
                             "KeyW": [6, 7]},
                centering: true
            },
            Attack: {
                id: "RedRidingHoodAttack",
                filename: "/Spritesheets/RedRidingHoodAttack.png",
                sprite_width: 46,
                sprite_height: 34,
                sprite_columns: 2,
                sprite_rows: 4,
                offset_x: 0,
                offset_y: 0,
                default_scale: 1,
                frame_delay: 8,
                animations: {"KeyS": [0, 1],
                             "KeyD": [2, 3],
                             "KeyA": [4, 5],
                             "KeyW": [6, 7]},
                centering: true
            },
            Idle: {
                id: "RedRidingHoodIdle",
                filename: "/Spritesheets/RedRidingHoodMovement.png",
                sprite_width: 34,
                sprite_height: 34,
                sprite_columns: 8,
                sprite_rows: 1,
                offset_x: 0,
                offset_y: 0,
                default_scale: 1,
                frame_delay: 8,
                animations: {"KeyS": [0],
                             "KeyD": [2],
                             "KeyA": [4],
                             "KeyW": [6]},
                centering: true
            }
        },

        SciGuy: {
            Move: {
                id: "SciGuyMove",
                filename: "/Spritesheets/SciGuyMovement.png",
                sprite_width: 34,
                sprite_height: 34,
                sprite_columns: 3,
                sprite_rows: 4,
                offset_x: 0,
                offset_y: 0,
                default_scale: 1,
                frame_delay: 8,
                animations: {"KeyS": [1, 2],
                             "KeyD": [4, 5],
                             "KeyA": [7, 8],
                             "KeyW": [10, 11]},
                centering: true
            },
            Attack: {
                id: "SciGuyAttack",
                filename: "/Spritesheets/SciGuyAttack.png",
                sprite_width: 34,
                sprite_height: 34,
                sprite_columns: 2,
                sprite_rows: 4,
                offset_x: 0,
                offset_y: 0,
                default_scale: 1,
                frame_delay: 8,
                animations: {"KeyS": [0, 1],
                             "KeyD": [2, 3],
                             "KeyA": [4, 5],
                             "KeyW": [6, 7]},
                centering: true
            },
            Idle: {
                id: "SciGuyIdle",
                sprite_width: 34,
                sprite_height: 34,
                sprite_columns: 3,
                sprite_rows: 4,
                offset_x: 0,
                offset_y: 0,
                default_scale: 1,
                frame_delay: 8,
                filename: "/Spritesheets/SciGuyMovement.png",
                animations: {"KeyS": [0],
                              "KeyD": [1],
                              "KeyA": [2],
                              "KeyW": [9]},
                centering: true
            }
        }
    },

    PortalProfiles: {
        NexusMap: {
            id: "NexusMapPortal",
            sprite_width: 12,
            sprite_height: 30,
            sprite_columns: 1,
            sprite_rows: 6,
            offset_x: 0,
            offset_y: 0,
            default_scale: 2,
            frame_delay: 8,
            filename: "Spritesheets/portal.png",
            animations: {"Normal": [0, 1, 2, 3],
                         "Blinking": [0, 4, 2, 5]},
            centering: true
        },

        RealmMap: {
            id: "RealmMapPortal",
            sprite_width: 12,
            sprite_height: 30,
            sprite_columns: 1,
            sprite_rows: 6,
            offset_x: 0,
            offset_y: 0,
            default_scale: 2,
            frame_delay: 8,
            filename: "Spritesheets/portal.png",
            animations: {"Normal": [0, 1, 2, 3],
                         "Blinking": [0, 4, 2, 5]},
            centering: true
        }
    },

    PlayerBulletProfiles: {
        BlueBullet: {
            id: "BlueBullet",
            sprite_width: 34,
            sprite_height: 18,
            sprite_columns: 4,
            sprite_rows: 1,
            offset_x: 0,
            offset_y: 0,
            frame_delay: 3,
            default_scale: 1,
            filename: "/Spritesheets/BlueBullet.png",
            animation: [0, 1, 2, 3],
            centering: true
        }
    },

    EnemyProfiles: {
        BlueSlime: {
            Move: {
                id: "BlueSlimeMove",
                filename: "/Spritesheets/BlueSlimeMove.png",
                sprite_width: 32,
                sprite_height: 27,
                sprite_columns: 4,
                sprite_rows: 4,
                offset_x: 0,
                offset_y: 0,
                default_scale: 1,
                frame_delay: 8,
                animations: {"KeyS": [0, 1, 2, 3],
                             "KeyA": [4, 5, 6, 7],
                             "KeyD": [8, 9, 10, 11],
                             "KeyW": [12, 13, 14, 15]}
            },
            Attack: {
                id: "BlueSlimeAttack",
                filename: "/Spritesheets/BlueSlimeIdle.png",
                sprite_width: 32,
                sprite_height: 27,
                sprite_columns: 2,
                sprite_rows: 4,
                offset_x: 0,
                offset_y: 0,
                default_scale: 1,
                frame_delay: 3,
                animations: {"KeyS": [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
                              "KeyA": [2, 3, 2, 3, 2, 3, 2, 3, 3, 3, 3, 3, 3],
                              "KeyD": [4, 5, 4, 5, 4, 5, 4, 5, 5, 5, 5, 5, 5],
                              "KeyW": [6, 7, 6, 7, 6, 7, 6, 7, 7, 7, 7, 7, 7]}
            },
            Idle: {
                id: "BlueSlimeIdle",
                sprite_width: 32,
                sprite_height: 27,
                sprite_columns: 2,
                sprite_rows: 4,
                default_scale: 1,
                offset_x: 0,
                offset_y: 0,
                frame_delay: 16,
                filename: "/Spritesheets/BlueSlimeIdle.png",
                animations: {"KeyS": [0, 1],
                             "KeyA": [2, 3],
                             "KeyD": [4, 5],
                             "KeyW": [6, 7]}
            }
        }
    }
}

module.exports = AnimationProfiles;
