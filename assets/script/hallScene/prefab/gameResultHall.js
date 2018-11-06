import global from "../../global";
cc.Class({
    extends: cc.Component,

    properties: {
        nullGameResult: cc.Label,
        oneGameResult: cc.Prefab,
        gameResultContent: cc.Node,
    },

    initWithData(data) {
        if (data.length === 0) {
            this.nullGameResult.node.active = true;
            return;
        }
        this.nullGameResult.node.active = false;
        for (let i = data.length - 1; i >= 0; i--) {
            this.addOneGameResult(data[i]);
        }
    },

    addOneGameResult(data) {
        let onegameResult = cc.instantiate(this.oneGameResult);
        onegameResult.parent = this.gameResultContent;
        onegameResult.getComponent('oneGameResult').initWithData(data);
    },

    destroyBeforeGameResult() {
        if (this.gameResultContent.children.length !== 0) {
            console.log('开始清除');
            for (let i = 0; i < this.gameResultContent.children.length; i++) {
                this.gameResultContent.children[i].destroy();
            }
        }
        console.log('清除完毕');
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            case 'ddz':
                console.log('斗地主战绩');
                this.destroyBeforeGameResult();
                global.hallService.proxy.gameRecord("ddz", data => {
                        if (!data.ok) {
                            console.log('** HallScene ** requestGameRecord err');
                        } else {
                            console.log('** HallScene ** requestGameRecord data=' + JSON.stringify(data.record));
                            this.initWithData(data.record);
                        }
                    });
                break;
            case 'wzn':
                console.log('五醉牛战绩');
                this.destroyBeforeGameResult();
                global.hallService.proxy.gameRecord("wzn", data => {
                        if (!data.ok) {
                            console.log('** HallScene ** requestGameRecord err');
                        } else {
                            console.log('** HallScene ** requestGameRecord data=' + JSON.stringify(data.record));
                            this.initWithData(data.record);
                        }
                    });
                break;
            case 'psz':
                console.log('拼三张战绩');
                this.destroyBeforeGameResult();
                    global.hallService.proxy.gameRecord("psz", data => {
                        if (!data.ok) {
                            console.log('** HallScene ** requestGameRecord err');
                        } else {
                            console.log('** HallScene ** requestGameRecord data=' + JSON.stringify(data.record));
                            this.initWithData(data.record);
                        }
                    });
                break;
            default:
                break;
        }
    },
});
