let EventListener = require("./utility/event-listener");
let netWorkManager = require("./tools/NetWorkManager");
const global = {} || global;    //单例模式
global.playerData = {};
global.eventListener = new EventListener();
global.joinRoomData = {};
global.tip = '';
global.systemInfo = undefined;
global.playVolume = 0.5;
global.bgmVolume = 0.05;
global.hallScene = undefined;
global.gameService = undefined;
global.hallService = undefined;
global.handler = undefined;
global.netWorkManager = netWorkManager;
global.chatMusicUrl = 'resources/audio/';
global.ddzMusicUrl = 'resources/audio/ddz/PlayCard/';
global.nnMusicUrl = 'resources/audio/wzn/';
global.pszMusicUrl = 'resources/audio/psz/';
global.wordList = {
    word001: '大家好，很高兴见到各位',
    word002: '不好意思，我要离开一会儿',
    word003: '不要走，决战到天亮',
    word004: '快点啊，等得花儿都谢了',
    word005: '风水轮流转，底裤都输光了',
    word006: '竟然被看穿了，你真厉害',
    word007: '看我通杀全场，钱都是我的',
    word008: '底牌亮出来，绝对吓死你',
    word009: '快点下注吧，一会儿没机会了',
    word010: '我是庄家，谁敢挑战我',
    word011: '我早就看穿你的牌了',
    word012: '再见了，我会想念大家的',
    word013: '怎么又断线，网络这么差呀'
};
global.chatMusicList = {
    word001: '/word001.mp3',
    word002: '/word002.mp3',
    word003: '/word003.mp3',
    word004: '/word004.mp3',
    word005: '/word005.mp3',
    word006: '/word006.mp3',
    word007: '/word007.mp3',
    word008: '/word008.mp3',
    word009: '/word009.mp3',
    word010: '/word010.mp3',
    word011: '/word011.mp3',
    word012: '/word012.mp3',
    word013: '/word013.mp3'
};
global.ddzMusicList = {
    One1: '/souCard_1_3.mp3',
    One2: '/souCard_1_4.mp3',
    One3: '/souCard_1_5.mp3',
    One4: '/souCard_1_6.mp3',
    One5: '/souCard_1_7.mp3',
    One6: '/souCard_1_8.mp3',
    One7: '/souCard_1_9.mp3',
    One8: '/souCard_1_10.mp3',
    One9: '/souCard_1_11.mp3',
    One10: '/souCard_1_12.mp3',
    One11: '/souCard_1_13.mp3',
    One12: '/souCard_1_14.mp3',
    One13: '/souCard_1_15.mp3',
    One14: '/souCard_1_16.mp3',
    One15: '/souCard_1_17.mp3',
    Double1: '/souCard_2_3.mp3',
    Double2: '/souCard_2_4.mp3',
    Double3: '/souCard_2_5.mp3',
    Double4: '/souCard_2_6.mp3',
    Double5: '/souCard_2_7.mp3',
    Double6: '/souCard_2_8.mp3',
    Double7: '/souCard_2_9.mp3',
    Double8: '/souCard_2_10.mp3',
    Double9: '/souCard_2_11.mp3',
    Double10: '/souCard_2_12.mp3',
    Double11: '/souCard_2_13.mp3',
    Double12: '/souCard_2_14.mp3',
    Double13: '/souCard_2_15.mp3',
    Three: '/souCardThree.mp3',
    ThreeWithOne: '/souCardThree_1.mp3',
    ThreeWithTwo: '/souCardThree_2.mp3',
    Boom: '/souCardBomb.mp3',
    rocket: '/souCardRocket.mp3',
    FourCardWithTwo: '/souCardFour_21.mp3',
    Plane: '/souCardPlane.mp3',
    Straight: '/souCardSLine.mp3',
    spring: '/souCardSpring.mp3',
    DoubleStraight: '/souCardDLine.mp3',
    call0: '/souCardCallLord1.mp3',//叫地主
    call1: '/souCardCallLord0_1.mp3',//不叫
    call2: '/souCardRobLord1_1.mp3',//抢地主
    call3: '/souCardRobLord0_1.mp3',//不抢
    noPush0: '/souCardPass1.mp3',
    noPush1: '/souCardPass2.mp3',
    noPush2: '/souCardPass3.mp3'
};
global.nnMusicList = {
    grenade: '/M_zhadan.mp3',
    cheers: '/M_pijiu.mp3',
    flower: '/M_xianhua.mp3',
    kiss: '/M_wen.mp3',
    e_grenade: '/m_grenade.mp3',
    e_cheers: '/m_cheers.mp3',
    e_flower: '/m_flower.mp3',
    e_kiss: '/m_kiss.mp3',
    niu_type0: '/niu_type0.mp3',
    niu_type1: '/niu_type1.mp3',
    niu_type2: '/niu_type2.mp3',
    niu_type3: '/niu_type3.mp3',
    niu_type4: '/niu_type4.mp3',
    niu_type5: '/niu_type5.mp3',
    niu_type6: '/niu_type6.mp3',
    niu_type7: '/niu_type7.mp3',
    niu_type8: '/niu_type8.mp3',
    niu_type9: '/niu_type9.mp3',
    niu_type10: '/niu_type10.mp3',
    niu_type11: '/niu_type11.mp3',
    niu_type12: '/niu_type12.mp3',
    niu_type13: '/niu_type13.mp3',
    niu_type14: '/niu_type14.mp3',
};
global.nnEffectList = {
    //music文件夹底下的音效
    startTip: '/game_start_music.mp3',   //游戏开始提示音效
    pushCard: '/sound_fapai.mp3',         //发牌音效
    chip: '/chip.mp3',                     //下注音效
    getCoin: '/getCoin.mp3',              //收钱音效
    waitBet: '/wait_bet_music.mp3',      //闲家下注音效
    waitPlyerBet: '/wait_plyer_bet.mp3',//等待闲家下注音效
    lose: '/lose.mp3',                    //输音效
    win: '/win.mp3',                      //赢音效
};
global.pszMusicList = {
    play0: '/qi.mp3',
    play1: '/kan.mp3',
    play2: '/compare.mp3',
    play3: '/jia.mp3',
    play4: '/gen.mp3'
};
export default global;
