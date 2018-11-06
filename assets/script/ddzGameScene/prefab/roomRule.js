import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        wfLabel: cc.Label,
        dfLabel: cc.Label,
        fbgzLabel: cc.Label,
        fjgzLabel: cc.Label,
        tsgzLabel: cc.Label,
    },

    initWithData(data) {
        this.wfLabel.string = data.gameType;
        this.dfLabel.string = data.basicScore;
        this.fbgzLabel.string = data.doubleRule;
        this.fjgzLabel.string = data.roomRule;
        this.tsgzLabel.string = data.spaceilRule;
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            default:
                break;
        }
    }
});
