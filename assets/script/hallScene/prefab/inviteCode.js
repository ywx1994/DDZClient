import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        inviteCode: cc.EditBox,
        labelContent: cc.Node,
        haveInviteCodeNode: cc.Node,
        inviteCodeLabel: cc.Label,      //已绑定的邀请码
        bindingBtn: cc.Button,
        tipsPrefab: cc.Prefab,
    },

    initWithData(data) {
        this.labelContent.active = false;
        this.haveInviteCodeNode.active = true;
        this.inviteCodeLabel.string = data;
        this.bindingBtn.interactable = false;
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'),false,global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            case 'binding':
                console.log('绑定邀请码。。。');
                let code = this.inviteCode.string.trim();   //获取用户输入的邀请码并去除两端的空格
                if (code.length !== 8) {
                    let tips = cc.instantiate(this.tipsPrefab);
                    tips.parent = this.node;
                    global.tip = '请输入8位的纯数字(不能含空格)。';
                    return;
                }
                let codeToNum = Number(code);
                if (isNaN(codeToNum)) {
                    let tips = cc.instantiate(this.tipsPrefab);
                    tips.parent = this.node;
                    global.tip = '请输入8位的纯数字(不能含空格)。';
                    return;
                } else {
                    console.log('输入的是纯数字!');
                    global.hallService.proxy.inviteCode(codeToNum, data => {
                            if (!data.ok) {
                                console.log('** inviteCode ** requestVerifyCode err=' );
                                if (data.data) {
                                    let tips = cc.instantiate(this.tipsPrefab);
                                    tips.parent = this.node;
                                    global.tip = '该邀请码不存在！';
                                }
                            } else {
                                console.log('** inviteCode ** requestVerifyCode result=' + JSON.stringify(data));
                                if (data.data !== undefined) {
                                    global.playerData.ranking = data.data;
                                    this.initWithData(data.data);
                                }
                            }
                        });
                }

                break;
            default:
                break;
        }
    },

    //在输入框中点击回车键
    editingReturn(editbox, customEventData) {
        switch (customEventData) {
            case 'goBinding':
                this.onButtonClick(null, 'binding');
                break;
            default:
                break;
        }
    },
});
