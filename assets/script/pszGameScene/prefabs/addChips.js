import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        chips5: cc.Button,
        chips2: cc.Button,
        chips1: cc.Button,
    },

    onButtonClick(event, customData) {
        if (customData.length === 1) {
            global.gameService.proxy.addChips(Number(customData));
            cc.systemEvent.emit('addChipsOver');        //pszGamingUI接收
            this.node.destroy();
        }
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
        }
    },
    initWithData(time, num) {
        if (num < 5) {
            this.chips5.interactable = false;
        }
        if (num < 2) {
            this.chips2.interactable = false;
        }
        let thisTime = Number(time);
        this.addChipsTimer = function () {
            thisTime -= 0.1;
            console.log(' thisTime 的变化 ：' + thisTime);
            if (thisTime <= 1.5) {
                console.log(' thisTime 小于1.5了');
                this.node.destroy();
            }
        };
        this.schedule(this.addChipsTimer, 0.1);
    },

    onDestroy() {
        console.log(' this.node.destroy ');
        this.unschedule(this.addChipsTimer);
    },
});
