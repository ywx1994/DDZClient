//从字符串中取出所有数字
exports.getNumFromStr = function (str) {
    let num = str.replace(/[^0-9]/ig, "")
    return Number(num);
};
