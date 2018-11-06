import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        headImg0:cc.Sprite,
        headImg1:cc.Sprite,
        headImg2:cc.Sprite,
        headImg3:cc.Sprite,
        headImg4:cc.Sprite,
        headImg5:cc.Sprite,
        nickName0:cc.Label,
        nickName1:cc.Label,
        nickName2:cc.Label,
        nickName3:cc.Label,
        nickName4:cc.Label,
        nickName5:cc.Label,
        money0:cc.Label,
        money1:cc.Label,
        money2:cc.Label,
        money3:cc.Label,
        money4:cc.Label,
        money5:cc.Label,
        cards0:cc.Node,
        cards1:cc.Node,
        cards2:cc.Node,
        cards3:cc.Node,
        cards4:cc.Node,
        cards5:cc.Node,
        award0:cc.Label,
        award1:cc.Label,
        award2:cc.Label,
        award3:cc.Label,
        award4:cc.Label,
        award5:cc.Label,
        cardsValue0:{default: [], type: [cc.Node]},
        cardsValue1:{default: [], type: [cc.Node]},
        cardsValue2:{default: [], type: [cc.Node]},
        cardsValue3:{default: [], type: [cc.Node]},
        cardsValue4:{default: [], type: [cc.Node]},
        cardsValue5:{default: [], type: [cc.Node]},
        cardPrefab:cc.Prefab
    },

    onLoad () {
        this.playerList = this.node.children;
        for (let i = 0; i < this.playerList.length; i ++) {
            this.playerList[i].active = false;
        }
    },

    initWithData(data){
        let time = 10;
        this.timer = function(){
            time--;
            if (time <= 0) {
                this.unschedule(this.timer);
                cc.systemEvent.emit('psz_next_round');  //pszGamingUI中接收
                this.node.destroy();
            }
        };
        this.schedule(this.timer,1);
        for (let i = 0; i < data.length; i++) {
            this.playerList[i].active = true;
            if (data[i].seatIndex === global.seatIndex) {
                if (data[i].money > 0) {
                    cc.audioEngine.play(cc.url.raw(global.pszMusicUrl+'win.mp3'),false,global.playVolume);
                }else {
                    cc.audioEngine.play(cc.url.raw(global.pszMusicUrl+'lose.mp3'),false,global.playVolume);
                }
            }
            cc.loader.load({url:data[i].avatarUrl,type:'png'}, (err, tex)=> {
                cc.log('sss'+(tex instanceof cc.Texture2D));
                this['headImg'+i].spriteFrame =new cc.SpriteFrame(tex);
            });
            this['nickName'+i].string = decodeURI(data[i].nickName);
            if (Number(data[i].money) < 0) {
                this['money'+i].string = data[i].money;
            }else {
                this['money'+i].node.color = new cc.color(255,0,0,255);
                this['money'+i].string = '+'+data[i].money;
            }
            for (let j = 0; j < data[i].cards.length; j++) {
               let card = cc.instantiate(this.cardPrefab);
               card.scale = 0.9;
               card.parent = this['cards'+i];
               card.getComponent('card').showPSZCard(data[i].cards[j]);
            }
            if (data[i].award === 0|| data[i].award) {
                this['award'+i].string = "喜钱:"+data[i].award;
            }else {
                this['award'+i].string = "";
            }
            let cardsValue = data[i].cardsValue-1 < 0? 0:data[i].cardsValue-1;
            this['cardsValue'+i][cardsValue].active = true;
        }
    },

});
