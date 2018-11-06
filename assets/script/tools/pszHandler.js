let EventListener = require("./../utility/event-listener");
class pszHandler {
    constructor() {
        this.service = {};
        this.service.destroyRoomChoice = function (data, cb) {
            pszHandler.event.fire("destroyRoomChoice",data);
        };
        this.service.faceChat = function (data, cb) {
            console.log("data"+JSON.stringify(data));
            console.log(pszHandler.event);
            pszHandler.event.fire("faceChat",data);
        };
        this.service.wordChat = function (data, cb) {
            pszHandler.event.fire("wordChat",data);
        };
        this.service.playerOffLine =function (data, cb) {
            pszHandler.event.fire("playerOffLine",data);
        };
        this.service.roomHasDestroyed = function (data,cb) {
            pszHandler.event.fire("roomHasDestroyed",data);
        };
        this.service.destroyRoomRequest = function (data, cb) {
            pszHandler.event.fire("destroyRoomRequest",data);
        };
        this.service.destroyRoomFailed = function (data, cb) {
            pszHandler.event.fire("destroyRoomFailed",data);
        };
        this.service.pushCard = function (data, cb) {
            pszHandler.event.fire("pushCard",data);
        };
        this.service.oneGameOver = function (data, cb) {
            pszHandler.event.fire("oneGameOver",data);
        };
        this.service.allGameOver = function (data, cb) {
            pszHandler.event.fire("allGameOver",data);
        };
        this.service.actionChat = function (data, cb) {
            pszHandler.event.fire("actionChat",data);
        };
        this.service.playerJoinRoom = function (data, cb) {
            pszHandler.event.fire("playerJoinRoom",data);
        };
        this.service.playerReady = function (data, cb) {
            pszHandler.event.fire("playerReady",data);
        };
        this.service.gameStart = function (data, cb) {
            pszHandler.event.fire("gameStart",data);
        };
        this.service.changeMultiple = function (data, cb) {
            pszHandler.event.fire("changeMultiple",data);
        };
        this.service.changeLand = function (data, cb) {
            pszHandler.event.fire("changeLand",data);
        };
        this.service.otherLeaveRoom = function (data, cb) {
            pszHandler.event.fire("otherLeaveRoom",data);
        };
        this.service.voiceChat = function (data, cb) {
            pszHandler.event.fire("voiceChat",data);
        };
        this.service.canStartGame = function (data, cb) {
            pszHandler.event.fire("canStartGame",data);
        };
        this.service.cannotSeat = function (data, cb) {
            pszHandler.event.fire("cannotSeat",data);
        };
        this.service.changeFirstPlayer = function (data, cb) {
            pszHandler.event.fire("changeFirstPlayer",data);
        };
        this.service.showBanker = function (data, cb) {
            pszHandler.event.fire("showBanker",data);
        };
        this.service.changePSZBout = function (data, cb) {
            pszHandler.event.fire("changePSZBout",data);
        };
        this.service.outOfBout = function (data, cb) {
            pszHandler.event.fire("outOfBout",data);
        };
        this.service.turnToPlay = function (data, cb) {
            pszHandler.event.fire("turnToPlay",data);
        };
        this.service.playerChoice = function (data, cb) {
            pszHandler.event.fire("playerChoice",data);
        };
        this.service.outRoundPlayer = function (data, cb) {
            pszHandler.event.fire("outRoundPlayer",data);
        };
        this.service.changeChips = function (data, cb) {
            pszHandler.event.fire("changeChips",data);
        };
        this.service.compareResult = function (data, cb) {
            pszHandler.event.fire("compareResult",data);
        };
        this.service.settlementPSZ = function (data, cb) {
            pszHandler.event.fire("settlementPSZ",data);
        };


    }
    onDestroyRoomChoice(cb){
        pszHandler.event.on("destroyRoomChoice",cb);
    }
    offDestroyRoomChoice () {
        pszHandler.event.removeListener('destroyRoomChoice');
    };
    onFaceChat(cb){
        pszHandler.event.on("faceChat",cb);
        console.log("onfaceChat"+cb);
    }
    onWordChat(cb){
        pszHandler.event.on("wordChat",cb);
    }
    onPlayerOffLine(cb){
        pszHandler.event.on("playerOffLine",cb);
    }
    onDestroyRoom(cb){
        pszHandler.event.on("roomHasDestroyed",cb);
    }
    onDestroyRoomRequest(cb){
        pszHandler.event.on("destroyRoomRequest",cb);
    }
    onDestroyRoomFailed(cb){
        pszHandler.event.on("destroyRoomFailed",cb);
    }
    onOneGameOver(cb){
        pszHandler.event.on("oneGameOver",cb);
    }
    onAllGameOver(cb){
        pszHandler.event.on("allGameOver",cb);
    }
    onActionChat(cb){
        pszHandler.event.on("actionChat",cb);
    }
    onPlayerJoinRoom(cb){
        pszHandler.event.on("playerJoinRoom",cb);
    }
    onPlayerReady(cb){
        pszHandler.event.on("playerReady",cb);
    }
    onGameStart(cb){
        pszHandler.event.on("gameStart",cb);
    }
    onChangeMultiple(cb){
        pszHandler.event.on("changeMultiple",cb);
    }
    onChangeLand(cb){
        pszHandler.event.on("changeLand",cb);
    }
    onOtherLeaveRoom(cb){
        pszHandler.event.on("otherLeaveRoom",cb);
    }
    onVoiceChat(cb){
        pszHandler.event.on("voiceChat",cb);
    }
    onCanStartGame(cb){
        pszHandler.event.on("canStartGame",cb);
    }
    onCannotSeat(cb){
        pszHandler.event.on("cannotSeat",cb);
    }
    onChangeFirstPlayer(cb){
        pszHandler.event.on("changeFirstPlayer",cb);
    }
    onShowBanker(cb){
        pszHandler.event.on("showBanker",cb);
    }
    onPushCard(cb){
        pszHandler.event.on("pushCard",cb);
    }
    onChangePSZBout(cb){
        pszHandler.event.on("changePSZBout",cb);
    }
    onOutOfBout(cb){
        pszHandler.event.on("outOfBout",cb);
    }
    onTurnToPlay(cb){
        pszHandler.event.on("turnToPlay",cb);
    }
    onPlayerChoice(cb){
        pszHandler.event.on("playerChoice",cb);
    }
    onOutRoundPlayer(cb){
        pszHandler.event.on("outRoundPlayer",cb);
    }
    onChangeChips(cb){
        pszHandler.event.on("changeChips",cb);
    }
    onCompareResult(cb){
        pszHandler.event.on("compareResult",cb);
    }
    onSettlementPSZ(cb){
        pszHandler.event.on("settlementPSZ",cb);
    }

    removeAllListener(){
        pszHandler.event.removeAllListeners();
    }

}
pszHandler.event = new EventListener();
pszHandler.g = new pszHandler();
module.exports = pszHandler.g;