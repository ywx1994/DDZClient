cc.Class({
    extends: cc.Component,

    properties: {
        playersLayout: cc.Node,
        comparePlayer: cc.Prefab
    },
    onLoad() {
        this.time = 5;
    },

    start() {
        this.schedule(() => {
            this.time -= 0.1;
            if (this.time < 1.5) {
                this.node.destroy();
            }
        }, 0.1);
    },
    onButtonClick(event, customData) {
        switch (customData) {
            case 'destroy':
                this.node.destroy();
                break;
        }
    },
    initWithData(data, time) {
        this.time = Number(time);
        for (let i = 0; i < data.length; i++) {
            let player = cc.instantiate(this.comparePlayer);
            player.parent = this.playersLayout;
            player.getComponent('comparePlayer').initWithData(data[i]);
        }
    },
});
