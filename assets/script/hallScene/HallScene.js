import global from "./../global"

cc.Class({
    extends: cc.Component,

    properties: {
        headImg: cc.Sprite,
        sexImg: cc.Sprite,
        playerName: cc.Label,
        playerID: cc.Label,
        daimondNum: cc.Label,
        male: cc.SpriteFrame,
        famale: cc.SpriteFrame,

        createRoomNode: cc.Node,
        joinRoomNode: cc.Node,
        createRoomPrefab: cc.Prefab,
        joinRoomPrefab: cc.Prefab,

        tipsPrefab: cc.Prefab,
        loadingPrefab: cc.Prefab,
        playerSelfInfo: cc.Prefab,
        buyPrefab: cc.Prefab,
        inviteCodePrefab: cc.Prefab,
        gameResultHall: cc.Prefab,
        detailResultPrefab: cc.Prefab,
        systemInfoPrefab: cc.Prefab,
        hallSharePrefab: cc.Prefab,
        //子菜单
        submenuNode: cc.Node,
        hallGameRulePrefab: cc.Prefab,
        callWePrefab: cc.Prefab,
        outGamePrefab: cc.Prefab,
        agencyPrefab: cc.Prefab,
        settingPrefab: cc.Prefab,
        //房间列表
        roomListBG: cc.Node,
        roomConfig: cc.Prefab,
        roomListContent: cc.Node,
        roomListNode: cc.Node,
        noticeNode:cc.Label
    },

    onLoad() {
        global.hallScene = this.node;
        this.loading = undefined;
        this.bgm = cc.audioEngine.play(cc.url.raw('resources/audio/hallMusic.mp3'), true, global.bgmVolume);
        //微信分享
        if (cc.sys.isMobile && cc.sharePlugin === undefined) {
            let agent = anysdk.agentManager;
            cc.sharePlugin = agent.getSharePlugin();
            cc.sharePlugin.setListener((code, msg) => {
                this.shareNode.active = false;
                switch (code) {
                    case anysdk.ShareResultCode.kShareSuccess:
                        let tips1 = cc.instantiate(this.tipsPrefab);
                        tips1.parent = this.node;
                        global.tip = "分享成功";
                        break;
                    case anysdk.ShareResultCode.kShareFail:
                        let tips2 = cc.instantiate(this.tipsPrefab);
                        tips2.parent = this.node;
                        global.tip = "分享失败";
                        break;
                    case anysdk.ShareResultCode.kShareCancel:
                        let tips3 = cc.instantiate(this.tipsPrefab);
                        tips3.parent = this.node;
                        global.tip = "分享取消";
                        break;
                    case anysdk.ShareResultCode.kShareNetworkError:
                        let tips4 = cc.instantiate(this.tipsPrefab);
                        tips4.parent = this.node;
                        global.tip = "分享网络错误";
                        break;
                }
            }, this);
        }

        if (global.firstToHall){
            console.log('此处应有广告弹出！');
            global.firstToHall = false;
            global.hallService.proxy.systemInfo(data=>{
                if (!data.ok) {
                    console.log('** hallScene ** requestSystemInfo has err');
                } else {
                    let systemInfo = cc.instantiate(this.systemInfoPrefab);
                    systemInfo.parent = this.node;
                    if (data !== undefined) {
                        global.systemInfo = data.info;
                        systemInfo.getComponent('syetemInfo').initWithData(data.info);
                    }
                }
            });
        }

        global.hallService.proxy.refreshSelfInfo(data => {
            global.playerData.account_id = data.info.accountID;
            global.playerData.nick_name = data.info.nickName;
            global.playerData.avatar_url = data.info.avatarUrl;
            global.playerData.gold_count = data.info.gold;
            global.playerData.daimond_count = data.info.diamond;
            global.playerData.sex = data.info.sex;
            global.playerData.city = data.info.city;
            global.playerData.loginIP = data.info.ip;
            global.playerData.createDate = data.info.createDate;
            global.playerData.totalGames = data.info.totalGame;
            global.playerData.ranking = data.info.ranking;

            //todo 用户信息每次到hallScene时都应该重新加载
            this.playerName.string = decodeURI(global.playerData.nick_name);
            this.playerID.string = "ID:" + global.playerData.account_id;
            cc.loader.load({url: global.playerData.avatar_url, type: 'jpg'}, (err, tex) => {
                //cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
                let oldWidth = this.headImg.node.width;
                this.headImg.spriteFrame = new cc.SpriteFrame(tex);
                let newWidth = this.headImg.node.width;
                this.headImg.node.scale = oldWidth / newWidth;
            });
            this.daimondNum.string = global.playerData.daimond_count;
            if (global.playerData.sex === 1) {
                this.sexImg.spriteFrame = this.male;
            } else {
                this.sexImg.spriteFrame = this.famale;
            }
        });

        //展示游戏详细记录（oneGameRusult发出的）
        this.node.on('show_detail_result', (data) => {
            let detail = data.detail;
            console.log('** show_detail_result ** detail=' + JSON.stringify(detail));
            let detailResult = cc.instantiate(this.detailResultPrefab);
            detailResult.parent = this.node;
            detailResult.getComponent('detailResult').initWithData(detail.gameItemContents, detail.nameANDscore);
        });
        //改变音乐音量大小（setting发出的）
        cc.systemEvent.on('changeVolume', () => {
            cc.audioEngine.setVolume(this.bgm, global.bgmVolume);
        });
        //等待加入房间（roomConfig发出的）
        this.node.on('waitingJoinRoom', () => {
            this.loading = cc.instantiate(this.loadingPrefab);
            this.loading.parent = this.node;
        });
        this.node.on('cancelWaiting', () => {
            this.loading.destroy();
        });
        this.node.on('change_daimond', () => {
            this.daimondNum.string = global.playerData.daimond_count;
        })
    },

    update() {

    },

    start() {
        let action1 = cc.moveTo(0, 250+this.noticeNode.node.width/2, 0);
        let action2 = cc.moveBy(this.noticeNode.node.width/50,-500-this.noticeNode.node.width,0);
        let seq1 = cc.repeatForever(cc.sequence(action1, action2));
        this.noticeNode.node.runAction(seq1);
        //---------------------产生动态界面的效果-----------------------
        // let action1 = cc.moveBy(1.3, 0, 10);
        // let action2 = cc.moveBy(1.3, 0, -10);
        // let action3 = cc.moveBy(1.3, 0, 10);
        // let action4 = cc.moveBy(1.3, 0, -10);
        // let action5 = cc.moveBy(1.3, 0, 10);
        // let action6 = cc.moveBy(1.3, 0, -10);
        // let action7 = cc.moveBy(1.3, 0, 10);
        // let action8 = cc.moveBy(1.3, 0, -10);
        // let seq1 = cc.repeatForever(cc.sequence(action1, action2));
        // let seq2 = cc.repeatForever(cc.sequence(action4, action3));
        // let seq3 = cc.repeatForever(cc.sequence(action5, action6));
        // let seq4 = cc.repeatForever(cc.sequence(action8, action7));
        // this.clubNode.runAction(seq1);
        // this.goldRoomNode.runAction(seq3);
        // this.createRoomNode.runAction(seq2);
        // this.joinRoomNode.runAction(seq4);
        //---------------------产生动态界面的效果end-----------------------
    },

    onDestroy() {
        global.eventListener.removeAllListeners();
        global.hallScene = undefined;
        cc.audioEngine.stop(this.bgm);
        cc.systemEvent.off('changeVolume');
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case  'creat_room':     //创建房间
                console.log("创建房间");
                let createRoom = cc.instantiate(this.createRoomPrefab);
                createRoom.parent = this.node;
                break;
            case 'join_room':       //加入房间
                console.log("加入房间");
                let joinRoom = cc.instantiate(this.joinRoomPrefab);
                joinRoom.parent = this.node;
                break;
            case 'room_list':       //房间列表
                console.log("房间列表");
                if (this.roomListBG.active) {
                    this.roomListBG.active = false;
                    this.roomListNode.runAction(cc.moveBy(0.3, -630, 0));
                    let rooms = this.roomListContent.children;
                    for (let i = 0; i < rooms.length; i++) {
                        rooms[i].destroy();
                    }
                } else {
                    global.hallService.proxy.searchRoomList(data => {
                        if (data.ok) {
                            for (let i = 0; i < data.roomList.length; i++) {
                                let room = cc.instantiate(this.roomConfig);
                                room.parent = this.roomListContent;
                                room.getComponent('roomConfig').initWithData(data.roomList[i]);
                            }
                        }
                    });
                    this.roomListNode.runAction(cc.moveBy(0.3, 630, 0));
                    this.roomListBG.active = true;
                }
                break;
            case 'player_info':     //玩家信息
                console.log("玩家信息");
                let playerSelfInfo = cc.instantiate(this.playerSelfInfo);
                playerSelfInfo.parent = this.node;
                break;
            case 'add_money':       //充值
                console.log("充值");
                let addMoney = cc.instantiate(this.buyPrefab);
                addMoney.parent = this.node;
                break;
            case 'invitation_code': //邀请码
                console.log("邀请码");
                let inviteCode = cc.instantiate(this.inviteCodePrefab);
                inviteCode.parent = this.node;
                console.log('ranking=' + global.playerData.ranking);
                if (global.playerData.ranking !== undefined && global.playerData.ranking !== null) {
                    inviteCode.getComponent('inviteCode').initWithData(global.playerData.ranking);
                }
                break;
            case 'record':          //战绩
                console.log("战绩");
                global.hallService.proxy.gameRecord("ddz", data => {
                    if (!data.ok) {
                        console.log('** HallScene ** requestGameRecord err');
                    } else {
                        console.log('** HallScene ** requestGameRecord data=' + JSON.stringify(data.record));
                        let gameResult = cc.instantiate(this.gameResultHall);
                        gameResult.parent = this.node;
                        gameResult.getComponent('gameResultHall').initWithData(data.record);
                    }
                });
                break;
            // case 'system_info':    //系统信息
            //     console.log("系统信息");
            //     if (global.systemInfo !== undefined) {
            //         let systemInfo = cc.instantiate(this.systemInfoPrefab);
            //         systemInfo.parent = this.node;
            //         systemInfo.getComponent('syetemInfo').initWithData(global.systemInfo);
            //     } else {
            //            global.hallService.proxy.systemInfo(data=>{
            //                if (!data.ok) {
            //                    console.log('** hallScene ** requestSystemInfo err=' );
            //                } else {
            //                    let systemInfo = cc.instantiate(this.systemInfoPrefab);
            //                    systemInfo.parent = this.node;
            //                    if (data !== undefined) {
            //                        global.systemInfo = data.info;
            //                        systemInfo.getComponent('syetemInfo').initWithData(data.info);
            //                    }
            //                }
            //            });
            //     }
            //     break;
            case 'share':           //分享
                console.log("分享");
                let hallShare = cc.instantiate(this.hallSharePrefab);
                hallShare.parent = this.node;
                break;
            case 'menu':            //菜单
                console.log("菜单");
                if (this.submenuNode.active) {
                    this.submenuNode.active = false;
                } else {
                    this.submenuNode.active = true;
                }
                break;
            default:
                break;
        }
    },

    onSubmenuClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        console.log('点击了:' + customData);
        switch (customData) {
            case 'gz':      //规则
                let hallGameRule = cc.instantiate(this.hallGameRulePrefab);
                hallGameRule.parent = this.node;
                break;
            case 'lx':      //联系我们
                let callWe = cc.instantiate(this.callWePrefab);
                callWe.parent = this.node;
                break;
            case 'dl':      //代理网址
                let agency = cc.instantiate(this.agencyPrefab);
                agency.parent = this.node;
                break;
            case 'sz':      //设置音量，切换账号
                let setting = cc.instantiate(this.settingPrefab);
                setting.parent = this.node;
                break;
            case 'tc':      //退出游戏
                let outGame = cc.instantiate(this.outGamePrefab);
                outGame.parent = this.node;
                break;
            default:
                break;
        }
    },

    onDestroy() {
        cc.audioEngine.stop(this.bgm);
    },

});
