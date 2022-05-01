const Painter = require('../viewport/painter.js');
const SpriteSheet = require('./spritesheet.js');
const SpriteSheetProfile = require('./spritesheetprofile.js');
const AnimationProfiles = require('../animators/animationprofiles.js');

class SpriteSheetManager extends Painter {
    #centering = true;
    #_SpriteSheetList = {};
    #_SpriteSheetProfileList = {};

    loadAllFromAnimationProfileNamespace(namespace, ts) {
        var keysInNamespace = Object.keys(AnimationProfiles[namespace]);
        var keysInAnimation;
        for (var i=0; i<keysInNamespace.length; i++){
            //decide if super profile with single sheet or multiple sheets
            //single sheet profiles have the filename added to them
            if(AnimationProfiles[namespace][keysInNamespace[i]].id == undefined) {
                var filename = AnimationProfiles[namespace][keysInNamespace[i]].filename;
                keysInAnimation = Object.keys(AnimationProfiles[namespace][keysInNamespace[i]]);
                for (var j=0; j<keysInAnimation.length; j++){
                    if(filename != undefined) {
                        AnimationProfiles[namespace][keysInNamespace[i]][keysInAnimation[j]].filename = filename;
                    }
                    this.loadFromProfile(AnimationProfiles[namespace][keysInNamespace[i]][keysInAnimation[j]], ts);
                }
            }
            //otherwise its a profile with a single sheet
            else {
                this.loadFromProfile(AnimationProfiles[namespace][keysInNamespace[i]], ts);
            }
        }
    }

    loadFromProfile(p,ts) {
        ts.registerTask();
        this.load(p.filename, p.id, p.sprite_width, p.sprite_height, p.offset_x, p.offset_y, p.sprite_rows, p.sprite_columns, ts.task_finish_callback);
    }

    load(filename, id, width, height, offset_x, offset_y, rows, cols, callback) {
        //No matter what readd the profile, even if it already exists it might contain some fancy redefinition or new filename pointer
        this.#_SpriteSheetProfileList[id] = new SpriteSheetProfile(filename, width, height, offset_x, offset_y, rows, cols);
        //only load filenames once
        if(Object.keys(this.#_SpriteSheetList).includes(filename)) {
            callback();
            return;
        }
        this.#_SpriteSheetList[filename] = new SpriteSheet(filename, callback);
    }

    getSheet(id) {
        return this.#_SpriteSheetList[this.#_SpriteSheetProfileList[id].filename];
    }

    drawSprite(id, index, dx, dy, rotation=undefined, dWidth = 0, dHeight = 0, centering_override = undefined) {
        const cur = this.#_SpriteSheetProfileList[id];
        if(centering_override != undefined) {
            this.#centering = centering_override;
        } else if(this.#_SpriteSheetProfileList[id].centering != undefined) {
            this.#centering = this.#_SpriteSheetProfileList[id].centering;
        } else {
            this.#centering = true;
        }
        const curImg = this.#_SpriteSheetList[cur.filename];
        if(index >= cur.cols*cur.rows){
            throw new Error("Requested unobtainable sprite.");
        }
        if(!dHeight && dWidth){
            //If only one scaling attribute is given take it as a scaling value
            dHeight = Math.round(cur.height * dWidth);
            dWidth = Math.round(cur.width * dWidth);
        } else {
            if(!dWidth){
                dWidth = cur.width;
            }
            if(!dHeight){
                dHeight = cur.height;
            }
        }
        if(rotation) {
            //we must move to the center of what we are drawing,
            //rotate
            //move back to 0,0
            //draw
            //reset context so future things don't draw weird

            //start by saving ctx so we can reset
            this.viewport.context.save();
            //get the center of the image to draw
            if(this.#centering) {
                this.viewport.context.translate(dx, dy);
            } else {
                this.viewport.context.translate(dx, dy + dHeight/2);
            }
            //rotate
            this.viewport.context.rotate(rotation);
            //move back for draws
            if(this.#centering) {
                this.viewport.context.translate( -dx, -dy);
            } else {
                this.viewport.context.translate(-dx, -(dy + dHeight/2));
            }
            //draw it
            if(this.#centering) {;
                this.viewport.context.drawImage(curImg.img, (index%cur.cols)*cur.width+cur.offset_x, Math.floor(index/cur.cols)*cur.height+cur.offset_y, cur.width, cur.height, dx-dWidth/2, dy-dHeight/2, dWidth, dHeight);
            } else {
                this.viewport.context.drawImage(curImg.img, (index%cur.cols)*cur.width+cur.offset_x, Math.floor(index/cur.cols)*cur.height+cur.offset_y, cur.width, cur.height, dx, dy, dWidth, dHeight);
            }
            //reset
            this.viewport.context.restore();
        } else {
            if(this.centering) {
                this.viewport.context.drawImage(curImg.img, (index%cur.cols)*cur.width+cur.offset_x, Math.floor(index/cur.cols)*cur.height+cur.offset_y, cur.width, cur.height, dx-dWidth/2, dy-dHeight/2, dWidth, dHeight);
            } else {
                this.viewport.context.drawImage(curImg.img, (index%cur.cols)*cur.width+cur.offset_x, Math.floor(index/cur.cols)*cur.height+cur.offset_y, cur.width, cur.height, dx, dy, dWidth, dHeight);
            }
        }
    }

    get centering() {
        return this.#centering;
    }

    set centering(c) {
        this.#centering = c;
    }
}

module.exports = new SpriteSheetManager();
