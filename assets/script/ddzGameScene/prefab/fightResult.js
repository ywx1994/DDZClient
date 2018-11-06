import global from './../../global'
let ScreenShot = require("../../utils/ScreenShot");

cc.Class({
    extends: cc.Component,

    properties: {
        roomID: cc.Label,
        roundCount: cc.Label,
        baseScore: cc.Label,
        gameType: cc.Label,
        gameTime: cc.Label,
        playerPosList: cc.Node,
        onePlayerResult: cc.Prefab
    },

    initWithData(data) {
        this.roomID.string = '房号:' + data.roomID;
        this.roundCount.string = '局数:' + data.roundCount;
        this.baseScore.string = '底分:' + data.baseScore;
        this.gameType.string = data.gameType;
        this.gameTime.string = data.gameTime;
        for (let i = 0; i < data.playerList.length; i++) {
            this.addPlayerNode(i, data.playerList[i], {
                houseMasterID: data.houseMasterID,
                bigWinnerScore: data.bigWinnerScore,
                tyrantScore: data.tyrantScore
            });
        }
    },

    addPlayerNode(pos, playerInfo, data) {
        let playerNode = cc.instantiate(this.onePlayerResult);
        playerNode.parent = this.playerPosList.children[pos];
        playerNode.getComponent('onePlayerResult').initWithData(playerInfo, data);
        // playerNode.position = this.playerPosList.children[pos].position;
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
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
            case 'share':
                let shot = new ScreenShot();
                ScreenShot.clearImage("shot.png");
                shot.shot();
                shot.saveToFile("shot.png", cc.ImageFormat.PNG, () => {
                    if (cc.sharePlugin === undefined) {
                        let agent = anysdk.agentManager;
                        cc.sharePlugin = agent.getSharePlugin();
                    }
                    let info = {
                        shareTo: 0,
                        mediaType: 1,
                        imagePath: jsb.fileUtils.getWritablePath() + "shot.png",
                        thumbImage: jsb.fileUtils.getWritablePath() + "shot.png"
                    };
                    cc.sharePlugin.share(info);
                });
                break;
            case 'backHall':
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
            default:
                break;
        }
    }
});
