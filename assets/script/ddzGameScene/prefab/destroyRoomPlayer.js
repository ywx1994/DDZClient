cc.Class({
    extends: cc.Component,

    properties: {
        headImg: cc.Sprite,
        nickName: cc.Label,
        choice: cc.Node
    },
    onLoad() {
        this.accountID = -1;
        this.choiceList = this.choice.children;
        this.node.on('choose', (event) => {     //chooseDestroyRoom发出的
            let data = event.detail;
            // console.log(JSON.stringify(data));
            if (data.accountID === this.accountID) {
                for (let i = 0; i < this.choiceList.length; i++) {
                    this.choiceList[i].active = (i === data.choice);
                }
            }
        });
    },
    initWithData(data) {
        this.accountID = data.accountID;
        cc.loader.load({url: data.avatarUrl, type: 'png'}, (err, tex) => {
            // cc.log('sss' + (tex instanceof cc.Texture2D));
            this.headImg.spriteFrame = new cc.SpriteFrame(tex);
            this.headImg.node.scale = 0.85;
        });
        this.nickName.string = decodeURI(data.nickName);
    }
});
