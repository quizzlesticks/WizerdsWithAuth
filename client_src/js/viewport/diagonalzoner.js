class DiagonalZoner {
    #_slope;
    #_top_b;
    #_bottom_b;

    //size of player space (i.e. win - gui)
    #_width;
    #_height;
    //camera pos in screen space
    #_x;
    #_y;

    constructor(width, height, pos) {
        this.#_x = pos.x;
        this.#_y = pos.y;
        this.#_width = width;
        this.#_height = height;
        this.#updateDiagonalZones();
    }

    #updateDiagonalZones() {
        this.#_slope = this.#_height/this.#_width;
        this.#_top_b = this.#_y - this.#_slope * this.#_x;
        this.#_bottom_b = this.#_y + this.#_slope * this.#_x - this.#_height;
    }

    #_keys = ["KeyD", "KeyS", "KeyA", "KeyW"];
    #_inverse_keys = ["KeyA", "KeyW", "KeyD", "KeyS"];
    #_cur_keys;
    //inverse is for enemies because they move toward the player
    //noninverse is for mouse because player looks toward
    findDiagonalZone(p, inverse) {
        if(inverse) {
            this.#_cur_keys = this.#_inverse_keys;
        } else {
            this.#_cur_keys = this.#_keys;
        }
        //If we are exactly on the camera return zone down
        if(p.x == this.#_x && p.y == this.#_y){
            return this.#_cur_keys[1];
        }
        //If we are under the top line (positive for canvas, in standard cartesian this is the one with negative slope and we are 'under' it)
        if(p.y >= this.#topZoningLine(p.x)) {
            //then we are in either zone 2 or 3
            //If we are under the bottom line
            if(p.y >= this.#bottomZoningLine(p.x)) {
                //We are in zone 3
                return this.#_cur_keys[1];
            } else {
                //Otherwise we must be in zone 2
                return this.#_cur_keys[2];
            }
        } else {
            //Otherwise we are in either zone 0 or 1
            //If we are under the bottom line
            if(p.y >= this.#bottomZoningLine(p.x)) {
                //We are in zone 0
                return this.#_cur_keys[0];
            } else {
                //Otherwise we are in zone 1
                return this.#_cur_keys[3];
            }
        }
    }

    #topZoningLine(x) {
        return this.#_slope*x + this.#_top_b;
    }

    #bottomZoningLine(x) {
        return this.#_height - this.#_slope*x + this.#_bottom_b;
    }
}

module.exports = DiagonalZoner;
