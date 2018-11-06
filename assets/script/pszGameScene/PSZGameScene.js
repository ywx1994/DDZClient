import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        rules: cc.Node,
        playerSeatNode: cc.Node,
        showFightSetBtn: cc.Node,
        inviteFriendsBtn: cc.Node,
        tableRule:cc.Label,

        tipsPrefab: cc.Prefab,
        playerNode: cc.Prefab,
        explainPrefab: cc.Prefab,         //牌型说明
        fightUserInfo: cc.Prefab,        // 玩家信息
        fightSettingPrefab: cc.Prefab,  //设置菜单
        gameSettingPrefab: cc.Prefab,   //音量设置
        chatPrefab: cc.Prefab,          // 聊天
        actionChatPrefab: cc.Prefab,   // 聊天动画
    },

    onLoad() {
        this.playerNodeList = [];           //玩家的预制件节点
        this.playerPosList = [];            //自己相对座位号为 0 的座位列表
        this.readyPlayerList = [];          //已准备的玩家列表
        this.startPlayerList = [];          //已开始游戏的玩家列表
        this.ruleList = this.rules.children;
        this.bout = 0;              //当前游戏回合数
        this.round = 0;             //已开始游戏局数

        this.tableRule.string = "";
        let specialRuleLength = global.joinRoomData.roomRules.spaceilRule.length;
        for (let i = 0;i<global.joinRoomData.roomRules.GJSZ.length;i++){
            this.tableRule.string += global.joinRoomData.roomRules.GJSZ[i]+",";
        }
        for (let i = 0; i <specialRuleLength -1;i++) {
            this.tableRule.string += global.joinRoomData.roomRules.spaceilRule[i]+",";
        }
        this.tableRule.string += global.joinRoomData.roomRules.spaceilRule[specialRuleLength -1];

        this.bgm = cc.audioEngine.play(cc.url.raw('resources/audio/wzn/music/gaming_room_bg.mp3'), true, global.bgmVolume);
        //PSZGameScene发来的       改变回合数
        this.node.on('change_bout', (data) => {
            this.bout = data.detail;
        });
        //改变音乐音量大小（setting发出的）
        cc.systemEvent.on('changeVolume', () => {
            cc.audioEngine.setVolume(this.bgm, global.bgmVolume);
        });
        //nnPlayerNode发来的
        cc.systemEvent.on('show_user_info', (playerInfo) => {
            let detail = playerInfo.detail;
            console.log('收到PlayerNode的消息' + JSON.stringify(detail));
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
            global.tip = detail;
            let tips = cc.instantiate(this.tipsPrefab);
            tips.parent = this.node;
        });
        //figheSet发来的
        cc.systemEvent.on('dissolveRoom_err', (err) => {
            let detail = err.detail;
            global.tip = detail;
            let tips = cc.instantiate(this.tipsPrefab);
            tips.parent = this.node;

        });
    },

    onSocket() {
        global.gameService.proxy.enterRoom(global.playerData.accountID,(data) => {
            if (data.ok) {
                console.log("requestEnterRoonScene data = " + JSON.stringify(data));
                this.readyPlayerList = data.playerInfo.readyPlayerList;
                this.startPlayerList = data.playerInfo.startPlayerList;
                this.round = global.joinRoomData.roomRules.nowRound;
                this.bout = data.playerInfo.bout;
                global.joinRoomData.firstPlayerID = data.playerInfo.firstPlayerID;
                global.joinRoomData.houseManagerID = data.playerInfo.houseManagerID;
                global.playerData.seatNum = data.playerInfo.seatIndex;
                console.log("firstPlayerID：" + global.joinRoomData.firstPlayerID
                    + ", houseManagerID：" + global.joinRoomData.houseManagerID
                    + ", readyPlayerList： " + JSON.stringify(this.readyPlayerList)
                    + ", startPlayerList：" + JSON.stringify(this.startPlayerList));

                this.initPlayerPos(data.playerInfo.seatIndex);
                let playerData = data.playerInfo.playerData;

                for (let i = 0; i < playerData.length; i++) {
                    this.addPlayerNode(playerData[i], data.playerInfo.readyPlayerList, data.playerInfo.startPlayerList);
                }
                //判断玩之前进入房间的家准备情况，显示准备图片
                for (let i = 0; i < this.readyPlayerList.length; i++) {
                    for (let j = 0; j < this.playerNodeList.length; j++) {  //playerNodeList的长度跟playerData是一样的
                        if (playerData[j].accountID === this.readyPlayerList[i]) {
                            this.playerNodeList[j].emit('player_ready', data.playerInfo.readyPlayerList[i]);
                        }
                    }
                }
                if (data.playerInfo.totalChips > 0) {
                    this.node.emit('init_totalChips', data.playerInfo.totalChips);     //pszGamingUI接收
                }
                if (global.playerData.account_id === global.joinRoomData.firstPlayerID) {
                    this.node.emit('show_start_btn');                //pszGamingUI接收
                }
                //pszGaming接收
                this.node.emit('change_some_data', {
                    readyPlayerList: data.playerInfo.readyPlayerList,
                    startPlayerList: data.playerInfo.startPlayerList,
                    playerNodeList: this.playerNodeList,
                });
            }
        });
        //聊天动画
        global.handler.onActionChat((data) => {
            console.log('聊天动画：' + JSON.stringify(data));
            let sendPosition = undefined;
            let receivePosition = undefined;
            sendPosition = this.playerSeatNode.children[this.playerPosList[data.sendPlayerIndex]].position;
            receivePosition = this.playerSeatNode.children[this.playerPosList[data.receivePlayerIndex]].position;
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
        global.handler.onPlayerJoinRoom((data) => {
            this.addPlayerNode(data, this.readyPlayerList, this.startPlayerList);
            this.node.emit('change_some_data', {playerNodeList: this.playerNodeList});        //pszGamingUI接收
        });
        //收到其他玩家离开房间的消息
        global.handler.onOtherLeaveRoom((data) => {
            console.log('收到玩家离开房间消息:' + JSON.stringify(data));
            for (let i = 0; i < this.playerNodeList.length; i++) {
                let playerNode = this.playerNodeList[i];
                let playerAccountID = playerNode.getComponent('pszPlayerNode').accountID;
                if (data === playerAccountID) {
                    this.playerNodeList[i].destroy();
                    this.playerNodeList.splice(i, 1);
                    break;
                }
            }

            let isReady = false;
            for (let i = 0, len = this.readyPlayerList.length; i < len; i++) {
                if (data === this.readyPlayerList[i]) {
                    isReady = true;
                    this.readyPlayerList.splice(i, 1);
                    break;
                }
            }
            if (isReady) {
                //pszGamingUI接收
                this.node.emit('change_some_data', {
                    readyPlayerList: this.readyPlayerList,
                    playerNodeList: this.playerNodeList
                });
            } else {
                this.node.emit('change_some_data', {playerNodeList: this.playerNodeList});        //pszGamingUI接收
            }
        });
        //通知之前进入房间的玩家，我准备好了，显示我的准备图片
        global.handler.onPlayerReady((data) => {
            this.readyPlayerList.push(data);
            console.log('readyPlayerList = ' + JSON.stringify(this.readyPlayerList));
            this.node.emit('change_some_data', {readyPlayerList: this.readyPlayerList});      //pszGamingUI接收
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('player_ready', data);
            }
        });
        global.handler.onGameStart((data) => {
            console.log('  gameStart  data = ' + JSON.stringify(data));
            if (this.inviteFriendsBtn.active) {
                this.inviteFriendsBtn.active = false;
            }
            this.round++;
            this.startPlayerList = data.startPlayerList;
            this.readyPlayerList = [];
            //nnGamingUI接收
            this.node.emit('change_some_data', {
                readyPlayerList: this.readyPlayerList,
                startPlayerList: this.startPlayerList
            });
            this.node.emit('init_startGame', {canAddChips: data.canAddChips, totalChips: data.totalChips});
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('game_start', {chips: data.nowChips});
            }
        });
        global.handler.onFaceChat((data) => {
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('face_chat', data);
            }
        });
        global.handler.onWordChat((data) => {
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('word_chat', data);
            }
        });
    },
    start() {
        this.onSocket();
    },
    update() {
        this.ruleList[0].getComponent(cc.Label).string = '房号:' + global.joinRoomData.roomID;
        this.ruleList[1].getComponent(cc.Label).string = '底分:' + global.joinRoomData.roomRules.basicScore;
        this.ruleList[2].getComponent(cc.Label).string = '回合:' + this.bout + '/' + global.joinRoomData.roomRules.limitRound;
        this.ruleList[3].getComponent(cc.Label).string = '局数:' + this.round + '/' + global.joinRoomData.roomRules.roundCount;
        this.ruleList[4].getComponent(cc.Label).string = '闷牌:' + global.joinRoomData.roomRules.stuffyRound + '回合';
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

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'showExplain':
                let explain = cc.instantiate(this.explainPrefab);
                explain.parent = this.node;
                break;
            case 'fightMenu':
                this.showFightSetBtn.active = false;
                let fightSetting = cc.instantiate(this.fightSettingPrefab);
                fightSetting.parent = this.node;
                break;
            case 'chat':
                let chat = cc.instantiate(this.chatPrefab);
                chat.parent = this.node;
                break;
            case 'voice':
                //todo 语音功能暂不完善，后续更新
                let tips = cc.instantiate(this.tipsPrefab);
                tips.parent = this.node;
                global.tip = '为促进和谐交流，暂停使用语音';
                break;
            case 'inviteFriends':
                console.log('微信邀请好友');
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
                console.log('我还点了什么我没设置啊？？？' + customData);
                break;
        }
    },

    addPlayerNode(data, readyPlayerList, startPlayerList) {
        let playerNode = cc.instantiate(this.playerNode);
        playerNode.parent = this.node;
        playerNode.getComponent('pszPlayerNode').initWithData(data, this.playerPosList[data.seatIndex], readyPlayerList, startPlayerList);
        playerNode.position = this.playerSeatNode.children[this.playerPosList[data.seatIndex]].position;
        this.playerNodeList.push(playerNode);
    },

    initPlayerPos(seatIndex) {
        switch (seatIndex) {
            case 0:
                this.playerPosList[0] = 0;
                this.playerPosList[1] = 1;
                this.playerPosList[2] = 2;
                this.playerPosList[3] = 3;
                this.playerPosList[4] = 4;
                this.playerPosList[5] = 5;
                break;
            case 1:
                this.playerPosList[1] = 0;
                this.playerPosList[2] = 1;
                this.playerPosList[3] = 2;
                this.playerPosList[4] = 3;
                this.playerPosList[5] = 4;
                this.playerPosList[0] = 5;
                break;
            case 2:
                this.playerPosList[2] = 0;
                this.playerPosList[3] = 1;
                this.playerPosList[4] = 2;
                this.playerPosList[5] = 3;
                this.playerPosList[0] = 4;
                this.playerPosList[1] = 5;
                break;
            case 3:
                this.playerPosList[3] = 0;
                this.playerPosList[4] = 1;
                this.playerPosList[5] = 2;
                this.playerPosList[0] = 3;
                this.playerPosList[1] = 4;
                this.playerPosList[2] = 5;
                break;
            case 4:
                this.playerPosList[4] = 0;
                this.playerPosList[5] = 1;
                this.playerPosList[0] = 2;
                this.playerPosList[1] = 3;
                this.playerPosList[2] = 4;
                this.playerPosList[3] = 5;
                break;
            case 5:
                this.playerPosList[5] = 0;
                this.playerPosList[0] = 1;
                this.playerPosList[1] = 2;
                this.playerPosList[2] = 3;
                this.playerPosList[3] = 4;
                this.playerPosList[4] = 5;
                break;
        }
    },

    playMusic(url, sex) {
        cc.audioEngine.play(cc.url.raw(global.nnMusicUrl + 'sex' + sex + url), false, global.playVolume);
    },
});
