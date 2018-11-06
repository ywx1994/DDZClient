/**
 * Created by litengfei on 2018/1/18.
 */
import global from "./../global";

var AutoReconnectWsRpcClient = require("./AutoReconnectWsRpcClient");
var EventEmitter = require("./EventEmitter");
var ddzHandler = require("./ddzHandler");
var nnHandler = require("./nnHandler");
var pszHandler = require("./pszHandler");
class NetWorkManager{
    static connectAndAuthToHall(url) {//cb 2params baseinfo service
        if (NetWorkManager.g_HallService === null) {
            NetWorkManager.g_HallService = new AutoReconnectWsRpcClient();
            NetWorkManager.g_HallService.connect(url);
            NetWorkManager.g_HallService.onClose(function () {
                //连接中断
                NetWorkManager.g_HallServiceIsLogin = false;
                NetWorkManager.events.emit("closeFromHall");
                NetWorkManager.connectAndAuthToHall(url);
            })
        }
        NetWorkManager.g_HallService.onReady(function (service) {
            service.proxy.login(global.playerData.accountID,function (data) {
                if(data.ok){//大厅服务器里录入玩家成功
                    NetWorkManager.g_HallServiceIsLogin = true;
                    global.hallService = NetWorkManager.g_HallService;
                    NetWorkManager.events.emit("loginToHall",service);
                    //cc.director.loadScene('HallScene');
                }
            })
        })
    }

    static onConnectedToHall(cb){//cb 1param service
        if(NetWorkManager.g_HallServiceIsLogin){
            cb(NetWorkManager.g_HallService);
            return;
        }
        NetWorkManager.events.on("loginToHall",cb);
    }

    static offConnectedToHall(cb){
        NetWorkManager.events.off(cb);
    }

    static onClosedFromHall(cb){//cb 1param service
        NetWorkManager.events.on("closeFromHall",cb);
    }

    static  offClosedFromHall(cb){
        NetWorkManager.events.off(cb);
    }

    static clearHallService() {//清理当前大厅的连接
        NetWorkManager.events = new EventEmitter();
        NetWorkManager.g_HallServiceIsLogin = false;
        if (NetWorkManager.g_HallService){
            NetWorkManager.g_HallService.clear();
            NetWorkManager.g_HallService = null;
        }
    }


    //-------------------------------ddz游戏服务网络-----------------------------
    static connectAndAuthToDDZGame(url) {//cb 2params baseinfo service
        if (NetWorkManager.g_ddzGameService === null) {
            NetWorkManager.g_ddzGameService = new AutoReconnectWsRpcClient();
            NetWorkManager.g_ddzGameService.addRpc(ddzHandler.service);
            NetWorkManager.g_ddzGameService.connect(url);
            NetWorkManager.g_ddzGameService.onClose(function () {
                //连接中断
                NetWorkManager.g_ddzGameServiceIsLogin = false;
                NetWorkManager.ddzgamevents.emit("closeFromGame");
                NetWorkManager.connectAndAuthToDDZGame(url);
            })
        }
        NetWorkManager.g_ddzGameService.onReady(function (service) {
            console.log("成功连接斗地主服务");
            global.gameService = NetWorkManager.g_ddzGameService;
            global.handler = ddzHandler;
            NetWorkManager.g_ddzGameServiceIsLogin = true;
            NetWorkManager.ddzgamevents.emit("loginToGame",service);
        })
    }

    static onConnectedToDDZGame(cb){//cb 1param service
        if(NetWorkManager.g_ddzGameServiceIsLogin){
            cb(NetWorkManager.g_ddzGameService);
            return;
        }
        NetWorkManager.ddzgamevents.on("loginToGame",cb);
    }

    static offConnectedToDDZGame(cb){
        NetWorkManager.ddzgamevents.off(cb);
    }

    static onClosedFromDDZGame(cb){//cb 1param service
        NetWorkManager.ddzgamevents.on("closeFromGame",cb);
    }

    static  offClosedFromDDZGame(cb){
        NetWorkManager.ddzgamevents.off(cb);
    }

    static clearDDZGameService() {//清理当前大厅的连接
        NetWorkManager.ddzgamevents = new EventEmitter();
        NetWorkManager.g_ddzGameServiceIsLogin = false;
        if (NetWorkManager.g_ddzGameService){
            NetWorkManager.g_ddzGameService.clear();
            NetWorkManager.g_ddzGameService = null;
        }
    }
    //-------------------------------nn游戏服务网络-----------------------------
    static connectAndAuthToNNGame(url) {//cb 2params baseinfo service
        if (NetWorkManager.g_nnGameService === null) {
            NetWorkManager.g_nnGameService = new AutoReconnectWsRpcClient();
            NetWorkManager.g_nnGameService.addRpc(nnHandler.service);
            NetWorkManager.g_nnGameService.connect(url);
            NetWorkManager.g_nnGameService.onClose(function () {
                //连接中断
                NetWorkManager.g_nnGameServiceIsLogin = false;
                NetWorkManager.nngamevents.emit("closeFromGame");
                NetWorkManager.connectAndAuthToNNGame(url);
            })
        }
        NetWorkManager.g_nnGameService.onReady(function (service) {
            global.gameService = NetWorkManager.g_nnGameService;
            global.handler = nnHandler;
            NetWorkManager.g_nnGameServiceIsLogin = true;
            NetWorkManager.nngamevents.emit("loginToGame",service);
        })
    }

    static onConnectedToNNGame(cb){//cb 1param service
        if(NetWorkManager.g_nnGameServiceIsLogin){
            cb(NetWorkManager.g_nnGameService);
            return;
        }
        NetWorkManager.nngamevents.on("loginToGame",cb);
    }

    static offConnectedToNNGame(cb){
        NetWorkManager.nngamevents.off(cb);
    }

    static onClosedFromNNGame(cb){//cb 1param service
        NetWorkManager.nngamevents.on("closeFromGame",cb);
    }

    static  offClosedFromNNGame(cb){
        NetWorkManager.nngamevents.off(cb);
    }

    static clearNNGameService() {//清理当前大厅的连接
        NetWorkManager.nngamevents = new EventEmitter();
        NetWorkManager.g_nnGameServiceIsLogin = false;
        if (NetWorkManager.g_nnGameService){
            NetWorkManager.g_nnGameService.clear();
            NetWorkManager.g_nnGameService = null;
        }
    }
    //-------------------------------psz游戏服务网络-----------------------------
    static connectAndAuthToPSZGame(url) {//cb 2params baseinfo service
        if (NetWorkManager.g_pszGameService === null) {
            NetWorkManager.g_pszGameService = new AutoReconnectWsRpcClient();
            NetWorkManager.g_pszGameService.addRpc(pszHandler.service);
            NetWorkManager.g_pszGameService.connect(url);
            NetWorkManager.g_pszGameService.onClose(function () {
                //连接中断
                NetWorkManager.g_pszGameServiceIsLogin = false;
                NetWorkManager.pszgamevents.emit("closeFromGame");
                NetWorkManager.connectAndAuthToPSZGame(url);
            })
        }
        NetWorkManager.g_pszGameService.onReady(function (service) {
            global.gameService = NetWorkManager.g_pszGameService;
            global.handler = pszHandler;
            NetWorkManager.g_pszGameServiceIsLogin = true;
            NetWorkManager.pszgamevents.emit("loginToGame",service);
        })
    }

    static onConnectedToPSZGame(cb){//cb 1param service
        if(NetWorkManager.g_pszGameServiceIsLogin){
            cb(NetWorkManager.g_pszGameService);
            return;
        }
        NetWorkManager.pszgamevents.on("loginToGame",cb);
    }

    static offConnectedToPSZGame(cb){
        NetWorkManager.pszgamevents.off(cb);
    }

    static onClosedFromPSZGame(cb){//cb 1param service
        NetWorkManager.pszgamevents.on("closeFromGame",cb);
    }

    static  offClosedFromPSZGame(cb){
        NetWorkManager.pszgamevents.off(cb);
    }

    static clearPSZGameService() {//清理当前大厅的连接
        NetWorkManager.pszgamevents = new EventEmitter();
        NetWorkManager.g_pszGameServiceIsLogin = false;
        if (NetWorkManager.g_pszGameService){
            NetWorkManager.g_pszGameService.clear();
            NetWorkManager.g_pszGameService = null;
        }
    }
}
//大厅
NetWorkManager.g_HallService = null;
NetWorkManager.g_HallServiceIsLogin = false;
NetWorkManager.events = new EventEmitter();
//ddz
NetWorkManager.g_ddzGameService = null;
NetWorkManager.g_ddzGameServiceIsLogin = false;
NetWorkManager.ddzgamevents = new EventEmitter();
//nn
NetWorkManager.g_nnGameService = null;
NetWorkManager.g_nnGameServiceIsLogin = false;
NetWorkManager.nngamevents = new EventEmitter();
//psz
NetWorkManager.g_pszGameService = null;
NetWorkManager.g_pszGameServiceIsLogin = false;
NetWorkManager.pszgamevents = new EventEmitter();


module.exports = NetWorkManager;