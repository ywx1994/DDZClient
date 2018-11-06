import global from "./../../global";

const voiceNative = require("./../../utils/VoiceNative");

cc.Class({
    extends: cc.Component,

    properties: {
        voiceNode: cc.Node,             //录音节点
        voiceFailedNode: cc.Node,      //录音失败节点
        timeBarNode: cc.Node,          //录音时间条
        volumeNode: cc.Node,           //录音音量
        _lastTouchTime: null,
        _lastCheckTime: -1,
        MAX_TIME: 15000,
    },

    statics: {
        _instance: null,		//instance  实例
        _shopList: null,
        // 语音队列
        _voiceList: [],
    },

    onLoad() {
        var btnVoice = cc.find("Canvas/btnNode/voiceBtn");
        var self = this;
        if (btnVoice) {
            btnVoice.on(cc.Node.EventType.TOUCH_START, function () {
                console.log("cc.Node.EventType.TOUCH_START");
                voiceNative.prepare("record.amr");
                self._lastTouchTime = Date.now();
                self.voiceNode.active = true;
                self.voiceFailedNode.active = false;
            });

            btnVoice.on(cc.Node.EventType.TOUCH_MOVE, function () {
                console.log("cc.Node.EventType.TOUCH_MOVE");
            });

            btnVoice.on(cc.Node.EventType.TOUCH_END, function () {
                console.log("cc.Node.EventType.TOUCH_END");
                if (Date.now() - self._lastTouchTime < 1000) {
                    self.voiceNode.active = false;
                    self.voiceFailedNode.active = true;
                    voiceNative.cancel();
                }
                else {
                    self.onVoiceOK();
                }
                self._lastTouchTime = null;
            });

            btnVoice.on(cc.Node.EventType.TOUCH_CANCEL, function () {
                console.log("cc.Node.EventType.TOUCH_CANCEL");
                voiceNative.cancel();
                self._lastTouchTime = null;
                self.voiceNode.active = false;
            });
        }
    },

    onVoiceOK: function () {
        if (this._lastTouchTime != null) {
            voiceNative.release();
            var time = Date.now() - this._lastTouchTime;
            var msg = voiceNative.getVoiceData("record.amr");
            global.gameService.proxy.voiceMSG({msg: msg, time: time});
        }
        this.voiceNode.active = false;
        // 本地测试测试
        setTimeout(function () {
            // 间隔两秒播放录音
            var msgfile = "record.amr";
            voiceNative.play(msgfile);
            // 到这里结束
            //voiceNative.writeVoice 根据msgStr 文件  和命名 把后端发送过来的语音存放本地
            // 本地测试不需要这步
            voiceNative.writeVoice(msgfile, msg);
            cc.log("即将要播放的语音内容" + msg);
            voiceNative.play(msgfile);
            this._lastPlayTime = Date.now() + time;
        }, 2000)
    },

    update: function (dt) {
        if (this.voiceNode.active == true && this.voiceFailedNode.active == false) {
            if (Date.now() - this._lastCheckTime > 300) {
                for (var i = 0; i < this.volumeNode.children.length; ++i) {
                    this.volumeNode.children[i].active = false;
                }
                var v = this.getVoiceLevel(7);
                if (v >= 1 && v <= 7) {
                    this.volumeNode.children[v - 1].active = true;
                }
                this._lastCheckTime = Date.now();
            }
        }

        if (this._lastTouchTime) {
            var time = Date.now() - this._lastTouchTime;
            if (time >= this.MAX_TIME) {
                this.onVoiceOK();
                this._lastTouchTime = null;
            }
            else {
                var percent = time / this.MAX_TIME;
                this.timeBarNode.scaleX = 1 - percent;
            }
        }

        if (this._lastPlayTime != null) {
            if (Date.now() > this._lastPlayTime + 200) {
                cc.audioEngine.resumeAll();
                this._lastPlayTime = null;
            }
        }
    },

    getVoiceLevel: function (maxLevel) {
        return Math.floor(Math.random() * maxLevel + 1);
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod("com/babykylin/VoiceRecorder", "getVoiceLevel", "(I)I", maxLevel);
        }
        else if (cc.sys.os == cc.sys.OS_IOS) {
        }
        else {
            return Math.floor(Math.random() * maxLevel + 1);
        }
    },

    onButtonClick(event, customData) {
        switch (customData) {
            case 'close':
                this.voiceNode.active = false;
                this.voiceFailedNode.active = false;
                break;
        }
    },
})
;
