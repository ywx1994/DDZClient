import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        webView: cc.WebView
    },

    onLoad() {
        this.webView.url = 'https://www.baidu.com/';
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
        }
    }
});
