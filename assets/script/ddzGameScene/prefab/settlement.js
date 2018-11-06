import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        winTitle: cc.Node,
        loseTitle: cc.Node,
        clockString: cc.Label,
        nickName1: cc.Label,
        nickName2: cc.Label,
        nickName3: cc.Label,
        money1: cc.Label,
        money2: cc.Label,
        money3: cc.Label


    },

    onLoad() {
        this.winTitle.active = false;
        this.loseTitle.active = false;
        this.clockString.string = 5;
        this.nickNameList = [];
        this.moneyList = [];
        this.nickNameList.push(this.nickName1);
        this.nickNameList.push(this.nickName2);
        this.nickNameList.push(this.nickName3);
        this.moneyList.push(this.money1);
        this.moneyList.push(this.money2);
        this.moneyList.push(this.money3);
    },
    start() {

    },
    initWithData(num, settlementList) {
        if (num === 1) {
            this.loseTitle.active = true;
            cc.audioEngine.play(cc.url.raw(global.ddzMusicUrl + 'effGameLose.mp3'), false, global.playVolume);
        } else {
            this.winTitle.active = true;
            cc.audioEngine.play(cc.url.raw(global.ddzMusicUrl + 'effGameWin.mp3'), false, global.playVolume);
        }
        for (let i = 0; i < settlementList.length; i++) {
            this.nickNameList[i].string = decodeURI(settlementList[i].nickName);
            this.moneyList[i].string = settlementList[i].settlement;
        }
        this.clockString.string = 10;
        this.schedule(() => {
            this.clockString.string -= 1;
            if (this.clockString.string < 1) {
                cc.systemEvent.emit('next_round');  //gamingUI中接收
                this.node.destroy();
            }
        }, 1);
    },
});
