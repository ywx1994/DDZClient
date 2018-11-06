import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {},

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case'close':
                this.node.destroy();
                break;
            case'out_game':
                global.hallService.proxy.logout(data=>{
                    });
                cc.director.end();
                break;
            default:
                break;
        }
    }
});
