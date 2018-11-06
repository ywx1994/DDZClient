cc.Class({
    extends: cc.Component,

    properties: {
        headImg: cc.Sprite,
        houseMasterMark: cc.Sprite,
        winnerMark: cc.Sprite,
        tyrantMark: cc.SpriteFrame,
        nameLabel: cc.Label,
        IDLabel: cc.Label,
        scoreLabel: cc.Label
    },

    initWithData(playerInfo, data) {
        cc.loader.load({url: playerInfo.avatarUrl, type: 'jpg'}, (err, tex) => {
            //cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
            let oldWidth = this.headImg.node.width;
            this.headImg.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImg.node.width;
            this.headImg.node.scale = oldWidth / newWidth;
        });
        this.nameLabel.string = decodeURI(playerInfo.nickName);
        this.IDLabel.string = playerInfo.accountID;
        this.scoreLabel.string = playerInfo.score;
        if (playerInfo.accountID === data.houseMasterID) {
            this.houseMasterMark.node.active = true;
        }
        console.log(playerInfo.score + ":" + data.bigWinnerScore + ":" + data.tyrantScore);
        if (playerInfo.score === Number(data.bigWinnerScore)) {
            console.log('出现大赢家图片')
            this.winnerMark.node.active = true;
            return;
        }
        if (playerInfo.score === Number(data.tyrantScore) && data.tyrantScore !== undefined) {
            console.log("土豪的标志该出现了")
            this.winnerMark.node.active = true;
            this.winnerMark.spriteFrame = this.tyrantMark;
        }
    }

});
