import global from "../../global";
let ScreenShot = require("../../utils/ScreenShot");

cc.Class({
    extends: cc.Component,

    properties: {
        onePlayerResult: cc.Prefab,
        oneGaemResultContent: cc.Node,
        labelNode: cc.Node
    },

    initWithData(data) {
        this.gameItemContents = (JSON.parse(data.game_info)).gameItemContents;
        this.nameANDscore = {name: [], score: []};
        // console.log('** oneGameResult ** this.gameItemContents=' + JSON.stringify(this.gameItemContents));

        let labelList = this.labelNode.children;
        labelList[0].getComponent(cc.Label).string = '房号:' + data.room_id;
        labelList[1].getComponent(cc.Label).string = '局数:' + data.total_round;
        labelList[2].getComponent(cc.Label).string = '底分:' + data.base_score;
        labelList[3].getComponent(cc.Label).string = data.game_type;
        labelList[4].getComponent(cc.Label).string = data.create_date.substr(0, 16);

        let playerJson = JSON.parse(data.players);
        console.log('玩家个数：' + playerJson.length);
        let gameInfo = JSON.parse(data.game_info);
        console.log('游戏数据：' + JSON.stringify(gameInfo));

        let totalScoreList = {};
        for (let i = 0; i < playerJson.length; i++) {
            let score = gameInfo.userContents[i].totalScore;
            if (!totalScoreList.hasOwnProperty(score)) {
                totalScoreList[score] = true;
            }
        }
        let socreList = Object.keys(totalScoreList);
        socreList.sort((a, b) => {
            return Number(b) - Number(a);
        });
        console.log('排序好的总分数：' + JSON.stringify(socreList));
        let tyrantScore = undefined;
        if (socreList.length >= 2) {
            tyrantScore = socreList[1];
        }
        let otherData = {
            houseMasterID: data.house_master,
            bigWinnerScore: socreList[0],
            tyrantScore: tyrantScore
        };

        for (let i = 0; i < playerJson.length; i++) {
            this.addOnePlayerResult(gameInfo.userContents[i], otherData);
            this.nameANDscore.name.push(gameInfo.userContents[i].name);
            this.nameANDscore.score.push(gameInfo.userContents[i].totalScore);
        }
        console.log('====== nameANDscore =======' + JSON.stringify(this.nameANDscore));
    },

    addOnePlayerResult(data, otherData) {
        let onePlayerResult = cc.instantiate(this.onePlayerResult);
        onePlayerResult.parent = this.oneGaemResultContent;
        let playerInfo = {
            avatarUrl: data.head,
            nickName: data.name,
            accountID: data.username,
            score: data.totalScore
        };
        onePlayerResult.getComponent('onePlayerResult').initWithData(playerInfo, otherData);
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'share':
                //todo 截图分享微信好友
                let shot = new ScreenShot();
                ScreenShot.clearImage("shot.png");
                shot.shot();
                shot.saveToFile("shot.png", cc.ImageFormat.PNG, () => {
                    if (cc.sharePlugin === undefined) {
                        let agent = anysdk.agentManager;
                        cc.sharePlugin = agent.getSharePlugin();
                    }
                    let info = {
                        shareTo: 0,
                        mediaType: 1,
                        imagePath: jsb.fileUtils.getWritablePath() + "shot.png",
                        thumbImage: jsb.fileUtils.getWritablePath() + "shot.png"
                    };
                    cc.sharePlugin.share(info);
                });
                break;
            case 'detail':
                //让hallScene接收展示游戏详情
                global.hallScene.emit('show_detail_result', {
                    gameItemContents: this.gameItemContents,
                    nameANDscore: this.nameANDscore
                });
                break;
            default:
                break;
        }
    },
});
