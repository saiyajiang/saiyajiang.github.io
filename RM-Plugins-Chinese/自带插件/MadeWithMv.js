/*:
 * NOTE: Images are stored in the img/system folder.
 *
 * @plugindesc 在进入主界面显示一个"Made with MV"的闪屏 并/或者一个自定义的闪屏
 *  * @author Dan "Liquidize" Deptula
 *
 * @help 此插件不提供插件命令。
 *
 * @param 显示 Made With MV
 * @desc 显示"Made with MV"闪屏
 * OFF - false     ON - true
 * Default: ON
 * @default true
 *
 * @param Made with MV 图片
 * @desc 当显示"Made with MV"的时候使用的图片
 * Default: MadeWithMv
 * @default MadeWithMv
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param 显示自定义图像
 * @desc 显示"Made with MV"闪屏
 * OFF - false     ON - true
 * Default: OFF
 * @default false
 *
 * @param 自定义图像
 * @desc 当显示"Made with MV"的时候使用的图片
 * Default: 
 * @default 
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param 淡出时间
 * @desc 淡出所需的时间，单位：帧
 * Default: 120
 * @default 120
 *
 * @param 淡入
 * @desc 淡入所需的时间，单位：帧
 * Default: 120
 * @default 120
 *
 * @param 等待事件
 * @desc 淡入淡出中间所需的事件, 单位：帧
 * Default: 160
 * @default 160
 *
 */
/*:ja
 * メモ: イメージはimg／systemフォルダ内に保存されます。
 *
 * @plugindesc メイン画面へ進む前に、"Made with MV"のスプラッシュ画面もしくはカスタマイズされたスプラッシュ画面を表示します。
 * @author Dan "Liquidize" Deptula
 *
 * @help  このプラグインにはプラグインコマンドはありません。
 *
 * @param Show Made With MV
 * @desc "Made with MV"のスプラッシュ画面を表示できる/できないようにします。 
 * OFF - false     ON - true
 * デフォルト: ON
 * @default true
 *
 * @param Made with MV Image
 * @desc "Made with MV"を表示する際に使用する画像
 * デフォルト: MadeWithMv
 * @default MadeWithMv
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Show Custom Splash
 * @desc "Made with MV"のスプラッシュ画面を表示できる/できないようにします。 
 * OFF - false     ON - true
 * デフォルト: OFF
 * @default false
 *
 * @param Custom Image
 * @desc "Made with MV"を表示する際に使用する画像
 * デフォルト: 
 * @default 
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Fade Out Time
 * @desc フェードアウトに要する時間（フレーム数）
 * デフォルト: 120
 * @default 120
 *
 * @param Fade In Time
 * @desc フェードインに要する時間（フレーム数）
 * デフォルト: 120
 * @default 120
 *
 * @param Wait Time
 * @desc フェードインからフェードアウトまでに要する時間（フレーム数）
 * デフォルト: 160
 * @default 160
 *
 */
var Liquidize = Liquidize || {};
Liquidize.MadeWithMV = {};
Liquidize.MadeWithMV.Parameters = PluginManager.parameters('MadeWithMv');

Liquidize.MadeWithMV.ShowMV = JSON.parse(Liquidize.MadeWithMV.Parameters["Show Made With MV"]);
Liquidize.MadeWithMV.MVImage = String(Liquidize.MadeWithMV.Parameters["Made with MV Image"]);
Liquidize.MadeWithMV.ShowCustom = JSON.parse(Liquidize.MadeWithMV.Parameters["Show Custom Splash"]);
Liquidize.MadeWithMV.CustomImage = String(Liquidize.MadeWithMV.Parameters["Custom Image"]);
Liquidize.MadeWithMV.FadeOutTime = Number(Liquidize.MadeWithMV.Parameters["Fade Out Time"]) || 120;
Liquidize.MadeWithMV.FadeInTime = Number(Liquidize.MadeWithMV.Parameters["Fade In Time"]) || 120;
Liquidize.MadeWithMV.WaitTime = Number(Liquidize.MadeWithMV.Parameters["Wait Time"]) || 160;


//-----------------------------------------------------------------------------
// Scene_Splash
//
// This is a constructor, implementation is done in the inner scope.

function Scene_Splash() {
    this.initialize.apply(this, arguments);
}

(function() {

    //-----------------------------------------------------------------------------
    // Scene_Boot
    //
    // The scene class for dealing with the game boot.
    
    var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        if (Liquidize.MadeWithMV.ShowMV) {
            ImageManager.loadSystem(Liquidize.MadeWithMV.MVImage);
        }
        if (Liquidize.MadeWithMV.ShowCustom) {
            ImageManager.loadSystem(Liquidize.MadeWithMV.CustomImage);
        }
    };

    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        if ((Liquidize.MadeWithMV.ShowMV || Liquidize.MadeWithMV.ShowCustom) && !DataManager.isBattleTest() && !DataManager.isEventTest()) {
            SceneManager.goto(Scene_Splash);
        } else {
            _Scene_Boot_start.call(this);
        }
    };

    //-----------------------------------------------------------------------------
    // Scene_Splash
    //
    // The scene class for dealing with the splash screens.

    Scene_Splash.prototype = Object.create(Scene_Base.prototype);
    Scene_Splash.prototype.constructor = Scene_Splash;

    Scene_Splash.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
        this._mvSplash = null;
        this._customSplash = null;
        this._mvWaitTime = Liquidize.MadeWithMV.WaitTime;
        this._customWaitTime = Liquidize.MadeWithMV.WaitTime;
        this._mvFadeOut = false;
        this._mvFadeIn = false;
        this._customFadeOut = false;
        this._customFadeIn = false;
    };

    Scene_Splash.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this.createSplashes();
    };

    Scene_Splash.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        SceneManager.clearStack();
        if (this._mvSplash != null) {
            this.centerSprite(this._mvSplash);
        }
        if (this._customSplash != null) {
            this.centerSprite(this._customSplash);
        }
    };

    Scene_Splash.prototype.update = function() {
        if (Liquidize.MadeWithMV.ShowMV) {
            if (!this._mvFadeIn) {
                this.startFadeIn(Liquidize.MadeWithMV.FadeInTime, false);
                this._mvFadeIn = true;
            } else {
                if (this._mvWaitTime > 0 && this._mvFadeOut == false) {
                    this._mvWaitTime--;
                } else {
                    if (this._mvFadeOut == false) {
                        this._mvFadeOut = true;
                        this.startFadeOut(Liquidize.MadeWithMV.FadeOutTime, false);
                    }
                }
            }
        }

        if (Liquidize.MadeWithMV.ShowCustom) {
            if (Liquidize.MadeWithMV.ShowMV && this._mvFadeOut == true) {
                if (!this._customFadeIn && this._fadeDuration == 0) {
                    this._customSplash.opacity = 255;
                    this._customWaitTime = Liquidize.MadeWithMV.WaitTime;
                    this.startFadeIn(Liquidize.MadeWithMV.FadeInTime, false);
                    this._customFadeIn = true;
                } else {
                    if (this._customWaitTime > 0 && this._customFadeOut == false) {
                        this._customWaitTime--;
                    } else {
                        if (this._customFadeOut == false) {
                            this._customFadeOut = true;
                            this.startFadeOut(Liquidize.MadeWithMV.FadeOutTime, false);
                        }
                    }
                }
            } else if (!Liquidize.MadeWithMV.ShowMV) {
                if (!this._customFadeIn) {
                    this._customSplash.opacity = 255;
                    this.startFadeIn(Liquidize.MadeWithMV.FadeInTime, false);
                    this._customFadeIn = true;
                } else {
                    if (this._customWaitTime > 0 && this._customFadeOut == false) {
                        this._customWaitTime--;
                    } else {
                        if (this._customFadeOut == false) {
                            this._customFadeOut = true;
                            this.startFadeOut(Liquidize.MadeWithMV.FadeOutTime, false);
                        }
                    }
                }
            }
        }

        if (Liquidize.MadeWithMV.ShowCustom) {
            if (Liquidize.MadeWithMV.ShowMV && this._mvFadeOut == true && this._customFadeOut == true) {
                this.gotoTitleOrTest();
            } else if (!Liquidize.MadeWithMV.ShowMV && this._customFadeOut == true) {
                this.gotoTitleOrTest();
            }
        } else {
            if (this._mvFadeOut == true) {
                this.gotoTitleOrTest();
            }
        }

        Scene_Base.prototype.update.call(this);
    };

    Scene_Splash.prototype.createSplashes = function() {
        if (Liquidize.MadeWithMV.ShowMV) {
            this._mvSplash = new Sprite(ImageManager.loadSystem(Liquidize.MadeWithMV.MVImage));
            this.addChild(this._mvSplash);
        }
        if (Liquidize.MadeWithMV.ShowCustom) {
            this._customSplash = new Sprite(ImageManager.loadSystem(Liquidize.MadeWithMV.CustomImage));
            this._customSplash.opacity = 0;
            this.addChild(this._customSplash);
        }
    };

    Scene_Splash.prototype.centerSprite = function(sprite) {
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
    };

    Scene_Splash.prototype.gotoTitleOrTest = function() {
        Scene_Base.prototype.start.call(this);
        SoundManager.preloadImportantSounds();
        if (DataManager.isBattleTest()) {
            DataManager.setupBattleTest();
            SceneManager.goto(Scene_Battle);
        } else if (DataManager.isEventTest()) {
            DataManager.setupEventTest();
            SceneManager.goto(Scene_Map);
        } else {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Title);
            Window_TitleCommand.initCommandPosition();
        }
        this.updateDocumentTitle();
    };

    Scene_Splash.prototype.updateDocumentTitle = function() {
        document.title = $dataSystem.gameTitle;
    };

    Scene_Splash.prototype.checkPlayerLocation = function() {
        if ($dataSystem.startMapId === 0) {
            throw new Error('Player\'s starting position is not set');
        }
    };

})();