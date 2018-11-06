cc.Class({
    extends: cc.Component,

    properties: {
        loadingSprite: cc.Sprite,
        lodingSpriteAtlas: cc.SpriteAtlas
    },


    onLoad() {
        let index = 1;
        let time = 50;
        this.loadingTimer = function () {
            if (index % 16 === 0) {
                index++;
            }
            let num = index % 16;
            this.loadingSprite.spriteFrame = this.lodingSpriteAtlas.getSpriteFrame('loading_' + num);
            index++;
            time--;
            if (time <= 0) {
                this.node.destroy();
            }
        }
        this.schedule(this.loadingTimer, 0.1);
    },

    onDestroy() {
        this.unschedule(this.loadingTimer);
    }
});
