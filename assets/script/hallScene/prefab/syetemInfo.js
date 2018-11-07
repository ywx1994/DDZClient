import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        contentRichText: cc.RichText,
        signatureLabel: cc.Label,       //署名
        infoContent: cc.Node,
        activitiesNode: cc.Node,
    },

    initWithData(data) {
        this.contentRichText.string = data.content;
        this.signatureLabel.string = data.signature;
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            case 'activities':
                if (!this.activitiesNode.active) {
                    this.infoContent.active = false;
                    this.activitiesNode.active = true;
                }
                break;
            case 'systemInfo':
                if (!this.infoContent.active){
                    this.activitiesNode.active = false;
                    this.infoContent.active = true;
                }
                break;
        }
    },
});
