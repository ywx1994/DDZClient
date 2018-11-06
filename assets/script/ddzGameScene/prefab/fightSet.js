import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {},

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            case 'leaveRoom':
                console.log('离开房间');
                this.node.destroy();
                global.gameService.proxy.playerLeaveRoom(data=>{
                    if (!data.ok) {
                        console.log('**GameScene** leaveRoom err=' + JSON.stringify(data.data));
                        cc.systemEvent.emit('leaveroom_err', data.data);      //DDZGameScene接收
                    }else {
                        console.log('**GameScene** leaveRoom 离开房间成功!');
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
                    }
                });
                break;
            case 'dissolveRoom':
                console.log('解散房间');
                this.node.destroy();
                global.gameService.proxy.destroyRoom(data=>{
                    if (!data.ok) {
                        cc.systemEvent.emit('dissolveRoom_err', data.err);
                    }
                });
                break;
            case 'gameSet':
                console.log('游戏设置');
                this.node.destroy();
                cc.systemEvent.emit('show_game_setting');   //DDZGameScene接收
                break;
            default:
                break;
        }
    },

    onDestroy() {
        cc.systemEvent.emit('show_menu_btn');   //DDZGameScene接收
    }
});
