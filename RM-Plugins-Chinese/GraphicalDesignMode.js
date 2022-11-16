//=============================================================================
// GraphicalDesignMode.js
// ----------------------------------------------------------------------------
// (C)2016 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 2.10.6 2020/03/21 SceneCustomMenu.js略微修改以适配
// 2.10.5 2020/02/06 修复了某些添加了插件的窗口退出设计模式时位置变化未反映的问题
// 2.10.4 2020/01/27 修复了无法反映插件添加的某些窗口的重新定位的冲突
// 2.10.3 2019/11/02 修复了设置设计模式时不通过单击不发送消息窗口的问题
// 2.10.2 2019/02/27 修复了更改初始滚动窗口的行高时，初始滚动显示发生偏移的问题
// 2.10.1 2018/11/06 修复和BattleFormation.js的冲突
// 2.10.0 2018/08/18 添加了设置，以防止此插件触摸消息窗口和子窗口
// 2.9.1 2018/07/10 修复了以下问题：在核心脚本1.6.1或更高版本中移动设备窗口时启动设备屏幕会导致错误
// 2.9.0 2018/06/27 在关闭窗口的同时执行GDM_LOCK_MESSAGE_WINDOW时，请等待直到窗口关闭。
// 2.8.2 2018/05/20 与YEP_BattleEngineCore.js一起使用时，已解决了在设计模式下某些窗口中无法切换透明状态的冲突。
// 2.8.1 2018/01/30 修改以与最新的NW.js一起使用
// 2.8.0 2017/07/26 通过从控制台执行功能，添加了用于更改刚刚编辑的窗口的位置的功能
// 2.7.0 2017/04/11 修复了2.6.0修复程序无法正常定位其他窗口的问题，并添加了一个插件命令来临时禁用选择窗口的重新定位。
// 2.6.0 2017/04/07 添加了仅在任何开关打开时显示添加的图片和窗口的功能
// 2.5.0 2017/03/11 添加了隐藏窗口的功能
// 2.4.0 2017/01/09 添加了用于指定自定义窗口中显示内容的对齐方式的功能。
// 2.3.1 2016/11/30 修复了RPGアツマール中的NowLoading屏幕可能无法显示屏幕的问题。
// 2.3.0 2016/11/25 添加了修复消息窗口背景的显示可用性的功能。
// 2.2.1 2016/11/12 添加了在Mac上使用option键而不是Ctrl键的帮助
// 2.2.0 2016/11/03 添加了设置每个窗口所用字体的功能
// 2.1.0 2016/09/28 添加了自动缩放图标大小以匹配字体大小的功能
//                  添加了在聚焦于要操作的窗口时更改框的颜色的功能
//                  添加了在设置数字项的属性时应用JavaScript公式的功能
// 2.0.0 2016/08/22 Windows v1.3.0更改了窗口透明度的实现。
// 1.1.3 2016/08/05 本体版本低于v1.3.0时出现警告和阻止。
// 1.1.2 2016/07/20 修复了在某些窗口中加载属性后无法重新创建内容的问题
// 1.1.1 2016/07/17 修复了切换屏幕后可以恢复更改边距和字体大小的问题
// 1.1.0 2016/07/11 添加了一个插件命令以仅临时禁用消息窗口的重新定位
// 1.0.2 2016/04/02 修复与liply_memoryleak_patch.js的冲突
// 1.0.1 2016/03/28 修复了尝试更改某些窗口属性时的错误
// 1.0.0 2016/03/13 初版
// 0.9.0 2016/03/05 测试版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:zh
 * @plugindesc GUI屏幕设计插件
 * 更改参数后「保存项目」（Ctrl+S）
 * @author トリアコンタン
 *
 * @param 设计模式
 * @desc 在设计模式下启动游戏。(ON/OFF)
 * 在此模式下，您可以通过拖放来调整位置。
 * @default true
 * @type boolean
 *
 * @param 自动保存
 * @desc 更改位置时自动保存更改。(ON/OFF)
 * 通常用Ctrl + S保存。
 * @default false
 * @type boolean
 *
 * @param 创建手机版本
 * @desc 创建一个单独的移动窗口布局。(ON/OFF)
 * 仅在要更改移动版本和PC版本之间的窗口排列时才打开。
 * @default false
 * @type boolean
 *
 * @param 移动设备模拟
 * @desc 启用模拟移动设备。(ON/OFF)
 * 在创建移动版本窗口或测试时将其打开。
 * @default false
 * @type boolean
 *
 * @param 窗口透明度
 * @desc 窗口重叠时透明显示。(ON/OFF)
 * 如果另一个插件实现相同功能，则关闭。
 * @default false
 * @type boolean
 *
 * @param 网格尺寸
 * @desc 在窗口调整期间以指定的大小显示网格。
 * 0为隐藏。
 * @default 48
 * @type number
 *
 * @param 填充
 * @desc 窗口边距的默认值。 如果输入，将被应用。默认值：18
 * @default 0
 * @type number
 *
 * @param 字号
 * @desc 窗口字体大小的默认值。如果输入，将被应用。默认值：28
 * @default 0
 * @type number
 *
 * @param 行高
 * @desc 窗口行高的默认值。如果输入，将被应用。默认值：36
 * @default 0
 * @type number
 *
 * @param 背景透明度
 * @desc 窗口背景透明度默认值。如果输入，将被应用。默认值：192
 * @default 0
 * @type number
 *
 * @param 图标大小调整
 * @desc 字体大小更改时自动调整图标大小。
 * @default false
 * @type boolean
 *
 * @param 背景显示是否固定
 * @desc 忽略在消息窗口等中为每个事件指令指定的后台显示设置，并使用插件设置值对其进行修复。
 * @default false
 * @type boolean
 *
 * @param 右键单击删除
 * @desc 在设计模式中右键单击时隐藏整个窗口。(OFF时，仅删除框架)
 * @default false
 * @type boolean
 *
 * @param 忽略消息窗口
 * @desc 防止此插件对显示文字、显示选项、数值输入处理生效。更改的位置不会重置。
 * @default false
 * @type boolean
 *
 * @help 窗口和图像在每个屏幕（例如菜单窗口和战斗窗口）上的显示位置
 * 拖放以微调并以图形方式设计窗口外观。
 * 您可以在窗口上更改宽度，高度，边距，背景图像等。
 *
 * 除默认窗口外，插件添加的窗口
 * 可自定义的位置。
 * (但是，不能保证操作，因为它取决于另一方的实现。)
 *
 * 请按照以下步骤。
 *
 * 1. 将参数“设计模式”设置为「ON」。
 *   - 默认为「ON」。
 *
 * 2. 开始测试游戏，战斗测试，事件测试。
 *
 * 3. 用鼠标抓取对象并将其放置在所需的任何位置。
 *   - 用鼠标进行的常规窗口操作将被禁用。
 *   - 自动捕捉到其他窗口或屏幕边缘。(Shift无效)
 *   - 按住Ctrl键可捕捉到网格。(Mac上使用option)
 *   - Ctrl + Z撤消上一次更改。
 *   - Ctrl + Shift + Enter初始化当前场景中的所有更改。
 *   - 在窗口中右键单击以在透明和不透明之间切换框架。
 *     如果要更改参数，则切换整个窗口的显示。
 *     隐藏后，如果不重置整个屏幕就无法重新显示它。
 *   - 可以通过在窗口中按数字键（※）来更改每个属性。
 *   - 通过在控制台中输入“ changePos（x，y）;”
 *     可以更改刚刚编辑的窗口的位置。
 *
 * 4. 使用Ctrl + S保存自定义位置。
 *
 * 5. 在正常测试播放期间将“设计模式”设置为「OFF」。
 *
 * ※数字键和对应属性(数字小键盘不是数字键)
 *
 * 1. 窗口的宽度(※1)
 * 2. 窗口的高度(直接指定)(※1)
 * 3. 窗口边距(※2)
 * 4. 窗口字号(※2)
 * 5. 围绕一个窗口的高度(※2)
 * 6. 窗口背景透明度(※2)
 * 7. 窗口中的行数(※2)
 * 8. 窗口背景图片文件名
 * 9. 窗口字体名称(※3)
 *
 * ※1 可以应用JS公式。该公式仅被计算一次。。
 * ※2 可以应用JS公式。每次显示公式时，都会对其进行保存和重新计算。
 * 如果你不知道，只需像以前一样设置。
 * ※3 您需要加载字体。 请使用“字体加载插件”。
 * 下载地址：raw.githubusercontent.com/triacontane/RPGMakerMV/master/FontLoad.js
 * ※4 在Mac上，Ctrl键应替换为Option键。（command键不响应）
 *
 * 还可以添加其他图片和窗口。
 * 有关详细信息，请参见源代码中的「用户重写区域」
 * 可以通过拖放来调整其他显示的位置。
 *
 * 可以使用以下控制字符来更改窗口中显示的内容。
 * \\AL[left]   # 左对齐(如果留空，则默认左对齐)
 * \\AL[0]      # 同上
 * \\AL[center] # 中心对齐
 * \\AL[1]      # 同上
 * \\AL[right]  # 右对齐
 * \\AL[2]      # 同上
 *
 * 内容将保存在「data/ContainerProperties.json」。
 * JSON也可以使用编辑器等进行编辑。。
 *
 * 此外，您可以为移动设备定义不同的窗口排列。
 * 移动设备的内容将保存在「data/ContainerPropertiesMobile.json」。
 *
 * 启用移动设备模拟选项以移动设备在PC上运行
 * 可以复制。复制移动执行可能会更改音频和视频文件的使用格式，或者音频文件可能无法播放。
 *
 * 使用此插件重新定位的窗口将不再可重新定位。
 * 因此，此插件可用于其位置在游戏中动态变化的窗口。
 * 如果固定了位置，则可能无法正确显示。
 *
 * 如果显示出现错误（包括这些情况），
 * 建议执行一次Ctrl + Shift + Enter，以初始化屏幕上的所有窗口设置。
 *
 * 注意！　添加的图片将是
 * 可能被过滤为未使用的文件。
 * 在这种情况下，必须采取措施，例如重新插入已删除的文件。
 *
 * 注意！
 * 根据其他插件的使用情况，窗口的位置和大小可能无法正确保存。
 *
 *插件命令详细信息
 * 在事件中的「插件命令」使用。
 *  （用空格分隔参数。）
 *
 * GDM解除_显示文字
 * GDM_UNLOCK_MESSAGE_WINDOW
 *  暂时取消显示文字的位置更改。
 *  插件更改的坐标无效
 *  在事件「显示文字」中指定的窗口位置已启用。
 *
 * GDM固定_显示文字
 * GDM_LOCK_MESSAGE_WINDOW
 *  重新启用显示文字定位。
 *  插件更改的坐标生效。
 *  在事件「显示文字」中指定的窗口位置将被忽略。
 *
 * GDM解除_显示选项
 * GDM_UNLOCK_CHOICE_WINDOW
 *  暂时取消显示选项的位置更改。
 *  插件更改的坐标无效
 *  在事件「显示选项」中指定的窗口位置已启用。
 *
 * GDM固定_显示选项
 * GDM_LOCK_CHOICE_WINDOW
 *  重新启用显示选项的位置更改。
 *  插件更改的坐标生效。
 *  在事件「显示选项」中指定的窗口位置将被忽略。
 *
 * 利用规约：
 *  未经作者许可以及使用形式，可以对其进行修改和重新分发。（商用、18禁利用等）
 *  没有限制。
 *  这个插件已经是你的了。
 */
var $dataContainerProperties = null;

(function() {
    'use strict';
    //=============================================================================
    // 用户重写区-开始-
    //  pictures : 每个屏幕上显示的图片信息
    //  windows  : 每个屏幕上显示的窗口信息
    // （此处指定的文件名在部署期间使用
    // 　可能被过滤为未使用的文件）
    // ※逗号添加到最后一项，以使其更易于复制和粘贴。。
    //=============================================================================
    var settings = {
        /* 标题屏幕上的其他信息 */
        Scene_Title   : {
            /* pictures:要添加到场景中的图像。 无条件显示。 */
            pictures: [
                /* file:「img/pictures/」指定以下不带扩展名的文件  switchId: 显示条件即开关ID*/
                {file: '', switchId: 0},
            ],
            /* windows:这是一个在场景中另外显示的窗口。*/
            windows : [
                /* lines:显示内容数组。 控制字符可用。「\\i[n]」和「\」等其他指定字符。*/
                /* switchId:作为出现条件的开关ID*/
                /* 如果要在调整位置后添加新窗口，确保「添加到数组的末尾」*/
                {lines: [], switchId: 0},
            ],
        },
        /* 主菜单屏幕上的追加信息 */
        Scene_Menu :{
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 战斗画面上的追加信息 */
        Scene_Battle  : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 项目菜单屏幕上的追加信息 */
        Scene_Item    : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 技能菜单屏幕上的追加信息 */
        Scene_Skill   : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 设备菜单屏幕上的追加信息 */
        Scene_Equip   : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 在状态菜单屏幕上追加情報 */
        Scene_Status  : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 在选项屏幕上追加情報 */
        Scene_Options : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 在保存屏幕上追加情報 */
        Scene_Save    : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 在加载屏幕上追加情報 */
        Scene_Load    : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 在商店屏幕上追加情報 */
        Scene_Shop    : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 在名称输入窗口上追加情報 */
        Scene_Name    : {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
        /* 在游戏画面上追加情報 */
        Scene_Gameover: {
            pictures: [
                {file: '', switchId: 0},
            ],
            windows : [
                {lines: [], switchId: 0},
            ],
        },
    };
    //=============================================================================
    // 用户重写区 - 结束 -
    //=============================================================================
    var pluginName    = 'GraphicalDesignMode';
    var metaTagPrefix = 'GDM';

    if (!Utils.RPGMAKER_VERSION || Utils.RPGMAKER_VERSION.match(/^1\.2./)) {
        alert('!!!除非引擎版本为1.3或更高版本，否则不能使用此插件。!!!');
        return;
    }

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (value == null) return null;
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return value.toUpperCase() === 'ON' || value.toUpperCase() === 'TRUE';
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getArgString = function(arg, upperFlg) {
        arg = convertEscapeCharacters(arg);
        return upperFlg ? arg.toUpperCase() : arg;
    };

    var getArgEval = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (eval(convertEscapeCharacters(arg)) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var window = SceneManager._scene._windowLayer.children[0];
        return window ? window.convertEscapeCharacters(text) : text;
    };

    var checkTypeFunction = function(value) {
        return checkType(value, 'Function');
    };

    var checkType = function(value, typeName) {
        return Object.prototype.toString.call(value).slice(8, -1) === typeName;
    };

    var getClassName = function(object) {
        var define = object.constructor.toString();
        if (define.match(/^class/)) {
            return define.replace(/class\s+(.*?)\s+[\s\S]*/m, '$1');
        }
        return define.replace(/function\s+(.*)\s*\([\s\S]*/m, '$1');
    };

    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var paramDesignMode      = getParamBoolean(['DesignMode', '设计模式']);
    var paramThroughWindow   = getParamBoolean(['ThroughWindow', '窗口透明度']);
    var paramAutoSave        = getParamBoolean(['AutoSave', '自动保存']);
    var paramGridSize        = getParamNumber(['GridSize', '网格尺寸'], 0) || 0;
    var paramPadding         = getParamNumber(['Padding', '填充']);
    var paramFontSize        = getParamNumber(['FontSize', '字号']);
    var paramLineHeight      = getParamNumber(['LineHeight', '行高']);
    var paramBackOpacity     = getParamNumber(['LineHeight', '背景透明度']);
    var paramMobileMake      = getParamBoolean(['MobileMake', '创建手机版本']);
    var paramFakeMobile      = getParamBoolean(['FakeMobile', '移动设备模拟']);
    var paramIconSizeScale   = getParamBoolean(['IconSizeScale', '图标大小调整']);
    var paramBackgroundFixed = getParamBoolean(['BackgroundFixed', '背景显示是否固定']);
    var paramRightClickHide  = getParamBoolean(['RightClickHide', '右键单击删除']);
    var paramIgnoreMesWindow = getParamBoolean(['IgnoreMesWindow', '忽略消息窗口']);

    //=============================================================================
    // Utils
    //  添加设计模式判断。
    //=============================================================================
    Utils.isDesignMode = function() {
        return (this.isOptionValid('test') || this.isOptionValid('btest') || this.isOptionValid('etest')) &&
            this.isNwjs() && paramDesignMode;
    };

    //=============================================================================
    // 仅在设计模式下实施
    //=============================================================================
    if (Utils.isDesignMode()) {

        //=============================================================================
        // 全局功能
        //=============================================================================
        window.changePos = function(x, y) {
            SceneManager.setLastWindowPosition(x, y);
        };

        //=============================================================================
        // Input
        //  定义用于复制和覆盖的其他按钮。
        //=============================================================================
        Input.keyMapper[67] = 'copy';
        Input.keyMapper[83] = 'save';
        for (var i = 49; i < 58; i++) {
            Input.keyMapper[i] = 'num' + (i - 48);
        }

        var _Input__wrapNwjsAlert = Input._wrapNwjsAlert;
        Input._wrapNwjsAlert      = function() {
            _Input__wrapNwjsAlert.apply(this, arguments);
            var _prompt   = window.prompt;
            window.prompt = function() {
                var gui    = require('nw.gui');
                var win    = gui.Window.get();
                var result = _prompt.apply(this, arguments);
                win.focus();
                Input.clear();
                return result;
            };
        };

        var _Input_isRepeated = Input.isRepeated;
        Input.isRepeated      = function(keyName) {
            if (keyName === 'ok' && this.isPressed('control')) {
                return false;
            }
            return _Input_isRepeated.apply(this, arguments);
        };

        //=============================================================================
        // TouchInput
        //  永远记住指针的位置。
        //=============================================================================
        TouchInput._onMouseMove = function(event) {
            var x = Graphics.pageToCanvasX(event.pageX);
            var y = Graphics.pageToCanvasY(event.pageY);
            this._onMove(x, y);
        };

        //=============================================================================
        // SceneManager
        // 定义其他处理以将窗口位置保存为json格式。
        //=============================================================================
        SceneManager.controlNumber = 0;

        var _SceneManager_initialize = SceneManager.initialize;
        SceneManager.initialize      = function() {
            _SceneManager_initialize.call(this);
            this.lastWindowX            = null;
            this.lastWindowY            = null;
            this._lastWindow            = null;
            this._windowPositionChanged = false;
            this.infoWindow             = '';
            this.infoExtend             = '';
            this._copyCount             = 0;
            this._infoHelp              = '以设计模式启动。 ';
            this._documentTitle         = '';
            this._changeStack           = [];
            this.showDevToolsForGdm();
        };

        SceneManager.setLastWindow = function(windowObject) {
            this._lastWindow = windowObject;
        };

        SceneManager.setLastWindowPosition = function(x, y) {
            if (!this._lastWindow) {
                this.setInfoExtend('该操作无效，因为您刚刚接触的对象不存在。', 0);
                return;
            }
            this._lastWindow.position.x = x;
            this._lastWindow.position.y = y;
            this._windowPositionChanged = true;
        };

        SceneManager.isWindowPositionChanged = function(windowObject) {
            if (this._windowPositionChanged && windowObject === this._lastWindow) {
                this._windowPositionChanged = false;
                return true;
            }
            return false;
        };

        SceneManager.showDevToolsForGdm = function() {
            var nwWin = require('nw.gui').Window.get();
            if (nwWin.isDevToolsOpen) {
                if (!nwWin.isDevToolsOpen()) {
                    var devTool = nwWin.showDevTools();
                    devTool.moveTo(0, 0);
                    devTool.resizeTo(window.screenX + window.outerWidth, window.screenY + window.outerHeight);
                    nwWin.focus();
                }
            } else {
                nwWin.showDevTools();
            }
            this.outputStartLog();
        };

        SceneManager.outputStartLog = function() {
            var logValue = [
                '☆☆☆欢迎，以设计模式启动。☆☆☆\n',
                '在设计模式下、您可以通过自由设置对象的排列和属性来从实际游戏屏幕设计屏幕。\n',
                '--------------------操 作 方 法----------------------------------------------------------------------\n',
                '拖放 ： 抓取窗口和图像，然后将它们重新排列到所需位置。\n',
                'Ctrl+左键 ： 窗口和图像捕捉到网格。(Mac上使用option键)\n',
                'Shift+左键  ： 窗口和图像不再吸附到对象和屏幕边缘。\n',
                '在控制台上可以通过键入「changePos(x, y);」来更改刚编辑的窗口的位置。\n',
                'Ctrl+S ： 保存所有更改。\n',
                'Ctrl+C ： 将刚才操作的坐标复制到剪贴板。\n',
                'Ctrl+Z ： 撤消上一个动作。\n',
                'Ctrl+Shift+Enter ： 重置显示窗口的布局并重新加载。\n',
                '右键 ： 显示/隐藏窗口框架（或整个窗口）。\n',
                '数字键 ： 在窗口中按下时，可以如下更改相应的属性。\n',
                ' 1. 窗口宽度(※1)\n',
                ' 2. 窗口高度(直接指定)(※1)\n',
                ' 3. 窗口边距(※2)\n',
                ' 4. 窗口字号(※2)\n',
                ' 5. 一行窗口的高度(※2)\n',
                ' 6. 窗口背景透明度(※2)\n',
                ' 7. 窗口行数(※2)\n',
                ' 8. 窗口背景图片文件名\n',
                ' 9. 窗口字体名称(※3)\n',
                '※1 可以应用JS公式。在您输入公式时，公式只会被计算一次。\n',
                '※2 可以应用JS公式。每次显示屏幕时，都会保存并重新计算。\n',
                '如果您不知道，只需像以前一样设置。\n',
                '※3 字体必须事先加载。请使用「字体加载插件」。\n',
                '下载地址：raw.githubusercontent.com/triacontane/RPGMakerMV/master/FontLoad.js\n',
                '※4 在Mac上，使用Option键代替Ctrl键。（command键不再使用）\n',
                '-----------------------------------------------------------------------------------------------------\n',
                '显示以下操作日志。\n'
            ];
            console.log.apply(console, logValue);
        };

        var _SceneManager_onSceneCreate = SceneManager.onSceneCreate;
        SceneManager.onSceneCreate      = function() {
            _SceneManager_onSceneCreate.apply(this, arguments);
            this._changeStack = [];
        };

        SceneManager.pushChangeStack = function(child) {
            var index = child.parent.getChildIndex(child);
            var info  = {parent: child.parent, index: index};
            child.saveProperty(info);
            this._changeStack.push(info);
        };

        SceneManager.popChangeStack = function() {
            var info = this._changeStack.pop();
            if (info) {
                var child = info.parent.children[info.index];
                if (child) {
                    child.loadProperty(info);
                    child.saveContainerInfo();
                    return true;
                }
            }
            return false;
        };

        var _SceneManager_update = SceneManager.updateMain;
        SceneManager.updateMain  = function() {
            _SceneManager_update.apply(this, arguments);
            this.updateDragInfo();
        };

        SceneManager.updateDragInfo = function() {
            if (Input.isPressed('control') && Input.isTriggered('copy')) {
                SoundManager.playOk();
                if (this.lastWindowX == null || this.lastWindowY == null) return;
                var clipboard = require('nw.gui').Clipboard.get();
                var copyValue = '';
                if (this._copyCount % 2 === 0) {
                    copyValue = this.lastWindowX.toString();
                    this.setInfoExtend('X坐标[' + copyValue + ']复制到剪贴板。', 0);
                } else {
                    copyValue = this.lastWindowY.toString();
                    this.setInfoExtend('Y坐标[' + copyValue + ']复制到剪贴板。', 0);
                }
                clipboard.set(copyValue, 'text');
                this._copyCount++;
            }
            if (Input.isPressed('control') && Input.isTriggered('save')) {
                SoundManager.playSave();
                DataManager.saveDataFileWp();
                this.setInfoExtend('所有更改已保存。', 0);
            }
            if (Input.isPressed('control') && Input.isTriggered('ok')) {
                if (this.popChangeStack()) {
                    SoundManager.playCancel();
                    this.setInfoExtend('撤消左侧数字的操作。', -1);
                    if (paramAutoSave) DataManager.saveDataFileWp();
                }
            }
            if (Input.isPressed('control') && Input.isPressed('shift') && Input.isPressed('ok')) {
                $dataContainerProperties[this.getSceneName()] = {};
                DataManager.saveDataFileWp();
                location.reload();
            }
            var docTitle        = this._infoHelp + this.infoWindow + this.infoExtend;
            document.title      = docTitle;
            this._documentTitle = docTitle;
        };

        SceneManager.setInfoExtend = function(value, add) {
            this.controlNumber += add;
            this.infoExtend = ' ' + value;
            console.log(add ? this.controlNumber + (add < 0 ? 1 : 0) + ' : ' + value : value);
            if (paramAutoSave && add !== 0) {
                console.log('通过自动保存保存的更改。');
            }
        };

        //=============================================================================
        // DataManager
        // 定义其他处理以将窗口位置保存为json格式。
        //=============================================================================
        DataManager.saveDataFileWp = function() {
            StorageManager.saveToLocalDataFile(this._databaseFileCp.src, window[this._databaseFileCp.name]);
        };

        //=============================================================================
        // StorageManager
        // 定义其他处理以将窗口位置保存为json格式。
        //=============================================================================
        StorageManager.saveToLocalDataFile = function(fileName, json) {
            var data     = JSON.stringify(json);
            var fs       = require('fs');
            var dirPath  = this.localDataFileDirectoryPath();
            var filePath = dirPath + fileName;
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
            fs.writeFileSync(filePath, data);
        };

        StorageManager.localDataFileDirectoryPath = function() {
            var path = require('path');
            var base = path.dirname(process.mainModule.filename);
            return path.join(base, 'data/');
        };

        //=============================================================================
        // Scene_Base
        // 拖放窗口。
        //=============================================================================
        var _Scene_Base_update      = Scene_Base.prototype.update;
        Scene_Base.prototype.update = function() {
            _Scene_Base_update.apply(this, arguments);
            if (this._windowLayer) {
                this.updateDrag();
            }
            this.shiftGridToLast();
        };

        Scene_Base.prototype.shiftGridToLast = function() {
            if (this._gridSprite && this.children[this.children.length - 1] !== this._gridSprite) {
                this.addChild(this._gridSprite);
            }
        };

        Scene_Base.prototype.updateDrag = function() {
            this._windowLayer.isFrameChanged = false;

            var result = this._windowLayer.children.clone().reverse().some(function(container) {
                return checkTypeFunction(container.processDesign) && container.processDesign();
            }, this);
            if (result) return;
            this.children.clone().reverse().some(function(container) {
                return checkTypeFunction(container.processDesign) && container.processDesign();
            }, this);
        };

        var _Scene_Base_createWindowLayer      = Scene_Base.prototype.createWindowLayer;
        Scene_Base.prototype.createWindowLayer = function() {
            if (!(this instanceof Scene_Boot) && !(this instanceof Scene_Map)) this.createGridSprite();
            _Scene_Base_createWindowLayer.apply(this, arguments);
        };

        Scene_Base.prototype.createGridSprite = function() {
            var size = paramGridSize;
            if (size === 0) return;
            var width        = Graphics.boxWidth;
            var height       = Graphics.boxHeight;
            this._gridSprite = new Sprite();
            this._gridSprite.setFrame(0, 0, width, height);
            var bitmap = new Bitmap(width, height);
            for (var x = 0; x < width; x += size) {
                bitmap.fillRect(x, 0, 1, height, 'rgba(255,255,255,1.0)');
            }
            for (var y = 0; y < height; y += size) {
                bitmap.fillRect(0, y, width, 1, 'rgba(255,255,255,1.0)');
            }
            this._gridSprite.bitmap      = bitmap;
            this._gridSprite.moveDisable = true;
            this.addChild(this._gridSprite);
        };

        //=============================================================================
        // PIXI.Container 及其子类
        // 拖放容器。
        //=============================================================================
        var _PIXI_DisplayObjectContainer_initialize = PIXI.Container.prototype.initialize;
        PIXI.Container.prototype.initialize         = function(x, y, width, height) {
            _PIXI_DisplayObjectContainer_initialize.apply(this, arguments);
            this._holding      = false;
            this._dx           = 0;
            this._dy           = 0;
            this.moveDisable   = false;
            this._positionLock = false;
        };

        PIXI.Container.prototype.processDesign = function() {
            var result = false;
            if (!this.moveDisable) {
                if (this.processPosition()) {
                    var info                 = 'X:[' + this.x + '] Y:[' + this.y + ']';
                    SceneManager.lastWindowX = this.x;
                    SceneManager.lastWindowY = this.y;
                    SceneManager.infoWindow  = info;
                    SceneManager.infoCopy    = '';
                    if (!this._holding) SceneManager.setInfoExtend('位置已变更。' + info, 1);
                    result = true;
                }
                if (this.processOpacity()) {
                    SceneManager.setInfoExtend('显示/隐藏背景已更改。', 1);
                    result = true;
                }
                if (this.processInput()) {
                    SceneManager.setInfoExtend(this._propLabel + '的值' + this._propValue + '已变更。', 1);//等待更改
                    result = true;
                }
                this.processFrameChange();
            }
            return result;
        };

        if (paramIgnoreMesWindow) {
            Window_Message.prototype.processDesign = function() {};
            Window_NumberInput.prototype.processDesign = function() {};
            Window_ChoiceList.prototype.processDesign = function() {};
        }

        PIXI.Container.prototype.processPosition = function() {
            if (SceneManager.isWindowPositionChanged(this)) {
                return true;
            }
            if (this.isTouchEvent(TouchInput.isTriggered) || (this._holding && TouchInput.isPressed())) {
                if (!this._holding) this.hold();
                var x = TouchInput.x - this._dx;
                var y = TouchInput.y - this._dy;
                if (Input.isPressed('control')) {
                    var size = paramGridSize;
                    if (size !== 0) {
                        x += (x % size > size / 2 ? size - x % size : -(x % size));
                        y += (y % size > size / 2 ? size - y % size : -(y % size));
                    }
                } else if (!Input.isPressed('shift') && !this.isAnchorChanged()) {
                    x = this.updateSnapX(x);
                    y = this.updateSnapY(y);
                }
                this.position.x    = x;
                this.position.y    = y;
                this._positionLock = true;
                return true;
            } else if (this._holding) {
                this.release();
                return true;
            }
            return false;
        };

        PIXI.Container.prototype.processFrameChange = function() {};

        Window_Base.prototype.processFrameChange = function() {
            if (this._holding || !TouchInput.isMoved()) return;
            if (this.isPreparedEvent() && !this.parent.isFrameChanged) {
                this._windowFrameSprite.setBlendColor([255, 128, 0, 192]);
                this.parent.isFrameChanged = true;
                SceneManager.setLastWindow(this);
            } else {
                this._windowFrameSprite.setBlendColor([0, 0, 0, 0]);
            }
        };

        PIXI.Container.prototype.processOpacity = function() {};

        Window_Base.prototype.processOpacity = function() {
            if (this.isTouchEvent(TouchInput.isCancelled)) {
                SoundManager.playMiss();
                SceneManager.pushChangeStack(this);
                if (paramRightClickHide) {
                    this.visible = !this.visible;
                } else {
                    this.opacity = (this.opacity === 255 ? 0 : 255);
                }
                this.saveContainerInfo();
                return true;
            }
            return false;
        };

        PIXI.Container.prototype.processInput = function() {};

        Window_Base.prototype.processInput = function() {
            if (this.isPreparedEvent()) {
                var params = [
                    ['num1', '宽度', 'width', 1, 2000, null],
                    ['num2', '高度', 'height', 1, 2000, null],
                    ['num3', '填充', '_customPadding', 1, 100, this.updatePadding.bind(this), true],
                    ['num4', '字号', '_customFontSize', 1, 100, this.resetFontSettings.bind(this), true],
                    ['num5', '行高', '_customLineHeight', 1, 2000, this.setFittingHeight.bind(this), true],
                    ['num6', '背景透明度', '_customBackOpacity', 0, 255, this.updateBackOpacity.bind(this), true],
                    ['num7', '行数', '_customLineNumber', 0, 999, this.setFittingHeight.bind(this), true],
                    ['num8', '背景图像文件名', '_customBackFileName', null, null, this.createBackSprite.bind(this), true],
                    ['num9', '字体名称', '_customFontFace', null, null, this.resetFontSettings.bind(this), true]
                ];
                return params.some(function(param) {
                    return this.processSetProperty.apply(this, param);
                }.bind(this));
            }
            return false;
        };

        Window_Base.prototype.setFittingHeight = function() {
            if (this._customLineNumber) this.height = this.fittingHeight(this._customLineNumber);
        };

        Window_Base.prototype.processSetProperty = function(keyCode, propLabel, propName, min, max,
                                                            callBack, stringFlg) {
            if (this[propName] === undefined) return null;
            if (Input.isTriggered(keyCode)) {
                var result = window.prompt(propLabel + '请输入。', this[propName].toString());
                if (result || (stringFlg && result === '')) {
                    this._windowFrameSprite.setBlendColor([0, 0, 0, 0]);
                    SceneManager.pushChangeStack(this);
                    this[propName] = stringFlg ? getArgString(result) : getArgEval(result, min, max);
                    if (callBack) callBack();
                    this.reDrawContents();
                    SoundManager.playMagicEvasion();
                    this.saveContainerInfo();
                    this._propLabel = propLabel;
                    this._propValue = this[propName];
                    return true;
                }
            }
            return null;
        };

        Window_Base.prototype.reDrawContents = function() {
            this.createContents();
            this.refresh();
        };

        Window_Selectable.prototype.reDrawContents = function() {
            Window_Base.prototype.reDrawContents.apply(this, arguments);
            this.updateCursor();
        };

        PIXI.Container.prototype.isAnchorChanged = function() {
            return false;
        };

        Sprite.prototype.isAnchorChanged = function() {
            return this.anchor.x !== 0 || this.anchor.y !== 0;
        };

        PIXI.Container.prototype.hold = function() {
            this._holding = true;
            this._dx      = TouchInput.x - this.x;
            this._dy      = TouchInput.y - this.y;
            SceneManager.pushChangeStack(this);
        };

        Window_Base.prototype.hold = function() {
            PIXI.Container.prototype.hold.call(this);
            this._windowBackSprite.setBlendColor([255, 255, 255, 192]);
            this._windowContentsSprite.setBlendColor([255, 128, 0, 192]);
        };

        Sprite.prototype.hold = function() {
            PIXI.Container.prototype.hold.call(this);
            this.setBlendColor([255, 255, 255, 192]);
        };

        PIXI.Container.prototype.release = function() {
            this._holding = false;
            this.saveContainerInfo();
        };

        Window_Base.prototype.release = function() {
            PIXI.Container.prototype.release.call(this);
            this._windowBackSprite.setBlendColor([0, 0, 0, 0]);
            this._windowContentsSprite.setBlendColor([0, 0, 0, 0]);
        };

        Sprite.prototype.release = function() {
            PIXI.Container.prototype.release.call(this);
            this.setBlendColor([0, 0, 0, 0]);
        };

        PIXI.Container.prototype.updateSnapX = function(x) {
            var minDistanceL = 16, minIndexL = -1, minDistanceR = 16, minIndexR = -1;
            var children     = this.parent.children, endX = x + this.width;
            for (var i = 0, n = children.length; i < n; i++) {
                var child = children[i];
                if (child !== this && this.isSameInstance(child) && child.isTouchable() && child.isOverlapY(this)) {
                    var distanceL = Math.abs(x - child.endX);
                    if (minDistanceL > distanceL) {
                        minDistanceL = distanceL;
                        minIndexL    = i;
                    }
                    var distanceR = Math.abs(endX - child.x);
                    if (minDistanceR > distanceR) {
                        minDistanceR = distanceR;
                        minIndexR    = i;
                    }
                }
            }
            if (minDistanceL > Math.abs(x)) return 0;
            if (minDistanceR > Math.abs(Graphics.boxWidth - endX)) return Graphics.boxWidth - this.width;
            if (minDistanceR > minDistanceL) {
                return minIndexL === -1 ? x : children[minIndexL].endX;
            } else {
                return minIndexR === -1 ? x : children[minIndexR].x - this.width;
            }
        };

        PIXI.Container.prototype.updateSnapY = function(y) {
            var minDistanceU = 16, minIndexU = -1, minDistanceD = 16, minIndexD = -1;
            var children     = this.parent.children, endY = y + this.height;
            for (var i = 0, n = children.length; i < n; i++) {
                var child = children[i];
                if (child !== this && this.isSameInstance(child) && child.isTouchable() && child.isOverlapX(this)) {
                    var distanceU = Math.abs(y - child.endY);
                    if (minDistanceU > distanceU) {
                        minDistanceU = distanceU;
                        minIndexU    = i;
                    }
                    var distanceD = Math.abs(endY - child.y);
                    if (minDistanceD > distanceD) {
                        minDistanceD = distanceD;
                        minIndexD    = i;
                    }
                }
            }
            if (minDistanceU > Math.abs(y)) return 0;
            if (minDistanceD > Math.abs(Graphics.boxHeight - endY)) return Graphics.boxHeight - this.height;
            if (minDistanceD > minDistanceU) {
                return minIndexU === -1 ? y : children[minIndexU].endY;
            } else {
                return minIndexD === -1 ? y : children[minIndexD].y - this.height;
            }
        };

        PIXI.Container.prototype.isSameInstance = function() {
            return false;
        };

        Window_Base.prototype.isSameInstance = function(objectContainer) {
            return objectContainer instanceof Window_Base;
        };

        Sprite.prototype.isSameInstance = function(objectContainer) {
            return objectContainer instanceof Sprite;
        };

        PIXI.Container.prototype.isTouchPosInRect = function() {
            var tx = TouchInput.x;
            var ty = TouchInput.y;
            return (tx >= this.x && tx <= this.endX &&
            ty >= this.y && ty <= this.endY);
        };

        Sprite.prototype.isTouchPosInRect = function() {
            if (this.isTransparent()) return false;
            var dx  = TouchInput.x - this.x;
            var dy  = TouchInput.y - this.y;
            var sin = Math.sin(-this.rotation);
            var cos = Math.cos(-this.rotation);
            var rx  = this.x + Math.floor(dx * cos + dy * -sin);
            var ry  = this.y + Math.floor(dx * sin + dy * cos);
            return (rx >= this.minX() && rx <= this.maxX() &&
            ry >= this.minY() && ry <= this.maxY());
        };

        Sprite.prototype.isTransparent = function() {
            var dx  = TouchInput.x - this.x;
            var dy  = TouchInput.y - this.y;
            var sin = Math.sin(-this.rotation);
            var cos = Math.cos(-this.rotation);
            var bx  = Math.floor(dx * cos + dy * -sin) / this.scale.x + this.anchor.x * this.width;
            var by  = Math.floor(dx * sin + dy * cos) / this.scale.y + this.anchor.y * this.height;
            return this.bitmap.getAlphaPixel(bx, by) === 0;
        };

        Sprite.prototype.screenWidth = function() {
            return (this.width || 0) * this.scale.x;
        };

        Sprite.prototype.screenHeight = function() {
            return (this.height || 0) * this.scale.y;
        };

        Sprite.prototype.screenX = function() {
            return (this.x || 0) - this.anchor.x * this.screenWidth();
        };

        Sprite.prototype.screenY = function() {
            return (this.y || 0) - this.anchor.y * this.screenHeight();
        };

        Sprite.prototype.minX = function() {
            return Math.min(this.screenX(), this.screenX() + this.screenWidth());
        };

        Sprite.prototype.minY = function() {
            return Math.min(this.screenY(), this.screenY() + this.screenHeight());
        };

        Sprite.prototype.maxX = function() {
            return Math.max(this.screenX(), this.screenX() + this.screenWidth());
        };

        Sprite.prototype.maxY = function() {
            return Math.max(this.screenY(), this.screenY() + this.screenHeight());
        };

        PIXI.Container.prototype.isTouchable = function() {
            return false;
        };

        Window_Base.prototype.isTouchable = function() {
            return (this.opacity > 0 || this.contentsOpacity > 0) && this.visible && this.isOpen();
        };

        Window_BattleLog.prototype.isTouchable = function() {
            return Window.prototype.isTouchable.call(this) && this._lines.length > 0;
        };

        Sprite.prototype.isTouchable = function() {
            return this.visible && this.bitmap != null && this.scale.x !== 0 && this.scale.y !== 0;
        };

        PIXI.Container.prototype.isTouchEvent = function(triggerFunc) {
            return this.isTouchable() && triggerFunc.call(TouchInput) && this.isTouchPosInRect();
        };

        PIXI.Container.prototype.isPreparedEvent = function() {
            return this.isTouchable() && this.isTouchPosInRect();
        };

        PIXI.Container.prototype.isRangeX = function(x) {
            return this.x <= x && this.endX >= x;
        };

        PIXI.Container.prototype.isRangeY = function(y) {
            return this.y <= y && this.endY >= y;
        };

        PIXI.Container.prototype.isOverlapX = function(win) {
            return this.isRangeX(win.x) || this.isRangeX(win.endX) || win.isRangeX(this.x) || win.isRangeX(this.endX);
        };

        PIXI.Container.prototype.isOverlapY = function(win) {
            return this.isRangeY(win.y) || this.isRangeY(win.endY) || win.isRangeY(this.y) || win.isRangeY(this.endY);
        };

        Object.defineProperty(PIXI.Container.prototype, 'endX', {
            get: function() {
                return this.x + this.width;
            },
            set: function(value) {
                this.x = value - this.width;
            },

            configurable: true
        });

        Object.defineProperty(PIXI.Container.prototype, 'endY', {
            get: function() {
                return this.y + this.height;
            },
            set: function(value) {
                this.y = value - this.height;
            },

            configurable: true
        });

        //=============================================================================
        //  Window_Selectable
        //  禁用正常的触摸操作。
        //=============================================================================
        Window_Selectable.prototype.processTouch = function() {};
        Window_BattleActor.prototype.processTouch = function() {};
        Window_BattleEnemy.prototype.processTouch = function() {};

        var _Window_Message_isTriggered = Window_Message.prototype.isTriggered;
        Window_Message.prototype.isTriggered = function() {
            if (TouchInput.isRepeated()) {
                return false;
            } else {
                return _Window_Message_isTriggered.apply(this, arguments);
            }
        };
    }

    //=============================================================================
    // 通过窗口重叠时使显示自然。
    //=============================================================================
    if (paramThroughWindow && !WindowLayer.throughWindow) {
        WindowLayer.throughWindow = true;
        //=============================================================================
        //  WindowLayer
        //  删除蒙版。
        //=============================================================================
        WindowLayer.prototype._maskWindow = function(window) {};

        WindowLayer.prototype._canvasClearWindowRect = function(renderSession, window) {};
    }

    if (paramFakeMobile) {
        Utils.isMobileDevice = function() {
            return true;
        };
    }

    //=============================================================================
    // Game_Interpreter
    // 定义其他插件命令。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (!command.match(new RegExp('^' + metaTagPrefix))) return;
        this.pluginCommandGraphicalDesignMode(command.replace(metaTagPrefix, ''), args);
    };

    Game_Interpreter.prototype.pluginCommandGraphicalDesignMode = function(command) {
        switch (getCommandName(command)) {
            case '解除_显示文字' :
            case '_UNLOCK_MESSAGE_WINDOW':
                SceneManager._scene._messageWindow.unlockPosition();
                break;
            case '固定_显示文字' :
            case '_LOCK_MESSAGE_WINDOW':
                var win = SceneManager._scene._messageWindow;
                if (win.isClosing()) {
                    win.setCloseListener(win.lockPosition)
                } else {
                    win.lockPosition();
                }
                break;
            case '解除_显示选项' :
            case '_UNLOCK_CHOICE_WINDOW':
                SceneManager._scene._messageWindow._choiceWindow.unlockPosition();
                break;
            case '固定_显示选项' :
            case '_LOCK_CHOICE_WINDOW':
                var win = SceneManager._scene._messageWindow._choiceWindow;
                if (win.isClosing()) {
                    win.setCloseListener(win.lockPosition)
                } else {
                    win.lockPosition();
                }
                break;
        }
    };

    //=============================================================================
    // DataManager
    //  ContainerProperties.json添加阅读过程。
    //=============================================================================
    DataManager._databaseFileCp = {name: '$dataContainerProperties', src: 'ContainerProperties.json'};
    if (paramMobileMake && Utils.isMobileDevice()) {
        DataManager._databaseFileCp.src = 'ContainerPropertiesMobile.json';
    }

    var _DataManager_loadDatabase = DataManager.loadDatabase;
    DataManager.loadDatabase      = function() {
        _DataManager_loadDatabase.apply(this, arguments);
        var errorMessage = this._databaseFileCp.src + '找不到。';//等待修改
        this.loadDataFileAllowError(this._databaseFileCp.name, this._databaseFileCp.src, errorMessage);
    };

    DataManager.loadDataFileAllowError = function(name, src, errorMessage) {
        var xhr = new XMLHttpRequest();
        var url = 'data/' + src;
        xhr.open('GET', url);
        xhr.overrideMimeType('application/json');
        xhr.onload   = function() {
            if (xhr.status < 400) {
                window[name] = JSON.parse(xhr.responseText);
                DataManager.onLoad(window[name]);
            } else {
                DataManager.onDataFileNotFound(name, errorMessage);
            }
        };
        xhr.onerror  = function() {
            DataManager.onDataFileNotFound(name, errorMessage);
        };
        window[name] = null;
        xhr.send();
    };

    DataManager.onDataFileNotFound = function(name, errorMessage) {
        window[name] = {};
        console.warn(errorMessage);
    };

    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded      = function() {
        return _DataManager_isDatabaseLoaded.apply(this, arguments) && window[this._databaseFileCp.name];
    };

    //=============================================================================
    // SceneManager
    // 返回当前场景名称。
    //=============================================================================
    SceneManager.getSceneName = function() {
        return getClassName(this._scene);
    };

    var _SceneManager_updateScene = SceneManager.updateScene;
    SceneManager.updateScene      = function() {
        _SceneManager_updateScene.apply(this, arguments);
        if (this._scene) {
            this._scene.updateCustomContainer();
        }
    };

    //=============================================================================
    // Scene_Base
    // 添加窗口时的加载位置。
    //=============================================================================
    var _Scene_Base_addWindow      = Scene_Base.prototype.addWindow;
    Scene_Base.prototype.addWindow = function(child) {
        _Scene_Base_addWindow.apply(this, arguments);
        child.loadContainerInfo();
    };

    var _Scene_Base_addChild      = Scene_Base.prototype.addChild;
    Scene_Base.prototype.addChild = function(child) {
        _Scene_Base_addChild.apply(this, arguments);
        child.loadContainerInfo();
    };

    var _Scene_Base_createWindowLayer2     = Scene_Base.prototype.createWindowLayer;
    Scene_Base.prototype.createWindowLayer = function() {
        this.createCustomPicture();
        _Scene_Base_createWindowLayer2.apply(this, arguments);
        this.createCustomWindow();
    };

    Scene_Base.prototype.createCustomPicture = function() {
        var setting = settings[getClassName(this)];
        if (setting) {
            var pictures         = setting.pictures;
            this._customPictures = [];
            if (pictures) {
                pictures.forEach(function(picture) {
                    if (!picture.file) return;
                    var sprite    = new Sprite();
                    sprite.bitmap = ImageManager.loadPicture(picture.file, 0);
                    this._customPictures.push(sprite);
                    this.addChild(sprite);
                    sprite.switchId = picture.switchId || 0;
                }.bind(this));
            }
        }
    };

    Scene_Base.prototype.createCustomWindow = function() {
        var setting = settings[getClassName(this)];
        if (setting) {
            var windows         = setting.windows;
            this._customWindows = [];
            if (windows) {
                windows.forEach(function(windowItem) {
                    if (!windowItem.lines || windowItem.lines.length < 1) return;
                    var win = new Window_Custom(windowItem.lines);
                    this._customWindows.push(win);
                    win.switchId = windowItem.switchId || 0;
                }.bind(this));
            }
            this.updateCustomWindowVisible();
        }
    };

    Scene_Base.prototype.updateCustomContainer = function() {
        if (this._customPictures) {
            this.updateCustomPicture();
        }
        if (this._customWindows) {
            this.updateCustomWindow();
        }
    };

    Scene_Base.prototype.updateCustomPicture = function() {
        this._customPictures.forEach(function(picture) {
            if (picture.switchId > 0) {
                picture.visible = $gameSwitches.value(picture.switchId);
            }
        });
    };

    Scene_Base.prototype.updateCustomWindow = function() {
        this.updateCustomWindowVisible();
        if (!this._windowAdd) {
            this._customWindows.forEach(function(windowItem) {
                this.addWindow(windowItem);
            }, this);
            this._windowAdd = true;
        }
    };

    Scene_Base.prototype.updateCustomWindowVisible = function() {
        this._customWindows.forEach(function(windowItem) {
            if (windowItem.switchId > 0) {
                if ($gameSwitches.value(windowItem.switchId)) {
                    windowItem.show();
                } else {
                    windowItem.hide();
                }
            }
        }, this);
    };

    //=============================================================================
    // PIXI.Container
    // 保存并加载显示位置。
    //=============================================================================
    Object.defineProperty(PIXI.Container.prototype, 'x', {
        get: function() {
            return this.position.x;
        },
        set: function(value) {
            if (this._positionLock) return;
            this.position.x = value;
        }
    });

    Object.defineProperty(PIXI.Container.prototype, 'y', {
        get: function() {
            return this.position.y;
        },
        set: function(value) {
            if (this._positionLock) return;
            this.position.y = value;
        }
    });

    PIXI.Container.prototype.loadContainerInfo = function() {
        var sceneName  = SceneManager.getSceneName();
        var parentName = getClassName(this.parent);
        var sceneInfo  = $dataContainerProperties[sceneName];
        if (sceneInfo) {
            var containerInfo = sceneInfo[parentName];
            var key           = [this.parent.getChildIndex(this), getClassName(this)];
            if (containerInfo && containerInfo[key]) {
                this._positionLock = true;
                this.loadProperty(containerInfo[key]);
            }
        }
    };

    PIXI.Container.prototype.unlockPosition = function() {
        this._positionLock    = false;
        this._customPositionX = this.position.x;
        this._customPositionY = this.position.y;
    };

    PIXI.Container.prototype.lockPosition = function() {
        this._positionLock = true;
        if (this._customPositionX) {
            this.position.x = this._customPositionX;
        }
        if (this._customPositionY) {
            this.position.y = this._customPositionY;
        }
    };

    PIXI.Container.prototype.loadProperty = function(containerInfo) {
        this.position.x = containerInfo.x;
        this.position.y = containerInfo.y;
    };

    Window_Base.prototype.loadProperty = function(containerInfo) {
        PIXI.Container.prototype.loadProperty.apply(this, arguments);
        this.width               = containerInfo.width;
        this.height              = containerInfo.height;
        this.opacity             = containerInfo.opacity;
        this.visible             = this.visible && !containerInfo.hidden;
        this._customFontSize     = containerInfo._customFontSize;
        this._customPadding      = containerInfo._customPadding;
        this._customLineHeight   = containerInfo._customLineHeight;
        this._customBackOpacity  = containerInfo._customBackOpacity;
        this._customBackFileName = containerInfo._customBackFileName;
        this._customFontFace     = containerInfo._customFontFace;
        this.updatePadding();
        this.resetFontSettings();
        this.updateBackOpacity();
        this.createContents();
        this.refresh();
        this.createBackSprite();
    };

    Window_Base.prototype.refresh = function() {};

    Window_Selectable.prototype.loadProperty = function(containerInfo) {
        var row;
        if (this._scrollY !== 0) {
            row = this.topRow();
        }
        Window_Base.prototype.loadProperty.apply(this, arguments);
        this.updateCursor();
        if (row) {
            this.setTopRow(row);
        }
    };

    PIXI.Container.prototype.saveContainerInfo = function() {
        var sceneName  = SceneManager.getSceneName();
        var parentName = getClassName(this.parent);
        if (!$dataContainerProperties[sceneName]) $dataContainerProperties[sceneName] = {};
        var sceneInfo = $dataContainerProperties[sceneName];
        if (!sceneInfo[parentName]) sceneInfo[parentName] = {};
        var containerInfo = sceneInfo[parentName];
        var key           = [this.parent.getChildIndex(this), getClassName(this)];
        if (!containerInfo[key]) containerInfo[key] = {};
        this.saveProperty(containerInfo[key]);
        if (paramAutoSave) {
            DataManager.saveDataFileWp();
        }
    };

    PIXI.Container.prototype.saveProperty = function(containerInfo) {
        containerInfo.x = this.x;
        containerInfo.y = this.y;
    };

    Window_Base.prototype.saveProperty = function(containerInfo) {
        PIXI.Container.prototype.saveProperty.apply(this, arguments);
        containerInfo.width               = this.width;
        containerInfo.height              = this.height;
        containerInfo.opacity             = this.opacity;
        containerInfo.hidden              = !this.visible;
        containerInfo._customFontSize     = this._customFontSize;
        containerInfo._customPadding      = this._customPadding;
        containerInfo._customLineHeight   = this._customLineHeight;
        containerInfo._customBackOpacity  = this._customBackOpacity;
        containerInfo._customBackFileName = this._customBackFileName;
        containerInfo._customFontFace     = this._customFontFace;
    };

    //=============================================================================
    // Window_Base
    // 自定义属性值。
    //=============================================================================
    var _Window_Base_initialize      = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function(x, y, width, height) {
        _Window_Base_initialize.apply(this, arguments);
        this._customFontSize     = this.standardFontSize();
        this._customPadding      = this.standardPadding();
        this._customLineHeight   = this.lineHeight();
        this._customLineNumber   = 0;
        this._customBackOpacity  = this.standardBackOpacity();
        this._customBackSprite   = null;
        this._customBackFileName = '';
        this._customFontFace     = '';
    };

    Window_Base.prototype.createBackSprite = function() {
        if (this._customBackFileName) {
            if (!this._customBackSprite) {
                this._customBackSprite = new Sprite();
                this.addChildToBack(this._customBackSprite);
            }
            this._customBackSprite.bitmap = ImageManager.loadPicture(this._customBackFileName, 0);
        } else if (this._customBackSprite) {
            this.removeChild(this._customBackSprite);
            this._customBackSprite = null;
        }
        if (Utils.isDesignMode() && this._customBackSprite && this._customBackSprite.bitmap) {
            var bitmap            = this._customBackSprite.bitmap;
            bitmap._image.onerror = function() {
                this._customBackFileName                 = '';
                this._customBackSprite.bitmap._isLoading = false;
                this._customBackSprite.bitmap            = null;
                this._customBackSprite                   = null;
                SceneManager.popChangeStack();
                SceneManager.setInfoExtend('找不到文件，左侧返回的号码已更改。', -1);
            }.bind(this);
        }
    };

    var _Window_Selectable_initialize      = Window_Selectable.prototype.initialize;
    Window_Selectable.prototype.initialize = function(x, y, width, height) {
        _Window_Selectable_initialize.apply(this, arguments);
        // Resolve conflict for BattleFormation.js
        this._customLineNumber = this.maxRows ? this.maxRows() : 0;
    };

    var _Window_Base_standardFontFace      = Window_Base.prototype.standardFontFace;
    Window_Base.prototype.standardFontFace = function() {
        return this._customFontFace ? this._customFontFace : _Window_Base_standardFontFace.apply(this, arguments);
    };

    var _Window_Base_standardFontSize      = Window_Base.prototype.standardFontSize;
    Window_Base.prototype.standardFontSize = function() {
        return this._customFontSize ? eval(this._customFontSize) :
            paramFontSize ? paramFontSize : _Window_Base_standardFontSize.apply(this, arguments);
    };

    var _Window_Base_standardPadding      = Window_Base.prototype.standardPadding;
    Window_Base.prototype.standardPadding = function() {
        return this._customPadding ? eval(this._customPadding) :
            paramPadding ? paramPadding : _Window_Base_standardPadding.apply(this, arguments);
    };

    var _Window_Base_lineHeight      = Window_Base.prototype.lineHeight;
    Window_Base.prototype.lineHeight = function() {
        return this._customLineHeight ? eval(this._customLineHeight) :
            paramLineHeight ? paramLineHeight : _Window_Base_lineHeight.apply(this, arguments);
    };

    var _Window_Base_standardBackOpacity      = Window_Base.prototype.standardBackOpacity;
    Window_Base.prototype.standardBackOpacity = function() {
        return this._customBackOpacity ? eval(this._customBackOpacity) :
            paramBackOpacity ? paramBackOpacity : _Window_Base_standardBackOpacity.apply(this, arguments);
    };

    Window_Base._iconSrcWidth  = Window_Base._iconWidth;
    Window_Base._iconSrcHeight = Window_Base._iconHeight;

    Window_Base.prototype.getIconScale = function() {
        var defaultFontSize = _Window_Base_standardFontSize.apply(this, arguments);
        var fontSize        = this.contents.fontSize;
        return paramIconSizeScale && defaultFontSize !== fontSize ? fontSize / defaultFontSize : null;
    };

    Window_Base.prototype.changeIconSize = function() {
        var iconScale = this.getIconScale();
        if (iconScale) {
            Window_Base._iconWidth *= iconScale;
            Window_Base._iconHeight *= iconScale;
        }
    };

    Window_Base.prototype.restoreIconSize = function() {
        var iconScale = this.getIconScale();
        if (iconScale) {
            Window_Base._iconWidth  = Window_Base._iconSrcWidth;
            Window_Base._iconHeight = Window_Base._iconSrcHeight;
        }
    };

    var _Window_Base_drawActorIcons      = Window_Base.prototype.drawActorIcons;
    Window_Base.prototype.drawActorIcons = function(actor, x, y, width) {
        this.changeIconSize();
        _Window_Base_drawActorIcons.apply(this, arguments);
        this.restoreIconSize();
    };

    var _Window_Base_drawItemName      = Window_Base.prototype.drawItemName;
    Window_Base.prototype.drawItemName = function(item, x, y, width) {
        this.changeIconSize();
        _Window_Base_drawItemName.apply(this, arguments);
        this.restoreIconSize();
    };

    var _Window_Base_processDrawIcon      = Window_Base.prototype.processDrawIcon;
    Window_Base.prototype.processDrawIcon = function(iconIndex, textState) {
        this.changeIconSize();
        _Window_Base_processDrawIcon.apply(this, arguments);
        this.restoreIconSize();
    };

    var _Window_Base_drawIcon      = Window_Base.prototype.drawIcon;
    Window_Base.prototype.drawIcon = function(iconIndex, x, y) {
        var iconScale = this.getIconScale();
        if (iconScale) {
            var bitmap = ImageManager.loadSystem('IconSet');
            var pw     = Window_Base._iconSrcWidth;
            var ph     = Window_Base._iconSrcHeight;
            var sx     = iconIndex % 16 * pw;
            var sy     = Math.floor(iconIndex / 16) * ph;
            var dw     = Math.floor(pw * iconScale);
            var dh     = Math.floor(ph * iconScale);
            var dx     = x;
            var dy     = y + (this.lineHeight() - dh) / 2 - 2;
            this.contents.blt(bitmap, sx, sy, pw, ph, dx, dy, dw, dh);
        } else {
            _Window_Base_drawIcon.apply(this, arguments);
        }
    };

    var _Window_Base_setBackgroundType      = Window_Base.prototype.setBackgroundType;
    Window_Base.prototype.setBackgroundType = function(type) {
        if (!paramBackgroundFixed) {
            _Window_Base_setBackgroundType.apply(this, arguments);
        }
    };

    var _Window_Base_updateClose = Window_Base.prototype.updateClose;
    Window_Base.prototype.updateClose = function() {
        var prevClose = this.isClosing();
        _Window_Base_updateClose.apply(this, arguments);
        if (this._callBack && prevClose && !this.isClosing()) {
            this._callBack();
            this._callBack = null;
        }
    };

    Window_Base.prototype.setCloseListener = function(callBack) {
        this._callBack = callBack;
    };

    // for RPG MV 1.6.1
    var _Window_EquipItem_refresh = Window_EquipItem.prototype.refresh;
    Window_EquipItem.prototype.refresh = function() {
        if (!this._actor) {
            return;
        }
        _Window_EquipItem_refresh.apply(this, arguments);
    };

    /**
     * Window_Custom
     * 任意窗口。
     * @constructor
     */
    function Window_Custom() {
        this.initialize.apply(this, arguments);
    }

    Window_Custom._textAligns = {
        'left'  : 0,
        '0'     : 0,
        'center': 1,
        '1'     : 1,
        'right' : 2,
        '2'     : 2
    };

    Window_Custom.prototype             = Object.create(Window_Selectable.prototype);
    Window_Custom.prototype.constructor = Window_Custom;

    Window_Custom.prototype.initialize = function(lines) {
        this._lines = lines || [];
        Window_Selectable.prototype.initialize.call(this, 0, 0, 320, this.fittingHeight(this._lines.length));
        this.refresh();
    };

    Window_Custom.prototype.refresh = function() {
        this.createContents();
        Window_Selectable.prototype.refresh.apply(this, arguments);
    };

    Window_Custom.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var text = this._lines[index];
        this.resetTextColor();
        text = this.changeTextAlign(text);
        if (this._textAlign > 0) {
            rect.x = this.getTextAlignStartX(text);
        }
        this.drawTextEx(text, rect.x, rect.y);
    };

    Window_Custom.prototype.getTextAlignStartX = function(text) {
        var width = this.drawTextEx(text, this.contentsWidth(), 0);
        if (this._textAlign === 1) {
            return this.contentsWidth() / 2 - width / 2;
        } else {
            return this.contentsWidth() - width;
        }
    };

    Window_Custom.prototype.maxItems = function() {
        return this._lines.length;
    };

    Window_Custom.prototype.changeTextAlign = function(text) {
        this._textAlign = 0;
        text            = text.replace(/\\al\[(.*)]/gi, function() {
            this._textAlign = Window_Custom._textAligns[arguments[1].toLowerCase()] || 0;
            return '';
        }.bind(this));
        return text;
    };

//    var _Scene_File_createListWindow = Scene_File.prototype.createListWindow;
//    Scene_File.prototype.createListWindow = function() {
//        _Scene_File_createListWindow.apply(this, arguments);
//        this._listWindow.setTopRow(this.firstSavefileIndex() - 2);
//    };
})();


/*由saiya本地化*/