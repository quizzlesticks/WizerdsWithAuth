const SSM = require('../sprites/spritesheetmanager.js')

class MapLoadScreen {

    #map_name;
    #font_size;
    #tombs;

    #callback;

    #display_length = 1000;

    #inner_rect_color = "#160614";
    #empty_tomb_color = "#343434";
    #filled_tomb_color = "#838383";
    #tomb_outline_color = "#000000"
    #tomb_lines_color = '#5a4308';

    #inner_rect_left_edge;
    #inner_rect_top_edge;
    #inner_rect_width;
    #inner_rect_height;
    #text_x_pos;
    #text_y_pos;
    #tombstone_radius = 15;
    #tombstone_height = 18;
    #tomb_seperation = 40;
    #tomb_starting_x;
    #tomb_y;
    #tomb_lines_starting_y;
    #tomb_lines_starting_y_margin = 5;
    #tomb_lines_margin = 5;
    #tomb_lines_vertical_seperation = 5;
    #tomb_lines_thickness = 2;

    constructor() {
        this.draw = this.draw.bind(this);
        this.close = this.close.bind(this);
    }

    start(map_name, font_size, tombs, ts, callback) {
        window.cancelAnimationFrame(SSM.viewport.last_animation_request);
        this.#map_name = map_name;
        this.#font_size = font_size;
        if(tombs > 10) tombs = 10;
        if(tombs < 0) tombs = 0;
        this.#tombs = tombs;
        this.#callback = callback;
        SSM.viewport.context.font = this.#font_size + SSM.palette.menu_font;
        SSM.viewport.context.textAlign = "center";
        this.calculate_edges();
        ts.registerTask();
        window.setTimeout(ts.task_finish_callback,this.#display_length);
        SSM.viewport.last_animation_request = window.requestAnimationFrame(this.draw);
    }

    calculate_edges() {
        this.#inner_rect_left_edge = SSM.viewport.camera.width/4;
        this.#inner_rect_top_edge = SSM.viewport.camera.height/4;
        this.#inner_rect_width = SSM.viewport.camera.width/2;
        this.#inner_rect_height = SSM.viewport.camera.height/2;
        this.#text_x_pos = SSM.viewport.camera.width/2;
        this.#text_y_pos = SSM.viewport.camera.height/2;
        this.#tomb_y = this.#text_y_pos + this.#font_size;
        this.#tomb_starting_x = SSM.viewport.camera.width/2 - 9*this.#tomb_seperation/2;
        this.#tomb_lines_starting_y = this.#tomb_y + this.#tomb_lines_starting_y_margin;
    }

    #empty_tomb_path;
    #filled_tomb_path;
    #tomb_lines;
    #phase = 0;
    #freq = 4*Math.PI/3;
    #phase_divisor = 2*Math.PI/30;
    #amplitude = 1.5;
    calculate_paths() {
        this.#filled_tomb_path = new Path2D();
        this.#tomb_lines = new Path2D();
        //sin(2*pi*i*2/3 + 2*pi*phase/30)
        var x = this.#tomb_starting_x;
        var y = this.#tomb_y;
        var s = 0;
        var x_s = 0;
        for(var i = 0; i < this.#tombs; i++) {
            s = Math.sin(this.#freq*i - this.#phase_divisor*this.#phase);
            x_s = x + this.#amplitude*s;
            this.#filled_tomb_path.moveTo(x_s+this.#tombstone_radius, y);
            this.#filled_tomb_path.arc(x_s, y, this.#tombstone_radius, 0, Math.PI, true);
            this.#filled_tomb_path.lineTo(x_s-this.#tombstone_radius, y+this.#tombstone_height);
            this.#filled_tomb_path.lineTo(x_s+this.#tombstone_radius, y+this.#tombstone_height);
            this.#filled_tomb_path.lineTo(x_s+this.#tombstone_radius, y);
            x_s = x + s;
            this.#tomb_lines.moveTo(x_s - this.#tombstone_radius + this.#tomb_lines_margin, this.#tomb_lines_starting_y);
            this.#tomb_lines.lineTo(x_s + this.#tombstone_radius - this.#tomb_lines_margin, this.#tomb_lines_starting_y);
            this.#tomb_lines.moveTo(x_s - this.#tombstone_radius + this.#tomb_lines_margin, this.#tomb_lines_starting_y+this.#tomb_lines_vertical_seperation);
            this.#tomb_lines.lineTo(x_s + this.#tombstone_radius - this.#tomb_lines_margin, this.#tomb_lines_starting_y+this.#tomb_lines_vertical_seperation);
            x += this.#tomb_seperation;
        }

        this.#empty_tomb_path = new Path2D();
        for(var j = i; j < 10; j++) {
            s = Math.sin(this.#freq*j - this.#phase_divisor*this.#phase);
            x_s = x + s;
            this.#empty_tomb_path.moveTo(x_s + this.#tombstone_radius, y);
            this.#empty_tomb_path.arc(x_s, y, this.#tombstone_radius, 0, Math.PI, true);
            this.#empty_tomb_path.lineTo(x_s-this.#tombstone_radius, y+this.#tombstone_height);
            this.#empty_tomb_path.lineTo(x_s+this.#tombstone_radius, y+this.#tombstone_height);
            this.#empty_tomb_path.lineTo(x_s+this.#tombstone_radius, y);
            x_s = x + 0.9*s;
            this.#tomb_lines.moveTo(x_s - this.#tombstone_radius + this.#tomb_lines_margin, this.#tomb_lines_starting_y);
            this.#tomb_lines.lineTo(x_s + this.#tombstone_radius - this.#tomb_lines_margin, this.#tomb_lines_starting_y);
            this.#tomb_lines.moveTo(x_s - this.#tombstone_radius + this.#tomb_lines_margin, this.#tomb_lines_starting_y+this.#tomb_lines_vertical_seperation);
            this.#tomb_lines.lineTo(x_s + this.#tombstone_radius - this.#tomb_lines_margin, this.#tomb_lines_starting_y+this.#tomb_lines_vertical_seperation);
            x += this.#tomb_seperation;
        }
        this.#phase += 1;
    }

    draw() {
        //background
        SSM.viewport.context.fillStyle = SSM.palette.menu_background_color;
        SSM.viewport.context.fillRect(0,0,SSM.viewport.camera.width,SSM.viewport.camera.height);
        //inner rect
        SSM.viewport.context.fillStyle = this.#inner_rect_color;
        SSM.viewport.context.fillRect(this.#inner_rect_left_edge, this.#inner_rect_top_edge, this.#inner_rect_width, this.#inner_rect_height);
        //Text
        SSM.viewport.context.fillStyle = SSM.palette.menu_text_color;
        SSM.viewport.context.fillText(this.#map_name, this.#text_x_pos, this.#text_y_pos);
        //Tombstones
        this.calculate_paths();
        SSM.viewport.context.lineWidth = 1.0;
        SSM.viewport.context.strokeStyle = this.#tomb_outline_color;
        if(this.#tombs > 0) {
            SSM.viewport.context.fillStyle = this.#filled_tomb_color;
            SSM.viewport.context.stroke(this.#filled_tomb_path);
            SSM.viewport.context.fill(this.#filled_tomb_path);
        }
        SSM.viewport.context.fillStyle = this.#empty_tomb_color;
        SSM.viewport.context.stroke(this.#empty_tomb_path);
        SSM.viewport.context.fill(this.#empty_tomb_path);
        SSM.viewport.context.lineWidth = this.#tomb_lines_thickness;
        SSM.viewport.context.strokeStyle = this.#tomb_lines_color
        SSM.viewport.context.stroke(this.#tomb_lines);
        SSM.viewport.context.lineWidth = 1.0;
        SSM.viewport.last_animation_request = window.requestAnimationFrame(this.draw);
    }

    close() {
        window.cancelAnimationFrame(SSM.viewport.last_animation_request);
        this.#callback();
    }
}

module.exports = new MapLoadScreen();
