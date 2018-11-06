class ScreenShot{
    constructor(){
        this.hasMask = false;
        this.renderTexture = null;
    }
    static clearImage(name) {
        let fullPath = jsb.fileUtils.getWritablePath() + name;
        if (jsb.fileUtils.isFileExist(fullPath)) {
            jsb.fileUtils.removeFile(fullPath);
        }
    }
    shot() {
        let scene = cc.director.getScene();
        let canvas = cc.find("/Canvas");
        this.renderTexture = this.createRenderTexture(canvas.width, canvas.height);
        this.renderTexture.begin();
        cc.director.getRunningScene().visit();
        this.renderTexture.end();
    }
    saveToFile(path, format, callback) {
        this.renderTexture.saveToFile(path, format, true, callback);
    }
    createRenderTexture(width, height) {
        return cc.RenderTexture.create(width, height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
        // if (this.hasMask) {
        //     return cc.RenderTexture.create(width, height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
        // } else {
        //     return cc.RenderTexture.create(width, height);
        // }
    }
}
module.exports = ScreenShot;