import global from './../../global'

cc.Class({
    extends: cc.Component,

    properties: {
        tipLabelNode: cc.Node,
        tipLabel: cc.Label,
        robUI: cc.Node,
        robUI2: cc.Node,

        seatDownBtn: cc.Button,
        startGameBtn: cc.Button,
        readyBtn: cc.Button,
        rubCardBtn: cc.Button,      //搓牌
        flopBtn: cc.Button,         //翻牌
        showDownBtn: cc.Button,    //亮牌
        tipCardBtn: cc.Button,     //提示

        plyerBetNode: cc.Node,
        smallBetLabel: cc.Label,
        bigBetLabel: cc.Label,
        plyerBetBtn: cc.Button,
        plyerBetLabel: cc.Label,

        tipsPrefab: cc.Prefab,
        rubCardPrefab: cc.Prefab,
        destroyRoomTipPrefab: cc.Prefab,       //房间销毁的提示
        chooseDestroyRoomPrefab: cc.Prefab,   //房间销毁的选择

        fightResultPrefab: cc.Prefab,
    },

    onLoad() {
        this.robUI2List = this.robUI2.children;
        this.bankerID = undefined;
        this.lastScore = 0;              // 玩家上局分数
        this.XJTZCount = 0;              // 闲家推注次数
        this.cards = undefined;         // 牌的数据
        this.readyPlayerList = [];     // 已准备玩家列表
        this.startPlayerList = [];     // 已开始游戏玩家列表
        this.playerNodeList = [];      // 玩家的预制件节点

        //NNGameScene发来的
        this.node.on('show_start_btn', () => {
            this.startGameBtn.node.active = true;
            this.startGameBtn.interactable = false;    //interactable为false时按钮变成灰色
            this.startGameBtn.node.opacity = 120;       //设置不透明度，255为不透明，值越小越透明
        });
        //NNGameScene发来的
        this.node.on('change_some_data', (data) => {
            let detail = data.detail;
            if (detail.readyPlayerList !== undefined) {
                this.readyPlayerList = detail.readyPlayerList;
                console.log('readyPlayerList 改变了咯。。。');
            }
            if (detail.startPlayerList !== undefined) {
                this.startPlayerList = detail.startPlayerList;
                console.log('startPlayerList 改变了咯。。。');
            }
            if (detail.playerNodeList !== undefined) {
                this.playerNodeList = detail.playerNodeList;
                console.log('playerNodeList 改变了咯。。。');
            }
            if (this.readyPlayerList.length < 2 && this.startGameBtn.node.active) {
                this.startGameBtn.interactable = false;    //interactable为false时按钮变成灰色
                this.startGameBtn.node.opacity = 120;       //设置不透明度，255为不透明，值越小越透明
            }
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('change_litile_data', {
                    readyPlayerList: this.readyPlayerList,
                    startPlayerList: this.startPlayerList
                })
            }
        });
        //聊天表情
        global.handler.onFaceChat((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('face_chat', data);        //playerNode接收
            }
        });
        //聊天文字
        global.handler.onWordChat((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('word_chat', data);        //playerNode接收
            }
        });
        //游戏中的玩家掉线
        global.handler.onPlayerOffLine((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('player_off_line', data);        //nnPlayerNode接收
            }
        });
        //解散房间(游戏未开始，房间解散成功)
        global.handler.onDestroyRoom(() => {
            let destroyRoomTip = cc.instantiate(this.destroyRoomTipPrefab);
            destroyRoomTip.parent = this.node;
        });
        //解散房间请求
        global.handler.onDestroyRoomRequest((data) => {
            this.unscheduleAllCallbacks();
            let chooseDestroyRoom = cc.instantiate(this.chooseDestroyRoomPrefab);
            chooseDestroyRoom.parent = this.node;
            chooseDestroyRoom.getComponent('chooseDestroyRoom').initWithData(data);
        });
        //解散房间失败
        global.handler.onDestroyRoomFailed((data) => {
            let tip = cc.instantiate(this.tipsPrefab);
            tip.parent = this.node;
            global.tip = '有玩家未同意，解散失败';
            this.node.getChildByName('chooseDestroyRoom').destroy();
            if (this.tipLabel.string.substr(0, 4) === '开始抢庄') {
                this.schedule(this.robBankerTimer, 1);
            }
            if (this.tipLabel.string.substr(0, 4) === '请选择下') {
                this.schedule(this.plyerBetTimer, 1);
            }
            if (this.tipLabel.string.substr(0, 4) === '查看手牌') {
                this.schedule(this.observeCardTimer, 1);
            }
            if (this.tipLabel.string.substr(0, 4) === '下一局即') {
                this.schedule(this.nextRoundTimer, 1);
            }
        });
        //第一位玩家掉线或离开房间（游戏未开始前）
        global.handler.onChangeFirstPlayer((data) => {
            if (global.playerData.account_id === data) {
                console.log('。。。我是第一位玩家了。。。');
                this.startGameBtn.node.position = cc.p(-200, -150);
                if (this.seatDownBtn.node.active) {
                    this.startGameBtn.node.active = true;
                    this.startGameBtn.interactable = false;
                    this.startGameBtn.node.opacity = 120;
                } else {
                    console.log('onChangeFirstPlayer 已准备的玩家人数为：' + this.readyPlayerList.length);
                    this.startGameBtn.node.active = true;
                    if (this.readyPlayerList.length >= 2) {
                        this.startGameBtn.interactable = true;
                        this.startGameBtn.node.opacity = 255;
                    } else {
                        this.startGameBtn.interactable = false;
                        this.startGameBtn.node.opacity = 120;
                    }
                    let seq = cc.sequence(cc.moveBy(0.8, 225, 0), cc.moveBy(0.5, -35, 0), cc.moveBy(0.4, 15, 0), cc.moveBy(0.5, -5, 0));
                    this.startGameBtn.node.runAction(seq);
                }
            }
        });

        global.handler.onCanStartGame((data) => {
            // console.log("告诉我是不是第一位玩家：" + data);
            if (global.playerData.account_id === data && this.seatDownBtn.node.active === false) {
                this.startGameBtn.interactable = true;
                this.startGameBtn.node.opacity = 255;
            }
        });
        global.handler.onCannotSeat((data) => {
            this.seatDownBtn.node.active = true;
            let tips = cc.instantiate(this.tipsPrefab);
            tips.parent = this.node;
            global.tip = data;
        });

        this.robBanker = function (gameType) {
            let index = 15;
            this.robBankerTimer = function () {
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '开始抢庄：' + index;
                if (index === 15) {
                    if (gameType === '自由抢庄') {
                        this.robUI.active = true;
                    } else if (gameType === '明牌抢庄') {
                        let x = Number(global.joinRoomData.roomRules.ZDQZ);
                        this.robUI2.active = true;
                        console.log('最大抢庄的倍数为：' + x);
                        for (let i = 0; i <= x; i++) {
                            this.robUI2List[i].active = true;
                            this.robUI2List[i].position = cc.p((this.robUI2List[i].width * 1.15 * x * -0.5 + this.robUI2List[i].width * 1.15 * i), 0);
                        }
                    }
                }
                if (index <= 0) {
                    this.onButtonClick(null, 'norob');
                }
                index--;
            };
            this.schedule(this.robBankerTimer, 1);
        };
        global.handler.onGameStart((data) => {
            this.playEffect(global.nnEffectList.startTip);
            this.readyPlayerList = [];
            console.log('开始游戏前 startPlayerList = ' + JSON.stringify(this.startPlayerList));
            this.startPlayerList = data.startPlayerList;
            console.log('开始游戏后 startPlayerList = ' + JSON.stringify(this.startPlayerList));
            if (!this.tipLabelNode.active) {
                this.tipLabelNode.active = true;
            }
            this.tipLabel.string = '游戏开始了';

            if (global.joinRoomData.roomRules.smallType === '自由抢庄') {
                setTimeout(() => {
                    this.robBanker('自由抢庄');
                }, 600);
            }
        });
        //通知某个玩家下好注了  playerNode中接收
        global.handler.onOneBetOver((data) => {
            this.playEffect(global.nnEffectList.chip);
            console.log('单个玩家下注完成' + JSON.stringify(data));
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('one_bet_over', data);
            }
        });
        //通比牛牛默认的下注
        global.handler.onShowPlayerBet((data) => {
            this.playEffect(global.nnEffectList.chip);
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('show_player_bet', data);   //nnPlayerNode接收
            }
        });
        global.handler.onShowBanker((data) => {
            if (data.lastScore !== null && data.lastScore !== undefined) {
                this.lastScore = data.lastScore;
                this.XJTZCount = data.XJTZCount;
            }
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('show_banker', data);   //nnPlayerNode接收
            }
        });
        //通知玩家系统发牌了  playerNode中接收
        global.handler.onPushCard((data) => {
            console.log("收到发牌通知：" + JSON.stringify(data));
            this.playEffect(global.nnEffectList.pushCard);
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('push_card', data);
            }
            if (!this.tipLabelNode.active) {
                this.tipLabelNode.active = true;
            }
            this.tipLabel.string = '开始发牌';
        });

        global.handler.onShowDownOver((data) => {
            this.unschedule(this.observeCardTimer);
            if (!this.tipLabelNode.active) {
                this.tipLabelNode.active = true;
            }
            this.tipLabel.string = '开始比牌';
            if (global.joinRoomData.roomRules.smallType !== '通比牛牛') {
                setTimeout(() => {
                    for (let i = 0; i < this.startPlayerList.length; i++) {
                        if (global.playerData.account_id !== this.bankerID && global.playerData.account_id === this.startPlayerList[i]) {
                            console.log(global.playerData.account_id + '去通知服务端比牌咯。。。。。。');
                            global.gameService.proxy.compareCardWithBanker();
                        }
                    }
                }, 500);
            }
        });

        global.handler.onOneGameOver((data) => {
            this.playEffect(global.nnEffectList.getCoin);
            this.node.emit('one_game_over');
            if (this.seatDownBtn.node.active) {
                this.seatDownBtn.node.active = false;
            }
            this.startPlayerList = [];
            this.cards = undefined;
            this.readyBtn.node.active = true;
            let index = 10;
            this.nextRoundTimer = function () {
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '下一局即将开始：' + index;
                if (index <= 0) {
                    this.onButtonClick(null, 'ready');
                    console.log('xia一局倒数计时结束');
                }
                index--;
            };
            this.schedule(this.nextRoundTimer, 1);
        });

        global.handler.onAllGameOver((data) => {
            this.unscheduleAllCallbacks();
            console.log('全部游戏结束：' + JSON.stringify(data));
            let fightResult = cc.instantiate(this.fightResultPrefab);
            fightResult.parent = this.node;
            console.log('global.roomData:' + JSON.stringify(global.joinRoomData));
            fightResult.getComponent('fightResult').initWithData({
                //todo 保存的房间信息有问题，得从服务端传会来
                roomID: global.joinRoomData.roomID,
                roundCount: global.joinRoomData.roomRules.roundCount,
                baseScore: global.joinRoomData.roomRules.basicScore,
                gameType: global.joinRoomData.roomRules.smallType,
                gameTime: data.gameTime,
                playerList: data.playerList,
                houseMasterID: data.houseMasterID,
                bigWinnerScore: data.bigWinnerScore,
                tyrantScore: data.tyrantScore
            });
            for (let i = 0, len = data.playerList.length; i < len; i++) {
                if (data.playerList[i].accountID === global.playerData.account_id) {
                    if (data.playerList[i].score > 0) {
                        this.playEffect(global.nnEffectList.win);
                    }
                    if (data.playerList[i].score < 0) {
                        this.playEffect(global.nnEffectList.lose);
                    }
                }
            }
        });

        //监听玩家亮牌的消息
        global.handler.onPlayerShowDownCards((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('player_show_down_cards', data);   //nnPlayerNode接收
            }
        });
        //监听比牌结果消息
        global.handler.onCompareCardResult((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('compare_card_result', data);   //nnPlayerNode接收
            }
        });
        //监听玩家抢庄情况
        global.handler.onPlayerRobState((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('player_rob_state', data);   //nnPlayerNode接收
            }
        });
        //rubCard发送过来的      搓完牌的通知
        cc.systemEvent.on('rub_card_over', () => {
            console.log('搓完牌了。。。。。。');
            this.onButtonClick(null, 'flop');
        });
        //nnPlayerNode发来的
        cc.systemEvent.on('rob_banker', () => {
            this.robBanker('明牌抢庄');
        });
        //nnPlayerNode发来的
        cc.systemEvent.on('rob_over', (data) => {
            let detail = data.detail;
            if (detail.type !== 3) {
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '（ ' + decodeURI(detail.bankerName) + ' ）成为了庄家';
                this.bankerID = detail.bankerID;
            }
            // console.log('startPlayerList = ' + JSON.stringify(this.startPlayerList));
            for (let i = 0; i < this.startPlayerList.length; i++) {
                if (global.playerData.account_id === this.startPlayerList[i]) {
                    if (global.playerData.account_id === detail.bankerID) {
                        setTimeout(() => {
                            if (!this.tipLabelNode.active) {
                                this.tipLabelNode.active = true;
                            }
                            this.playEffect(global.nnEffectList.waitPlyerBet);
                            this.tipLabel.string = '等待闲家下注';
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            let index = 15;
                            this.plyerBetTimer = function () {
                                if (!this.tipLabelNode.active) {
                                    this.tipLabelNode.active = true;
                                }
                                this.tipLabel.string = '请选择下注分数：' + index;
                                if (index === 15) {
                                    this.playEffect(global.nnEffectList.waitBet);
                                    this.plyerBetNode.active = true;
                                    let baseScoreList = (global.joinRoomData.roomRules.basicScore).split('/');
                                    this.smallBetLabel.string = baseScoreList[0];
                                    this.bigBetLabel.string = baseScoreList[1];
                                    if (this.lastScore > 0 && this.XJTZCount === 0) {
                                        this.plyerBetLabel.string = Number(baseScoreList[1]) + this.lastScore;
                                        this.plyerBetBtn.node.active = true;
                                    } else {
                                        this.plyerBetBtn.node.active = false;
                                    }
                                }
                                if (index <= 0) {
                                    this.onButtonClick(null, 'smallbet');
                                }
                                index--;
                            };
                            this.schedule(this.plyerBetTimer, 1);
                        }, 1000);
                    }
                }
            }

        });
        //nnPlayerNode发来的   系统发牌结束的通知
        cc.systemEvent.on('push_card_over', (data) => {
            let detail = data.detail;
            if (this.cards === undefined) {
                this.cards = detail;
            } else {
                for (let i = 0, len = detail.length; i < len; i++) {
                    this.cards.push(detail[i]);
                }
            }
            if (this.cards.length !== 0) {
                let GJSZ = global.joinRoomData.roomRules.GJSZ;
                for (let i = 0, len = GJSZ.length; i < len; i++) {
                    if (GJSZ[i] === '禁止搓牌') {
                        this.rubCardBtn.interactable = false;
                        this.rubCardBtn.node.opacity = 120;
                    } else {
                        this.rubCardBtn.interactable = true;
                        this.rubCardBtn.node.opacity = 255;
                    }
                }
                this.rubCardBtn.node.active = true;
                this.flopBtn.node.active = true;
            }
            let index = 15;
            this.observeCardTimer = function () {
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '查看手牌：' + index;
                if (index <= 0) {
                    this.unschedule(this.observeCardTimer);
                    if (this.cards.length !== 0) {
                        this.onButtonClick(null, 'showdown');
                    }
                }
                index--;
            };
            this.schedule(this.observeCardTimer, 1);
        });
    },

    onDestroy() {
        cc.systemEvent.off('rub_card_over');
        cc.systemEvent.off('rob_banker');
        cc.systemEvent.off('rob_over');
        cc.systemEvent.off('push_card_over');
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'seatDown':
                global.gameService.proxy.playerReady();
                this.seatDownBtn.node.active = false;
                if (this.startGameBtn.node.active) {
                    let seq = cc.sequence(cc.moveBy(0.8, 225, 0), cc.moveBy(0.5, -35, 0), cc.moveBy(0.4, 15, 0), cc.moveBy(0.5, -5, 0));
                    this.startGameBtn.node.runAction(seq);
                }
                break;
            case 'startGame':
                global.gameService.proxy.startGame();
                this.startGameBtn.node.active = false;
                break;
            case 'ready':
                this.unschedule(this.nextRoundTimer);
                global.gameService.proxy.playerReady();
                this.readyBtn.node.active = false;
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家准备';
                break;
            case 'rob':
                this.unschedule(this.robBankerTimer);
                this.robUI.active = false;
                global.gameService.proxy.robState('rob');
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家抢庄';
                break;
            case 'norob':
                this.unschedule(this.robBankerTimer);
                if (this.robUI.active) {
                    this.robUI.active = false;
                }
                if (this.robUI2.active) {
                    for (let i = 0, len = this.robUI2List.length; i < len; i++) {
                        this.robUI2List[i].active = false;
                    }
                    this.robUI2.active = false;
                }
                global.gameService.proxy.robState('norob');
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家抢庄';
                break;
            case 'one':
                this.unschedule(this.robBankerTimer);
                if (this.robUI2.active) {
                    for (let i = 0, len = this.robUI2List.length; i < len; i++) {
                        this.robUI2List[i].active = false;
                    }
                    this.robUI2.active = false;
                }
                global.gameService.proxy.robState('1');
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家抢庄';
                break;
            case 'two':
                this.unschedule(this.robBankerTimer);
                if (this.robUI2.active) {
                    for (let i = 0, len = this.robUI2List.length; i < len; i++) {
                        this.robUI2List[i].active = false;
                    }
                    this.robUI2.active = false;
                }
                global.gameService.proxy.robState('2');
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家抢庄';
                break;
            case 'three':
                this.unschedule(this.robBankerTimer);
                if (this.robUI2.active) {
                    for (let i = 0, len = this.robUI2List.length; i < len; i++) {
                        this.robUI2List[i].active = false;
                    }
                    this.robUI2.active = false;
                }
                global.gameService.proxy.robState('3');
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家抢庄';
                break;
            case 'four':
                this.unschedule(this.robBankerTimer);
                if (this.robUI2.active) {
                    for (let i = 0, len = this.robUI2List.length; i < len; i++) {
                        this.robUI2List[i].active = false;
                    }
                    this.robUI2.active = false;
                }
                global.gameService.proxy.robState('4');
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家抢庄';
                break;
            case 'rubcard'://搓牌
                let rubCard = cc.instantiate(this.rubCardPrefab);
                rubCard.parent = this.node;
                rubCard.getComponent('rubCard').initWithData(this.cards);
                break;
            case 'flop'://翻牌
                if (this.rubCardBtn.node.active) {
                    this.rubCardBtn.node.active = false;
                }
                this.flopBtn.node.active = false;
                for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                    this.playerNodeList[i].emit('flop', global.playerData.account_id);   //nnPlayerNode接收
                }
                this.tipCardBtn.node.active = true;
                this.showDownBtn.node.active = true;
                break;
            case 'tipcard'://提示
                this.tipCardBtn.node.active = false;
                for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                    this.playerNodeList[i].emit('tipCard', 0);   //nnPlayerNode接收
                }
                break;
            case 'showdown'://亮牌
                this.unschedule(this.observeCardTimer);
                console.log('。。。。。。亮牌咯');
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家亮牌';
                if (this.rubCardBtn.node.active) {
                    cc.systemEvent.emit('destroy_rubCardPrefab');       //rubCard中接收
                    this.rubCardBtn.node.active = false;
                }
                if (this.flopBtn.node.active) {
                    for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                        this.playerNodeList[i].emit('flop', global.playerData.account_id);   //nnPlayerNode接收
                    }
                    this.flopBtn.node.active = false;
                }
                if (this.tipCardBtn.node.active) {
                    this.tipCardBtn.node.active = false;
                }
                this.showDownBtn.node.active = false;
                for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                    this.playerNodeList[i].emit('tipCard', 1);   //nnPlayerNode接收
                }
                break;
            case 'smallbet':
                this.unschedule(this.plyerBetTimer);
                this.plyerBetNode.active = false;
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家下注';
                global.gameService.proxy.playerBet({playerBet: this.smallBetLabel.string, type: 1});
                break;
            case 'bigbet':
                this.unschedule(this.plyerBetTimer);
                this.plyerBetNode.active = false;
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家下注';
                global.gameService.proxy.playerBet({playerBet: this.bigBetLabel.string, type: 1});
                break;
            case 'plyerBet':
                this.unschedule(this.plyerBetTimer);
                this.plyerBetNode.active = false;
                if (!this.tipLabelNode.active) {
                    this.tipLabelNode.active = true;
                }
                this.tipLabel.string = '等待其他玩家下注';
                global.gameService.proxy.playerBet({playerBet: this.plyerBetLabel.string, type: 2});
                break;
            default:
                break;
        }
    },

    playEffect(url) {
        cc.audioEngine.play(cc.url.raw(global.nnMusicUrl + 'music/' + url), false, global.playVolume);
    },
});
