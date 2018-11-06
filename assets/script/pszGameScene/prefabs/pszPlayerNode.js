import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        nickNameLabel: cc.Label,
        moneyLabel: cc.Label,
        chipsLabel: cc.Label,
        headImage: cc.Sprite,
        readyNode: cc.Node,
        readyImg: cc.Sprite,
        offLineNode: cc.Node,
        offLineImg: cc.Node,
        bankerIcon: cc.Node,

        clockNode: cc.Node,
        clockTime: cc.Label,

        cardsPos: cc.Node,
        cardsNode: cc.Node,
        cardPrefab: cc.Prefab,
        playNode: cc.Node,
        choiceNode: cc.Node,
        isLookCardNode:cc.Node,

        chatWord: cc.Node,
        chatFace: cc.Sprite,
        chatWordString: cc.Label,
        faceAtlas: cc.SpriteAtlas,
    },
    onLoad() {
        this.cardsPosList = this.cardsPos.children;
        this.choiceList = this.choiceNode.children;
        this.startPlayerList = [];    //已开始游戏玩家列表
        this.readyPlayerList = [];    //已准备玩家列表
        this.cards = [];               // 牌的预制体
        this.cardsData = [];           // 牌的数据

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
        this.node.on('player_ready', (event) => {
            let detail = event.detail;
            console.log("*** playerNode *** on player_ready detail=" + detail);
            if (detail === this.accountID) {
                this.readyNode.active = true;
                let seq = cc.sequence(cc.scaleTo(0, 2), cc.scaleTo(0.2, 1), cc.scaleTo(0.1, 1.3), cc.scaleTo(0.1, 1));
                this.readyImg.node.runAction(seq);
            }
        });
        //通知房间里的玩家，我掉线了
        this.node.on('player_off_line', (data) => {
            let detail = data.detail;
            console.log("------" + JSON.stringify(detail) + "掉线了！！！------");
            if (this.accountID === detail.playerID) {
                this.offLineNode.active = true;
                this.offLineImg.runAction(cc.sequence(cc.scaleTo(0, 2), cc.scaleTo(0.2, 1), cc.scaleTo(0.1, 1.3), cc.scaleTo(0.1, 1)));
            }
        });
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
        //暂停计时器     pszGamingUI发来的
        this.node.on('stop_playTimer', () => {
            if (this.clockNode.active) {
                this.unschedule(this.playTimer);
            }
        });
        //恢复计时器     pszGamingUI发来的
        this.node.on('begin_playTimer', () => {
            if (this.clockNode.active) {
                this.schedule(this.playTimer, 1);
            }
        });

        this.node.on('game_start', (event) => {
            console.log('收到游戏开始的通知。。。');
            let detail = event.detail;
            if (this.readyNode.active) {
                this.readyNode.active = false;
            }
            for (let i = 0, len = this.startPlayerList.length; i < len; i++) {
                if (this.accountID === this.startPlayerList[i]) {
                    this.chipsLabel.string = detail.chips;
                    break;
                }
            }
        });
        this.node.on('show_banker', (event) => {
            let detail = event.detail;
            if (this.accountID === detail) {
                this.bankerIcon.active = true;
                this.bankerIcon.scale = 2;
                this.bankerIcon.runAction(cc.scaleTo(1, 1).easing(cc.easeBackOut()));
            }
        });
        this.node.on('push_card', (data) => {
            this.isLookCardNode.active = false;
            if (this.cards.length !== 0) {
                for (let i = 0; i < this.cards.length; i++) {
                    this.cards[i].destroy();
                }
                this.cards = [];
            }
            console.log('  startPlayerList  = ' + JSON.stringify(this.startPlayerList));
            if (typeof (data.detail) === "number") {
                if (this.seatPos !== 0) {
                    for (let i = 0, len = this.startPlayerList.length; i < len; i++) {
                        if (this.accountID === this.startPlayerList[i]) {
                            for (let i = 0; i < 3; i++) {
                                let card = cc.instantiate(this.cardPrefab);
                                card.parent = this.cardsNode;
                                this.playNode.position = this.cardsPosList[this.seatPos].position;
                                card.scale = 0.6;
                                card.x = card.width * 0.6 * 0.6 * (3 - 1) * -0.5 + card.width * 0.6 * 0.6 * i;
                                this.cards.push(card);
                            }
                            break;
                        }
                    }
                }
            } else {
                for (let i = 0, len = this.startPlayerList.length; i < len; i++) {
                    if (this.accountID === this.startPlayerList[i]) {
                        for (let i = 0; i < 3; i++) {
                            let card = cc.instantiate(this.cardPrefab);
                            card.parent = this.cardsNode;
                            this.playNode.position = this.cardsPosList[this.seatPos].position;
                            if (this.seatPos === 0) {
                                card.scale = 0.9;
                                card.x = card.width * 0.9 * 0.6 * (3 - 1) * -0.5 + card.width * 0.9 * 0.6 * i;
                            } else {
                                card.scale = 0.6;
                                card.x = card.width * 0.6 * 0.6 * (3 - 1) * -0.5 + card.width * 0.6 * 0.6 * i;
                            }
                            this.cards.push(card);
                        }
                        break;
                    }
                }
            }
        });
        this.node.on('showTime', (event) => {
            let data = event.detail;
            if (this.seatNum === data.seatIndex && global.playerData.seatNum !== data.seatIndex) {
                this.clockNode.active = true;
                this.clockTime.string = data.second;
                this.playTimer = function () {
                    this.clockTime.string -= 1;
                    if (this.clockTime.string < 1) {
                        this.unschedule(this.playTimer);
                    }
                };
                this.schedule(this.playTimer, 1);
            } else {
                this.unschedule(this.playTimer);
                this.clockNode.active = false;
            }
        });
        this.node.on('hide_choice', (event) => {
            let data = event.detail;
            if (data === this.seatNum) {
                this.choiceNode.active = false;
            }
        });
        this.node.on('show_play_choice', (event) => {
            let data = event.detail;
            if (data.seatIndex === this.seatNum) {
                this.choiceNode.active = true;
                for (let i = 0; i < this.choiceList.length; i++) {
                    this.choiceList[i].active = (i === data.choice);
                    if (i === data.choice) {
                        let url = global.pszMusicList['play' + i];
                        this.playPlayMusic(url);
                    }
                }
                setTimeout(() => {
                    this.choiceNode.active = false;
                }, 2000);
                if (data.choice === 1) {
                    if (data.seatIndex !== global.playerData.seatNum) {
                        this.isLookCardNode.active = true;
                    }
                }
            }
        });
        this.node.on('out_round_player', (event) => {
            let seatIndex = event.detail;
            if (seatIndex === this.seatNum) {
                for (let i = 0; i < this.cards.length; i++) {
                    this.cards[i].getComponent('card').brokenCard();
                }
            }
        });
        this.node.on('show_cards', (event) => {
            let data = event.detail;
            if (data.seatIndex === this.seatNum) {
                for (let i = 0; i < this.cards.length; i++) {
                    this.cards[i].getComponent('card').showPSZCard(data.cards[i]);
                }
            }
        });
        this.node.on('change_chips', (event) => {
            let data = event.detail;
            if (data.seatIndex === this.seatNum) {
                this.chipsLabel.string += data.chips;
            }
        });
        this.node.on('settlement', (event) => {
            let data = event.detail;
            for (let i = 0; i < data.length; i++) {
                if (data[i].seatIndex === this.seatNum) {
                    this.moneyLabel.string = Number(this.moneyLabel.string) + data[i].money;
                    if (data[i].award) {
                        this.moneyLabel.string = Number(this.moneyLabel.string) + data[i].award;
                    }
                }
            }
            this.chipsLabel.string = 0;
            if (this.bankerIcon.active) {
                this.bankerIcon.active = false;
            }
        });
    },

    initWithData(data, seatPos, readyPlayerList, startPlayerList) {
        console.log('playerData = ' + JSON.stringify(data) + ' ; seatPos = ' + seatPos);
        this.seatPos = seatPos;             // 现在座位号
        this.seatNum = data.seatIndex;     // 实际座位号
        this.accountID = data.accountID;
        this.playerInfo = data;
        this.readyPlayerList = readyPlayerList;
        this.startPlayerList = startPlayerList;

        this.nickNameLabel.string = decodeURI(data.nickName);
        this.moneyLabel.string = data.score;
        this.chipsLabel.string = data.chips;
        cc.loader.load({url: data.avatarUrl, type: 'jpg'}, (err, tex) => {
            let oldWidth = this.headImage.node.width;
            this.headImage.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImage.node.width;
            this.headImage.node.scale = oldWidth / newWidth;
        });

        if (data.isBanker) {
            this.bankerIcon.active = true;
        }
        if (data.cards !== 0) {
            for (let i = 0; i < data.cards; i++) {
                let card = cc.instantiate(this.cardPrefab);
                card.parent = this.cardsNode;
                this.playNode.position = this.cardsPosList[this.seatPos].position;
                if (this.seatPos === 0) {
                    card.scale = 0.9;
                    card.x = card.width * 0.9 * 0.6 * (3 - 1) * -0.5 + card.width * 0.9 * 0.6 * i;
                } else {
                    card.scale = 0.6;
                    card.x = card.width * 0.6 * 0.6 * (3 - 1) * -0.5 + card.width * 0.6 * 0.6 * i;
                }
                this.cards.push(card);
            }
            if (data.isLookCards) {
                for (let i = 0; i < this.cards.length; i++) {
                    this.cards[i].getComponent('card').lookCard();
                }
            }
            if (data.isDiscard) {
                for (let i = 0; i < this.cards.length; i++) {
                    this.cards[i].getComponent('card').brokenCard();
                }
            }
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
    playChatMusic(url) {
        cc.audioEngine.play(cc.url.raw(global.chatMusicUrl + 'chatSex' + this.playerInfo.sex + url), false, global.playVolume);
    },

    playPlayMusic(url) {
        cc.audioEngine.play(cc.url.raw(global.pszMusicUrl + 'sex' + this.playerInfo.sex + url), false, global.playVolume);
    },
});
