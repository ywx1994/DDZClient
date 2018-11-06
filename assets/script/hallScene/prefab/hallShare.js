cc.Class({
    extends: cc.Component,

    properties: {},

    onButtonClick(event, customData) {
        switch (customData) {
            case 'shareFriend':
                console.log("分享好友");
                if (cc.sharePlugin !== undefined) {
                    let info1 = {
                        title: '告诉你我的分享可以用了!',
                        text: '这里是内容模块,我就是内容!',
                        url: 'www.baidu.com',
                        mediaType: 2,
                        shareTo: 0,
                    };
                    cc.sharePlugin.share(info1);
                }
                break;
            case 'shareFriendCircle':
                console.log("分享朋友圈");
                if (cc.sharePlugin !== undefined) {
                    let info2 = {
                        title: '告诉你我的分享可以用了!',
                        text: '这里是内容模块,我就是内容!',
                        url: 'www.baidu.com',
                        mediaType: 2,
                        shareTo: 1,
                    };
                    cc.sharePlugin.share(info2);
                }
                break;
            case 'close':
                this.node.destroy();
                break;
            default:
                break;
        }
    }

});
