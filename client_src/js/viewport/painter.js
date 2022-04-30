class Painter {
    viewport = require('../viewport/viewport.js');
    palette = require('./stylesheet.js');

    clearScreen(color) {
        this.viewport.context.fillStyle = color;
        this.viewport.context.fillRect(0,0,this.viewport.camera.width,this.viewport.camera.height);
    }

    setDefaultFont(size=30){
        this.viewport.context.font = size + this.palette.menu_font;
    	this.viewport.context.textAlign = "center";
        this.viewport.context.fillStyle = this.palette.menu_text_color;
        this.viewport.context.strokeStyle = this.palette.menu_text_color;
    }
}

module.exports = Painter;
