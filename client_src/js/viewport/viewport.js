class Viewport {
    #canvas;
    #context;
    #last_animation_request;
    #smoothing;
    #default_scale = 2;
    #camera = require('../viewport/camera.js');

    constructor() {
        this.#canvas = document.getElementById('canvas');
        this.#context = this.#canvas.getContext('2d');
        this.#canvas.width = this.#camera.width;
        this.#canvas.height = this.#camera.height;
        this.smoothing = false;
    }

    get camera() {
        return this.#camera;
    }

    get context() {
        return this.#context;
    }

    get canvas() {
        return this.#canvas;
    }

    get last_animation_request() {
        return this.#last_animation_request;
    }

    set last_animation_request(l) {
        this.#last_animation_request = l;
    }

    get smoothing() {
        return this.#context.imageSmoothingEnabled;
    }

    set smoothing(s) {
        this.#smoothing = s;
        this.#context.imageSmoothingEnabled = s;
    }

    get default_scale() {
        return this.#default_scale;
    }

    set default_scale(s) {
        this.#default_scale = s;
    }
}

module.exports = new Viewport();
