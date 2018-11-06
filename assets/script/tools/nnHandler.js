let EventListener = require("./../utility/event-listener");
class nnHandler {
    constructor() {
        this.service = {};
        this.service.destroyRoomChoice = function (data, cb) {
            nnHandler.event.fire("destroyRoomChoice",data);
        };
        this.service.faceChat = function (data, cb) {
            console.log("data"+JSON.stringify(data));
            console.log(nnHandler.event);
            nnHandler.event.fire("faceChat",data);
        };
        this.service.wordChat = function (data, cb) {
            nnHandler.event.fire("wordChat",data);
        };
        this.service.playerOffLine =function (data, cb) {
            nnHandler.event.fire("playerOffLine",data);
        };
        this.service.roomHasDestroyed = function (data,cb) {
            nnHandler.event.fire("roomHasDestroyed",data);
        };
        this.service.destroyRoomRequest = function (data, cb) {
            nnHandler.event.fire("destroyRoomRequest",data);
        };
        this.service.destroyRoomFailed = function (data, cb) {
            nnHandler.event.fire("destroyRoomFailed",data);
        };
        this.service.pushCard = function (data, cb) {
            nnHandler.event.fire("pushCard",data);
        };
        this.service.canLandClaim = function (data, cb) {
            nnHandler.event.fire("canLandClaim",data);
        };


        this.service.oneGameOver = function (data, cb) {
            nnHandler.event.fire("oneGameOver",data);
        };

        this.service.allGameOver = function (data, cb) {
            nnHandler.event.fire("allGameOver",data);
        };
        this.service.actionChat = function (data, cb) {
            nnHandler.event.fire("actionChat",data);
        };
        this.service.playerJoinRoom = function (data, cb) {
            nnHandler.event.fire("playerJoinRoom",data);
        };
        this.service.playerReady = function (data, cb) {
            nnHandler.event.fire("playerReady",data);
        };
        this.service.gameStart = function (data, cb) {
            nnHandler.event.fire("gameStart",data);
        };

        this.service.changeLand = function (data, cb) {
            nnHandler.event.fire("changeLand",data);
        };
        this.service.otherLeaveRoom = function (data, cb) {
            nnHandler.event.fire("otherLeaveRoom",data);
        };
        this.service.voiceChat = function (data, cb) {
            nnHandler.event.fire("voiceChat",data);
        };
        this.service.changeFirstPlayer = function (data, cb) {
            nnHandler.event.fire("changeFirstPlayer",data);
        };
        this.service.canStartGame = function (data, cb) {
            nnHandler.event.fire("canStartGame",data);
        };
        this.service.cannotSeat = function (data, cb) {
            nnHandler.event.fire("cannotSeat",data);
        };
        this.service.oneBetOver = function (data, cb) {
            nnHandler.event.fire("oneBetOver",data);
        };
        this.service.showPlayerBet = function (data, cb) {
            nnHandler.event.fire("showPlayerBet",data);
        };
        this.service.showBanker = function (data, cb) {
            nnHandler.event.fire("showBanker",data);
        };
        this.service.showDownOver = function (data, cb) {
            nnHandler.event.fire("showDownOver",data);
        };
        this.service.playerShowDownCards = function (data, cb) {
            nnHandler.event.fire("playerShowDownCards",data);
        };
        this.service.compareCardResult = function (data, cb) {
            nnHandler.event.fire("compareCardResult",data);
        };
        this.service.playerRobState = function (data, cb) {
            nnHandler.event.fire("playerRobState",data);
        };



    }

    onDestroyRoomChoice(cb){
        nnHandler.event.on("destroyRoomChoice",cb);
    }
    offDestroyRoomChoice () {
        nnHandler.event.removeListener('destroyRoomChoice');
    };
    onFaceChat(cb){
        nnHandler.event.on("faceChat",cb);
        console.log("onfaceChat"+cb);
    }
    onWordChat(cb){
        nnHandler.event.on("wordChat",cb);
    }
    onPlayerOffLine(cb){
        nnHandler.event.on("playerOffLine",cb);
    }
    onDestroyRoom(cb){
        nnHandler.event.on("roomHasDestroyed",cb);
    }
    onDestroyRoomRequest(cb){
        nnHandler.event.on("destroyRoomRequest",cb);
    }
    onDestroyRoomFailed(cb){
        nnHandler.event.on("destroyRoomFailed",cb);
    }
    onPushCard(cb){
        nnHandler.event.on("pushCard",cb);
    }
    onOneGameOver(cb){
        nnHandler.event.on("oneGameOver",cb);
    }
    onShowOtherRemainCards(cb){
        nnHandler.event.on("showOtherRemainCards",cb);
    }
    onAllGameOver(cb){
        nnHandler.event.on("allGameOver",cb);
    }
    onActionChat(cb){
        nnHandler.event.on("actionChat",cb);
    }
    onPlayerJoinRoom(cb){
        nnHandler.event.on("playerJoinRoom",cb);
    }
    onPlayerReady(cb){
        nnHandler.event.on("playerReady",cb);
    }
    onGameStart(cb){
        nnHandler.event.on("gameStart",cb);
    }
    onChangeLand(cb){
        nnHandler.event.on("changeLand",cb);
    }
    onOtherLeaveRoom(cb){
        nnHandler.event.on("otherLeaveRoom",cb);
    }
    onVoiceChat(cb){
        nnHandler.event.on("voiceChat",cb);
    }
    onChangeFirstPlayer(cb){
        nnHandler.event.on("changeFirstPlayer",cb);
    }
    onCanStartGame(cb){
        nnHandler.event.on("canStartGame",cb);
    }
    onCannotSeat(cb){
        nnHandler.event.on("cannotSeat",cb);
    }
    onOneBetOver(cb){
    nnHandler.event.on("oneBetOver",cb);
    }
    onShowPlayerBet(cb){
        nnHandler.event.on("showPlayerBet",cb);
    }
    onShowBanker(cb){
        nnHandler.event.on("showBanker",cb);
    }
    onShowDownOver(cb){
        nnHandler.event.on("showDownOver",cb);
    }
    onPlayerShowDownCards(cb){
        nnHandler.event.on("playerShowDownCards",cb);
    }
    onCompareCardResult(cb){
        nnHandler.event.on("compareCardResult",cb);
    }
    onPlayerRobState(cb){
        nnHandler.event.on("playerRobState",cb);
    }



    removeAllListener(){
        nnHandler.event.removeAllListeners();
    }

}
nnHandler.event = new EventListener();
nnHandler.g = new nnHandler();
module.exports = nnHandler.g;