let EventListener = require("./../utility/event-listener");

class ddzHandler {
    constructor() {
        this.service = {};
        this.service.destroyRoomChoice = function (data, cb) {
            ddzHandler.event.fire("destroyRoomChoice",data);
        };
        this.service.faceChat = function (data, cb) {
            console.log("data"+JSON.stringify(data));
            console.log(ddzHandler.event);
            ddzHandler.event.fire("faceChat",data);
        };
        this.service.wordChat = function (data, cb) {
            ddzHandler.event.fire("wordChat",data);
        };
        this.service.playerOffLine =function (data, cb) {
            ddzHandler.event.fire("playerOffLine",data);
        };
        this.service.roomHasDestroyed = function (data,cb) {
            ddzHandler.event.fire("roomHasDestroyed",data);
        };
        this.service.destroyRoomRequest = function (data, cb) {
            ddzHandler.event.fire("destroyRoomRequest",data);
        };
        this.service.destroyRoomFailed = function (data, cb) {
            ddzHandler.event.fire("destroyRoomFailed",data);
        };
        this.service.pushCard = function (data, cb) {
            ddzHandler.event.fire("pushCard",data);
        };
        this.service.canLandClaim = function (data, cb) {
            ddzHandler.event.fire("canLandClaim",data);
        };
        this.service.playerRobState = function (data, cb) {
            ddzHandler.event.fire("playerRobState",data);
        };
        this.service.showBottomCards = function (data, cb) {
            ddzHandler.event.fire("showBottomCards",data);
        };
        this.service.showTrust = function (data, cb) {
            ddzHandler.event.fire("showTrust",data);
        };
        this.service.stopShowTrust = function (data, cb) {
            ddzHandler.event.fire("stopShowTrust",data);
        };
        this.service.canPushCard = function (data, cb) {
            ddzHandler.event.fire("canPushCard",data);
        };
        this.service.playerPushedCards = function (data, cb) {
            ddzHandler.event.fire("playerPushedCards",data);
        };
        this.service.spring = function (data, cb) {
            ddzHandler.event.fire("spring",data);
        };
        this.service.oneGameOver = function (data, cb) {
            ddzHandler.event.fire("oneGameOver",data);
        };
        this.service.showOtherRemainCards = function (data, cb) {
            ddzHandler.event.fire("showOtherRemainCards",data);
        };
        this.service.allGameOver = function (data, cb) {
            ddzHandler.event.fire("allGameOver",data);
        };
        this.service.actionChat = function (data, cb) {
            ddzHandler.event.fire("actionChat",data);
        };
        this.service.playerJoinRoom = function (data, cb) {
            ddzHandler.event.fire("playerJoinRoom",data);
        };
        this.service.playerReady = function (data, cb) {
            ddzHandler.event.fire("playerReady",data);
        };
        this.service.gameStart = function (data, cb) {
            ddzHandler.event.fire("gameStart",data);
        };
        this.service.changeMultiple = function (data, cb) {
            ddzHandler.event.fire("changeMultiple",data);
        };
        this.service.changeLand = function (data, cb) {
            ddzHandler.event.fire("changeLand",data);
        };
        this.service.otherLeaveRoom = function (data, cb) {
            ddzHandler.event.fire("otherLeaveRoom",data);
        };
        this.service.voiceChat = function (data, cb) {
            ddzHandler.event.fire("voiceChat",data);
        };


    }
    onDestroyRoomChoice(cb){
        ddzHandler.event.on("destroyRoomChoice",cb);
    }
    offDestroyRoomChoice () {
        ddzHandler.event.removeListener('destroyRoomChoice');
    };
    onFaceChat(cb){
        ddzHandler.event.on("faceChat",cb);
        console.log("onfaceChat"+cb);
    }
    onWordChat(cb){
        ddzHandler.event.on("wordChat",cb);
    }
    onPlayerOffLine(cb){
        ddzHandler.event.on("playerOffLine",cb);
    }
    onDestroyRoom(cb){
        ddzHandler.event.on("roomHasDestroyed",cb);
    }
    onDestroyRoomRequest(cb){
        ddzHandler.event.on("destroyRoomRequest",cb);
    }
    onDestroyRoomFailed(cb){
        ddzHandler.event.on("destroyRoomFailed",cb);
    }
    onPushCard(cb){
        ddzHandler.event.on("pushCard",cb);
    }
    onCanLandClaim(cb){
    ddzHandler.event.on("canLandClaim",cb);
    }
    onPlayerRobState(cb){
        ddzHandler.event.on("playerRobState",cb);
    }
    onShowBottomCards(cb){
        ddzHandler.event.on("showBottomCards",cb);
    }
    onShowTrust(cb){
        ddzHandler.event.on("showTrust",cb);
    }
    onStopShowTrust(cb){
        ddzHandler.event.on("stopShowTrust",cb);
    }
    onCanPushCard(cb){
        ddzHandler.event.on("canPushCard",cb);
    }
    onPlayerPushedCards(cb){
        ddzHandler.event.on("playerPushedCards",cb);
    }
    onSpring(cb){
        ddzHandler.event.on("spring",cb);
    }
    onOneGameOver(cb){
        ddzHandler.event.on("oneGameOver",cb);
    }
    onShowOtherRemainCards(cb){
        ddzHandler.event.on("showOtherRemainCards",cb);
    }
    onAllGameOver(cb){
        ddzHandler.event.on("allGameOver",cb);
    }
    onActionChat(cb){
        ddzHandler.event.on("actionChat",cb);
    }
    onPlayerJoinRoom(cb){
        ddzHandler.event.on("playerJoinRoom",cb);
    }
    onPlayerReady(cb){
        ddzHandler.event.on("playerReady",cb);
    }
    onGameStart(cb){
        ddzHandler.event.on("gameStart",cb);
    }
    onChangeMultiple(cb){
        ddzHandler.event.on("changeMultiple",cb);
    }
    onChangeLand(cb){
        ddzHandler.event.on("changeLand",cb);
    }
    onOtherLeaveRoom(cb){
        ddzHandler.event.on("otherLeaveRoom",cb);
    }
    onVoiceChat(cb){
        ddzHandler.event.on("voiceChat",cb);
    }
    removeAllListener(){
        ddzHandler.event.removeAllListeners();
    }
}
ddzHandler.event = new EventListener();
ddzHandler.g = new ddzHandler();
module.exports = ddzHandler.g;