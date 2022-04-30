class SpriteSheet {
    #_img;

    constructor(filename, callback) {
        this.#_img = new Image();
        this.#_img.src = filename;
        this.#_img.onload = () => callback();
    }

    get img() {
        return this.#_img;
    }
}

module.exports = SpriteSheet;
