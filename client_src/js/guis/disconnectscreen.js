const SSM = require('../sprites/spritesheetmanager.js');

class DisconnectScreen {
    draw() {
        SSM.clearScreen(SSM.palette.menu_background_color);
        SSM.viewport.context.save();
        SSM.setDefaultFont(30);
        SSM.viewport.context.fillText("No wizards here...",SSM.viewport.camera.width/2, SSM.viewport.camera.height/2);
        SSM.viewport.context.restore();
    }
}

module.exports = new DisconnectScreen();
