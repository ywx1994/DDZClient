import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        titleLabel: cc.Label,
        contentRichText: cc.RichText,
        signatureLabel: cc.Label,       //署名
        infoContent: cc.Node,
        isNull: cc.Node
    },

    initWithData(data) {
        this.isNull.active = false;
        this.infoContent.active = true;
        this.titleLabel.string = data.title;
        this.contentRichText.string = data.content;
        this.signatureLabel.string = data.signature;
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'),false,global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
        }

    },
});
