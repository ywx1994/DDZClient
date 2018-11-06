class EventListener {
    constructor(){
        this.Register = {};
    }
    on(type, method) {
        if (this.Register.hasOwnProperty(type)) {  //判断type是不是Register的一个属性或对象
            this.Register[type].push(method);
        } else {
            this.Register[type] = [method];
        }
    };

    fire (type) {
        if (this.Register.hasOwnProperty(type)) {
            let handlerList = this.Register[type];
            for (let i = 0; i < handlerList.length; i++) {
                let handler = handlerList[i];
                let args = [];  //存放方法参数
                for(let j = 1 ; j < arguments.length ;j++){
                    args.push(arguments[j]);
                }
                handler.apply(this,args);
            }
        }
    };

    removeListener(type) {
        this.Register[type] = [];
    };

    removeAllListeners () {
        this.Register = {};
    };
}
module.exports = EventListener;