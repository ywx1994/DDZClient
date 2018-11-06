import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        explainNode: cc.Node,
    },

    onLoad() {
        this.explainNode.runAction(cc.moveBy(0.3, 0, -300));
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                this.explainNode.runAction(cc.sequence(cc.moveBy(0.3, 0, 300), cc.callFunc(() => {
                    this.node.destroy();
                })));
                break;
        }
    },
});
