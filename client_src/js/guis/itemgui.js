const SSM = require('../sprites/spritesheetmanager.js');
const AnimationLoopSubscribers = require('../animators/animationloopsubscribers.js');

class ItemGui {
    constructor() {
        this.draw = this.draw.bind(this);
        AnimationLoopSubscribers.subscribe(this.draw,AnimationLoopSubscribers.priority_list["item_gui"]);
    }

    draw(game_events={}) {
        SSM.viewport.context.save();
        SSM.viewport.context.fillStyle = "#524848d4";
        SSM.viewport.context.fillRect(SSM.viewport.camera.width - SSM.viewport.camera.side_gui_width, 0, SSM.viewport.camera.side_gui_width, SSM.viewport.camera.height);
        SSM.viewport.context.restore();
        return game_events;
    }
}

module.exports = new ItemGui();
