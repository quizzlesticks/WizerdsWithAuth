const PortalAnimator = require('../animators/portalanimator.js');
const AnimationProfiles = require('../animators/animationprofiles.js');
const PoolProfiles = require('./poolprofiles.js');
const SocketManager = require('../socketmanager.js');
const AnimationLoopSubscribers = require('../animators/animationloopsubscribers');

class PortalPool {
    #pool = [];

    constructor() {
        for (var i = 0; i < PoolProfiles.Portals.pool_size; i++) {
            this.#pool.push(new PortalAnimator("NexusMap"));
        }
        this.addPortal = this.addPortal.bind(this);
        this.addPermPortals = this.addPermPortals.bind(this);
        this.drawAndCheck = this.drawAndCheck.bind(this);
        SocketManager.registerModule("portal_manager", this);
        AnimationLoopSubscribers.subscribe(this.drawAndCheck, AnimationLoopSubscribers.priority_list["portal_manager"]);
    }

    addPortal(map_type, upid, pos, lifetime) {
        //find an unused portal
        var found_portal = false;
        for (var i = 0; i < PoolProfiles.Portals.pool_size; i++) {
            if(!this.#pool[i].active) {
                this.#pool[i].activate(AnimationProfiles.PortalProfiles[map_type], upid, pos, lifetime);
                found_portal = true;
                break;
            }
        }
        if(!found_portal) {
            this.#pool.push(new PortalAnimator("NexusMap"));
            this.#pool[this.#pool.length-1].activate(AnimationProfiles.PortalProfiles[map_type], upid, pos, lifetime);
            PoolProfiles.Portal.pool_size++;
        }
    }

    addPermPortals(portals) {
        for(let i = 0; i < portals.length; i++) {
            this.addPortal(portals[i].map_type, portals[i].upid, portals[i].pos, portals[i].lifetime);
        }
    }

    killAllPortals() {
        for (var i = 0; i < PoolProfiles.Portals.pool_size; i++) {
            if(this.#pool[i].active) {
                this.#pool[i].deactivate();
            }
        }
    }

    drawAndCheck(game_events={}) {
        if(game_events.misc_key_states.KeyF==1) {
            delete(game_events.misc_key_states.KeyF);
            SocketManager.sendEnterPortal('0');
            this.killAllPortals();
        }
        for (var i = 0; i < PoolProfiles.Portals.pool_size; i++) {
            if(this.#pool[i].active) {
                this.#pool[i].update();
                if(game_events.misc_key_states.KeyR == 1 && this.#pool[i].checkCollision(game_events.player_rect)) {
                    delete(game_events.misc_key_states.KeyR);
                    SocketManager.sendEnterPortal(this.#pool[i].upid);
                    this.killAllPortals();
                }
            }
        }
        return game_events;
    }
}

module.exports = new PortalPool();
