class SpriteSheetProfile {
    #_width;
    #_height;
    #_offset_x;
    #_offset_y;
    #_cols;
    #_rows;
    #_filename;

    constructor(filename, width, height, offset_x, offset_y, rows, cols) {
        this.#_width = width;
        this.#_height =  height;
        this.#_offset_x = offset_x;
        this.#_offset_y = offset_y;
        this.#_cols = cols;
        this.#_rows = rows
        this.#_filename = filename;
    }

    get width() {
        return this.#_width;
    }
    get height() {
        return this.#_height;
    }
    get offset_x() {
        return this.#_offset_x;
    }
    get offset_y() {
        return this.#_offset_y;
    }
    get cols() {
        return this.#_cols;
    }
    get rows() {
        return this.#_rows;
    }
    get filename() {
        return this.#_filename;
    }
}

module.exports = SpriteSheetProfile;
