import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        dataNode: cc.Node,
        playerPosNode: cc.Node,
        showFightSetBtn: cc.Node,
        inviteFriendsBtn: cc.Node,

        tipsPrefab: cc.Prefab,
        chatPrefab: cc.Prefab,             // 聊天
        roomRulePrefab: cc.Prefab,        // 游戏规则
        nnPlayerNodePrefab: cc.Prefab,   // 玩家
        fightUserInfo: cc.Prefab,        // 玩家信息
        fightSettingPrefab: cc.Prefab,  //设置菜单
        gameSettingPrefab: cc.Prefab,   //音量设置
        actionChatPrefab: cc.Prefab,    //聊天动画
    },

    onLoad() {
        this.playerNodeList = [];           //玩家的预制件节点
        this.playerPosList = [];            //自己相对座位号为 0 的座位列表
        this.readyPlayerList = [];          //已准备的玩家列表
        this.startPlayerList = [];          //已开始游戏的玩家列表

        this.bgm = cc.audioEngine.play(cc.url.raw('resources/audio/wzn/music/gaming_room_bg.mp3'), true, global.bgmVolume);
        //-------------------------------初始化基础数据 begin-------------------------------
        let labelList = this.dataNode.children;     //0-房号；1-庄位；2-底分；3-已玩局数；4-总局数
        labelList[0].getComponent(cc.Label).string = global.joinRoomData.roomID;
        let roomRules = global.joinRoomData.roomRules;
        labelList[1].getComponent(cc.Label).string = roomRules.smallType;
        labelList[2].getComponent(cc.Label).string = roomRules.basicScore;
        labelList[3].getComponent(cc.Label).string = roomRules.nowRound;
        labelList[4].getComponent(cc.Label).string = "/" + roomRules.roundCount;
        //-------------------------------初始化基础数据 end---------------------------------
           global.gameService.proxy.enterRoom(global.playerData.accountID,data=>{
              if (!data.ok) {
                  console.log("requestEnterRoonScene err = ");
              }else {
                  console.log("requestEnterRoonScene data = " + JSON.stringify(data));
                  this.readyPlayerList = data.playerInfo.readyPlayerList;
                  this.startPlayerList = data.playerInfo.startPlayerList;
                  global.joinRoomData.firstPlayerID = data.playerInfo.firstPlayerID;
                  global.joinRoomData.houseManagerID = data.playerInfo.houseManagerID;
                  global.playerData.seatNum = data.playerInfo.seatIndex;
                  console.log("firstPlayerID：" + global.joinRoomData.firstPlayerID
                      + ", houseManagerID：" + global.joinRoomData.houseManagerID
                      + ", readyPlayerList： " + JSON.stringify(this.readyPlayerList)
                      + ", startPlayerList：" + JSON.stringify(this.startPlayerList));

                  this.initPlayerPos(data.playerInfo.seatIndex);
                  let playerData = data.playerInfo.playerData;
                  //显示之前进入房间的玩家的位置
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
                  //nnGaming接收
                  this.node.emit('change_some_data', {
                      readyPlayerList: data.playerInfo.readyPlayerList,
                      startPlayerList: data.playerInfo.startPlayerList,
                      playerNodeList: this.playerNodeList,
                  });
                  if (global.playerData.account_id === global.joinRoomData.firstPlayerID) {
                      this.node.emit('show_start_btn');                //nnGaming接收
                  }
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
        //通知之前进入房间的玩家，有玩家进入房间了，显示该玩家的位置
        global.handler.onPlayerJoinRoom((data) => {
            this.addPlayerNode(data, this.readyPlayerList, this.startPlayerList);
            this.node.emit('change_some_data', {playerNodeList: this.playerNodeList});        //nnGamingUI接收
        });

        //通知之前进入房间的玩家，我准备好了，显示我的准备图片
        global.handler.onPlayerReady((data) => {
            this.readyPlayerList.push(data);
            console.log('readyPlayerList = ' + JSON.stringify(this.readyPlayerList));
            this.node.emit('change_some_data', {readyPlayerList: this.readyPlayerList});      //nnGamingUI接收
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('player_ready', data);
            }
        });

        //通知玩家游戏开始  playerNode中接收
        global.handler.onGameStart((data) => {
            if (this.inviteFriendsBtn.active) {
                this.inviteFriendsBtn.active = false;
            }
            labelList[3].getComponent(cc.Label).string += 1;
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('game_start', data);
            }
            this.startPlayerList = data.startPlayerList;
            this.readyPlayerList = [];
            //nnGamingUI接收
            this.node.emit('change_some_data', {
                readyPlayerList: this.readyPlayerList,
                startPlayerList: this.startPlayerList
            });
        });

        this.node.on('one_game_over', () => {
            console.log('一局游戏结束了！！！');
            if (this.inviteFriendsBtn.active) {
                this.inviteFriendsBtn.active = false;
            }
        });

        //收到其他玩家离开房间的消息
        global.handler.onOtherLeaveRoom((data) => {
            console.log('收到玩家离开房间消息:' + JSON.stringify(data));
            for (let i = 0; i < this.playerNodeList.length; i++) {
                let playerNode = this.playerNodeList[i];
                let playerAccountID = playerNode.getComponent('nnPlayerNode').accountID;
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
                //nnGamingUI接收
                this.node.emit('change_some_data', {
                    readyPlayerList: this.readyPlayerList,
                    playerNodeList: this.playerNodeList
                });
            } else {
                this.node.emit('change_some_data', {playerNodeList: this.playerNodeList});        //nnGamingUI接收
            }
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

    /**
     * 添加玩家节点
     * @param data
     */
    addPlayerNode(playerData, readyPlayerList, startPlayerList) {
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
        let playerNode = cc.instantiate(this.nnPlayerNodePrefab);
        playerNode.parent = this.node;
        playerNode.getComponent('nnPlayerNode').initWithData(playerData, this.playerPosList[playerData.seatIndex], readyPlayerList, startPlayerList);
        playerNode.position = this.playerPosNode.children[this.playerPosList[playerData.seatIndex]].position;
        this.playerNodeList.push(playerNode);
    },

    /**
     * 通过自己的座位号，排布玩家位置
     * @param seatIndex
     */
    initPlayerPos(seatIndex) {
        let children = this.playerPosNode.children;
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
                this.playerPosList[0] = 2;
                this.playerPosList[5] = 3;
                this.playerPosList[3] = 4;
                this.playerPosList[4] = 5;
                break;
            case 2:
                this.playerPosList[2] = 0;
                this.playerPosList[0] = 1;
                this.playerPosList[1] = 2;
                this.playerPosList[4] = 3;
                this.playerPosList[5] = 4;
                this.playerPosList[3] = 5;
                break;
            case 3:
                this.playerPosList[3] = 0;
                this.playerPosList[5] = 1;
                this.playerPosList[4] = 2;
                this.playerPosList[1] = 3;
                this.playerPosList[0] = 4;
                this.playerPosList[2] = 5;
                break;
            case 4:
                this.playerPosList[4] = 0;
                this.playerPosList[3] = 1;
                this.playerPosList[5] = 2;
                this.playerPosList[0] = 3;
                this.playerPosList[2] = 4;
                this.playerPosList[1] = 5;
                break;
            case 5:
                this.playerPosList[5] = 0;
                this.playerPosList[4] = 1;
                this.playerPosList[3] = 2;
                this.playerPosList[2] = 3;
                this.playerPosList[1] = 4;
                this.playerPosList[0] = 5;
                break;
            default:
                break;
        }
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'roomRule':
                let roomRule = cc.instantiate(this.roomRulePrefab);
                roomRule.parent = this.node;
                let houseRule = '';
                for (let i = 0, len = global.joinRoomData.roomRules.GJSZ.length; i < len; i++) {
                    houseRule += ' ' + global.joinRoomData.roomRules.GJSZ[i];
                }
                let spaceilRule = '';
                for (let i = 0, len = global.joinRoomData.roomRules.TSPX.length; i < len; i++) {
                    if (i === 0) {
                        spaceilRule += global.joinRoomData.roomRules.TSPX[i];
                    } else {
                        spaceilRule += ' ' + global.joinRoomData.roomRules.TSPX[i];
                    }
                }
                roomRule.getComponent('roomRule').initWithData({
                    gameType: global.joinRoomData.roomRules.smallType,
                    basicScore: global.joinRoomData.roomRules.basicScore,
                    doubleRule: global.joinRoomData.roomRules.FBGZ,
                    roomRule: global.joinRoomData.roomRules.roomRate.substr(0, 4) + houseRule,
                    spaceilRule: spaceilRule
                });
                break;
            case 'fightMenu':
                this.showFightSetBtn.active = false;
                let fightSetting = cc.instantiate(this.fightSettingPrefab);
                fightSetting.parent = this.node;
                break;
            case 'voice':
                //todo 语音功能暂不完善，后续更新
                let tips = cc.instantiate(this.tipsPrefab);
                tips.parent = this.node;
                global.tip = '为促进和谐交流，暂停使用语音';
                break;
            case 'chat':
                let chat = cc.instantiate(this.chatPrefab);
                chat.parent = this.node;
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
                break;
        }
    },

    playMusic(url, sex) {
        cc.audioEngine.play(cc.url.raw(global.nnMusicUrl + 'sex' + sex + url), false, global.playVolume);
    },

});
