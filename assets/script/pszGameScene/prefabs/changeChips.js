cc.Class({
    extends: cc.Component,

    properties: {
        totalAddLabel:cc.Label,
        chipsLabel:cc.Label,
        chips:cc.Node
    },
    // onLoad () {},

    start () {

    },
    initWithData(chips,position){
        this.totalAddLabel.string = '+'+chips;
        this.chipsLabel.string = chips;
        let time = 2;
        this.chips.position = position;
        let moveAction = cc.moveTo(1,cc.p(0,0));
        let scaleAction = cc.scaleTo(1,0.3);
        let seq = cc.sequence(scaleAction,cc.callFunc(()=>{
            this.chips.destroy();
        }));
        this.chips.runAction(moveAction);
        this.chips.runAction(seq);
        this.schedule(()=>{
            time -=1;
            if (time === 1) {
                this.totalAddLabel.node.active = true;
            }
            if (time <= 0) {
                this.node.destroy();
            }
        },1);
    },
    // update (dt) {},
});
