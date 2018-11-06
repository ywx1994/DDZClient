import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        buttons: cc.Node,
        clockTime: cc.Label,
        nickName: cc.Label,
        players: cc.Node,
        player: cc.Prefab

    },
    onLoad() {
        this.playerList = [];
        global.handler.onDestroyRoomChoice(data=>{
            for (let i = 0; i < this.playerList.length; i++) {
                this.playerList[i].emit('choose', data);        //destroyRoomPlayer接收
            }
        });
        this.chooseTimer = function () {
            this.clockTime.string -= 1;
            if (this.clockTime.string < 1) {
                this.onButtonClick(null, 'yes');
                this.unschedule(this.chooseTimer);
            }
        };
        this.schedule(this.chooseTimer, 1);
    },
    start() {

    },
    onDestroy() {
        global.handler.offDestroyRoomChoice();
    },
    initWithData(data) {
        this.nickName.string = decodeURI( data.nickName);
        for (let i = 0; i < data.playerDataList.length; i++) {
            this.addPlayer(data.playerDataList[i]);
        }
    },
    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'yes':
                global.gameService.proxy.destroyRoomChoice({accountID: global.playerData.account_id, choice: 1});
                this.buttons.active = false;
                break;
            case 'no':
                global.gameService.proxy.destroyRoomChoice({accountID: global.playerData.account_id, choice: 2});
                this.buttons.active = false;
                break;
        }
    },
    addPlayer(data) {
        let player = cc.instantiate(this.player);
        player.parent = this.players;
        player.getComponent('destroyRoomPlayer').initWithData(data);
        this.playerList.push(player);
    }
});
