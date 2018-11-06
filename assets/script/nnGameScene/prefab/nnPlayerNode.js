import global from './../../global';

cc.Class({
    extends: cc.Component,
    properties: {
        playerNodeFrame: cc.Node,           //外围边框
        headImg: cc.Sprite,
        offLineNode: cc.Node,
        offLineImg: cc.Sprite,
        readyNode: cc.Node,
        readyImg: cc.Sprite,
        nameLabel: cc.Label,
        pointLabel: cc.Label,
        //自己和他人的牌的节点，及牌的值，及倍数
        cardPrefab: cc.Prefab,
        cardsNode: cc.Node,
        selfCardsNode: cc.Node,
        selfWhichCowNode: cc.Node,
        selfMultipleNode: cc.Node,
        otherWhichCowNode: cc.Node,
        otherMultipleNode: cc.Node,
        whichCowSpriteAtlas: cc.SpriteAtlas,
        multipleSpriteAtlas: cc.SpriteAtlas,

        robIconSP: cc.Sprite,           //抢与不抢
        robBnakerSpriteAtlas: cc.SpriteAtlas,
        bankerIcon: cc.Node,            //庄家标志
        scoreLabel: cc.Label,           //单局结算的分数

        betNode: cc.Node,               //下注结果
        betLabel: cc.Label,             //下注结果文本
        selfBetNode: cc.Node,           //自己下注结果
        selfBetLabel: cc.Label,         //自己下注结果文本

        faceAtlas: cc.SpriteAtlas,       //表情合辑
        chatFace: cc.Sprite,
        chatWord: cc.Node,
        chatWordString: cc.Label,
        pokeCardPrefab: cc.Prefab,      //戳牌中。。。
    },

    onLoad() {
        this.cardList = [];             //牌的预制件
        this.otherCardList = {};       //其他玩家的牌的预制件
        this.cards = [];                //牌的数据
        this.bankerID = undefined;    //庄家ID
        this.startPlayerList = [];    //已开始游戏玩家列表
        this.readyPlayerList = [];    //已准备玩家列表

        //聊天表情
        this.node.on('face_chat', (data) => {
            let detail = data.detail;
            if (detail.playerID === this.accountID) {
                this.chatFace.node.active = true;
                setTimeout(() => {
                    this.chatFace.node.active = false;
                }, 4000);
                this.chatFace.spriteFrame = this.faceAtlas.getSpriteFrame('biaoqin' + detail.num);
                let action1 = cc.scaleTo(1, 2);
                let action2 = cc.scaleTo(1, 1);
                let seq1 = cc.sequence(action1, action2, action1, action2);
                this.chatFace.node.runAction(seq1);
            }
        });
        //聊天文字
        this.node.on('word_chat', (data) => {
            let detail = data.detail;
            if (detail.playerID === this.accountID) {

                this.playChatMusic(global.chatMusicList['word' + detail.num]);
                this.chatWord.active = true;
                this.chatWordString.string = global.wordList['word' + detail.num];
                setTimeout(() => {
                    this.chatWord.active = false;
                }, 2000);
            }
        });
        //监听readyPlayerList、startPlayerList的变化
        this.node.on('change_litile_data', (data) => {
            let detail = data.detail;
            if (detail.readyPlayerList) {
                this.readyPlayerList = detail.readyPlayerList;
            }
            if (detail.startPlayerList) {
                this.startPlayerList = detail.startPlayerList;
            }
        });
        //通知房间里的玩家，我掉线了
        this.node.on('player_off_line', (data) => {
            let detail = data.detail;
            console.log("------" + JSON.stringify(detail) + "掉线了！！！------");
            if (this.accountID === detail.playerID) {
                this.offLineNode.active = true;
                this.offLineImg.node.runAction(cc.sequence(cc.scaleTo(0, 2), cc.scaleTo(0.2, 1), cc.scaleTo(0.1, 1.3), cc.scaleTo(0.1, 1)));
            }
        });
        //NNGameScene发来的     玩家已准备通知
        this.node.on('player_ready', (evnet) => {
            let detail = evnet.detail;
            console.log("*** playerNode *** on player_ready detail=" + detail);
            if (detail === this.accountID) {
                this.readyNode.active = true;
                let seq = cc.sequence(cc.scaleTo(0, 2), cc.scaleTo(0.2, 1), cc.scaleTo(0.1, 1.3), cc.scaleTo(0.1, 1));
                this.readyImg.node.runAction(seq);
            }

            //-----------------------------------第一局结束后，做一些判断处理-----------------------------------
            if (detail === global.playerData.account_id) {
                if (detail === this.accountID) {
                    if (this.selfBetNode.active) {
                        this.selfBetNode.active = false;
                    }
                    if (this.selfWhichCowNode.active) {
                        this.selfWhichCowNode.active = false;
                    }
                    if (this.selfMultipleNode.active) {
                        this.selfMultipleNode.active = false;
                    }
                    if (this.cardList.length !== 0) {
                        for (let i = 0; i < this.cardList.length; i++) {
                            this.cardList[i].destroy();
                        }
                        this.cardList = [];
                    }
                }

                if (detail !== this.accountID) {
                    if (this.betNode.active) {
                        this.betNode.active = false;
                    }
                    if (this.otherWhichCowNode.active) {
                        this.otherWhichCowNode.active = false;
                    }
                    if (this.otherMultipleNode.active) {
                        this.otherMultipleNode.active = false;
                    }
                    for (let i in this.otherCardList) {
                        if (i === this.accountID) {
                            for (let j = 0; j < this.otherCardList[i].length; j++) {
                                this.otherCardList[i][j].destroy();
                            }
                            console.log('删除前的otherCardList = ' + Object.keys(this.otherCardList).length);
                            delete this.otherCardList[i];
                            console.log('删除后的otherCardList = ' + Object.keys(this.otherCardList).length);
                        }
                    }
                }
                if (this.robIconSP.node.active) {
                    this.robIconSP.node.active = false;
                    this.robIconSP.node.position = cc.p(0, -90);
                }
                this.cards = [];
            }
        });
        //nnGameScene发来的    游戏开始通知
        this.node.on('game_start', (data) => {
            let detail = data.detail;
            // console.log('\n game_start收到的：' + JSON.stringify(detail));
            if (this.readyNode.active) {
                this.readyNode.active = false;
            }
        });
        //nnGamingUI发来的     展示通比牛牛玩家默认下的注
        this.node.on('show_player_bet', (data) => {
            let detail = data.detail;
            for (let i = 0, len = this.startPlayerList.length; i < len; i++) {
                if (this.accountID === this.startPlayerList[i]) {
                    if (this.accountID === global.playerData.account_id) {
                        this.selfBetNode.active = true;
                        this.selfBetLabel.string = detail;
                    } else {
                        if (this.index === 1 || this.index === 3) {
                            this.betNode.x *= -1;
                        }
                        this.betNode.active = true;
                        this.betLabel.string = detail;
                    }
                }
            }
        });
        //nnGameScene发来的    玩家下好注的通知
        this.node.on('one_bet_over', (data) => {
            let detail = data.detail;
            if (this.accountID === detail.playerID) {
                if (this.accountID === global.playerData.account_id) {
                    this.selfBetNode.active = true;
                    this.selfBetLabel.string = detail.bet;
                } else {
                    if (this.index === 1 || this.index === 3) {
                        this.betNode.x *= -1;
                    }
                    this.betNode.active = true;
                    this.betLabel.string = detail.bet;
                }
            }
        });
        //nnGameScene发来的    展示庄家
        this.node.on('show_banker', (data) => {
            let detail = data.detail;
            if (this.robIconSP.node.active) {
                this.robIconSP.node.active = false;
            }
            if (this.bankerIcon.active) {
                this.playerNodeFrame.active = false;
                this.bankerIcon.active = false;
            }
            console.log('** onShowBanker **' + JSON.stringify(detail));
            if (detail.type === 1) {
                this.bankerID = detail.bankerID;
                for (let i = 0; i < this.startPlayerList.length; i++) {
                    if (this.accountID === this.startPlayerList[i]) {
                        console.log('玩家的accountID为：' + this.accountID + " ; i=" + i);
                        setTimeout(() => {
                            let index = 9;
                            this.callback = function () {
                                if (index % 2 === 0) {
                                    this.playerNodeFrame.active = true;
                                } else {
                                    this.playerNodeFrame.active = false;
                                }
                                if (index < 0) {
                                    this.unschedule(this.callback);
                                    if (this.accountID === detail.bankerID) {
                                        if (detail.bankerScore !== null && detail.bankerScore !== undefined) {
                                            this.pointLabel.string = detail.bankerScore;
                                        }
                                        this.playerNodeFrame.active = true;
                                        this.bankerIcon.active = true;
                                        //通知nnGamingUI抢庄结束
                                        cc.systemEvent.emit('rob_over', {
                                            bankerID: detail.bankerID,
                                            bankerName: this.playerInfo.nickName,
                                            type: 1
                                        });
                                        if (detail.robBnakerMultiples !== undefined) {
                                            this.robIconSP.spriteFrame = this.robBnakerSpriteAtlas.getSpriteFrame('niuniu_bei' + detail.robBnakerMultiples);
                                            this.robIconSP.node.active = true;
                                            let spawn = cc.spawn(cc.moveTo(1.5, -80, -25), cc.scaleTo(1.5, 0.8));
                                            this.robIconSP.node.runAction(spawn);
                                        }
                                    }
                                }
                                index--;
                            };
                            this.schedule(this.callback, 0.15);
                        }, (300 / (this.startPlayerList.length) * i));
                    }
                }
            } else if (detail.type === 2) {
                this.bankerID = detail.bankerID;
                if (this.accountID === detail.bankerID) {
                    this.playerNodeFrame.active = true;
                    this.bankerIcon.active = true;
                    if (detail.bankerScore !== undefined) {
                        this.pointLabel.string = detail.bankerScore;
                    }
                    //通知nnGamingUI抢庄结束
                    cc.systemEvent.emit('rob_over', {
                        bankerID: detail.bankerID,
                        bankerName: this.playerInfo.nickName,
                        type: 2
                    });
                }
            } else if (detail.type === 3) {
                if (this.accountID === detail.bankerID) {
                    this.playerNodeFrame.active = true;
                    this.bankerIcon.active = true;
                    //通知nnGamingUI抢庄结束
                    cc.systemEvent.emit('rob_over', {
                        bankerID: detail.bankerID,
                        bankerName: this.playerInfo.nickName,
                        type: 3
                    });
                }
            }
        });
        //nnGameScene发来的    系统发牌通知
        this.node.on('push_card', (data) => {
            console.log("** nnPlayerNode push_card **" + JSON.stringify(data.detail) + " ; type = " + typeof (data.detail));
            let cardsLength = 0;
            if (typeof (data.detail) === "number") {
                cardsLength += data.detail;
            } else {
                for (let i = 0; i < data.detail.length; i++) {
                    this.cards.push(data.detail[i]);
                }
                cardsLength = data.detail.length;
            }
            if (this.accountID !== global.playerData.account_id) {
                // console.log('==============' + JSON.stringify(this.startPlayerList));
                for (let i = 0; i < this.startPlayerList.length; i++) {
                    if (this.startPlayerList[i] === this.accountID) {
                        if (this.otherCardList[this.accountID] === undefined || this.otherCardList[this.accountID].length !== 5) {
                            this.pushOtherCard(this.accountID, cardsLength);
                        }
                    }
                }
            } else {
                if (typeof (data.detail) !== "number") {
                    this.pushSelfCard(data.detail);
                    console.log("** nnPlayerNode push_card **" + JSON.stringify(this.cards));
                    if (this.cards.length === 4) {
                        this.showSelfCard(this.cards);
                        setTimeout(() => {
                            cc.systemEvent.emit('rob_banker');//nnGamingUI接收
                        }, 300);
                    } else {
                        setTimeout(() => {
                            cc.systemEvent.emit('push_card_over', this.cards);//nnGamingUI接收
                        }, 300);
                    }
                }
            }
        });
        //nnGamingUI发来的     翻牌通知
        this.node.on('flop', (data) => {
            let detail = data.detail;
            if (this.accountID === detail) {
                this.showSelfCard(this.cards);
            }
        });
        //nnGamingUI发来的     提示或亮牌的通知
        this.node.on('tipCard', (data) => {
            let detail = data.detail;
            if (global.playerData.account_id === this.accountID) {
                for (let i = 0; i < this.cardList.length; i++) {
                    this.cardList[i].position = cc.p((this.cardList[i].width * 0.6 * (5 - 1) * -0.5 + this.cardList[i].width * 0.6 * i), 0);
                }
                global.gameService.proxy.tipCards((data) => {
                    if (!data.ok) {
                        console.log('** nnPlayerNode ** requestTipCards err = ' + data.data);
                    } else {
                        let url = global.nnMusicList['niu_type' + data.data.cardsValue];
                        this.playMusic(url);
                        //先将 selfWhichCowNode 与 selfMultipleNode 的位置复原
                        this.selfWhichCowNode.position = cc.p(0, 0);
                        this.selfMultipleNode.position = cc.p(0, 0);

                        this.selfWhichCowNode.active = true;
                        let whichCowKey = 'niuniu_cow_' + data.data.cardsValue;
                        let multipleKey = undefined;
                        this.selfWhichCowNode.getComponent(cc.Sprite).spriteFrame = this.whichCowSpriteAtlas.getSpriteFrame(whichCowKey);

                        if (data.data.multiple !== undefined && data.data.multiple !== 1) {
                            if (data.data.cardsValue > 10) {
                                multipleKey = 'niuniu_mult_red_' + data.data.multiple;
                            } else {
                                multipleKey = 'niuniu_mult_yellow_' + data.data.multiple;
                            }
                            let x1 = -(this.selfWhichCowNode.width / 2) + 50;
                            this.selfWhichCowNode.position = cc.p(x1, 0);
                            this.selfMultipleNode.active = true;
                            this.selfMultipleNode.getComponent(cc.Sprite).spriteFrame = this.multipleSpriteAtlas.getSpriteFrame(multipleKey);
                            let x2 = (this.selfMultipleNode.width / 2) + 50;
                            this.selfMultipleNode.position = cc.p(x2, 0);
                        }
                            if (detail === 1) {
                                global.gameService.proxy.showDownCards({
                                    cardsValue: data.data.cardsValue,
                                    multiple: data.data.multiple
                                });
                            }
                        }
                });
            }
        });
        //nnGamingUI发来的     监听玩家亮牌的消息
        this.node.on('player_show_down_cards', (data) => {
            let detail = data.detail;
            console.log('玩家亮牌的data = ' + JSON.stringify(detail));
            if (detail.playerID === this.accountID) {
                let url = global.nnMusicList['niu_type' + detail.cardsValue];
                this.playMusic(url);
                this.showOtherCard(detail.playerID, detail.cardsData, detail.cardsValue, detail.multiple);
            }
        });
        //nnGamingUI发来的     监听比牌结果消息
        this.node.on('compare_card_result', (data) => {
            let detail = data.detail;
            if (detail.playerID === this.accountID) {
                console.log('** onCompareCardResult ** data = ' + JSON.stringify(detail) + ' : id = ' + this.accountID);
                this.scoreLabel.node.active = true;
                if (detail.score >= 0) {
                    this.scoreLabel.node.color = new cc.color(23, 156, 234, 255);
                    this.scoreLabel.string = '+' + detail.score;
                } else {
                    this.scoreLabel.node.color = new cc.color(252, 252, 50, 255);
                    this.scoreLabel.string = detail.score;
                }
                setTimeout(() => {
                    let scaleSeq = cc.sequence(cc.scaleTo(0.9, 2), cc.scaleTo(0.1, 0));
                    let spawn = cc.spawn(cc.moveTo(1, this.pointLabel.node.position), scaleSeq);
                    this.scoreLabel.node.runAction(cc.sequence(spawn, cc.callFunc(() => {
                        this.scoreLabel.node.active = false;
                        this.pointLabel.string += detail.score;
                        //比完牌 scoreLabel 要复原
                        this.scoreLabel.node.scale = 1;
                        this.scoreLabel.node.position = cc.p(0, 90);
                    })));
                }, 1000);
            }
        });
        //监听玩家抢庄情况
        this.node.on('player_rob_state', (data) => {
            let detail = data.detail;
            console.log('** onPlayerRobState ** data = ' + JSON.stringify(detail));
            if (detail.accountID === this.accountID) {
                if (detail.value === 'rob') {
                    this.robIconSP.spriteFrame = this.robBnakerSpriteAtlas.getSpriteFrame('niuniu_rob');
                } else if (detail.value === 'norob') {
                    this.robIconSP.spriteFrame = this.robBnakerSpriteAtlas.getSpriteFrame('niuniu_norob');
                } else {
                    this.robIconSP.spriteFrame = this.robBnakerSpriteAtlas.getSpriteFrame('niuniu_bei' + detail.value);
                }
                this.robIconSP.node.active = true;
            }
        });

    },

    /**
     * 初始化界面数据
     * @param data
     * @param index 玩家的座位
     */
    initWithData(data, index, readyPlayerList, startPlayerList) {
        console.log('** nnPlayerNode **  initWithData = ' + JSON.stringify(data) + ' ; index = ' + index);
        this.nameLabel.string = decodeURI(data.nickName);
        this.pointLabel.string = data.score;
        cc.loader.load({url: data.avatarUrl, type: 'jpg'}, (err, tex) => {
            //cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
            let oldWidth = this.headImg.node.width;
            this.headImg.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImg.node.width;
            this.headImg.node.scale = oldWidth / newWidth;
        });

        this.readyPlayerList = readyPlayerList;
        this.startPlayerList = startPlayerList;
        this.playerInfo = data;
        this.accountID = data.accountID;
        this.index = index;     //经转换后的相对位置

        //开局后的一些信息初始化
        if (data.isBanker) {
            this.playerNodeFrame.active = true;
            this.bankerIcon.active = true;
        }
        if (data.cards !== undefined && data.cards.length !== 0) {
            console.log('没有牌进不来。。。');
            if (typeof(data.cards) === "number") {
                this.pushOtherCard(data.accountID, data.cards);
            } else {
                this.pushOtherCard(data.accountID, data.cards.length);
                this.showOtherCard(data.accountID, data.cards, data.cardsValue, data.multiple);
            }
        }
        if (data.playerBet !== 0) {
            this.betNode.active = true;
            if (this.index === 1 || this.index === 3) {
                this.betNode.x *= -1;
            }
            this.betLabel.string = data.playerBet;
        }

        // if (index === 1) {
        //     this.pushedCardsNode.x *= -1;
        // }
    },

    pushOtherCard(accountID, length) {
        let num = 0;
        if (length === 1) {
            num = 4;
        }

        for (let i = 0; i < length; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.cardsNode;
            card.scale = 0.5;
            card.position = cc.p((card.width * 0.35 * (5 - 1) * -0.5 + card.width * 0.35 * (i + num)), 0);
            if (this.otherCardList.hasOwnProperty(accountID)) {
                this.otherCardList[accountID].push(card);
            } else {
                this.otherCardList[accountID] = [card];
            }

        }
    },

    pushSelfCard(data) {
        let num = 0;
        if (data.length === 1) {
            num = 4;
        }
        for (let i = 0; i < data.length; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.selfCardsNode;
            card.position = cc.p((card.width * 1.2 * (5 - 1) * -0.5 + card.width * 1.2 * (i + num)), 0);
            this.cardList.push(card);
        }
    },

    showSelfCard(data) {
        for (let i = 0; i < this.cardList.length; i++) {
            this.cardList[i].getComponent('card').showCard(data[i]);
        }
    },

    showOtherCard(playerID, cardsData, cardsValue, multiple) {
        for (let i in this.otherCardList) {
            if (i === playerID) {
                console.log(playerID + ' 玩家，有牌 ' + this.otherCardList[i].length + ' 张；');
                for (let j = 0; j < this.otherCardList[i].length; j++) {
                    this.otherCardList[i][j].getComponent('card').showCard(cardsData[j]);
                }
            }
        }
        //先将 otherWhichCowNode 与 otherMultipleNode 的位置复原，有需要再进行调整
        this.otherWhichCowNode.position = cc.p(0, 0);
        this.otherMultipleNode.position = cc.p(0, 0);

        this.otherWhichCowNode.active = true;
        this.otherWhichCowNode.getComponent(cc.Sprite).spriteFrame = this.whichCowSpriteAtlas.getSpriteFrame('niuniu_cow_' + cardsValue);

        this.otherWhichCowNode.scale = 0.6;
        if (multiple !== undefined && multiple !== 1) {
            let multipleKey = undefined;
            if (cardsValue > 10) {
                multipleKey = 'niuniu_mult_red_' + multiple;
            } else {
                multipleKey = 'niuniu_mult_yellow_' + multiple;
            }
            let x1 = -(this.otherWhichCowNode.width / 2) + 50;
            this.otherWhichCowNode.position = cc.p(x1, 0);
            let x2 = (this.otherMultipleNode.width / 2) + 50;
            this.otherMultipleNode.active = true;
            this.otherMultipleNode.position = cc.p(x2, 0);
            this.otherMultipleNode.getComponent(cc.Sprite).spriteFrame = this.multipleSpriteAtlas.getSpriteFrame(multipleKey);
            this.otherMultipleNode.scale = 0.6;
        }
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'show_user_info':
                console.log('展示玩家信息。。。' + JSON.stringify(this.playerInfo));
                cc.systemEvent.emit('show_user_info', this.playerInfo);
                break;
            default:
                break;
        }
    },

    playMusic(url) {
        cc.audioEngine.play(cc.url.raw(global.nnMusicUrl + 'sex' + this.playerInfo.sex + url), false, global.playVolume);
    },
    playChatMusic(url) {
        cc.audioEngine.play(cc.url.raw(global.chatMusicUrl + 'chatSex' + this.playerInfo.sex + url), false, global.playVolume);
    },
});
