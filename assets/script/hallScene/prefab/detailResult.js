import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        oneDetailResultPrefab: cc.Prefab,
        detailResultContent: cc.Node,
        topLabelNode: cc.Node,
        bottomLabelNode: cc.Node
    },

    initWithData(data1, data2) {
        console.log('** detailResult ** initWithData data1 = ' + JSON.stringify(data1));
        console.log('** detailResult ** initWithData data2 = ' + JSON.stringify(data2));
        let topLabelList = this.topLabelNode.children;
        let bottomLabelList = this.bottomLabelNode.children;
        for (let i = 0; i < data2.name.length; i++) {
            topLabelList[i + 1].getComponent(cc.Label).node.active = true;
            bottomLabelList[i + 1].getComponent(cc.Label).node.active = true;
            topLabelList[i + 1].getComponent(cc.Label).string = decodeURI(data2.name[i]);
            bottomLabelList[i + 1].getComponent(cc.Label).string = data2.score[i];
        }

        for (let i = 0; i < data1.length; i++) {
            this.addOneDetailResult(data1[i], i);
        }
    },

    addOneDetailResult(data, count) {
        // console.log('** detailResult ** addOneDetailResult data = ' + JSON.stringify(data));
        let oneDetailResult = cc.instantiate(this.oneDetailResultPrefab);
        oneDetailResult.parent = this.detailResultContent;
        oneDetailResult.getComponent('oneDetailResult').initWithData(data, count);
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'),false,global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            default:
                break;
        }
    },
});
