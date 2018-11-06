import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        nickName1:cc.Label,
        nickName2:cc.Label,
        headImg1:cc.Sprite,
        headImg2:cc.Sprite,
        card:cc.Prefab,
        compareStartImg1:cc.Node,
        compareStartImg2:cc.Node,
        cardsLayout1:cc.Node,
        cardsLayout2:cc.Node,
        imgWin1:cc.Node,
        imgWin2:cc.Node,
        imgLose1:cc.Node,
        imgLose2:cc.Node
    },

    onLoad () {
        this.cardList1 = [];
        this.cardList2 = [];
        for (let i = 0; i < 3; i++) {
            let card = cc.instantiate(this.card);
            card.parent = this.cardsLayout1;
            this.cardList1.push(card);
        }
        for (let i = 0; i < 3; i++) {
            let card = cc.instantiate(this.card);
            card.parent = this.cardsLayout2;
            this.cardList2.push(card);
        }
    },

    start () {

    },
    initWithData(data){
        this.nickName1.string = decodeURI(data[0].nickName);
        this.nickName2.string = decodeURI(data[1].nickName);
        cc.loader.load({url:data[0].avatarUrl,type:'png'}, (err, tex)=> {
            cc.log('sss'+(tex instanceof cc.Texture2D));
            this.headImg1.spriteFrame =new cc.SpriteFrame(tex);
        });
        cc.loader.load({url:data[1].avatarUrl,type:'png'}, (err, tex)=> {
            cc.log('sss'+(tex instanceof cc.Texture2D));
            this.headImg2.spriteFrame =new cc.SpriteFrame(tex);
        });
        for (let i = 0; i < data[0].cards.length; i++) {
            this.cardList1[i].getComponent('card').showPSZCard(data[0].cards[i]);
        }
        for (let i = 0; i < data[1].cards.length; i++) {
            this.cardList2[i].getComponent('card').showPSZCard(data[1].cards[i]);
        }
        this.compareStartImg1.runAction(cc.moveBy(1,1920,0));
        this.compareStartImg2.runAction(cc.moveBy(1,-1920,0));
        let time = 5;
        this.callback = function () {
            time -= 1;
            if (time === 3) {
                cc.audioEngine.play(cc.url.raw(global.pszMusicUrl+'compareEffect.mp3'),false,global.playVolume);
                if (data[0].result) {
                    this.imgWin1.active = true;
                    this.imgLose2.active = true;
                }else {
                    this.imgWin2.active = true;
                    this.imgLose1.active = true;
                }
            }
            if (time<1){
                this.node.destroy();
            }
        };
        this.schedule(this.callback,1);
    },

    // update (dt) {},
});
