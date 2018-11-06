import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        actionSprite: cc.Sprite,
        actionChatSpriteAtlas: cc.SpriteAtlas
    },

    initWithData(actionName) {
        this.actionSprite.spriteFrame = this.actionChatSpriteAtlas.getSpriteFrame(actionName + 0);
    },

    changeImage(actionName,sex) {
        let len = 0;
        if (actionName === 'grenade' || actionName === 'flower') {
            len = 9;
        }
        if (actionName === 'cheers') {
            len = 6;
        }
        if (actionName === 'kiss') {
            len = 7;
        }

        let i = 0;
        this.runActionTimer = function () {
            if (i > len) {
                this.node.destroy();
            }
            this.actionSprite.spriteFrame = this.actionChatSpriteAtlas.getSpriteFrame(actionName + i);
            if (i === 3){
                this.playMusic(global.nnMusicList['e_' + actionName],sex);
            }
            i++;
        }
        this.schedule(this.runActionTimer, 0.25);
    },

    playMusic(url, sex) {
        cc.audioEngine.play(cc.url.raw(global.nnMusicUrl + 'sex' + sex + url), false, global.playVolume);
    },

    onDestroy() {
        this.unschedule(this.runActionTimer);
    },
});
