import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        ruleText: cc.RichText
    },

    onLoad() {
        this.ruleText.string = '一、游戏规则:\n' +
            '1、牌面数值:10、J、Q、K都为10,其他按牌面数字计算。\n' +
            '2、取其中3张牌数值相加,如果和是(4+7+9=20)(K+8=18),此牌型\n' +
            '   为牛8.如果剩余2张牌相加之和也是10的倍数即为牛牛牌型,如4、\n' +
            '9、7、J、Q,J+Q=20,则为牛牛。\n' +
            '3、五小牛:所有牌均小于5,点数总和小于10.\n' +
            '   炸弹牛:有4张相同的牌。\n' +
            '   五花牛:5张牌均为J、Q、K\n' +
            '   对子牛:取其中3张牌数值相加,如果和为10的倍数并且另外两\n' +
            '   张牌为对子,则为对子牛牌型。\n' +
            '4、5张牌中任意3张牌之和都不能为10的倍数,则判定为无牛。\n' +
            '5、牌型大小顺序为:\n' +
            '   五小牛>炸弹牛>五花牛>对子牛>牛牛>牛九>牛八>牛七>牛六>\n' +
            '   牛五>牛四>牛三>牛二>牛一>无牛。\n' +
            '6、如果牛数相同,则比较五张手牌中最大的那张牌的大小,顺序为:\n' +
            '   K>Q>J…….>2>A。炸弹牛比较的大小。\n' +
            '7、如果牛数相同,最大那张牌的数字也相同,则比较花色,顺序为:\n' +
            '   黑桃>红桃>梅花>方块。\n' +
            '8、创建房间时,可以选择每种牌型的倍数,获胜积分=对应牌型的\n' +
            '   倍数*下注额。\n' +
            '  \n' +
            '二、庄家规则\n' +
            '1、明牌抢庄:玩家根据手中已经亮开的四张牌决定抢庄或者不抢庄,\n' +
            '   抢庄倍数最大的玩家坐庄:如果多名玩家都选择最大倍数,则从中\n' +
            '   随机一名玩家坐庄:如果无人抢庄,则所有玩家中随机一名玩家坐庄。\n' +
            '2、牛牛上庄:第一局随机庄家。在玩家抓到牛牛牌型之后,下局会\n' +
            '   成为庄家:如果一局中有多个玩家抓到牛牛牌型,则在牛牛玩家中随\n' +
            '   机一个玩家成为庄家:如果本局无牛牛牌型,则本局庄家下局连庄。\n' +
            '3、自由抢庄:每局开始玩家均可以选择是否抢庄,如果只有一个玩\n' +
            '   家抢庄,则抢庄玩家坐庄:如果多人抢庄,则从中随机一名玩家坐庄,\n' +
            '   如果无人抢庄,则从所有玩家中随机一名玩家坐庄。\n' +
            '4、固定庄家:房主固定为庄家,在游戏中庄家不可以变更。庄家可\n' +
            '   以拥有低分,在低分全部输光、达到开房局数或在三局以后庄家主\n' +
            '   动下庄时房间进行结算。每局结算时按照牌型大小进行结算,当庄\n' +
            '   家低分不足时,将停止后续的结算。\n' +
            '5、通比牛牛:无庄家,速度快,牌最大者赢全场。\n' +
            '\n' +
            '三、局内选项\n' +
            '1、底分:1/2、2/4、4/8\n' +
            '2、局数:5局、10局、20局\n' +
            '3、房费房主支付3钻 、AA每人1钻(20局翻倍)\n' +
            '4、翻倍规则:\n' +
            '   可选择A:牛牛*3倍、牛九*2倍、牛八*2倍\n' +
            '   可选择B:牛牛*4倍、牛九*3倍、牛八*2倍、牛七*2倍\n' +
            '5、特殊牌型:\n' +
            '   对子牛(4倍)、五花牛(5倍)、炸弹牛(6倍)、五小牛(8倍)\n' +
            '6、高级选项:\n' +
            '   闲家推注:当闲家获胜后,下局可将所赢得的积分与低注一起下\n' +
            '   注,最大推注倍数为低分的10倍,不可连续推注。\n' +
            '7、上庄分数:\n' +
            '   限固定庄家模式。房主固定为庄家。无限、400、600、800。\n' +
            '8、最大抢庄:\n' +
            '   限明牌抢庄模式。1倍、2倍、3倍、4倍。\n' +
            '\n' +
            '四、用语解释\n' +
            '1、庄闲:每局中会有一个庄家,剩余玩家为闲家。闲家在游戏中进\n' +
            '   行下注,庄家不需要下注。\n' +
            '2、亮牌:玩家将手上的牌面公示给其他玩家。\n' +
            '3、比牌:庄家跟闲家一一比较牌型大小,按照牌型大小顺序。\n' +
            '4、结算:闲家和庄家一一结算,根据闲家的下注数额及双方牌型计\n' +
            '   算输赢积分。\n';
    },

    onButtonClick(event, customData) {
        cc.audioEngine.play(cc.url.raw('resources/audio/click.mp3'), false, global.playVolume);
        switch (customData) {
            case 'close':
                this.node.destroy();
                break;
            default:
                break;
        }
    },
});
