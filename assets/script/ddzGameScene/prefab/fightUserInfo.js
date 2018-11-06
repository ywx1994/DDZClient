import global from './../../global';

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


    start() {

    },

    initWithData(data) {
        this.playerInfo = data;
        cc.loader.load({url: this.playerInfo.avatarUrl, type: 'jpg'}, (err, tex) => {
            //cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
            let oldWidth = this.headImg.node.width;
            this.headImg.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImg.node.width;
            this.headImg.node.scale = oldWidth / newWidth;
        });
        if (this.playerInfo.sex === 1) {
            this.sexImg.spriteFrame = this.maleSpriteFrame;
        } else {
            this.sexImg.spriteFrame = this.famaleSpriteFrame;
        }
        this.nameLabel.string = decodeURI(this.playerInfo.nickName);
        this.cityLabel.string = this.playerInfo.city;
        this.createDateLabel.string = this.playerInfo.createDate.substr(0, 10);
        this.idLabel.string = 'ID: ' + this.playerInfo.accountID;
        this.ipLabel.string = 'IP: ' + this.playerInfo.ip;
        this.totalGamesLabel.string = '总局数: ' + this.playerInfo.totalGame;
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        if (customData === 'close') {
            this.node.destroy();
        } else {
            console.log(this.playerInfo.accountID + ' ; ' + global.playerData.account_id);
            if (this.playerInfo.accountID !== global.playerData.account_id) {
                if (global.joinRoomData.gameType === "斗地主") {

                }
                global.gameService.proxy.actionChat({
                    sendPlayerIndex: global.playerData.seatNum,
                    sendPlayerSex: global.playerData.sex,
                    receivePlayerIndex: this.playerInfo.seatIndex,
                    actionName: customData
                });
                this.node.destroy();
            }
        }
        // switch (customData) {
        //     case 'grenade'://手雷
        //         break;
        //     case 'cheers'://干杯
        //         break;
        //     case 'flower'://花
        //         break;
        //     case 'kiss'://吻
        //         break;
        //     case 'close':
        //         this.node.destroy();
        //         break;
        //     default:
        //         break;
        // }
    }
});
