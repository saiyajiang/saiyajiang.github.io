/*:
 * @plugindesc 插件用于设置基本参数
 * @author RM CoreScript team
 *
 * @help 此插件不提供插件命令
 *
* @param 缓存限制
 * @desc 用于设置图像内存缓存的上限(单位:万象素)
 * @default 10
 *
 * @param 屏幕宽度
* @desc 用于设置屏幕宽度
 * @default 816
 *
 * @param 屏幕高度
 * @desc 用于设置屏幕高度
 * @default 624
 *
 * @param 更改窗口宽度
 * @desc 如果设置，将窗口宽度更改为此值
 *
 * @param 更改窗口高度
 * @desc 如果设置，将窗口高度更改为此值
 *
 * @param 渲染模式
 * @desc 渲染模式(canvas/webgl/auto)
 * @default auto
 *
 * @param 始终跑步
 * @desc 设置玩家是否总是跑步的初始状态(on/off)
 * @default off
 */

/*:ja
 * @plugindesc 基本的なパラメーターを設定するプラグインです。
 * @author RM CoreScript team
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 * @param cacheLimit
 * @desc 画像のメモリへのキャッシュの上限値 (MPix)
 * @default 10
 *
 * @param screenWidth
 * @desc 画面サイズの幅
 * @default 816
 *
 * @param screenHeight
 * @desc 画面サイズの高さ
 * @default 624
 *
 * @param changeWindowWidthTo
 * @desc 値が設定された場合、ウインドウの幅を指定した値に変更
 *
 * @param changeWindowHeightTo
 * @desc 値が設定された場合、ウインドウの高さを指定した値に変更
 *
 * @param renderingMode
 * @desc レンダリングモード (canvas/webgl/auto)
 * @default auto
 *
 * @param alwaysDash
 * @desc プレイヤーが常時ダッシュするかどうかの初期値 (on/off)
 * @default off
 */

(function() {
    function toNumber(str, def) {
        return isNaN(str) ? def : +(str || def);
    }

    var parameters = PluginManager.parameters('Community_Basic');
    var cacheLimit = toNumber(parameters['cacheLimit'], 10);
    var screenWidth = toNumber(parameters['screenWidth'], 816);
    var screenHeight = toNumber(parameters['screenHeight'], 624);
    var renderingMode = parameters['renderingMode'].toLowerCase();
    var alwaysDash = parameters['alwaysDash'].toLowerCase() === 'on';
    var windowWidthTo = toNumber(parameters['changeWindowWidthTo'], 0);
    var windowHeightTo = toNumber(parameters['changeWindowHeightTo'], 0);

    var windowWidth;
    var windowHeight;

    if(windowWidthTo){
        windowWidth = windowWidthTo;
    }else if(screenWidth !== SceneManager._screenWidth){
        windowWidth = screenWidth;
    }

    if(windowHeightTo){
        windowHeight = windowHeightTo;
    }else if(screenHeight !== SceneManager._screenHeight){
        windowHeight = screenHeight;
    }


    ImageCache.limit = cacheLimit * 1000 * 1000;
    SceneManager._screenWidth = screenWidth;
    SceneManager._screenHeight = screenHeight;
    SceneManager._boxWidth = screenWidth;
    SceneManager._boxHeight = screenHeight;

    SceneManager.preferableRendererType = function() {
        if (Utils.isOptionValid('canvas')) {
            return 'canvas';
        } else if (Utils.isOptionValid('webgl')) {
            return 'webgl';
        } else if (renderingMode === 'canvas') {
            return 'canvas';
        } else if (renderingMode === 'webgl') {
            return 'webgl';
        } else {
            return 'auto';
        }
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.apply(this, arguments);
        if (config['alwaysDash'] === undefined) {
            this.alwaysDash = alwaysDash;
        }
    };


    var _SceneManager_initNwjs = SceneManager.initNwjs;
    SceneManager.initNwjs = function() {
        _SceneManager_initNwjs.apply(this, arguments);

        if (Utils.isNwjs() && windowWidth && windowHeight) {
            var dw = windowWidth - window.innerWidth;
            var dh = windowHeight - window.innerHeight;
            window.moveBy(-dw / 2, -dh / 2);
            window.resizeBy(dw, dh);
        }
    };
})();