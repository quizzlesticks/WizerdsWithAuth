const TaskScheduler = require('./taskscheduler.js');
const SSM = require('./sprites/spritesheetmanager.js');
const SocketManager = require('./socketmanager.js');
const DisconnectScreen = require('./guis/disconnectscreen.js');
const AuthGUI = require('./guis/authgui.js');
const CharSelectGUI = require('./guis/charselectgui.js');
const BlueSlimePool = require('./pools/blueslimepool.js');
const AnimationLoopSubscribers = require('./animators/animationloopsubscribers.js');
const MapManager = require('./maps/mapmanager.js');
const ItemGui = require('./guis/itemgui.js');
const PortalPool = require('./pools/portalpool.js');

class GameManager {

    #_debug = false;

    constructor(gui_width=250, smoothing=false) {
        this.start = this.start.bind(this);
        this.loop = this.loop.bind(this);
        SocketManager.registerModule("game", this);
    }

    general_sprites_ts = new TaskScheduler();
    auth_gui_ts = new TaskScheduler();
    char_select_ts = new TaskScheduler();

    start() {
        this.general_sprites_ts.reset();
        this.auth_gui_ts.reset();
        this.char_select_ts.reset();
        SSM.loadAllFromAnimationProfileNamespace("CharacterProfiles", this.general_sprites_ts);
        SSM.loadAllFromAnimationProfileNamespace("PlayerBulletProfiles", this.general_sprites_ts);
        SSM.loadAllFromAnimationProfileNamespace("PortalProfiles", this.general_sprites_ts);
        SSM.loadAllFromAnimationProfileNamespace("EnemyProfiles", this.general_sprites_ts);
        SSM.loadFromProfile({filename: "/Spritesheets/bow_test.png", id: "bow", sprite_width: 34, sprite_height: 34, offset_x: 0, offset_y: 0, sprite_rows: 1, sprite_columns: 1}, this.general_sprites_ts);

        this.auth_gui_ts.registerTask();
        this.char_select_ts.registerTask();
        this.general_sprites_ts.setCallback((AuthGUI.start), this.auth_gui_ts.task_finish_callback);
        this.auth_gui_ts.setCallback(CharSelectGUI.start, this.char_select_ts.task_finish_callback);
        this.char_select_ts.setCallback(SocketManager.sendEnterPortal, "0");
    }

    //misc_key_states has a key of "KeyR" or something
    //the value for the key is 0 - not pressing, 1 - just pressed, 2 - sustained press
    game_events = {misc_key_states: {}, player_pos: {x: 0, y: 0}};

    loop() {
        SSM.clearScreen("red");
        for (var i = 0; i < AnimationLoopSubscribers.list.length; i++) {
            if(AnimationLoopSubscribers.list[i] == undefined) continue;
            for(var j = 0; j < AnimationLoopSubscribers.list[i].length; j++) {
                this.game_events = AnimationLoopSubscribers.list[i][j](this.game_events);
            }
        }
        SSM.drawSprite("bow",0,SSM.viewport.camera.player_space.width+50,600,0);
        SSM.drawSprite("bow",0,SSM.viewport.camera.player_space.width+50+50,600,0);
        SSM.drawSprite("bow",0,SSM.viewport.camera.player_space.width+50+100,600,0);
        SSM.drawSprite("bow",0,SSM.viewport.camera.player_space.width+50+150,600,0);
        SSM.viewport.last_animation_request = window.requestAnimationFrame(this.loop);
    }

    handleDisconnect(){
        window.cancelAnimationFrame(SSM.viewport.last_animation_request);
        DisconnectScreen.draw();
    }

    set debug(d) {
        this.#_debug = d;
    }

    get debug() {
        return this.#_debug;
    }
}

module.exports = new GameManager();
