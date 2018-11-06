import global from "./../global";

cc.Class({
    extends: cc.Component,

    properties: {
        waitStartLabel: cc.Node,
        dataNode: cc.Node,               //基础信息数据
        inviteFriendsBtn: cc.Node,
        showFightSetBtn: cc.Node,
        playerPosNode: cc.Node,         // 玩家位置
        voiceBtnNode: cc.Node,          // 语音按钮节点

        tipsPrefab: cc.Prefab,
        chatPrefab: cc.Prefab,          // 聊天
        voicePrefab: cc.Prefab,         // 语音聊天
        roomRulePrefab: cc.Prefab,      //游戏规则
        playerNodePrefab: cc.Prefab,    //玩家
        fightUserInfo: cc.Prefab,       //玩家信息
        fightSettingPrefab: cc.Prefab,  //设置菜单
        gameSettingPrefab: cc.Prefab,   //音量设置
        actionChatPrefab: cc.Prefab,    //聊天动画
    },

    onLoad() {
        let voice = cc.instantiate(this.voicePrefab);
        voice.parent = this.node;

        this.bgm = cc.audioEngine.play(cc.url.raw('resources/audio/ddz/ddzGaming.mp3'), true, global.bgmVolume);
        //改变音乐音量大小（setting发出的）
        cc.systemEvent.on('changeVolume', () => {
            cc.audioEngine.setVolume(this.bgm, global.bgmVolume);
        });
        //--------------------------- 初始化基础信息 begin ---------------------------
        this.labelList = this.dataNode.children;     //0-房号；1-底分；2-倍数；3-最大倍数；4-已玩局数；5-总局数
        this.labelList[0].getComponent(cc.Label).string = global.joinRoomData.roomID;
        let roomRules = global.joinRoomData.roomRules;
        this.labelList[1].getComponent(cc.Label).string = roomRules.basicScore;
        this.labelList[2].getComponent(cc.Label).string = ""+0;
        this.labelList[3].getComponent(cc.Label).string = "/" + roomRules.limitMultiplier;
        this.labelList[4].getComponent(cc.Label).string = roomRules.nowRound;
        this.labelList[5].getComponent(cc.Label).string = "/" + roomRules.roundCount;
        //--------------------------- 初始化基础信息 end ------------------------------

        this.playerNodeList = [];       //玩家的预制件节点
        this.playerPosList = [];        //自己相对座位号为 0 的座位列表
        global.gameService.proxy.enterRoom(global.playerData.accountID,data=>{
            if (!data.ok) {
                console.log("*** gameScene *** requestEnterRoonScene err" );
            } else {
                console.log("*** gameScene *** requestEnterRoonScene data=" + JSON.stringify(data));
                console.log(JSON.stringify(global.joinRoomData));
                this.initPlayerPos(data.playerInfo.seatIndex);
                this.readyPlayerList = data.playerInfo.readyPlayerList;
                let playerData = data.playerInfo.playerData;
                console.log(playerData.length);
                global.playerData.seatNum = data.playerInfo.seatIndex;
                console.log("readyPlayerList = " + JSON.stringify(this.readyPlayerList));
                //显示之前进入房间的玩家的位置
                for (let i = 0, len = playerData.length; i < len; i++) {
                    this.addPlayerNode(playerData[i]);
                }
                //判断玩之前进入房间的家准备情况，显示准备图片
                for (let i = 0, len1 = this.readyPlayerList.length; i < len1; i++) {
                    for (let j = 0, len2 = this.playerNodeList.length; j < len2; j++) {
                        if (playerData[j].accountID === this.readyPlayerList[i]) {
                            this.playerNodeList[j].emit('player_ready', data.playerInfo.readyPlayerList[i]);//playerNode接收
                        }
                    }
                }

                this.node.emit('player_node_list', this.playerNodeList);        //gamingUI接收
            }
        });
        //聊天动画
        global.handler.onActionChat((data) => {
            console.log('聊天动画：' + JSON.stringify(data));
            let sendPosition = undefined;
            let receivePosition = undefined;
            sendPosition = this.playerPosNode.children[this.playerPosList[data.sendPlayerIndex]].position;
            receivePosition = this.playerPosNode.children[this.playerPosList[data.receivePlayerIndex]].position;
            console.log('sendPosition = ' + JSON.stringify(sendPosition) + ' ; receivePosition = ' + JSON.stringify(receivePosition));
            this.playMusic(global.nnMusicList[data.actionName], data.sendPlayerSex);
            let actionChat = cc.instantiate(this.actionChatPrefab);
            actionChat.parent = this.node;
            actionChat.position = sendPosition;
            actionChat.getComponent('actionChat').initWithData(data.actionName);
            actionChat.runAction(cc.sequence(cc.moveTo(1.5, receivePosition), cc.callFunc(() => {
                actionChat.getComponent('actionChat').changeImage(data.actionName, data.sendPlayerSex);
            })))
        });
        //通知房间里的玩家，有新玩家进入，data显示他的位置
        global.handler.onPlayerJoinRoom((data) => {
            console.log("加入房间"+JSON.stringify(data));
            this.addPlayerNode(data);
            this.node.emit('player_node_list', this.playerNodeList);        //gamingUI接收
        });
        //通知房间里的玩家，我准备好了，显示我的准备图片
        global.handler.onPlayerReady((data) => {
            this.readyPlayerList.push(data);
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('player_ready', data);
            }
        });
        //通知玩家游戏开始  playerNode中接收
        global.handler.onGameStart((data) => {
            this.node.emit('game_start');   //gamingUI接收
            this.waitStartLabel.active = false;
            this.inviteFriendsBtn.active = false;
            this.labelList[4].getComponent(cc.Label).string += 1;    //局数+1；
            global.joinRoomData.roomRules.nowRound++;
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('game_start');
            }
        });
        //倍数变化
        global.handler.onChangeMultiple((data) => {
            this.labelList[2].getComponent(cc.Label).string = data;
        });
        //产生地主
        global.handler.onChangeLand((data) => {
            console.log("*** GameScene *** onChangeLand data=" + JSON.stringify(data));
            global.playerData.landID = data;
            for (let i = 0; i < this.playerNodeList.length; i++) {
                // this.playerNodeList[i].emit('change_land', data);
                let node = this.playerNodeList[i];
                node.emit('change_land', data);
                if (node.getComponent('playerNode').accountID === data) {//把地主的位置发送到gameingUI
                    this.node.emit('land_pos', node.position);
                }
            }
        });
        //收到其他玩家离开房间的消息
        global.handler.onOtherLeaveRoom((data) => {
            console.log('收到玩家离开房间消息:' + JSON.stringify(data));
            for (let i = 0; i < this.playerNodeList.length; i++) {
                let playerNode = this.playerNodeList[i];
                let playerAccountID = playerNode.getComponent('playerNode').accountID;
                if (data === playerAccountID) {
                    this.playerNodeList[i].destroy();
                    this.playerNodeList.splice(i, 1);
                    break;
                }
            }
            this.node.emit('player_node_list', this.playerNodeList);        //gamingUI接收
        });
        //为地主加3张牌，gamingUI发出
        this.node.on('add_card_to_player', () => {
            if (global.playerData.account_id !== global.playerData.landID) {
                for (let i = 0; i < this.playerNodeList.length; i++) {
                    this.playerNodeList[i].emit('add_three_cards', global.playerData.landID);
                }
            }
        });
        //playerNode发来的
        cc.systemEvent.on('show_user_info', (data) => {
            let detail = data.detail;
            let fightUserInfo = cc.instantiate(this.fightUserInfo);
            fightUserInfo.parent = this.node;
            fightUserInfo.getComponent('fightUserInfo').initWithData(detail);
        });
        //figheSet发来的
        cc.systemEvent.on('show_menu_btn', () => {
            this.showFightSetBtn.active = true;
        });
        //figheSet发来的
        cc.systemEvent.on('show_game_setting', () => {
            let gameSetting = cc.instantiate(this.gameSettingPrefab);
            gameSetting.parent = this.node;
        });
        //figheSet发来的
        cc.systemEvent.on('leaveroom_err', (err) => {
            let detail = err.detail;
            let tips = cc.instantiate(this.tipsPrefab);
            tips.parent = this.node;
            global.tip = detail;
        });
        //figheSet发来的
        cc.systemEvent.on('dissolveRoom_err', (err) => {
            let detail = err.detail;
            let tips = cc.instantiate(this.tipsPrefab);
            tips.parent = this.node;
            global.tip = detail;
        });
    },

    onDestroy() {
        global.handler.removeAllListener();
        cc.audioEngine.stop(this.bgm);
        cc.systemEvent.off('changeVolume');
        cc.systemEvent.off('show_user_info');
        cc.systemEvent.off('show_menu_btn');
        cc.systemEvent.off('show_game_setting');
        cc.systemEvent.off('leaveroom_err');
        cc.systemEvent.off('dissolveRoom_err');
    },

    //通过自己的座位号，排布玩家位置
    initPlayerPos(seatIndex) {
        let children = this.playerPosNode.children;
        switch (seatIndex) {
            case 0:
                this.playerPosList[0] = 0;
                this.playerPosList[1] = 1;
                this.playerPosList[2] = 2;
                break;
            case 1:
                this.playerPosList[1] = 0;
                this.playerPosList[2] = 1;
                this.playerPosList[0] = 2;
                break;
            case 2:
                this.playerPosList[2] = 0;
                this.playerPosList[0] = 1;
                this.playerPosList[1] = 2;
                break;
            default:
                break;
        }
    },

    //添加玩家节点
    addPlayerNode(data) {
        //动态加载玩家节点
        // cc.loader.loadRes('prefab/player_node', (err, prefab) => {
        //     let playerNode = cc.instantiate(prefab);
        //     playerNode.parent = this.node;
        //     playerNode.getComponent('playerNode').initWithData(data, this.playerPosList[data.seatIndex]);
        //     playerNode.position = this.playerPosNode.children[this.playerPosList[data.seatIndex]].position;
        //     this.playerNodeList.push(playerNode);
        //     console.log('玩家的个数：' + this.playerNodeList.length);
        // });

        //静态加载玩家节点
        let playerNode = cc.instantiate(this.playerNodePrefab);
        playerNode.parent = this.node;
        playerNode.position = this.playerPosNode.children[this.playerPosList[data.seatIndex]].position;
        playerNode.getComponent('playerNode').initWithData(data, this.playerPosList[data.seatIndex]);
        this.playerNodeList.push(playerNode);
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'roomRule':
                let roomRule = cc.instantiate(this.roomRulePrefab);
                roomRule.parent = this.node;
                roomRule.getComponent('roomRule').initWithData({
                    gameType: global.joinRoomData.roomRules.gameType,
                    basicScore: global.joinRoomData.roomRules.basicScore,
                    doubleRule: '抢地主翻倍，炸弹翻倍',
                    roomRule: global.joinRoomData.roomRules.roomRate.substr(0, 4) + '  所有玩家准备好就开始',
                    spaceilRule: '托管智能程度正在优化中，请慎用！！！'
                });
                break;
            case 'fightSet':
                this.showFightSetBtn.active = false;
                let fightSetting = cc.instantiate(this.fightSettingPrefab);
                fightSetting.parent = this.node;
                break;
            // case 'voice':
            //     //todo 语音功能暂不完善，后续更新
            //     let voice = cc.instantiate(this.voicePrefab);
            //     voice.parent = this.node;
            //     voice.getComponent('voice').initWithData(this.voiceBtnNode);
            //     break;
            case 'chat':
                let chat = cc.instantiate(this.chatPrefab);
                chat.parent = this.node;
                break;
            case 'inviteFriends':
                if (cc.sharePlugin !== undefined) {
                    let info = {
                        title: '星牛娱乐科技 ※ 房间号【' + global.joinRoomData.roomID + '】!',
                        text: '我开了' + global.joinRoomData.roomRules.roundCount + '局，' +
                        global.joinRoomData.roomRules.gameType + '(底分：' + global.joinRoomData.roomRules.basicScore +
                        ')的房间，快来和我一起玩耍吧!',
                        url: 'www.baidu.com',
                        mediaType: 2,
                        shareTo: 0,
                    };
                    cc.sharePlugin.share(info);
                }
                break;
            default:
                break;
        }
    },

    playMusic(url, sex) {
        cc.audioEngine.play(cc.url.raw(global.nnMusicUrl + 'sex' + sex + url), false, global.playVolume);
    },

});