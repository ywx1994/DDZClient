import global from './../../global';

const voiceNative = require("./../../utils/VoiceNative");
cc.Class({
    extends: cc.Component,
    properties: {
        gameingUI: cc.Node,
        readyBtn: cc.Node,
        robUI: cc.Node,                  //抢地主UI
        playUI: cc.Node,                 //出牌UI
        selfPushedCardsNode: cc.Node,  //自己出牌的位置的节点
        noPushNode: cc.Node,            //不出
        trustNode: cc.Node,              //托管
        stopTrustNode: cc.Node,         //取消托管

        playClockLabel: cc.Label,      //出牌计时器的数字
        robClockLabel: cc.Label,       //抢地主计时器的数字
        robLabel: cc.Label,
        norobLabel: cc.Label,

        tipsPrefab: cc.Prefab,
        cardPrefab: cc.Prefab,
        destroyRoomTipPrefab: cc.Prefab,       //房间销毁的提示
        chooseDestroyRoomPrefab: cc.Prefab,   //房间销毁的选择

        settlementPrefab: cc.Prefab,           //单局游戏结算
        fightResultPrefab: cc.Prefab,          //全部游戏结算

        _voiceMsgQueue: [],                    //存储所有收到的语音
        _playingAccountID: null,              //播放语音的玩家
        _lastPlayTime: null,                  //
    },
    onLoad() {
        this.playUIList = this.playUI.children;
        this.playerNodeList = [];       //玩家的预制件节点
        this.cardsData = [];            //牌的数据
        this.cardList = [];             //玩家牌的节点
        this.bottomCardsData = [];     //底牌的数据
        this.bottomCardList = [];      //底牌的节点
        this.chooseCardDataList = []; //选中的牌的数据
        this.tipCardsList = [];       //用于提示的牌的数组
        this.tipCardsIndex = 0;       //用于提示的牌的下标
        this.isTrust = false;         //是否托管


        //DDZGameScene发来的，接收所有玩家预制件节点
        this.node.on('player_node_list', (data) => {
            let detail = data.detail;
            this.playerNodeList = detail;
            console.log(' !!!  playerNodeList.length = ' + this.playerNodeList.length);
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
        //聊天语音
        global.handler.onVoiceChat((data) => {
            this._voiceMsgQueue.push(data);
            this.playVoice();
            // for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
            //     this.playerNodeList[i].emit('voice_chat', data);        //playerNode接收
            // }
        });
        //游戏中的玩家掉线
        global.handler.onPlayerOffLine((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('player_off_line', data);        //playerNode接收
            }
        });
        //解散房间(游戏未开始，房间解散成功)
        global.handler.onDestroyRoom((data) => {
            let destroyRoomTip = cc.instantiate(this.destroyRoomTipPrefab);
            destroyRoomTip.parent = this.node;
        });
        //解散房间请求
        global.handler.onDestroyRoomRequest((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('stop_playTimer');      //playerNode接收
            }
            if (this.robUI.active) {
                this.unschedule(this.robCountDownTimer);
            }
            if (this.playUI.active) {
                this.unschedule(this.playCountDownTimer);
            }
            let chooseDestroyRoom = cc.instantiate(this.chooseDestroyRoomPrefab);
            chooseDestroyRoom.parent = this.node;
            chooseDestroyRoom.getComponent('chooseDestroyRoom').initWithData(data);
        });
        //解散房间失败
        global.handler.onDestroyRoomFailed((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('begin_playTimer');     //playerNode接收
            }
            let tip = cc.instantiate(this.tipsPrefab);
            tip.parent = this.node;
            global.tip = '有玩家未同意，解散失败';
            this.node.getChildByName('chooseDestroyRoom').destroy();
            if (this.robUI.active) {
                this.schedule(this.robCountDownTimer, 1);
            }
            if (this.playUI.active) {
                this.schedule(this.playCountDownTimer, 1);
            }
        });
        //DDZGameScene发来的
        this.node.on('game_start', () => {
            this.trustNode.active = true;
        });
        //系统发牌通知
        global.handler.onPushCard((data) => {
            // console.log("gameingUI......" + JSON.stringify(data));
            this.pushCard(data);
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('system_push_card', data);        //playerNode接收
            }
        });
        //ID为data的玩家可以叫/抢地主了
        global.handler.onCanLandClaim((data) => {
            console.log("gameingUI onCanLandClaim data=" + JSON.stringify(data));
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('show_playTimer', {seatIndex: data.caller, time: 15});        //playerNode接收
            }
            if (data.caller === global.playerData.seatNum) {
                this.robUI.active = true;
                this.robClockLabel.string = 15;
                if (data.robTimes === 0) {
                    this.robLabel.string = '叫地主';
                    this.norobLabel.string = '不叫';
                } else {
                    this.robLabel.string = '抢地主';
                    this.norobLabel.string = '不抢';
                }
                this.robCountDownTimer = function () {
                    this.robClockLabel.string -= 1;
                    if (this.robClockLabel.string <= 5) {
                        cc.audioEngine.play(cc.url.raw('resources/audio/timeWarring.mp3'), false, global.playVolume);
                    }
                    if (this.robClockLabel.string < 1) {
                        this.onButtonClick(null, 'norob');
                    }
                };
                this.schedule(this.robCountDownTimer, 1);

                if (this.isTrust) {
                    setTimeout(() => {
                        this.onButtonClick(null, 'norob');
                    }, 1000)
                }
            }
        });
        //玩家抢地主的状态
        global.handler.onPlayerRobState((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('player_rob_state', data);        //playerNode接收
            }
        });
        //展示底牌
        global.handler.onShowBottomCards((data) => {
            console.log("*** gameingUI *** onShowBottomCards data=" + JSON.stringify(data));
            this.bottomCardsData = data;
            for (let i = 0; i < data.length; i++) {
                let card = this.bottomCardList[i];
                card.getComponent('card').showCard(data[i]);
            }

            //0.5s后将底牌移到桌面顶部并缩小
            this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(() => {
                let index = 0;
                const runActionCb = () => {
                    index++;
                    if (index === 3) {
                        this.node.emit('add_card_to_player');//通知玩家要加牌  GameScene中接收
                        if (global.playerData.account_id === global.playerData.landID) {
                            for (let i = 0, len = this.bottomCardsData.length; i < len; i++) {
                                let card = cc.instantiate(this.cardPrefab);
                                card.parent = this.gameingUI;
                                card.scale = 0.8;
                                card.position = cc.p((card.width * 0.35 * (17 - 1) * -0.5 + card.width * 0.35 * this.cardList.length) + 70, -235);
                                card.getComponent('card').showCard(this.bottomCardsData[i], global.playerData.account_id);
                                this.cardList.push(card);
                                this.cardsData.push(this.bottomCardsData[i]);
                            }
                            this.sortCards();
                        }
                    }
                };
                for (let i = 0; i < this.bottomCardList.length; i++) {
                    let card = this.bottomCardList[i];
                    this.runCardAction(card, this.landPos, runActionCb);
                }
            })));
        });
        //监听地主位置,GameScene发来的
        this.node.on('land_pos', (data) => {
            let detail = data.detail;
            console.log("---地主的位置---" + detail);
            this.landPos = detail;
        });
        //托管
        global.handler.onShowTrust((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('show_trust', data);        //playerNode接收
            }
            if (data === global.playerData.account_id) {
                if (this.robUI.active) {
                    setTimeout(() => {
                        this.onButtonClick(null, 'norob');
                    }, 1000);
                    return;
                }
                if (this.playUI.active) {
                    if (this.isTrust) {
                        setTimeout(() => {
                            if (this.tipCardsList.length === 0) {
                                this.onButtonClick(null, 'no_push');
                            } else {
                                this.tipCardsIndex = 0;
                                console.log("xiaobiaozzz"+this.tipCardsIndex);
                                this.onButtonClick(null, 'tips');
                                this.onButtonClick(null, 'push_card');
                            }
                        }, 1000)
                    }
                    return;
                }
            }
        });
        //取消托管
        global.handler.onStopShowTrust((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('stop_trust', data);        //playerNode接收
            }
        });
        //监听玩家可以出牌消息
        global.handler.onCanPushCard((data) => {
            console.log('** gameingUI ** onCanPushCard data=' + JSON.stringify(data));
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('show_playTimer', {seatIndex: data.seatIndex, time: 25});     //playerNode接收
            }
            if (data.seatIndex === global.playerData.seatNum) {
                if (this.noPushNode.active) {
                    this.noPushNode.active = false;
                }
                this.playUIList[0].active = true;
                if (data.lastCardsLength === 0) {
                    this.playUIList[0].active = false;
                }
                this.playUI.active = true;
                for (let i = 0; i < this.selfPushedCardsNode.children.length; i++) {
                    this.selfPushedCardsNode.children[i].destroy();
                }
                this.tipCardsList = [];
                this.tipCardsIndex = 0;

                global.gameService.proxy.tipCards((data) => {
                    if (!data.ok) {
                        console.log('*** gameingUI *** requestTipCards err=' + JSON.stringify(data.data));
                        let tips = cc.instantiate(this.tipsPrefab);
                        tips.parent = this.node;
                        global.tip = data.data;
                        this.playUIList[2].active = false;
                        this.playUIList[3].active = false;
                    } else {
                        this.tipCardsList = data.data;
                        console.log('*** gameingUI *** requestTipCards this.tipCardsList= ' + JSON.stringify(this.tipCardsList));
                        this.playUIList[2].active = true;
                        this.playUIList[3].active = true;
                    }
                });
                this.playClockLabel.string = 25;
                this.playCountDownTimer = function () {
                    this.playClockLabel.string -= 1;
                    if (this.playClockLabel.string <= 5) {
                        cc.audioEngine.play(cc.url.raw('resources/audio/timeWarring.mp3'), false, global.playVolume);
                    }
                    if (this.playClockLabel.string < 1) {
                        if (this.playUIList[0].active) {
                            this.onButtonClick(null, 'no_push');
                        } else {
                            this.tipCardsIndex = 0;
                            console.log("xiaobiaozzz"+this.tipCardsIndex);
                            this.onButtonClick(null, 'tips');
                            this.onButtonClick(null, 'push_card');
                        }
                    }
                };
                this.schedule(this.playCountDownTimer, 1);

                if (this.isTrust) {
                    setTimeout(() => {
                        if (this.tipCardsList.length === 0) {
                            this.onButtonClick(null, 'no_push');
                        } else {
                            this.tipCardsIndex = 0;
                            console.log("xiaobiaozzz"+this.tipCardsIndex);
                            this.onButtonClick(null, 'tips');
                            this.onButtonClick(null, 'push_card');
                        }
                    }, 1000)
                }
            }
        });
        //监听card传来的选中牌的消息
        cc.systemEvent.on('choose_card', (data) => {
            let detail = data.detail;
            console.log('gaming选中的牌为：' + JSON.stringify(detail));
            this.chooseCardDataList.push(detail);
        });
        //监听card传来的取消选中牌的消息
        cc.systemEvent.on('unchoose_card', (data) => {
            let detail = data.detail;
            for (let i = 0; i < this.chooseCardDataList.length; i++) {
                if (detail.id === this.chooseCardDataList[i].id) {
                    console.log("取消选中的牌：" + detail.id);
                    this.chooseCardDataList.splice(i, 1);
                    break;
                }
            }
        });
        //玩家出牌
        global.handler.onPlayerPushedCards((data) => {
            console.log("*** gameingUI *** onPlayerPushedCards data=" + JSON.stringify(data));
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('player_push_cards', data);        //playerNode接收
            }
            let cardsData = data.cards;
            if (data.playerID === global.playerData.account_id) {
                for (let i = 0; i < cardsData.length; i++) {
                    let card = cc.instantiate(this.cardPrefab);
                    card.parent = this.selfPushedCardsNode;
                    card.scale = 0.5;
                    let width = card.width;
                    card.x = (cardsData.length - 1) * -0.5 * width * 0.25 + width * 0.25 * i;
                    card.zIndex = i;
                    card.getComponent('card').showCard(cardsData[i]);
                    for (let j = 0; j < this.cardsData.length; j++) {
                        if (cardsData[i].id === this.cardsData[j].id) {
                            this.cardsData.splice(j, 1);
                        }
                    }
                }
            }
        });
        //监听春天
        global.handler.onSpring((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('spring', data);        //playerNode接收
            }
        });
        //单局游戏结束
        global.handler.onOneGameOver((data) => {
            global.gameService.proxy.showRemainCards();
            let flag = false;
            for (let i = 0; i < data.winnerList.length; i++) {
                if (global.playerData.account_id === data.winnerList[i]) {
                    flag = true;
                }
            }
            let settlement = cc.instantiate(this.settlementPrefab);
            settlement.parent = this.node;
            if (flag) {
                settlement.getComponent('settlement').initWithData(2, data.listSettlement);
            } else {
                settlement.getComponent('settlement').initWithData(1, data.listSettlement);
            }
            if (this.stopTrustNode.active) {
                this.onButtonClick(null, 'stop_trust');
            }
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('settlement', data.listSettlement);        //playerNode接收
            }
        });
        //单局游戏结束时展示玩家手中剩余的牌
        global.handler.onShowOtherRemainCards((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('show_otherRemain_cards', data);        //playerNode接收
            }
        });
        //收到下一轮游戏的通知,settlement发出的
        cc.systemEvent.on('next_round', () => {
            if (this.noPushNode.active) {
                this.noPushNode.active = false;
            }
            console.log('gamingUI收到next_round通知！');
            for (let i = 0; i < this.selfPushedCardsNode.children.length; i++) {
                this.selfPushedCardsNode.children[i].destroy();
            }
            for (let i = 0; i < this.bottomCardList.length; i++) {
                this.bottomCardList[i].destroy();
            }
            for (let i = 0; i < this.cardList.length; i++) {
                this.cardList[i].destroy();
            }

            this.cardsData = [];
            this.bottomCardList = [];
            this.cardList = [];
            this.bottomCardsData = [];
            this.chooseCardDataList = [];
            this.tipCardsList = [];
            this.tipCardsIndex = 0;
            this.onButtonClick(null, 'ready');
        });
        //所有游戏结束
        global.handler.onAllGameOver((data) => {
            console.log('全部游戏结束：' + JSON.stringify(data));
            cc.systemEvent.off('next_round');
            this.unschedule(this.robCountDownTimer);
            this.unschedule(this.playCountDownTimer);
            let fightResult = cc.instantiate(this.fightResultPrefab);
            fightResult.parent = this.node;
            console.log('global.roomData:' + JSON.stringify(global.joinRoomData));
            fightResult.getComponent('fightResult').initWithData({
                roomID: global.joinRoomData.roomID,
                roundCount: global.joinRoomData.roomRules.roundCount,
                baseScore: global.joinRoomData.roomRules.basicScore,
                gameType: global.joinRoomData.roomRules.gameType,
                gameTime: data.gameTime,
                playerList: data.playerList,
                houseMasterID: data.houseMasterID,
                bigWinnerScore: data.bigWinnerScore,
                tyrantScore: data.tyrantScore

            });
        });

        //todo 断线重连估计客户端不用操作，交由服务端操作
        //todo 断线重连估计客户端不用操作，交由服务端操作
        //todo 断线重连估计客户端不用操作，交由服务端操作
        // //玩家掉线，10s后开始托管
        // global.socket.onPlayerOffLine((data) => {
        //     if (data.playerID === global.playerData.account_id) {
        //         let index = 10;
        //         this.trustCountDownTimer = function () {
        //             this.playClockLabel.string -= 1;
        //             if (this.playClockLabel.string < 1) {
        //                 this.unschedule('this.trustCountDownTimer');
        //                 this.onButtonClick(null, 'trust');
        //             }
        //         };
        //         this.schedule(this.trustCountDownTimer, 1);
        //     }
        // });
        // //玩家断线重连
        // global.socket.onBrokenWireReconnection((data) => {
        //     if (data.playerID === global.playerData.account_id) {
        //         if (this.stopTrustNode.active) {
        //             this.onButtonClick(null, 'stop_trust');
        //         } else {
        //             this.unschedule('this.trustCountDownTimer');
        //         }
        //     }
        // });
    },

    playVoice: function () {
        if (this._playingAccountID == null && this._voiceMsgQueue.length) {
            console.log("playVoice2");
            var data = this._voiceMsgQueue.shift();
            // var idx = cc.vv.gameNetMgr.getSeatIndexByID(data.sender);
            // var localIndex = cc.vv.gameNetMgr.getLocalIndex(idx);
            // this._playingSeat = localIndex;
            // this._seats[localIndex].voiceMsg(true);
            // this._seats2[localIndex].voiceMsg(true);

            var msgInfo = JSON.parse(data.content);

            var msgfile = "voicemsg.amr";
            console.log(msgInfo.msg.length);
            voiceNative.writeVoice(msgfile, msgInfo.msg);
            voiceNative.play(msgfile);
            this._lastPlayTime = Date.now() + msgInfo.time;
        }
    },
    onPlayerOver: function () {
        cc.audioEngine.resumeAll();
    },

    onDestroy() {
        cc.systemEvent.off('choose_card');
        cc.systemEvent.off('unchoose_card');
        cc.systemEvent.off('next_round');
    },

    update() {
        if (this._lastPlayTime != null) {
            if (Date.now() > this._lastPlayTime + 200) {
                this.onPlayerOver();
                this._lastPlayTime = null;
            }
        }
        else {
            this.playVoice();
        }
    },

    //底牌移到桌面顶部的动画
    runCardAction(card, pos, cb) {
        let x = 0;
        if (card.x < 0) {
            x = card.x + 90;
        } else if (card.x > 0) {
            x = card.x - 90;
        }
        let moveAction = cc.moveTo(0.5, cc.p(x, 240));
        let scaleAction = cc.scaleTo(0.5, 0.4);//0.5s内缩小到0.4倍
        card.runAction(moveAction);
        card.runAction(cc.sequence(scaleAction, cc.callFunc(() => {
            if (cb) {
                cb();
            }
        })));
    },
    //排序牌的方法
    sortCards() {
        this.cardList.sort(function (x, y) {
            let a = x.getComponent('card').cardData;
            let b = y.getComponent('card').cardData;
            if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                return b.value - a.value;
            }
            if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                return -1;
            }
            if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return 1;
            }
            if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return b.king - a.king;
            }
        });

        let x = this.cardList[0].x;
        for (let i = 0; i < this.cardList.length; i++) {
            let card = this.cardList[i];
            card.zIndex = i;
            card.x = x + card.width * 0.35 * i;
        }

        this.referCardsPos();
    },
    //系统发牌的方法
    pushCard(data) {
        this.cardsData = data;
        data.sort(function (a, b) {
            if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                return b.value - a.value;
            }
            if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                return -1;
            }
            if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return 1;
            }
            if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return b.king - a.king;
            }
        });

        for (let i = 0; i < data.length; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.gameingUI;
            card.scale = 0.8;
            card.position = cc.p((card.width * 0.32 * (17 - 1) * -0.5 + card.width * 0.32 * i) + 60, -235);
            card.getComponent('card').showCard(data[i], global.playerData.account_id);
            this.cardList.push(card);
        }

        this.bottomCardList = [];
        for (let i = 0; i < 3; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.gameingUI;
            card.scale = 0.8;
            card.position = cc.p((card.width * 0.8 + 20) * (3 - 1) * -0.5 + (card.width * 0.8 + 20) * i, 25);
            this.bottomCardList.push(card);
        }
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'ready':
                this.readyBtn.active = false;
                global.gameService.proxy.playerReady();
                break;
            case 'trust':
                global.gameService.proxy.trust();
                this.trustNode.active = false;
                this.stopTrustNode.active = true;
                this.stopTrustNode.zIndex = 888;    //888随意取的，为了使 stopTrustNode 处于最上层
                this.isTrust = true;
                break;
            case 'stop_trust':
                global.gameService.proxy.stopTrust();
                this.trustNode.active = true;
                this.stopTrustNode.active = false;
                this.isTrust = false;
                break;
            case'rob':
                this.unschedule(this.robCountDownTimer);
                let str1 = this.robLabel.string;
                global.gameService.proxy.robState(str1);
                this.robUI.active = false;
                break;
            case 'norob':
                this.unschedule(this.robCountDownTimer);
                let str2 = this.norobLabel.string;
                global.gameService.proxy.robState(str2);
                this.robUI.active = false;
                break;
            case 'no_push':
                console.log("不出");
                this.unschedule(this.playCountDownTimer);
                global.gameService.proxy.selfPushCards([], (data) => {
                    if (!data.ok) {
                        let tips = cc.instantiate(this.tipsPrefab);
                        tips.parent = this.node;
                        global.tip = data.data;
                    } else {
                        this.noPushNode.active = true;
                    }
                });
                for (let i = 0; i < this.cardList.length; i++) {
                    this.cardList[i].emit('go_back', this.chooseCardDataList);
                }
                this.playUI.active = false;
                break;
            case 'tips':
                console.log("提示");
                this.chooseCardDataList = [];
                this.showTipCards(this.tipCardsList);
                break;
            case 'push_card':
                this.unschedule(this.playCountDownTimer);
                if (this.chooseCardDataList.length === 0) {
                    let tips = cc.instantiate(this.tipsPrefab);
                    tips.parent = this.node;
                    global.tip = '请选择要出的牌！';
                    return;
                }
                this.chooseCardDataList.sort((a, b) => {
                    return a.value - b.value;
                });
                global.gameService.proxy.selfPushCards(this.chooseCardDataList, (data) => {
                    if (!data.ok) {
                        console.log("*** gameingUI *** push_card err=" + data.data);
                        let tips = cc.instantiate(this.tipsPrefab);
                        tips.parent = this.node;
                        global.tip = data.data;
                    } else {
                        console.log("*** gameingUI *** push_card data=" + JSON.stringify(data.data));

                        for (let i = 0; i < this.cardList.length; i++) {
                            this.cardList[i].emit('pushed_card', this.chooseCardDataList);
                        }
                        //把打出去的牌从cardList中删除
                        for (let i = 0; i < this.chooseCardDataList.length; i++) {
                            let cardData = this.chooseCardDataList[i];
                            for (let j = 0; j < this.cardList.length; j++) {
                                let card = this.cardList[j];
                                if (card.getComponent('card').id === cardData.id) {
                                    this.cardList.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        this.playUI.active = false;
                        this.chooseCardDataList = [];
                        this.referCardsPos();
                    }
                });

                break;
            default:
                break;
        }
    },

    //刷新牌的位置
    referCardsPos() {
        for (let i = 0; i < this.cardList.length; i++) {
            let card = this.cardList[i];
            let width = card.width;
            card.x = (this.cardList.length - 1) * width * 0.32 * -0.5 + width * 0.32 * i + 80;
        }
    },

    //展示提示的牌
    showTipCards(cardsList) {
        if (cardsList.length === 0) {
            let tips = cc.instantiate(this.tipsPrefab);
            tips.parent = this.node;
            global.tip = '没有牌比上家大！';
            return;
        }
        console.log("xiaobiao"+this.tipCardsIndex);
        let cards = cardsList[this.tipCardsIndex];
        for (let i = 0; i < this.cardList.length; i++) {
            this.cardList[i].emit('go_back');
        }
        for (let i = 0; i < this.cardList.length; i++) {
            this.cardList[i].emit('tip_cards', cards);
        }
        this.tipCardsIndex++;
        if (this.tipCardsIndex === cardsList.length) {
            this.tipCardsIndex = 0;
        }
    },
});