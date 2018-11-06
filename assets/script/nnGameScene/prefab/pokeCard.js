cc.Class({
    extends: cc.Component,

    properties: {
        wordNode: cc.Node,
        pointNode: cc.Node,
    },

    onLoad() {
        this.wordList = this.wordNode.children;
        this.pointList = this.pointNode.children;

        this.wordList[0].runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.4, 0, 5), cc.moveBy(0.4, 0, -5))));


    },
});
