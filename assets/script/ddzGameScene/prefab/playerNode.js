import global from "../../global";

const voiceNative = require("./../../utils/VoiceNative");

cc.Class({
    extends: cc.Component,
    properties: {
        headImg: cc.Sprite,
        nameLabel: cc.Label,
        pointLabel: cc.Label,
        offLineNode: cc.Node,
        offLineImg: cc.Sprite,
        readyNode: cc.Node,
        readyImg: cc.Sprite,
        trustNode: cc.Node,

        cardPrefab: cc.Prefab,
        cardsNode: cc.Node,
        cardNum: cc.Label,
        pushedCardsNode: cc.Node,       //已出牌的节点
        noPushNode: cc.Node,            //不出

        clockNode: cc.Node,
        timeLabel: cc.Label,

        robChoiceNode: cc.Node,         //叫OR不叫，抢OR不抢
        robResultNode: cc.Node,         //地主OR农民

        faceAtlas: cc.SpriteAtlas,       //表情合辑
        chatFace: cc.Sprite,
        chatWord: cc.Node,
        chatWordString: cc.Label
    },

    start() {
    },
    onLoad() {
        this.cardList = [];
        this.robResultList = this.robResultNode.children;   //0-农民，1-地主
        this.robChoiceList = this.robChoiceNode.children;   //0-叫地主，1-不叫，2-抢地主，3-不抢
        this.noPushMusicIndex = 0;      //不出的音乐
        this.playerScore = 0;           //玩家分数
        //DDZGameScene发来的   玩家准备
        this.node.on('player_ready', (evnet) => {//DDZGameScene发出
            let detail = evnet.detail;
            if (detail === this.accountID) {
                this.readyNode.active = true;
                let seq = cc.sequence(cc.scaleTo(0, 2), cc.scaleTo(0.2, 1), cc.scaleTo(0.1, 1.3), cc.scaleTo(0.1, 1));
                this.readyImg.node.runAction(seq);
            }
        });
        //DDZGameScene发来的   游戏开始
        this.node.on('game_start', () => {
            if (this.readyNode.active) {
                this.readyNode.active = false;
            }
            if (this.robResultList[0].active) {
                this.robResultList[0].active = false;
            }
            if (this.robResultList[1].active) {
                this.robResultList[1].active = false;
            }
            for (let i = 0, len = this.pushedCardsNode.children.length; i < len; i++) {
                this.pushedCardsNode.children[i].destroy();
            }
        });
        //托管(gamingUI发来的)
        this.node.on('show_trust', (data) => {
            let detail = data.detail;
            if (detail === this.accountID) {
                this.trustNode.active = true;
            }
        });
        //取消托管
        this.node.on('stop_trust', (data) => {
            let detail = data.detail;
            if (detail === this.accountID) {
                this.trustNode.active = false;
            }
        });
        //暂停计时器     gamingUI发来的
        this.node.on('stop_playTimer', () => {
            if (this.clockNode.active) {
                this.unschedule(this.playTimer);
            }
        });
        //恢复计时器     gamingUI发来的
        this.node.on('begin_playTimer', () => {
            if (this.clockNode.active) {
                this.schedule(this.playTimer, 1);
            }
        });
        //系统发牌
        this.node.on('system_push_card', (data) => {
            let detail = data.detail;
            if (this.accountID !== global.playerData.account_id) {
                this.cardsNode.active = true;
                this.cardNum.string = detail.length;
            }
        });
        //显示玩家的倒计时
        this.node.on('show_playTimer', (data) => {
            let detail = data.detail;
            if (detail.seatIndex === this.playerInfo.seatIndex && detail.seatIndex !== global.playerData.seatNum) {
                this.robChoiceNode.active = false;
                this.timeLabel.string = detail.time;
                this.clockNode.active = true;
                this.playTimer = function () {
                    this.timeLabel.string -= 1;
                    if (this.timeLabel.string < 1) {
                        this.clockNode.active = false;
                        this.unschedule(this.playTimer);
                    }
                };
                this.schedule(this.playTimer, 1);
            }
        });
        //玩家抢地主的状态
        this.node.on('player_rob_state', (data) => {
            let detail = data.detail;
            console.log(detail.playerID + ' , 玩家抢地主的状态：' + detail.value);
            if (detail.playerID === this.accountID) {
                this.unschedule(this.playTimer);
                this.clockNode.active = false;
                this.robChoiceNode.active = true;
                let flag = undefined;
                switch (detail.value) {
                    case '叫地主':
                        flag = 0;
                        break;
                    case '不叫':
                        flag = 1;
                        break;
                    case '抢地主':
                        flag = 2;
                        break;
                    case '不抢':
                        flag = 3;
                        break;
                }
                console.log('flag = ' + flag);
                for (let i = 0, len = this.robChoiceList.length; i < len; i++) {
                    if (i === flag) {
                        let url = global.ddzMusicList['call' + flag];
                        this.playMusic(url);
                        this.robChoiceList[i].active = true;
                    } else {
                        this.robChoiceList[i].active = false;
                    }
                }
            }
        });
        //监听产生地主消息
        this.node.on('change_land', (data) => {
            let detail = data.detail;
            this.robResultNode.active = true;
            this.robChoiceNode.active = false;
            if (detail === this.accountID) {
                this.robResultList[1].active = true;
                this.robResultList[0].active = false;
                this.robResultList[1].scale = 2;
                this.robResultList[1].runAction(cc.scaleTo(1, 1).easing(cc.easeBackOut()));
            } else {
                this.robResultList[0].active = true;
                this.robResultList[1].active = false;
                this.robResultList[0].scale = 2;
                this.robResultList[0].runAction(cc.scaleTo(1, 1).easing(cc.easeBackOut()));
            }
        });
        //监听GameScene中add_card_to_player消息，为地主加三张牌
        this.node.on('add_three_cards', (data) => {
            let detail = data.detail;
            if (detail === this.accountID) {
                this.cardNum.string += 3;
            }
        });
        //玩家出牌
        this.node.on('player_push_cards', (data) => {
            let detail = data.detail;
            if (detail.playerID === this.accountID) {
                //播放音频
                let url = '';
                if (detail.cards.length === 0) {
                    url = global.ddzMusicList[detail.style + this.noPushMusicIndex++];
                    if (this.noPushMusicIndex === 3) {
                        this.noPushMusicIndex = 0;
                    }
                } else if (detail.cards.length === 2 && detail.cards[0].value === undefined) {
                    url = global.ddzMusicList.rocket;
                } else if (detail.cards.length < 3) {
                    let cardValue = 0;
                    if (detail.cards[0].value === undefined) {
                        cardValue = detail.cards[0].king;
                    } else {
                        cardValue = detail.cards[0].value;
                    }
                    url = global.ddzMusicList[detail.style + cardValue];
                } else if (detail.style === 'PlaneWithOne' || detail.style === 'PlaneWithTwo') {
                    url = global.ddzMusicList.Plane;
                } else {
                    url = global.ddzMusicList[detail.style];
                }
                this.playMusic(url);
            }

            if (detail.playerID === this.accountID && detail.playerID !== global.playerData.account_id) {
                this.unschedule(this.playTimer);
                this.clockNode.active = false;
                console.log("*** playerNode *** onPlayerPushedCards data=" + JSON.stringify(detail));
                console.log('cards = ' + JSON.stringify(detail.cards) + ' ; cards.length = ' + detail.cards.length);
                this.showPlayerPushedCards(detail.cards);
            }
        });
        //监听春天
        this.node.on('spring', (data) => {
            if (global.playerData.account_id === this.accountID) {
                //播放音频
                let url = global.ddzMusicList["spring"];
                this.playMusic(url);
            }
        });
        //单局游戏结束时展示玩家手中剩余的牌
        this.node.on('show_otherRemain_cards', (data) => {
            let detail = data.detail;
            console.log('监听游戏结束时玩家手中剩余的牌');
            this.cardsNode.active = false;
            if (detail.playerID === this.accountID && detail.playerID !== global.playerData.account_id) {
                this.showPlayerPushedCards(detail.remainCards, 'gameOver');
            }
        });
        //单局结算
        this.node.on('settlement', (data) => {
            let detail = data.detail;
            for (let i = 0; i < detail.length; i++) {
                if (detail[i].playerID === this.accountID) {
                    console.log('单局结算,玩家的分数变化为：' + Number(detail[i].settlement));
                    this.playerScore += Number(detail[i].settlement);
                    this.pointLabel.string = '' + this.playerScore;
                    console.log('单局结算后玩家的分数为：' + this.pointLabel.string);
                }
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
        //聊天语音
        this.node.on('voice_chat', (data) => {
            let detail = data.detail;
            let content = detail.content;

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
    },

    //初始化界面数据
    initWithData(data, index) {
        this.playerInfo = data;
        this.accountID = data.accountID;
        this.nameLabel.string = decodeURI(data.nickName);
        this.pointLabel.string = 0;
        this.index = index;     //相对与自身为0来讲的座位号，非系统生成的座位号
        cc.loader.load({url: data.avatarUrl, type: 'jpg'}, (err, tex) => {
            //cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
            let oldWidth = this.headImg.node.width;
            this.headImg.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImg.node.width;
            this.headImg.node.scale = oldWidth / newWidth;
        });
        // if (index === 1) {
        //     this.pushedCardsNode.x *= -1;
        // }
    },

    //展示其他玩家打出的牌（自己的不显示）
    showPlayerPushedCards(cardsData, str) {
        if (this.noPushNode.active) {
            this.noPushNode.active = false;
        }
        //将之前打出去的牌的节点删除
        for (let i = 0; i < this.pushedCardsNode.children.length; i++) {
            this.pushedCardsNode.children[i].destroy();
        }
        if (cardsData.length === 0 && str !== 'gameOver') {
            this.noPushNode.active = true;
            return;
        }
        //todo 将牌倒序一下再展示出来
        let reversedCardData = [];
        for (let i = cardsData.length - 1; i >= 0; i--) {
            reversedCardData.push(cardsData[i]);
        }

        for (let i = 0; i < reversedCardData.length; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.pushedCardsNode;
            card.scale = 0.4;
            let width = card.width;
            card.x = (reversedCardData.length - 1) * 0.5 * width * 0.2 - i * width * 0.2;
            card.zIndex = -i;
            card.getComponent('card').showCard(reversedCardData[i]);
        }
        //手中还剩的牌的数量
        this.cardNum.string -= reversedCardData.length;
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'show_user_info':
                // console.log('展示玩家信息。。。' + JSON.stringify(this.playerInfo));
                cc.systemEvent.emit('show_user_info', this.playerInfo);     //DDZGameScene接收
                break;
            default:
                break;
        }
    },

    playMusic(url) {
        cc.audioEngine.play(cc.url.raw(global.ddzMusicUrl + 'sex' + this.playerInfo.sex + url), false, global.playVolume);
    },
    playChatMusic(url) {
        cc.audioEngine.play(cc.url.raw(global.chatMusicUrl + 'chatSex' + this.playerInfo.sex + url), false, global.playVolume);
    },
});
