import global from './../../global'

cc.Class({
    extends: cc.Component,

    properties: {},

    // onLoad () {},

    start() {
        let myTip = new cc.Node('myTip');
        let tipContent = myTip.addComponent(cc.Label);
        tipContent.string = global.tip;
        tipContent.fontSize = 24;
        //myTip.y = -6;
        myTip.parent = this.node;
        setTimeout(function () {
            this.node.destroy();
        }.bind(this), 1500);
    },

});
