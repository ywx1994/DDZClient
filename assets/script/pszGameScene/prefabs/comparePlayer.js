import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        nickName:cc.Label,
        headImg:cc.Sprite
    },

    onButtonClick(event,customData){
      switch (customData) {
          case 'choose':
              global.gameService.proxy.compareCards(this.seatIndex);
              this.node.parent.parent.destroy();
              break;
      }
    },
    initWithData(data){
        this.seatIndex = data.seatIndex;
        this.nickName.string = decodeURI(data.nickName);
        cc.loader.load({url:data.avatarUrl,type:'png'}, (err, tex)=> {
            let oldWidth = this.headImg.node.width;
            this.headImg.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImg.node.width;
            this.headImg.node.scale = oldWidth / newWidth;
        });
    },
});
