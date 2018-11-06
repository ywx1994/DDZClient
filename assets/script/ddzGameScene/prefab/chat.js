import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        wordScrollView: cc.Node,
        faceScrollView: cc.Node
    },

    onLoad() {
        this.wordScrollView.active = true;
        this.faceScrollView.active = false;
    },
    start() {

    },
    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        if (customData.length <= 2) {
            global.gameService.proxy.faceChat(customData);
            this.node.destroy();
        } else if (customData.length === 3) {
            global.gameService.proxy.wordChat(customData);
            this.node.destroy();
        }
        switch (customData) {
            case 'word':
                this.wordScrollView.active = true;
                this.faceScrollView.active = false;
                break;
            case 'face':
                this.wordScrollView.active = false;
                this.faceScrollView.active = true;
                break;
            case 'close':
                this.node.destroy();
                break;
        }
    },
});
