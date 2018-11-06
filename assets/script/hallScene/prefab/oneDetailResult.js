cc.Class({
    extends: cc.Component,

    properties: {
        labelNode: cc.Node
    },

    initWithData(data, count) {
        console.log('** oneDatailResult ** initWithData data=' + JSON.stringify(data.itemUsers));
        let labelList = this.labelNode.children;
        let gameCount = 0;
        for (let i = 0; i < data.itemUsers.length; i++) {
            if (count % 2 !== 0) {
                this.node.color = new cc.color(250, 230, 210, 255);
            }
            if (i === 0) {
                labelList[i].getComponent(cc.Label).node.active = true;
                labelList[i].getComponent(cc.Label).string = '第' + (count + 1) + '回';
            }
            labelList[i + 1].getComponent(cc.Label).node.active = true;
            labelList[i + 1].getComponent(cc.Label).string = data.itemUsers[i].win;
        }
    },
});
