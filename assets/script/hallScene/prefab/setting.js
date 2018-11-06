import global from "./../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        bgmSlider: cc.Slider,
        musicSlider: cc.Slider,
        bgmValueNode: cc.Node,
        musicValueNode: cc.Node
    },

    onEnable() {
        this.length = 325;
        this.bgmVolume = global.bgmVolume;
        this.musicVolume = global.playVolume;
        this.bgmSlider.progress = global.bgmVolume;
        this.musicSlider.progress = global.playVolume;
        this.bgmValueNode.width = this.length * global.bgmVolume;
        this.musicValueNode.width = this.length * global.playVolume;
    },
    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                global.bgmVolume = this.bgmVolume;
                global.playVolume = this.musicVolume;
                cc.systemEvent.emit('changeVolume');  //hallScene接收，改变背景音乐音量
                this.node.destroy();
                break;
            case 'change':
                if (cc.userPlugin !== undefined) {
                    cc.userPlugin.logout();
                }
                global.hallService.proxy.logout(data=>{
                       if (data) {
                           cc.sys.localStorage.setItem('uid',"");
                           if (global.netWorkManager.g_HallServiceIsLogin) {
                               global.netWorkManager.clearHallService();
                           }
                           cc.director.loadScene('LoginScene');
                       }
                    });


                break;
            case 'sure':
                this.node.destroy();
                break;
        }
    },
    onSlider(event, customData) {
        switch (customData) {
            case 'changeBgm':
                global.bgmVolume = this.bgmSlider.progress;
                this.bgmValueNode.width = this.length * global.bgmVolume;
                cc.systemEvent.emit('changeVolume');  //hallScene接收，改变背景音乐音量
                console.log('音量大小：' + global.bgmVolume + ' ; 长度：' + this.bgmValueNode.width);
                break;
            case 'changeMusic':
                global.playVolume = this.musicSlider.progress;
                this.musicValueNode.width = this.length * global.playVolume;
                console.log('音量大小：' + global.playVolume + ' ; 长度：' + this.musicValueNode.width);
                break;
        }
    },
});
