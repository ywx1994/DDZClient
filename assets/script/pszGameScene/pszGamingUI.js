import global from "../global";

cc.Class({
    extends: cc.Component,

    properties: {
        totalChipsNode: cc.Node,
        totalChipsLabel: cc.Label,

        readyBtn: cc.Button,
        startBtn: cc.Button,
        abandonBtn:cc.Button,
        compareCardsBtn: cc.Button,
        lookCardsBtn: cc.Button,
        addChipsBtn: cc.Button,
        followChipsBtn: cc.Button,
        YGDDBtn:cc.Toggle,
        playUI: cc.Node,
        clockNode:cc.Node,
        timeLabel: cc.Label,

        tipsPrefab: cc.Prefab,
        chooseDestroyRoom: cc.Prefab,
        destroyRoomTip: cc.Prefab,
        addChips: cc.Prefab,
        comparePlayersList: cc.Prefab,
        comparePrefab: cc.Prefab,
        changeChips: cc.Prefab,
        pszSettlementPrefab: cc.Prefab,
        fightResultPrefab: cc.Prefab
    },
    onLoad() {
        this.canAddChips = 0;
        this.readyPlayerList = [];     //已准备玩家列表
        this.startPlayerList = [];     //已开始游戏玩家列表
        this.playerNodeList = [];      //玩家的预制件节点

        //PSZGameScene发来的
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
            if (this.readyPlayerList.length < 2 && this.startBtn.node.active) {
                this.startBtn.interactable = false;    //interactable为false时按钮变成灰色
                this.startBtn.node.opacity = 120;       //设置不透明度，255为不透明，值越小越透明
            }
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('change_litile_data', {
                    readyPlayerList: this.readyPlayerList,
                    startPlayerList: this.startPlayerList
                })
            }
        });
        //PSZGameScene发来的
        this.node.on('init_totalChips', (data) => {
            this.totalChipsNode.active = true;
            this.totalChipsLabel.string = data.detail;
        });
        //PSZGameScene发来的
        this.node.on('show_start_btn', () => {
            this.startBtn.node.active = true;
            this.startBtn.interactable = false;    //interactable为false时按钮变成灰色
            this.startBtn.node.opacity = 80;       //设置不透明度，255为不透明，值越小越透明
        });
        //PSZGameScene发来的
        this.node.on('init_startGame', (data) => {
            let detail = data.detail;
            this.canAddChips = detail.canAddChips;
            this.totalChipsNode.active = true;
            this.totalChipsLabel.string = detail.totalChips;
            this.canAddChipsFlag = true;
            this.canFollowChipsFlag = true;
            this.canPlayGame = true;
            this.canCompareFlag = false;
            this.playUI.active = true;
            this.YGDDBtn.node.active = true;
            this.YGDDBtn.isChecked = false;

            this.lookCardsBtn.interactable = false;
            this.lookCardsBtn.node.opacity = 120;
            this.canNotPlay();
        });
        cc.systemEvent.on('addChipsOver', () => {
            this.canNotPlay();
            this.unschedule(this.playTimer);
        });
        //pszSettlement发来的
        cc.systemEvent.on('psz_next_round', () => {
            if (this.clockNode.active) {
                this.canNotPlay();
            }
            this.unschedule(this.playTimer);
            this.onButtonClick(null, 'ready');
        });
        global.handler.onCanStartGame((data) => {
            // console.log("告诉我是不是第一位玩家：" + data);
            if (global.playerData.account_id === data && this.readyBtn.node.active === false) {
                this.startBtn.interactable = true;
                this.startBtn.node.opacity = 255;
            }
        });
        global.handler.onCannotSeat((data) => {
            this.readyBtn.node.active = true;
            global.tip = data;
            let tips = cc.instantiate(this.tipsPrefab);
            tips.parent = this.node;

        });
        global.handler.onDestroyRoom((data) => {
            let destroyTip = cc.instantiate(this.destroyRoomTip);
            destroyTip.parent = this.node;
        });
        global.handler.onDestroyRoomRequest((data) => {
            if (this.clockNode.active) {
                this.unschedule(this.playTimer);
                console.log('暂停了计时器');
            }
            let chooseDestroyRoom = cc.instantiate(this.chooseDestroyRoom);
            chooseDestroyRoom.parent = this.node;
            chooseDestroyRoom.getComponent('chooseDestroyRoom').initWithData(data);
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('stop_playTimer');      //spzPlayerNode接收
            }
        });
        global.handler.onDestroyRoomFailed((data) => {
            this.node.getChildByName('chooseDestroyRoom').destroy();
            global.tip = '有玩家未同意，解散失败';
            let tip = cc.instantiate(this.tipsPrefab);
            tip.parent = this.node;
            if (this.clockNode.active) {
                this.schedule(this.playTimer, 1);
                console.log('恢复了计时器');
            }
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('begin_playTimer');      //spzPlayerNode接收
            }
        });
        //第一位玩家掉线或离开房间（游戏未开始前）
        global.handler.onChangeFirstPlayer((data) => {
            if (global.playerData.account_id === data) {
                console.log('。。。我是第一位玩家了。。。');
                this.startBtn.node.position = cc.p(-260, -80);
                if (this.readyBtn.node.active) {
                    this.startBtn.node.active = true;
                    this.startBtn.interactable = false;
                    this.startBtn.node.opacity = 80;
                } else {
                    console.log('onChangeFirstPlayer 已准备的玩家人数为：' + this.readyPlayerList.length);
                    this.startBtn.node.active = true;
                    if (this.readyPlayerList.length >= 2) {
                        this.startBtn.interactable = true;
                        this.startBtn.node.opacity = 255;
                    } else {
                        this.startBtn.interactable = false;
                        this.startBtn.node.opacity = 80;
                    }
                    let seq = cc.sequence(cc.moveBy(0.8, 285, 0), cc.moveBy(0.5, -35, 0), cc.moveBy(0.4, 15, 0), cc.moveBy(0.5, -5, 0));
                    this.startBtn.node.runAction(seq);
                }
            }
        });
        //游戏中的玩家掉线
        global.handler.onPlayerOffLine((data) => {
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('player_off_line', data);        //pszPlayerNode接收
            }
        });
        global.handler.onShowBanker((data) => {
            console.log('  展示庄家  ' + data);
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('show_banker', data);   //nnPlayerNode接收
            }
        });
        global.handler.onPushCard((data) => {
            console.log('  系统发牌  data = ' + JSON.stringify(data));
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('push_card', data);
            }
        });
        global.handler.onChangePSZBout((data) => {
            this.node.emit('change_bout', data);
            if (data === global.joinRoomData.roomRules.stuffyRound + 1 && this.canPlayGame) {
                this.lookCardsBtn.interactable = true;
                this.lookCardsBtn.node.opacity = 255;
            }
            if (data > global.joinRoomData.roomRules.stuffyRound && data > 1) {
                this.canCompareFlag = true;
            }
        });
        global.handler.onOutOfBout(() => {
            this.canFollowChipsFlag = false;
            this.canAddChipsFlag = false;
            this.YGDDBtn.node.active = false;
        });
        global.handler.onTurnToPlay((data) => {
            if (data === global.playerData.seatNum) {
                this.canPlay();
                this.timeLabel.string = 15;
                this.playTimer = function () {
                    this.timeLabel.string -= 1;
                    if (this.timeLabel.string === 5) {
                        cc.audioEngine.play(cc.url.raw('resources/audio/timeWarring.mp3'), false, global.playVolume);
                    }
                    if (this.timeLabel.string < 1) {
                        this.unschedule(this.playTimer);
                    }
                };
                this.schedule(this.playTimer, 1);
            } else {
                this.canNotPlay();
                this.unschedule(this.playTimer);
            }
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('showTime', {seatIndex: data, second: 15});
                this.playerNodeList[i].emit('hide_choice', data);
            }
        });
        global.handler.onPlayerChoice((data) => {
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('show_play_choice', data);
            }
        });
        global.handler.onOutRoundPlayer((data) => {
            if (global.playerData.seatNum === data) {
                this.lookCardsBtn.interactable = false;
                this.lookCardsBtn.node.opacity = 120;
                this.canPlayGame = false;
            }
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('out_round_player', data);
            }
        });
        global.handler.onChangeChips((data) => {
            this.canAddChips = data.canAddChips;
            if (data.canAddChips <= 0) {
                this.canAddChipsFlag = false;
            }
            this.totalChipsLabel.string = data.totalChips;
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('change_chips', {seatIndex: data.seatIndex, chips: data.nowChips});
            }
            let changeChips = cc.instantiate(this.changeChips);
            changeChips.parent = this.node;
            let position = undefined;
            for (let i = 0; i < this.playerNodeList.length; i++) {
                if (this.playerNodeList[i].getComponent('pszPlayerNode').seatNum === data.seatIndex) {
                    position = this.playerNodeList[i].position;
                }
            }
            changeChips.getComponent('changeChips').initWithData(data.nowChips, position);
        });
        global.handler.onCompareResult((data) => {
            console.log(JSON.stringify(data));
            this.canNotPlay();
            this.unschedule(this.playTimer);
            let comparePrefab = cc.instantiate(this.comparePrefab);
            comparePrefab.parent = this.node;
            comparePrefab.getComponent('comparePrefab').initWithData(data);


        });
        global.handler.onSettlementPSZ((data) => {
            this.playUI.active = false;
            if (this.readyBtn.node.active) {
                this.readyBtn.node.active = false;
            }
            let settlementPrefab = cc.instantiate(this.pszSettlementPrefab);
            settlementPrefab.parent = this.node;
            settlementPrefab.getComponent('pszSettlement').initWithData(data);
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('settlement', data);
            }
            global.tip = '10秒后开始下一局';
            let tips = cc.instantiate(this.tipsPrefab);
            tips.parent = this.node;
        });
        global.handler.onAllGameOver((data) => {
            if (this.clockNode.active) {
                this.unschedule(this.playTimer);
                console.log('暂停了计时器');
            }
            for (let i = 0, len = this.playerNodeList.length; i < len; i++) {
                this.playerNodeList[i].emit('stop_playTimer');      //spzPlayerNode接收
            }
            cc.systemEvent.off('psz_next_round');
            console.log('全部游戏结束：' + JSON.stringify(data));
            let fightResult = cc.instantiate(this.fightResultPrefab);
            fightResult.parent = this.node;
            console.log('global.roomData:' + JSON.stringify(global.joinRoomData));
            fightResult.getComponent('fightResult').initWithData({
                //todo 保存的房间信息有问题，得从服务端传会来
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
    },
    onDestroy() {
        cc.systemEvent.off('addChipsOver');
    },
    canPlay(){
        if (this.canAddChipsFlag) {
            this.addChipsBtn.interactable = true;
            this.addChipsBtn.node.opacity = 255;
        }
        if (this.canCompareFlag) {
            this.compareCardsBtn.interactable = true;
            this.compareCardsBtn.node.opacity = 255;
        }
        if (this.canFollowChipsFlag) {
            this.followChipsBtn.interactable = true;
            this.followChipsBtn.node.opacity = 255;
        }
        this.abandonBtn.interactable = true;
        this.abandonBtn.node.opacity = 255;
        this.clockNode.active = true;
    },
    canNotPlay(){
        this.clockNode.active = false;
        this.abandonBtn.interactable = false;
        this.abandonBtn.node.opacity = 120;
        this.compareCardsBtn.interactable = false;
        this.compareCardsBtn.node.opacity = 120;
        this.addChipsBtn.interactable = false;
        this.addChipsBtn.node.opacity = 120;
        this.followChipsBtn.interactable = false;
        this.followChipsBtn.node.opacity = 120;
    },
    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'ready':
                global.gameService.proxy.playerReady();
                this.readyBtn.node.active = false;
                if (this.startBtn.node.active) {
                    let seq = cc.sequence(cc.moveBy(0.8, 285, 0), cc.moveBy(0.5, -35, 0), cc.moveBy(0.4, 15, 0), cc.moveBy(0.5, -5, 0));
                    this.startBtn.node.runAction(seq);
                }
                break;
            case 'start':
                global.gameService.proxy.startGame();
                this.startBtn.node.active = false;
                break;
            case 'abandon':
                global.gameService.proxy.abandonCards();
                this.canNotPlay();
                this.unschedule(this.playTimer);
                break;
            case 'lookCards':
                global.gameService.proxy.lookCards((data) => {
                    console.log("看牌："+JSON.stringify(data));
                    if (data.ok) {
                        for (let i = 0; i < this.playerNodeList.length; i++) {
                            this.playerNodeList[i].emit('show_cards', data.data);
                        }
                        this.lookCardsBtn.interactable = false;
                        this.lookCardsBtn.node.opacity = 120;
                    }
                });
                break;
            case 'compareCards':
                global.gameService.proxy.getComparePlayer((data) => {
                    if (data.ok) {
                        let comparePlayersList = cc.instantiate(this.comparePlayersList);
                        comparePlayersList.parent = this.node;
                        comparePlayersList.getComponent('comparePlayerList').initWithData(data.data, this.timeLabel.string);
                    }
                });
                break;
            case 'followChips':
                global.gameService.proxy.addChips(0);
                this.canNotPlay();
                this.unschedule(this.playTimer);
                break;
            case 'addChips':
                let addChips = cc.instantiate(this.addChips);
                addChips.parent = this.node;
                addChips.getComponent('addChips').initWithData(this.timeLabel.string, this.canAddChips);
                break;
            case 'YGDD':
                global.gameService.proxy.YGDD(this.YGDDBtn.isChecked);
                break;
        }
    },
    playEffect(url) {
        cc.audioEngine.play(cc.url.raw(global.nnMusicUrl + 'music/' + url), false, global.playVolume);
    },
});
