import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        cardsNode: cc.Node,
        cardPrefab: cc.Prefab
    },

    onLoad() {
        let move = cc.moveBy(1, 0, 230);
        this.cardsNode.runAction(move);

        //接收nnGamingUI发出的亮牌通知
        cc.systemEvent.on('destroy_rubCardPrefab', () => {
            this.onButtonClick(null, 'close');
        });
    },

    initWithData(data) {
        console.log('。。。。。。。搓牌：' + JSON.stringify(data));
        for (let i = data.length - 1; i >= 0; i--) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.cardsNode;
            card.scale = 1.4;
            card.getComponent('card').showCard(data[i], null, 'NN');
        }
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                cc.systemEvent.emit('rub_card_over');
                this.node.destroy();
                break;
        }
    },

    onDestroy() {
        //当 rubCardPrefab 不存在时，就不用监听该事件
        cc.systemEvent.off('destroy_rubCardPrefab');
    }

});
