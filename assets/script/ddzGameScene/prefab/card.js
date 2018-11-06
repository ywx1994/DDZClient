import global from "../../global";

cc.Class({
    extends: cc.Component,
    properties: {
        cardSpriteAtlas: cc.SpriteAtlas
    },
    onLoad() {
        this.flag = false;
        this.offset = 20;       //移动距离
        //收到gameingUI的通知，选中的牌要归位
        this.node.on('go_back', () => {
            if (this.flag) {
                this.node.y -= this.offset;
                this.flag = false;
                cc.systemEvent.emit('unchoose_card', this.cardData);
            }
        });
        //收到gameingUI的通知，打出的牌要销毁
        this.node.on('pushed_card', (data) => {
            let detail = data.detail;
            for (let i = 0; i < detail.length; i++) {
                if (detail[i].id === this.id) {
                    this.pushedCardAction(this.node);
                }
            }
        });

        /**
         * 收到gamingUI的通知，选中提示的牌
         */
        this.node.on('tip_cards', (data) => {
            let detail = data.detail;
            if (this.flag) {
                this.node.y -= this.offset;
                this.flag = false;
            }
            for (let i = 0; i < detail.length; i++) {
                let card = detail[i];
                if (card.id === this.id) {
                    if (this.flag === false) {
                        this.node.y += this.offset;
                        this.flag = true;
                        cc.systemEvent.emit('choose_card', this.cardData);
                    }
                }
            }
        });
    },
    //玩家出牌时，牌的移动动作
    pushedCardAction(node) {
        let moveAction = cc.moveTo(0.3, cc.p(0, -105));
        let scaleAction = cc.scaleTo(0.3, 0.3);
        let sequence = cc.sequence(scaleAction, cc.callFunc(() => {
            // cc.systemEvent.emit('destroy_pushed_card', this.id);
            this.node.destroy();
        }));
        node.runAction(moveAction);
        node.runAction(sequence);
    },

    //设置点击事件
    setTouchEvent() {
        // cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        if (this.accountID === global.playerData.account_id) {
            this.node.on(cc.Node.EventType.TOUCH_START, () => {//监听牌的点击事件
                console.log("*** card *** setTouchEvent cardID=" + this.id);
                if (this.flag === false) {
                    this.node.y += this.offset;
                    this.flag = true;
                    console.log('card选中的牌为: ' + JSON.stringify(this.cardData));
                    cc.systemEvent.emit('choose_card', this.cardData);
                } else {
                    this.node.y -= this.offset;
                    this.flag = false;
                    console.log('card取消选中的牌为: ' + JSON.stringify(this.cardData));
                    cc.systemEvent.emit('unchoose_card', this.cardData);
                }
            });
        }

    },

    //监听移动事件
    setTouchMove() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            // console.log('触摸移动。。。。。。');
            var delta = event.touch.getDelta();
            this.node.x += delta.x;
            this.node.y += delta.y;
        });
    },

    showCard(card, accountID, type) {
        console.log('** showCard ** card=' + JSON.stringify(card));
        if (accountID) {
            this.accountID = accountID;
        }
        this.id = card.id;
        this.cardData = card;
        const CardValue = {
            '12': 1,    //A
            '13': 2,    //2
            '1': 3,
            '2': 4,
            '3': 5,
            '4': 6,
            '5': 7,
            '6': 8,
            '7': 9,
            '8': 10,
            '9': 11,    //J
            '10': 12,   //Q
            '11': 13    //K
        };
        const CardShape = {
            '1': 3, //黑桃
            '2': 2, //红桃
            '3': 1, //梅花
            '4': 0  //方片
        };
        const Kings = {
            '14': 54,   //小王
            '15': 53    //大王
        };

        let spriteKey = '';
        if (card.shape) {
            spriteKey = 'card_' + (CardShape[card.shape] * 13 + CardValue[card.value]);
        } else {
            spriteKey = 'card_' + Kings[card.king];
        }
        // console.log('*** card *** showCard spriteKey = ' + spriteKey);
        this.node.getComponent(cc.Sprite).spriteFrame = this.cardSpriteAtlas.getSpriteFrame(spriteKey);
        this.setTouchEvent();
        if (type === 'NN') {
            this.setTouchMove();
        }
    },


    brokenCard() {
        this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(cc.url.raw('resources/pszGameScene/brokenCard.png'));
    },
    lookCard() {
        this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(cc.url.raw('resources/pszGameScene/lookCard.png'));
    },
    showPSZCard(card) {
        this.cardData = card;
        this.id = card.id;
        const CardValuePSZ = {
            "1": 2,//"2"
            "2": 3,//"3"
            "3": 4,//"4"
            "4": 5,//"5"
            "5": 6,//"6"
            "6": 7,//"7"
            "7": 8,//"8"
            "8": 9,//"9"
            "9": 10,//"10"
            "10": 11,//"J"
            "11": 12,//"Q"
            "12": 13,//"K"
            "13": 1//"A"
        };
        const CardShapePSZ = {
            "1": 3,//黑
            "2": 2,//红
            "3": 1,//梅
            "4": 0//方
        };
        let spriteKey = '';
        spriteKey = 'card_' + (CardShapePSZ[card.shape] * 13 + CardValuePSZ[card.value]);
        console.log('  spriteKey = ' + spriteKey);
        this.node.getComponent(cc.Sprite).spriteFrame = this.cardSpriteAtlas.getSpriteFrame(spriteKey);
        this.setTouchEvent();
    },
});