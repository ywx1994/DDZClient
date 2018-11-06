import global from './../../global'

cc.Class({
    extends: cc.Component,

    properties: {
        labelNode: cc.Node,
        tipsPrefab: cc.Prefab,
        loadingPrefab: cc.Prefab,
    },

    onLoad() {
        this.labelList = this.labelNode.children;
        this.roomIDStr = '';
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        if (customData.length === 1) {
            this.roomIDStr += customData;
            if (this.roomIDStr.length > 6) {
                this.roomIDStr = this.roomIDStr.substring(0, this.roomIDStr.length - 1);
            }
        }
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            case 'cs':
                this.roomIDStr = '';
                break;
            case 'sc':
                this.roomIDStr = this.roomIDStr.substring(0, this.roomIDStr.length - 1);
                break;
            case 'joinRoom':
                if (this.roomIDStr.length === 6) {
                    let loading = cc.instantiate(this.loadingPrefab);
                    loading.parent = this.node;
                       global.hallService.proxy.joinRoom(this.roomIDStr,data=>{
                           if (!data.ok) {
                               if (data.err) {
                                   loading.destroy();
                                   let tips = cc.instantiate(this.tipsPrefab);
                                   tips.parent = this.node;
                                   global.tip = data.err;
                               }
                           }else {
                               global.joinRoomData.roomID = this.roomIDStr;
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
                               }
                           }
                       });
                } else {
                    // console.log('请输入完整的房间号');
                    let tips = cc.instantiate(this.tipsPrefab);
                    tips.parent = this.node;
                    global.tip = "请输入完整的房间号";
                }
                break;
            default:
                break;
        }
    },

    update(dt) {
        for (let i = 0; i < this.labelList.length; i++) {
            this.labelList[i].getComponent(cc.Label).string = '';
        }
        for (let i = 0; i < this.roomIDStr.length; i++) {
            this.labelList[i].getComponent(cc.Label).string = this.roomIDStr[i];
        }
    }


});