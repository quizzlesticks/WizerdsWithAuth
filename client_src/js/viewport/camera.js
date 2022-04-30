const Window = require('./window.js');
const DiagonalZoner = require('./diagonalzoner.js');

class Camera extends Window {
    camera_position = {world_space: {x: 0, y: 0},
                        screen_space: {x: undefined, y: undefined}}
    #_diagonal_zoner;

    constructor() {
        super();
        this.camera_position.screen_space = {x: this.player_space.width/2, y: this.player_space.height/2};
        this.#_diagonal_zoner = new DiagonalZoner(this.player_space.width, this.player_space.height, this.camera_position.screen_space);
    }

    findDiagonalZone(p, inverse) {
        return this.#_diagonal_zoner.findDiagonalZone(p,inverse);
    }

    mouseToScreenSpace(pos) {
        var rect = document.getElementById('canvas').getBoundingClientRect();
        return {x: pos.x - rect.left, y: pos.y - rect.top};
    }

    worldToScreenSpace(pos) {
        return {x: this.camera_position.screen_space.x + (pos.x - this.camera_position.world_space.x), y: this.camera_position.screen_space.y + (pos.y - this.camera_position.world_space.y)};
    }

    screenToWorldSpace(pos) {
        return {x: this.camera_position.world_space.x + (pos.x - this.camera_position.screen_space.x), y: this.camera_position.world_space.y + (pos.y - this.camera_position.screen_space.y)};
    }

    worldToMapSpace(pos) {
        return {x: pos.x/this.tile_size, y: pos.y/this.tile_size};
    }

    mapToWorldSpace(pos) {
        return {x: pos.x*this.tile_size, y: pos.y*this.tile_size};
    }

    mouseTangent(mouse_pos) {
        //rotate uses radians so use radians
        //Math.atan2 also returns the angle in radians :o perfect
        //atan2 uses (0,0) as a center so center the mouse to camera_position
        const x = mouse_pos.x - this.camera_position.screen_space.x;
        const y = mouse_pos.y - this.camera_position.screen_space.y;
        return Math.atan2(y,x);
    }

    checkCollision(rect1, rect2) {
        if (rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top) {
                return true;
        }
        return false;
    }

}

module.exports = new Camera();
