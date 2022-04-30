const SSM = require('../sprites/spritesheetmanager.js');
const CharacterManager = require('../charactermanager.js');
const SocketManager = require('../socketmanager.js');

class CharSelectGui {
    #_selected_char;
    #square_width = 200;
    #gap = 50;
    #left_edge_first_box;
    #right_edge_first_box;
    #top_edge_first_box;
    #bottom_edge_first_box;
    #left_edge_second_box;
    #right_edge_second_box;
    #top_edge_second_box;
    #bottom_edge_second_box;

    #callback;
    constructor() {
        this.draw = this.draw.bind(this);
        this.close = this.close.bind(this);

        this.#left_edge_first_box = SSM.viewport.camera.width/2-this.#square_width-this.#gap/2;
        this.#right_edge_first_box = this.#left_edge_first_box + this.#square_width;
        this.#top_edge_first_box = SSM.viewport.camera.height/2-this.#square_width/2;
        this.#bottom_edge_first_box = this.#top_edge_first_box + this.#square_width;

        this.#left_edge_second_box = SSM.viewport.camera.width/2+this.#gap/2;
        this.#right_edge_second_box = this.#left_edge_second_box + this.#square_width;
        this.#top_edge_second_box = SSM.viewport.camera.height/2-this.#square_width/2;
        this.#bottom_edge_second_box = this.#top_edge_second_box + this.#square_width;
        this.start = this.start.bind(this);
    }

    get selected_char() {
        return this.#_selected_char;
    }

    start(cb) {
        window.addEventListener("mousemove", this.draw);
        window.addEventListener("mousedown", this.draw);
        this.draw({type: '', clientX: 0, clientY: 0});
        this.#callback = cb;
    }

    draw(e) {
        var mp = SSM.viewport.camera.mouseToScreenSpace({x: e.clientX, y: e.clientY});
        if(e.type == "mousedown"){
            if(mp.x >= this.#left_edge_first_box && mp.x <= this.#right_edge_first_box && mp.y >= this.#top_edge_first_box && mp.y <= this.#bottom_edge_first_box){
                this.#_selected_char = "RedRidingHood";
                this.close();
                return;
            }
            if(mp.x >= this.#left_edge_second_box && mp.x <= this.#right_edge_second_box && mp.y >= this.#top_edge_second_box && mp.y <= this.#bottom_edge_second_box){
                this.#_selected_char = "SciGuy";
                this.close();
                return;
            }
        }
        SSM.clearScreen(SSM.palette.menu_background_color);
        SSM.viewport.context.save();
        SSM.viewport.context.strokeStyle = SSM.palette.menu_text_color;
        SSM.viewport.context.strokeRect(this.#left_edge_first_box, this.#top_edge_first_box, this.#square_width, this.#square_width);
        if(mp.x >= this.#left_edge_first_box && mp.x <= this.#right_edge_first_box && mp.y >= this.#top_edge_first_box && mp.y <= this.#bottom_edge_first_box){
                SSM.viewport.context.fillStyle = "#00ff00bb";
                SSM.viewport.context.fillRect(this.#left_edge_first_box, this.#top_edge_first_box, this.#square_width, this.#square_width);
        }
        SSM.viewport.context.strokeRect(this.#left_edge_second_box,this.#top_edge_second_box, this.#square_width, this.#square_width);
        if(mp.x >= this.#left_edge_second_box && mp.x <= this.#right_edge_second_box && mp.y >= this.#top_edge_second_box && mp.y <= this.#bottom_edge_second_box){
                SSM.viewport.context.fillStyle = "#00ff00bb";
                SSM.viewport.context.fillRect(this.#left_edge_second_box, this.#top_edge_second_box, this.#square_width, this.#square_width);
        }
        SSM.setDefaultFont(30);
    	SSM.viewport.context.fillText("RRH",SSM.viewport.camera.width/2-this.#square_width/2-this.#gap/2, SSM.viewport.camera.height/2);
        SSM.viewport.context.fillText("SG",SSM.viewport.camera.width/2+this.#square_width/2+this.#gap/2, SSM.viewport.camera.height/2);
        SSM.viewport.context.fillText("Wizards keep that thang on them.",SSM.viewport.camera.width/2, 200);
        SSM.viewport.context.restore();
    }

    close() {
        window.removeEventListener("mousemove", this.draw);
        window.removeEventListener("mousedown", this.draw);
		CharacterManager.addPlayerCharacter(this.#_selected_char);
	    SocketManager.sendCharSelect(this.#_selected_char, CharacterManager.player.position, {state: "idle", key: "KeyS"});
	    this.#callback();
    }
}

module.exports = new CharSelectGui();
