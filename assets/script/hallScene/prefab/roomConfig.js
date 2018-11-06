import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        roomID: cc.Label,
        gameType: cc.Label,
        point: cc.Label,
        round: cc.Label,
        player: cc.Label,
        totalPlayer: cc.Label,
        tips: cc.Prefab
    },

    onLoad() {
    },
    initWithData(data) {
        console.log('** roomconfig ** data = ' + JSON.stringify(data));
        this.roomID.string = data.roomID;
        this.gameType.string = data.gameType;
        this.point.string = data.point;
        this.round.string = data.round;
        this.player.string = data.player;
        this.totalPlayer.string = data.totalPlayer;
    },
    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'invite':
                console.log('微信邀请好友');
                if (cc.sharePlugin !== undefined) {
                    let info = {
                        title: '星牛娱乐科技 ※ 房间号【' + this.roomID.string + '】',
                        text: '底分：' + this.point.string + '分, 局数：' + this.round.string + '局；一起来吧！让科技娱乐生活！',
                        url: 'www.baidu.com',
                        mediaType: 2,
                        shareTo: 0,
                    };
                    cc.sharePlugin.share(info);
                }
                break;
            case 'joinRoom':
                let seq = cc.sequence(cc.scaleTo(0.2, 0.6), cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1));
                this.node.runAction(seq);
                global.hallScene.emit('waitingJoinRoom'); //hallScene接收，等待加入房间，出现等待标志
                global.hallService.proxy.joinRoom(this.roomID.string,data=>{
                        if (!data.ok) {
                            global.hallScene.emit('cancelWaiting'); //hallScene接收，等待加入房间，等待标志消失
                            if (data.err) {
                                loading.destroy();
                                let tips = cc.instantiate(this.tips);
                                tips.parent = this.node;
                                global.tip = data.err;
                            }
                        }else {
                            global.joinRoomData.roomID = this.roomID.string;
                            global.joinRoomData.roomRules = data.roomConfig.config;
                            global.joinRoomData.roomRules.nowRound = data.roomConfig.roundCount;
                            if (data.roomConfig.config.gameType === '斗地主') {
                                global.netWorkManager.connectAndAuthToDDZGame(data.gameUrl);
                                global.netWorkManager.onConnectedToDDZGame(()=>{
                                    cc.director.loadScene('DDZGameScene');
                                })
                            } else if (data.roomConfig.config.gameType === '五醉牛') {
                                global.netWorkManager.connectAndAuthToNNGame(data.gameUrl);
                                global.netWorkManager.onConnectedToNNGame(()=>{
                                    cc.director.loadScene('NNGameScene');
                                })
                            } else if (data.roomConfig.config.gameType === '拼三张') {
                                global.netWorkManager.connectAndAuthToPSZGame(data.gameUrl);
                                global.netWorkManager.onConnectedToPSZGame(()=>{
                                    cc.director.loadScene('PSZGameScene');
                                })
                            }else {
                                console.log('** 房间列表加入房间 ** 我想你大概时走丢了吧！！！');
                            }
                        }
                    });
                break;
        }
    },
});
