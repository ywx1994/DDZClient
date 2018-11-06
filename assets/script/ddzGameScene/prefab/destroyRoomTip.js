import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {},

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'ok':
                if (global.netWorkManager.g_ddzGameServiceIsLogin) {
                    global.netWorkManager.clearDDZGameService();
                }
                if (global.netWorkManager.g_nnGameServiceIsLogin) {
                    global.netWorkManager.clearNNGameService();
                }
                if (global.netWorkManager.g_pszGameServiceIsLogin) {
                    global.netWorkManager.clearPSZGameService();
                }
                cc.director.loadScene('HallScene');
                break;
        }
    }
});
