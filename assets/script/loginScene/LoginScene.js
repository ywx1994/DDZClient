import global from "./../global"

var UnitTools = require("../tools/UnitTools.js");
cc.Class({
    extends: cc.Component,

    properties: {
        agreementToggle: cc.Toggle,  //用户协议复选框
        uiProgress: cc.Node,       //进度条
        uiButton: cc.Node,
        userAgreement: cc.Sprite,  //用户协议内容
        tipsPrefab: cc.Prefab,
        loadingPrefab: cc.Prefab
    },

    start() {
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 6b1bf129451265f46b82d0687ea11dd590c21b69
=======

>>>>>>> 6b1bf129451265f46b82d0687ea11dd590c21b69
    },

    onLoad() {
        this.bgm = cc.audioEngine.play(cc.url.raw('resources/audio/loginMusic.mp3'), true, global.bgmVolume);
        if (cc.sys.isMobile) {
            let agent = anysdk.agentManager;
            if (cc.userPlugin === undefined) {
                cc.userPlugin = agent.getUserPlugin();
            }
            if (cc.userPlugin === undefined) {
                cc.sharePlugin = agent.getSharePlugin();
            }
            cc.userPlugin.setListener((code, msg) => {
                switch (code) {
                    case anysdk.UserActionResultCode.kLoginSuccess:
                        let userInfo = cc.userPlugin.getUserInfo();
                        let userInfoJson = JSON.parse(userInfo);
                        UnitTools.request("http://127.0.0.1:3001/weixinRegister", {
                            uid: userInfoJson.uid,
                            nickName: encodeURI(userInfoJson.nickName),
                            avatarUrl: userInfoJson.avatarUrl,
                            sex: userInfoJson.sex,
                            city: userInfoJson.city,
                            platform: cc.sys.os
                        }, (err, data) => {
                            if (err) {
                                global.tip = "登陆失败";
                                let tips = cc.instantiate(this.tipsPrefab);
                                tips.parent = this.node;
                            } else {
                                let playerData = JSON.parse(data);
                                if (!playerData.ok) {
                                    global.tip = "登陆失败";
                                    let tips = cc.instantiate(this.tipsPrefab);
                                    tips.parent = this.node;
                                } else {
                                    cc.sys.localStorage.setItem('uid', userInfoJson.uid);//存uid到本地
                                    global.playerData.accountID = playerData.accountID;
                                    global.netWorkManager.connectAndAuthToHall(playerData.hallIP);
                                    global.netWorkManager.onConnectedToHall(() => {
                                        global.firstToHall = true;
                                        cc.director.loadScene('HallScene');
                                    })
                                }
                            }
                        }, 5000);
                        break;
                    case
                    anysdk.UserActionResultCode.kLoginFail:
                        global.tip = "登陆失败";
                        let tips2 = cc.instantiate(this.tipsPrefab);
                        tips2.parent = this.node;
                        break;
                    case
                    anysdk.UserActionResultCode.kLoginCancel:
                        global.tip = "登陆取消";
                        let tips3 = cc.instantiate(this.tipsPrefab);
                        tips3.parent = this.node;
                        break;
                    case
                    anysdk.UserActionResultCode.kLoginNetworkError:
                        global.tip = "网络连接失败";
                        let tips4 = cc.instantiate(this.tipsPrefab);
                        tips4.parent = this.node;
                        break;
                    default:
                        break;
                }
            }, this);
        }
        cc.sys.localStorage.setItem('uid', "zzz");
        var localUID = cc.sys.localStorage.getItem('uid');
        if (localUID && localUID !== "") {
            UnitTools.request("http://127.0.0.1:3001/weixinlogin", {
                uid: localUID,
                platform: cc.sys.os
            }, (err, data) => {
                if (err) {
                    global.tip = "登陆失败";
                    let tips = cc.instantiate(this.tipsPrefab);
                    tips.parent = this.node;
                } else {
                    let playerData = JSON.parse(data);
                    if (!playerData.ok) {
                        global.tip = "登陆失败";
                        let tips = cc.instantiate(this.tipsPrefab);
                        tips.parent = this.node;
                    } else {
                        console.log(playerData.hallIP);
                        global.playerData.accountID = playerData.accountID;
                        global.netWorkManager.connectAndAuthToHall(playerData.hallIP);
                        global.netWorkManager.onConnectedToHall(() => {
                            global.firstToHall = true;
                            cc.director.loadScene('HallScene');
                        })
                    }
                }
            }, 5000);
        }


    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case "WXLogin":
                if (this.agreementToggle.isChecked) {
                    console.log("微信登陆。。。");
                    let loading = cc.instantiate(this.loadingPrefab);
                    loading.parent = this.node;
                    if (cc.userPlugin !== undefined) {
                        cc.userPlugin.login();
                    }
                } else {
                    // console.log("请先同意用户协议和私人条款！");
                    let tips = cc.instantiate(this.tipsPrefab);
                    tips.parent = this.node;
                    global.tip = "请先同意用户协议";
                }
                break;
            case 'close':
                this.userAgreement.node.active = false;
                break;
            case 'showItem':
                // console.log("展示用户协议。");
                this.userAgreement.node.active = true;
                break;
            default:
                break;
        }
    },

    onDestroy() {
        cc.audioEngine.stop(this.bgm);
    },

});
