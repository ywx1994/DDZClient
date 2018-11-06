import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        callWeLabelNode: cc.Node
    },

    onLoad() {
        let labelList = this.callWeLabelNode.children;
        labelList[0].getComponent(cc.Label).string = 'DaiLiJiaMeng';
        labelList[1].getComponent(cc.Label).string = 'YouXiGuZhang';
        labelList[2].getComponent(cc.Label).string = 'TouZiHeZuo';
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case'close':
                this.node.destroy();
                break;
            default:
                break;
        }
    }
});
