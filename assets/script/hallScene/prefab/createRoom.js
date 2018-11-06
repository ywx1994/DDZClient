import global from './../../global';

let smallUtils = require('./../../utils/smallUtils');

cc.Class({
    extends: cc.Component,

    properties: {
        tipsPrefab: cc.Prefab,
        loadingPrefab: cc.Prefab,
        gametype: cc.ToggleContainer,   // 游戏类型
        gameTypeRuleContent: cc.Node,      // 几种游戏的游戏规则     0-斗地主，1-五醉牛，2-拼三张
        //斗地主
        ddzBasicScore: cc.ToggleContainer,  // 斗地主底分
        ddzRoundCount: cc.ToggleContainer,  // 斗地主局数
        ddzRoomRate: cc.ToggleContainer,    // 斗地主房费
        ddzlLimitMultiplier: cc.ToggleContainer,    // 斗地主上限倍数
        ddzRoomRateLabel: {default: [], type: [cc.Label]},   // 斗地主房费的文本信息
        //五醉牛
        wznBasicScore: cc.ToggleContainer,  // 牛牛底分
        wznRoundCount: cc.ToggleContainer,  // 牛牛局数
        wznRoomRate: cc.ToggleContainer,    // 牛牛房费
        wznNiuniuTYpe: cc.ToggleContainer,  // 牛牛醉牛型态
        wznDoubleRule: cc.ToggleContainer,  // 牛牛翻倍规则
        wznSpaceilRule: {default: [], type: [cc.Toggle]},// 牛牛特殊牌型 0-对子牛；1-五花牛；2-炸弹牛；3-五小牛
        wznAdvanceSet: {default: [], type: [cc.Toggle]}, // 牛牛高级设置  0-闲家推注；1-游戏开始后禁止加入；2-禁止搓牌
        wznGetBankerScore: cc.ToggleContainer, // 牛牛上庄分数
        wznMaxGetBanker: cc.ToggleContainer,   // 牛牛最大抢庄
        wznBaseScoreLabel: {default: [], type: [cc.Label]},  // 牛牛底分文本信息
        wznRoomRateLabel: {default: [], type: [cc.Label]},   // 牛牛房费的文本信息
        wznNiuniuTypeLabel: {default: [], type: [cc.Label]}, // 牛牛形态的文本信息
        wznDoubleRuleLabel: {default: [], type: [cc.Label]}, // 牛牛翻倍规则的文本信息
        wznSpaceilRuleLabel: {default: [], type: [cc.Label]},// 牛牛特殊牌型的文本信息
        wznAdvanceLabel: {default: [], type: [cc.Label]},    // 牛牛高级设置的文本信息
        upBankerPointSetNode: cc.Node,         // 牛牛上庄分数节点
        upBankerMultSetNode: cc.Node,          // 牛牛最大抢庄节点
        //拼三张
        pszBasicScore: cc.ToggleContainer,   // 拼三张底分
        pszRoundCount: cc.ToggleContainer,   // 拼三张局数
        pszRoomRate: cc.ToggleContainer,     // 拼三张房费
        pszStuffyCards: cc.ToggleContainer,  // 拼三张闷牌回合
        pszLimitRound: cc.ToggleContainer,   // 拼三张回合上限
        pszRoomRateLabel: {default: [], type: [cc.Label]},       // 拼三张房费的文本信息
        pszSpaceilRuleLabel: {default: [], type: [cc.Label]},   // 拼三张殊规则的文本信息
        pszSpaceilRule: {default: [], type: [cc.Toggle]},       // 拼三张殊规则 0-顺>金花；1-豹子顺金加分；2-相同牌型开者输；3-开始后禁入
        pszSpaceilRuleAutomatic: cc.ToggleContainer,           // 拼三张自动    自动弃牌 or 自动跟注
        pszSpaceilRuleCompere: cc.ToggleContainer,              // 拼三张比较    散235>豹子 or 散235>AAA
        pszSpecialRuleA23: cc.ToggleContainer                   //拼三张A23牌值  散牌、最小顺、最大顺
    },

    onLoad() {
        this.gameTypeList = this.gametype.toggleItems;
        this.gameTypeRuleList = this.gameTypeRuleContent.children;
        //斗地主
        this.ddzBasicScoreList = this.ddzBasicScore.toggleItems;
        this.ddzRoundCountList = this.ddzRoundCount.toggleItems;
        this.ddzRoomRateList = this.ddzRoomRate.toggleItems;
        this.ddzlLimitMultiplierList = this.ddzlLimitMultiplier.toggleItems;
        //五醉牛
        this.wznBasicScoreList = this.wznBasicScore.toggleItems;
        this.wznRoundCountList = this.wznRoundCount.toggleItems;
        this.wznRoomRateList = this.wznRoomRate.toggleItems;
        this.wznNiuniuTYpeList = this.wznNiuniuTYpe.toggleItems;
        this.wznDoubleRuleList = this.wznDoubleRule.toggleItems;
        this.wznGetBankerScoreList = this.wznGetBankerScore.toggleItems;
        this.wznMaxGetBankerList = this.wznMaxGetBanker.toggleItems;
        //拼三张
        this.pszBasicScoreList = this.pszBasicScore.toggleItems;
        this.pszRoundCountList = this.pszRoundCount.toggleItems;
        this.pszRoomRateList = this.pszRoomRate.toggleItems;
        this.pszLimitRoundList = this.pszLimitRound.toggleItems;
        this.pszStuffyCardsList = this.pszStuffyCards.toggleItems;
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            case 'createDDZ':
                let loading1 = cc.instantiate(this.loadingPrefab);
                loading1.parent = this.node;
                let ddzGameRule = {};
                ddzGameRule.gameType = '斗地主';
                for (let i = 0, len = this.ddzBasicScoreList.length; i < len; i++) {
                    if (this.ddzBasicScoreList[i].isChecked) {
                        ddzGameRule.basicScore = Math.pow(2, i);
                        break;
                    }
                }
                for (let i = 0, len = this.ddzRoundCountList.length; i < len; i++) {
                    if (this.ddzRoundCountList[i].isChecked) {
                        ddzGameRule.roundCount = 5 * Math.pow(2, i);
                        break;
                    }
                }
                for (let i = 0, len = this.ddzRoomRateList.length; i < len; i++) {
                    if (this.ddzRoomRateList[i].isChecked) {
                        ddzGameRule.roomRate = this.ddzRoomRateLabel[i].string;
                        break;
                    }
                }
                for (let i = 0, len = this.ddzlLimitMultiplierList.length; i < len; i++) {
                    if (this.ddzlLimitMultiplierList[i].isChecked) {
                        if (i === 3) {
                            ddzGameRule.limitMultiplier = '不限';
                        } else {
                            ddzGameRule.limitMultiplier = 24 * Math.pow(2, i);
                        }
                        break;
                    }
                }
                console.log('斗地主的游戏规则：' + JSON.stringify(ddzGameRule));
                global.hallService.proxy.createRoom(ddzGameRule,data=>{
                        if (!data.ok) {
                            loading1.destroy();
                            if (data.err) {
                                let tips = cc.instantiate(this.tipsPrefab);
                                tips.parent = this.node;
                                global.tip = data.err;
                            }
                        }else {
                            console.log("*** creatRoom *** requestCreateRoom successful" + JSON.stringify(data));
                            if (ddzGameRule.roomRate.substr(0, 2) !== '代开') {
                                let roomID = data.roomID;
                                global.hallService.proxy.joinRoom(roomID,data=>{
                                    console.log("data是"+JSON.stringify(data));
                                       if (!data.ok) {
                                           loading1.destroy();
                                           if (data.err) {
                                               let tips = cc.instantiate(this.tipsPrefab);
                                               tips.parent = this.node;
                                               global.tip = data.err;
                                           }
                                       }else {
                                           global.joinRoomData.roomID = roomID;
                                           global.joinRoomData.roomRules = data.roomConfig.config;
                                           global.joinRoomData.roomRules.nowRound = data.roomConfig.roundCount;
                                           if (ddzGameRule.roomRate.substr(0, 2) !== 'AA') {
                                               global.playerData.daimond_count -= smallUtils.getNumFromStr(ddzGameRule.roomRate);
                                           }
                                           //this.node.destroy();
                                           global.netWorkManager.connectAndAuthToDDZGame(data.gameUrl);
                                           global.netWorkManager.onConnectedToDDZGame(()=>{
                                               cc.director.loadScene('DDZGameScene');
                                           })
                                       }
                                   });
                            } else {
                                global.playerData.daimond_count -= smallUtils.getNumFromStr(ddzGameRule.roomRate);
                                global.hallScene.emit('change_daimond');
                                let tips = cc.instantiate(this.tipsPrefab);
                                tips.parent = this.node;
                                global.tip = '代开成功,房间号:' + data.roomID + '请到大厅查看';
                                setTimeout(() => {
                                    this.node.destroy();
                                }, 1500);
                            }
                        }
                   });
                break;
            case 'createWZN':
                let loading2 = cc.instantiate(this.loadingPrefab);
                loading2.parent = this.node;
                let wznGameRule = {};
                wznGameRule.gameType = '五醉牛';
                for (let i = 0, len = this.wznBasicScoreList.length; i < len; i++) {
                    if (this.wznBasicScoreList[i].isChecked) {
                        wznGameRule.basicScore = this.wznBaseScoreLabel[i].string;
                        break;
                    }
                }
                for (let i = 0, len = this.wznRoundCountList.length; i < len; i++) {
                    if (this.wznRoundCountList[i].isChecked) {
                        wznGameRule.roundCount = 5 * Math.pow(2, i);
                        break;
                    }
                }
                for (let i = 0, len = this.wznRoomRateList.length; i < len; i++) {
                    if (this.wznRoomRateList[i].isChecked) {
                        wznGameRule.roomRate = this.wznRoomRateLabel[i].string;
                        break;
                    }
                }
                for (let i = 0, len = this.wznNiuniuTYpeList.length; i < len; i++) {
                    if (this.wznNiuniuTYpeList[i].isChecked) {
                        wznGameRule.smallType = this.wznNiuniuTypeLabel[i].string;
                        break;
                    }
                }
                for (let i = 0, len = this.wznDoubleRuleList.length; i < len; i++) {
                    if (this.wznDoubleRuleList[i].isChecked) {
                        wznGameRule.FBGZ = this.wznDoubleRuleLabel[i].string;
                        break;
                    }
                }
                wznGameRule.TSPX = [];
                for (let i = 0, len = this.wznSpaceilRule.length; i < len; i++) {
                    if (this.wznSpaceilRule[i].isChecked) {
                        wznGameRule.TSPX.push(this.wznSpaceilRuleLabel[i].string);
                    }
                }
                wznGameRule.GJSZ = [];
                for (let i = 0, len = this.wznAdvanceSet.length; i < len; i++) {
                    if (this.wznAdvanceSet[i].isChecked) {
                        wznGameRule.GJSZ.push(this.wznAdvanceLabel[i].string);
                    }
                }
                if (this.upBankerPointSetNode.active) {
                    for (let i = 0, len = this.wznGetBankerScoreList.length; i < len; i++) {
                        if (this.wznGetBankerScoreList[i].isChecked) {
                            if (i === 0) {
                                wznGameRule.SZFS = 0;
                                break;
                            } else {
                                wznGameRule.SZFS = (400 + 200 * (i - 1));
                                break;
                            }
                        }
                    }
                }
                if (this.upBankerMultSetNode.active) {
                    for (let i = 0, len = this.wznMaxGetBankerList.length; i < len; i++) {
                        if (this.wznMaxGetBankerList[i].isChecked) {
                            wznGameRule.ZDQZ = (i + 1);
                            break;
                        }
                    }
                }
                console.log('wznGameRule = ' + JSON.stringify(wznGameRule));
                global.hallService.proxy.createRoom(wznGameRule,data=>{
                        if (!data.ok) {
                            loading2.destroy();
                            if (data.err) {
                                let tips = cc.instantiate(this.tipsPrefab);
                                tips.parent = this.node;
                                global.tip = data.err;
                            }
                        }else {
                            console.log("*** creatRoom *** requestCreateRoom successful" + JSON.stringify(data));
                            if (wznGameRule.roomRate.substr(0, 2) !== '代开') {
                                let roomID = data.roomID;
                                global.hallService.proxy.joinRoom(roomID,data=>{
                                        if (!data.ok) {
                                            loading2.destroy();
                                            if (data.err) {
                                                let tips = cc.instantiate(this.tipsPrefab);
                                                tips.parent = this.node;
                                                global.tip = data.err;
                                            }
                                        }else {
                                            global.joinRoomData.roomID = roomID;
                                            global.joinRoomData.roomRules = data.roomConfig.config;
                                            global.joinRoomData.roomRules.nowRound = data.roomConfig.roundCount;
                                            console.log("*** createRoom *** requestJoinRoom  global.joinRoomData=" + JSON.stringify(global.joinRoomData));
                                            if (wznGameRule.roomRate.substr(0, 2) !== 'AA') {
                                                global.playerData.daimond_count -= smallUtils.getNumFromStr(wznGameRule.roomRate);
                                            }
                                            //this.node.destroy();
                                            global.netWorkManager.connectAndAuthToNNGame(data.gameUrl);
                                            global.netWorkManager.onConnectedToNNGame(()=>{
                                                cc.director.loadScene('NNGameScene');
                                            })
                                        }
                                    });
                            } else {
                                global.playerData.daimond_count -= smallUtils.getNumFromStr(wznGameRule.roomRate);
                                global.hallScene.emit('change_daimond');
                                let tips = cc.instantiate(this.tipsPrefab);
                                tips.parent = this.node;
                                global.tip = '代开成功,房间号:' + data.roomID + '请到大厅查看';
                                setTimeout(() => {
                                    this.node.destroy();
                                }, 1500);
                            }
                        }
                    });
                break;
            case 'createPSZ':
                let loading3 = cc.instantiate(this.loadingPrefab);
                loading3.parent = this.node;
                let pszGameRule = {};
                pszGameRule.gameType = '拼三张';//游戏类型
                for (let i = 0, len = this.pszBasicScoreList.length; i < len; i++) {
                    if (this.pszBasicScoreList[i].isChecked) {
                        pszGameRule.basicScore = Math.pow(2, i);
                        break;
                    }
                }
                for (let i = 0, len = this.pszRoundCountList.length; i < len; i++) {
                    if (this.pszRoundCountList[i].isChecked) {
                        pszGameRule.roundCount = 5 * Math.pow(2, i);
                        break;
                    }
                }
                for (let i = 0, len = this.pszRoomRateList.length; i < len; i++) {
                    if (this.pszRoomRateList[i].isChecked) {
                        pszGameRule.roomRate = this.pszRoomRateLabel[i].string;
                    }
                }
                for (let i = 0; i < this.pszLimitRoundList.length; i++) {
                    if (this.pszLimitRoundList[i].isChecked) {
                        pszGameRule.limitRound = 5 * (i + 2);
                        break;
                    }
                }
                for (let i = 0; i < this.pszStuffyCardsList.length; i++) {
                    if (this.pszStuffyCardsList[i].isChecked) {
                        pszGameRule.stuffyRound = Math.pow(2, i) - 1;
                        break;
                    }
                }
                pszGameRule.GJSZ = [];
                for (let i = 0; i < this.pszSpaceilRule.length; i++) {
                    if (this.pszSpaceilRule[i].isChecked){
                        pszGameRule.GJSZ.push(this.pszSpaceilRuleLabel[i].string)
                    }
                }
                pszGameRule.spaceilRule = [];
                for (let i=0;i<this.pszSpecialRuleA23.toggleItems.length;i++){
                    if (this.pszSpecialRuleA23.toggleItems[i].isChecked){
                        pszGameRule.spaceilRule.push(this.pszSpaceilRuleLabel[i+5].string)
                    }
                }
                for (let i=0;i<this.pszSpaceilRuleAutomatic.toggleItems.length;i++){
                    if (this.pszSpaceilRuleAutomatic.toggleItems[i].isChecked){
                        pszGameRule.spaceilRule.push(this.pszSpaceilRuleLabel[i+8].string)
                    }
                }
                for (let i=0;i<this.pszSpaceilRuleCompere.toggleItems.length;i++){
                    if (this.pszSpaceilRuleCompere.toggleItems[i].isChecked){
                        pszGameRule.spaceilRule.push(this.pszSpaceilRuleLabel[i+11].string)
                    }
                }

                console.log('pszGameRule = ' + JSON.stringify(pszGameRule));
                global.hallService.proxy.createRoom(pszGameRule,data=>{
                        if (!data.ok) {
                            loading2.destroy();
                            if (data.err) {
                                let tips = cc.instantiate(this.tipsPrefab);
                                tips.parent = this.node;
                                global.tip = data.err;
                            }
                        }else {
                            console.log("*** creatRoom *** requestCreateRoom successful" + JSON.stringify(data));
                            if (pszGameRule.roomRate.substr(0, 2) !== '代开') {
                                let roomID = data.roomID;
                                global.hallService.proxy.joinRoom(roomID,data=>{
                                        if (!data.ok) {
                                            loading2.destroy();
                                            if (data.err) {
                                                let tips = cc.instantiate(this.tipsPrefab);
                                                tips.parent = this.node;
                                                global.tip = data.err;
                                            }
                                        }else {
                                            global.joinRoomData.roomID = roomID;
                                            global.joinRoomData.roomRules = data.roomConfig.config;
                                            global.joinRoomData.roomRules.nowRound = data.roomConfig.roundCount;
                                            console.log("*** createRoom *** requestJoinRoom  global.joinRoomData=" + JSON.stringify(global.joinRoomData));
                                            if (pszGameRule.roomRate.substr(0, 2) !== 'AA') {
                                                global.playerData.daimond_count -= smallUtils.getNumFromStr(pszGameRule.roomRate);
                                            }
                                            //this.node.destroy();
                                            global.netWorkManager.connectAndAuthToPSZGame(data.gameUrl);
                                            global.netWorkManager.onConnectedToPSZGame(()=>{
                                                cc.director.loadScene('PSZGameScene');
                                            })
                                        }
                                    });
                            } else {
                                global.playerData.daimond_count -= smallUtils.getNumFromStr(pszGameRule.roomRate);
                                global.hallScene.emit('change_daimond');
                                let tips = cc.instantiate(this.tipsPrefab);
                                tips.parent = this.node;
                                global.tip = '代开成功,房间号:' + data.roomID + '请到大厅查看';
                                setTimeout(() => {
                                    this.node.destroy();
                                }, 1500);
                            }
                        }
                    }) ;
                break;
            default:
                break;
        }
    },

    update() {
        for (let i = 0, len = this.gameTypeList.length; i < len; i++) {
            if (this.gameTypeList[i].isChecked) {
                this.gameTypeRuleList[i].active = true;
            } else {
                this.gameTypeRuleList[i].active = false;
            }
        }

        for (let i = 0, len = this.ddzRoundCountList.length; i < len; i++) {
            if (this.ddzRoundCountList[i].isChecked) {
                this.ddzRoomRateLabel[0].string = '房主支付(' + (3 * Math.pow(2, i)) + '钻)';
                this.ddzRoomRateLabel[1].string = 'AA支付(每人' + Math.pow(2, i) + '钻)';
                this.ddzRoomRateLabel[2].string = '代开支付(' + (3 * Math.pow(2, i)) + '钻)';
            }
        }
        for (let i = 0, len = this.wznRoundCountList.length; i < len; i++) {
            if (this.wznRoundCountList[i].isChecked) {
                this.wznRoomRateLabel[0].string = '房主支付(' + (3 * Math.pow(2, i)) + '钻)';
                this.wznRoomRateLabel[1].string = 'AA支付(每人' + Math.pow(2, i) + '钻)';
                this.wznRoomRateLabel[2].string = '代开支付(' + (3 * Math.pow(2, i)) + '钻)';
            }
        }
        for (let i = 0, len = this.pszRoundCountList.length; i < len; i++) {
            if (this.pszRoundCountList[i].isChecked) {
                this.pszRoomRateLabel[0].string = '房主支付(' + (3 * Math.pow(2, i)) + '钻)';
                this.pszRoomRateLabel[1].string = 'AA支付(每人' + Math.pow(2, i) + '钻)';
                this.pszRoomRateLabel[2].string = '代开支付(' + (3 * Math.pow(2, i)) + '钻)';
            }
        }

        if (this.wznNiuniuTYpeList[4].isChecked) {
            this.wznBaseScoreLabel[0].string = '1';
            this.wznBaseScoreLabel[1].string = '2';
            this.wznBaseScoreLabel[2].string = '4';
        } else {
            this.wznBaseScoreLabel[0].string = '1/2';
            this.wznBaseScoreLabel[1].string = '2/4';
            this.wznBaseScoreLabel[2].string = '4/8';
        }

        if (this.wznNiuniuTYpeList[1].isChecked) {
            this.upBankerPointSetNode.active = true;
        } else {
            this.upBankerPointSetNode.active = false;
        }

        if (this.wznNiuniuTYpeList[3].isChecked) {
            this.upBankerMultSetNode.active = true;
        } else {
            this.upBankerMultSetNode.active = false;
        }
    },
});