class Window {
    #width = 1000;
    #height = 800;
    #side_gui_width = 250;
    #player_space;

    #tile_size = 64;
    #num_tiles_horizontal;
    #num_tiles_vertical;

    #debug = false;

    constructor() {
        this.#player_space = {width: this.#width-this.#side_gui_width, height: this.#height};
        this.#num_tiles_horizontal = Math.ceil(this.#width/this.#tile_size)+4;
        if(this.#num_tiles_horizontal%2==0) {this.#num_tiles_horizontal += 1;}
        this.#num_tiles_vertical = Math.ceil(this.#height/this.#tile_size)+2;
        if(this.#num_tiles_vertical%2==0) {this.#num_tiles_vertical += 1;}
    }

    get debug() {
        return this.#debug;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get side_gui_width() {
        return this.#side_gui_width;
    }

    get player_space() {
        return this.#player_space;
    }

    get tile_size() {
        return this.#tile_size;
    }

    get num_tiles_horizontal() {
        return this.#num_tiles_horizontal;
    }

    get num_tiles_vertical() {
        return this.#num_tiles_vertical;
    }
}

module.exports = Window
