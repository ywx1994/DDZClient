import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        headImg: cc.Sprite,
        sexImg: cc.Sprite,
        nameLabel: cc.Label,
        cityLabel: cc.Label,
        createDateLabel: cc.Label,
        idLabel: cc.Label,
        ipLabel: cc.Label,
        totalGamesLabel: cc.Label,
        maleSpriteFrame: cc.SpriteFrame,
        famaleSpriteFrame: cc.SpriteFrame
    },

    onLoad() {
        cc.loader.load({url: global.playerData.avatar_url, type: 'jpg'}, (err, tex) => {
            //cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
            let oldWidth = this.headImg.node.width;
            this.headImg.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImg.node.width;
            this.headImg.node.scale = oldWidth / newWidth;
        });
        if (global.playerData.sex === 1) {
            this.sexImg.spriteFrame = this.maleSpriteFrame;
        } else {
            this.sexImg.spriteFrame = this.famaleSpriteFrame;
        }
        this.nameLabel.string = decodeURI(global.playerData.nick_name);
        this.cityLabel.string = global.playerData.city;
        this.createDateLabel.string = global.playerData.createDate.substr(0, 10);
        this.idLabel.string = 'ID: ' + global.playerData.account_id;
        this.ipLabel.string = 'IP: ' + global.playerData.loginIP;
        this.totalGamesLabel.string = '总局数: ' + global.playerData.totalGames;
    },

    start() {

    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'),false,global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            default:
                break;
        }
    },
});
