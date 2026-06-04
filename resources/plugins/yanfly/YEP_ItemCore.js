//=============================================================================
// Yanfly Engine Plugins - Item Core
// YEP_ItemCore.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_ItemCore = true;

var Yanfly = Yanfly || {};
Yanfly.Item = Yanfly.Item || {};
Yanfly.Item.version = 1.25;

//=============================================================================
 /*:
 * @plugindesc v1.25 更改您的游戏和物品场景处理物品的方式
 * @author Yanfly Engine Plugins
 *
 * @param ---一般---
 * @default
 *
 * @param 最大物品数量
 * @desc 最大物品数量.如果设置为 0 ,那么就没有独立物品.
 * @default 0
 *
 * @param 最大武器数量
 * @desc 最大武器数量.如果设置为 0,那么就没有独立武器.
 * @default 100
 *
 * @param 最大防具数量
 * @desc 最大防具数量.如果设置为 0,那么就没有独立防具.
 * @default 100
 *
 * @param 起始ID
 * @desc 这决定了独立物品的ID,这样它们就不会干扰普通物品.
 * 由于物品的最大设置上限为2000,所以尽量设置的数值大于2000
 * @default 3000
 *
 * @param 随机浮动
 * @desc 将非商店物品的数值进行正负浮动.
 * 设置为 0 则不浮动.
 * @default 0
 *
 * @param 负浮动
 * @desc 允许随机浮动的情况下，允许随机浮动数值为负
 * 不允许 - false     允许 - true
 * @default false
 *
 * @param 命名顺序
 * @desc 物品将以设定的结构命名
 * %1 - 前缀, %2 - 基础名, %3 - 后缀, %4 强化
 * @default %1%2%3%4
 *
 * @param 命名间隔
 * @desc 在前缀和后缀中间增加间隔
 * 不加 - false     加 - true
 * @default true
 *
 * @param 强化格式
 * @desc 物品强化的文字格式.
 * %1 - 强化等级
 * @default (+%1)
 *
 * @param ---Item Scene---
 * @default
 *
 * @param 新物品界面
 * @desc 启用将改变物品界面的外观.
 * 不启用 - false     启用 - true (推荐)
 * @default true
 *
 * @param 展示已装备物品
 * @desc 在物品列表中展示已装备物品
 * 不展示 - false     展示 - true
 * @default true
 *
 * @param 显示图标
 * @desc 在状态窗口显示图标
 * 不显示 - false     显示 - true
 * @default true
 *
 * @param 图标大小
 * @desc 这是要显示的图标的宽度和高度。
 * 这通常是默认图标宽度和图标高度的4倍。
 * @default 128
 *
 * @param 字号
 * @desc 这会改变描述物品的字号
 * 默认: 28
 * @default 20
 *
 * @param 命令的对齐方式
 * @desc 命令窗口的文字对齐方式
 * 左对齐 - left  居中 - center  右对齐 - right
 * @default center
 *
 * @param 恢复的格式
 * @desc 恢复 HP/MP 的文字格式
 * @default %1 Heal
 *
 * @param 增加状态
 * @desc 增加状态的文字格式
 * @default +State
 *
 * @param 增加Buff
 * @desc 增加buff的文字格式
 * @default +Buff
 *
 * @param 去除状态
 * @desc 去除状态的文字格式
 * @default -State
 *
 * @param 去除Buff
 * @desc 去除Buff的文字格式
 * @default -Buff
 *
 * @param 最大图标数量
 * @desc 状态和Buff图标显示的最大数量
 * @default 4
 *
 * @param "使用"命令的文字显示
 * @desc 使用选中物品的命令文字
 * %1 - 物品图标 + 名字
 * @default Use %1
 *
 * @param 携带格式
 * @desc 独立物品ID的显示格式
 * %1 - 物品索引     %2 - 最大数量
 * @default %1/%2
 *
 * @param --独立物品--
 * @default
 *
 * @param 游戏中期注释解析
 * @desc 允许在游戏中途或开始时解析
 * 不允许 - false     允许 - true    推荐: false
 * @default false
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 *
 * 这个插件可以对您的游戏进行几个主要的更改,
 * 并且作为基础核心用于未来的插件.
 *
 * 1. 独立物品
 * 如果您选择对您的物品,武器,防具有最大数量的限制,
 * 这些物品将变得独立,并拥有自己的数据统计
 * 独立项目能够升级,更改,修改等并保留这些改变的属性独立于相同类型的其他
 * 物品没有最大数量限制的物品(又可以说是 0 ),将继续像RPG制作大师MV中通
 * 常物品一样
 *
 * 2. 新物品栏
 * 物品栏已经修改,看起来有些不同.使用新的布局,物品列表不再是两列,而是一列.
 * 添加了更多的窗口,例如物品状态窗口(显示基本物品信息),物品信息窗口（它通过升级等显示应
 * 用在物品上的信息）,以及物品动作窗口,当你选择一个物品,它将询问你是否使用该物品或应用通
 * 过插件添加的任何动作(例如升级物品)
 * 如果你不想使用此修改,可以从参数中禁用它
 *
 * 3. 随机浮动
 * 不是从商店获得的新物品可以在很小程度上给予独立物品的随机数据。
 * 物品可以获得正或负的浮动值
 * 如果你希望某个物品不具有浮动,那么可以在注释中将浮动值设置为 0 
 * 如果你希望所有物品都不具有浮动，那么可以在参数中设置为 0 
 * 
 * 注意: 在战斗测试中,独立物品将被禁用
 *
 * ============================================================================
 * Notetags 注释
 * ============================================================================
 *
 * 如果你使用了独立物品,那么不通过商店获得的物品都会应用设置的随机浮动
 *
 * 物品,武器,防具的注释
 *   <Random Variance: x> 随机浮动
 *   如果该项目是通过非商店手段获得的,那么它将会在 ±x 上浮动
 *
 *   <Not Independent item> 非独立物品
 *   设置默认情况下是独立物品,来成为非独立物品,允许它堆叠并使其不受影响独立物品
 *   设置

 *   <Priority Name> 优先名
 *   这将物品,武器或装备的优先级名称设置为其数据库中的名字,使名称方案不能影响这
 *   个物品
 *
 *   <Text Color: x> 文字颜色
 *   此物品,武器或装备的文字颜色将使用颜色 x 
 *   x为 \www\img\system\windows.png 右下角的颜色 从左往右依次为 0 , 1 以此类推
 *
 * ============================================================================
 * 插件命令
 * ============================================================================
 *
 * 如果你希望能够在不应用随机浮动的情况下给你的角色库存中添加物品,可以使用以下插件
 * 命令来进行调整
 *
 * 插件命令:
 *   EnableVarianceStock 允许浮动堆叠 - 让所有的物品都会从它的变量中获得非随机值
 *   DisableVarianceStock 不允许浮动堆叠- 让所有的物品都会从它的变量中获得随机值
 *
 * 一个小提示,如果你启用浮动堆叠值,如果玩家通过标题界面重新开始游戏或者关闭程序再启动,
 * 随机浮动将再次生效.这个插件命令是用来短期禁止的.
 *
 * ============================================================================
 * 事件变化
 * ============================================================================
 *
 * 为了调整独立物品,进行了以下改变:
 *
 * 事件页面的条件以及条件分歧:
 * 检查物品是否存在于队伍的物品清单中,如果是独立物品,那么会有所不同
 * 相反,一个物品,即使升级了,所选物品作为基础物品也满足条件
 * 这意味着你的 +1 长剑 将满足事件编辑器中设置 长剑 的条件
 *
 * 角色有装备 X :
 * Actor Has X Equip:
 * 就像之前的条件一样,如果角色有一把事件编辑器中的基本物品匹配的武器,条件将满足
 * +1 长剑 将满足需要角色装备长剑物品的条件
 *
 * 更改装备:
 * Change Equipment:
 * 如果目标装备是独立的,游戏将首先检查角色是否具备了可以装备该基础物品的条件
 * 如果没有,游戏接着会检查队伍中是否有一个匹配该基础物品的角色会首先使用
 * 如果也没有,那么游戏会创建一个新的储存版本并装备给角色
 *
 * ============================================================================
 * 物品命名系统
 * ============================================================================
 *
 * 对于独立物品,它们具有独特的命名系统.
 * 独立物品由四个部分组成:
 *      Prefix 前缀    Base Name 基础名    Suffix 后缀    Boost Count 强化次数
 *
 * 前缀,基础名,后缀,强化次数由插件调整.
 * 根据所施加的效果,它们可以被更改.
 * 使用这个命名系统,一个有着'火焰'的前缀,基础名为'剑',后缀为'强力的',并且强化次数为 5
 * 的物品名字会显示为:
 *
 *       火焰 剑 强力的 (+5)                 //Fiery Sword of Might (+5) 
 *
 * 只有当它的各种名称部分被改变时，这个物品才会出现。
 * 但是，有一个第五个名称的约定并且是一个优先名
 * 如果一个物品有一个优先名，它将会用优先名本身覆盖当前的名称方案。
 * 所以即使物品的名字是'Fiery Sword of Might (+5)',如果这个物品的优先名为
 * 'Legendary Blade',那么'Legendary Blade'将优先显示
 * 
 *
 * ============================================================================
 * 疯狂模式 - 基于独立物品创建 (Lunatic Mode)
 * ============================================================================
 * 对于具有JavaScript经验的用户，可以使用以下Lunatic模式在创建的物品上运行JS代码。
 * 这仅适用于刚创建的独立物品
 *
 * 物品，武器，防具
 *
 *   <On Creation Eval>
 *    item.price = baseItem.price;
 *    item.price += Math.floor(Random() * 100);
 *   </On Creation Eval>
 * 'item' 变量指的是独立物品
 * 'baseItem'指的是基础物品 
 * 任何对'item'做出的任何改动都适用于独立物品
 *
 * ============================================================================
 * Lunatic Mode - 自定义信息窗口显示
 * ============================================================================
 *
 * 如果你想在你的信息窗口中显示唯一的和自定义的东西，你可以使用以下的注释：
 *
 *  顶部显示文本 
 *  <Info Text Top>
 *    text
 *    text
 *   </Info Text Top>
 *  你可以在该物品的信息窗口在这里输入额外的信息，无论是知识或其他信息 
 *  文本代码可以使用
 *  这里的信息会显示在信息窗口顶部
 *
 *  底部显示文本
 *   <Info Text Bottom>
 *    text
 *    text
 *   </Info Text Bottom>
 *  你可以在该物品的信息窗口在这里输入额外的信息，无论是知识或其他信息 
 *  文本代码可以使用
 *  这里的信息会显示在信息窗口底部
 *
 *  显示自定义信息
 *   <Info Eval>
 *    var variableId = 1;
 *    var value = 500;
 *    $gameVariables.setValue(variableId, value);
 *   </Info Eval>
 *   如果您了解JavaScript，你可以使用这些 注释 在显示任何新的信息之前运行一些代码。
 *   这样，如果您打算使用显示变量值的文本代码，则可以在显示变量值之前运行一些代码，
 *   来显示它们以同步信息窗口中显示的内容。
 *   
 *
 * ============================================================================
 * 独立物品和游戏中期注释解析
 * ============================================================================
 *
 * 插件参数中的“游戏中期注释解析”选项是针对任何可能只解析游戏中的游戏
 * 而不是为了加载游戏的插件而设计的。这是一个启用你自己风险的一个选项
 *
 * 为什么会自行承担风险?
 * 因为启用此选项意味着独立物品将保留他们的记录，因此会保存文件大小会增加几倍，这也
 * 可能导致游戏中后期的卡顿。
 * 
 * 
 * ============================================================================
 * 更新日志
 * ============================================================================
 *
 * Version 1.25:
 * - Optimization Update
 *
 * Version 1.24a:
 * - Fixed a typo within the code. Please update Item Core, Item Disassemble,
 * Attachable Augments, and More Currencies if you are using those plugins.
 * - Random variance is now disabled from fresh plugin installation by default.
 *
 * Version 1.23:
 * - Fixed an issue custom info text when using different font sizes.
 *
 * Version 1.22:
 * - Fixed a removal bug that caused weapon and armor ID's to clash.
 *
 * Version 1.21:
 * - Fixed an error with sorting algorithm when items have the same base ID.
 *
 * Version 1.20:
 * - Added <On Creation Eval> Lunatic Mode notetag. Read the help file for more
 * information about it.
 *
 * Version 1.19:
 * - Updated for RPG Maker MV version 1.1.0.
 *
 * Version 1.18a:
 * - Added 'Midgame Note Parsing' plugin parameter.
 * - Fixed a visual error with MP recovery displaying a 0 instead of ---.
 *
 * Version 1.17:
 * - Added <Text Color: x> notetag for items, weapons, and armors.
 *
 * Version 1.16:
 * - Fixed a bug that made mid-game actor initialization not display items
 * correctly in the item menu.
 *
 * Version 1.15:
 * - Fixed a bug with independent items getting values that crash the game.
 *
 * Version 1.14:
 * - Fixed an unintended function of the game not granting a piece of equipment
 * through events.
 *
 * Version 1.13:
 * - Fixed a bug that didn't unequip items properly.
 *
 * Version 1.12:
 * - Added 'Negative Variance' parameter.
 *
 * Version 1.11:
 * - Fixed a bug that caused random variance to not calculate correctly.
 * - Fixed a bug that didn't return the correct conditional branch results.
 * - Fixed the display in the shop window to show number of independent items
 * owned by the player rather than just 0.
 *
 * Version 1.10:
 * - Added Lunatic Mode - Custom Info Window Display.
 *
 * Version 1.09:
 * - Fixed a bug with evented item removal that didn't remove equipped items if
 * the 'Include Equipment' checkbox was checked.
 *
 * Version 1.08:
 * - Fixed a bug with the Control Variable event that would not gather the
 * right amount of independent items.
 *
 * Version 1.07:
 * - Fixed a bug with the Change Equipment event where armors wouldn't equip.
 *
 * Version 1.06:
 * - Fixed a bug and rewrote the initializing equipment process.
 *
 * Version 1.05:
 * - Compatibility update with ItemBook.
 *
 * Version 1.04:
 * - Added 'List Equipped Items' parameter to allow for equipment restricted
 * actors to be able to alt their equipment.
 *
 * Version 1.03:
 * - Fixed a bug where using events to remove independent items weren't working
 * properly and instead added more items.
 * - Fixed a bug where a Random Variance of 0 still gave random stats.
 *
 * Version 1.02:
 * - Fixed a bug where initializing equipment slots didn't work properly and/or
 * added incorrect equips from the wrong actors into the inventory.
 *
 * Version 1.01:
 * - Fixed bug where if you are using no independent pieces of equipment,
 * actors would fail to start with initial equipment.
 *
 * Version 1.00:
 * - Finished plugin!
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

Yanfly.Parameters = PluginManager.parameters('YEP_ItemCore');
Yanfly.Param = Yanfly.Param || {};

Yanfly.Param.ItemMaxItems = Number(Yanfly.Parameters['Max Items']);
Yanfly.Param.ItemMaxWeapons = Number(Yanfly.Parameters['Max Weapons']);
Yanfly.Param.ItemMaxArmors = Number(Yanfly.Parameters['Max Armors']);
Yanfly.Param.ItemStartingId = Number(Yanfly.Parameters['Starting ID']);
Yanfly.Param.ItemRandomVariance = Number(Yanfly.Parameters['Random Variance']);
Yanfly.Param.ItemNegVar = eval(String(Yanfly.Parameters['Negative Variance']));
Yanfly.Param.ItemNameFmt = String(Yanfly.Parameters['Name Format']);
Yanfly.Param.ItemNameSpacing = String(Yanfly.Parameters['Name Spacing']);
Yanfly.Param.ItemBoostFmt = String(Yanfly.Parameters['Boost Format']);

Yanfly.Param.ItemSceneItem = String(Yanfly.Parameters['Updated Scene Item']);
Yanfly.Param.ItemShEquipped = String(Yanfly.Parameters['List Equipped Items']);
Yanfly.Param.ItemShowIcon = String(Yanfly.Parameters['Show Icon']);
Yanfly.Param.ItemIconSize = Number(Yanfly.Parameters['Icon Size']);
Yanfly.Param.ItemFontSize = Number(Yanfly.Parameters['Font Size']);
Yanfly.Param.ItemCmdAlign = String(Yanfly.Parameters['Command Alignment']);
Yanfly.Param.ItemRecoverFmt = String(Yanfly.Parameters['Recovery Format']);
Yanfly.Param.ItemAddState = String(Yanfly.Parameters['Add State']);
Yanfly.Param.ItemAddBuff = String(Yanfly.Parameters['Add Buff']);
Yanfly.Param.ItemRemoveState = String(Yanfly.Parameters['Remove State']);
Yanfly.Param.ItemRemoveBuff = String(Yanfly.Parameters['Remove Buff']);
Yanfly.Param.ItemMaxIcons = Number(Yanfly.Parameters['Maximum Icons']);
Yanfly.Param.ItemUseCmd = String(Yanfly.Parameters['Use Command']);
Yanfly.Param.ItemCarryFmt = String(Yanfly.Parameters['Carry Format']);

Yanfly.Param.ItemNoteParse = String(Yanfly.Parameters['Midgame Note Parsing']);
Yanfly.Param.ItemNoteParse = eval(Yanfly.Param.ItemNoteParse);

//=============================================================================
// DataManager
//=============================================================================

Yanfly.Item.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!Yanfly.Item.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!Yanfly._loaded_YEP_ItemCore) {
    this.setDatabaseLengths();
    this.processItemCoreNotetags($dataItems);
    this.processItemCoreNotetags($dataWeapons);
    this.processItemCoreNotetags($dataArmors);
    Yanfly._loaded_YEP_ItemCore = true;
  }
  return true;
};

DataManager.processItemCoreNotetags = function(group) {
  var note1 = /<(?:RANDOM VARIANCE):[ ](\d+)>/i;
  var note2 = /<(?:NONINDEPENDENT ITEM|not independent item)>/i;
  var note3 = /<(?:PRIORITY NAME)>/i;
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);

    obj.randomVariance = Yanfly.Param.ItemRandomVariance;
    obj.textColor = 0;
    if (Imported.YEP_CoreEngine) obj.textColor = Yanfly.Param.ColorNormal;
    obj.nonIndependent = false;
    obj.setPriorityName = false;
    obj.infoEval = '';
    obj.infoTextTop = '';
    obj.infoTextBottom = '';
    obj.onCreationEval = '';
    var evalMode = 'none';

   for (var i = 0; i < notedata.length; i++) {
     var line = notedata[i];
     if (line.match(note1)) {
       obj.randomVariance = parseInt(RegExp.$1);
      } else if (line.match(note2)) {
        obj.nonIndependent = true;
      } else if (line.match(note3)) {
        obj.setPriorityName = true;
      } else if (line.match(/<(?:INFO EVAL)>/i)) {
        evalMode = 'info eval';
      } else if (line.match(/<\/(?:INFO EVAL)>/i)) {
        evalMode = 'none';
      } else if (line.match(/<(?:INFO TEXT TOP)>/i)) {
        evalMode = 'info text top';
      } else if (line.match(/<\/(?:INFO TEXT TOP)>/i)) {
        evalMode = 'none';
      } else if (line.match(/<(?:INFO TEXT BOTTOM)>/i)) {
        evalMode = 'info text bottom';
      } else if (line.match(/<\/(?:INFO TEXT BOTTOM)>/i)) {
        evalMode = 'none';
      } else if (evalMode === 'info eval') {
        obj.infoEval = obj.infoEval + line + '\n';
      } else if (evalMode === 'info text top') {
        if (obj.infoTextTop !== '') obj.infoTextTop += '\n';
        obj.infoTextTop = obj.infoTextTop + line;
      } else if (evalMode === 'info text bottom') {
        if (obj.infoTextBottom !== '') obj.infoTextBottom += '\n';
        obj.infoTextBottom = obj.infoTextBottom + line;
      } else if (line.match(/<(?:TEXT COLOR):[ ](\d+)>/i)) {
        obj.textColor = parseInt(RegExp.$1);
      } else if (line.match(/<(?:ON CREATE EVAL|ON CREATION EVAL)>/i)) {
        evalMode = 'on create eval';
      } else if (line.match(/<\/(?:ON CREATE EVAL|ON CREATION EVAL)>/i)) {
        evalMode = 'none';
      } else if (evalMode === 'on create eval') {
        obj.onCreationEval = obj.onCreationEval + line + '\n';
      }
    }
  }
};

DataManager.setDatabaseLengths = function() {
    this._baseItemsLength   = $dataItems.length
    this._baseWeaponsLength = $dataWeapons.length
    this._baseArmorsLength  = $dataArmors.length
};

Yanfly.Item.DataManager_createGameObjects =
    DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    Yanfly.Item.DataManager_createGameObjects.call(this);
    this.createIndependentObjects();
};

DataManager.createIndependentObjects = function() {
    DataManager.createIndependentGroups();
    this.loadIndependentItems();
};

DataManager.loadIndependentItems = function() {
    if (Yanfly.Param.ItemMaxItems > 0) {
      var difItems = $dataItems.length - DataManager._baseItemsLength;
      $dataItems.splice(DataManager._baseItemsLength, difItems);
      this.setIndependentLength($dataItems);
      $dataItems = $dataItems.concat(this._independentItems);
    }
    if (Yanfly.Param.ItemMaxWeapons > 0) {
      var difWeapons = $dataWeapons.length - DataManager._baseWeaponsLength;
      $dataWeapons.splice(DataManager._baseWeaponsLength, difWeapons);
      this.setIndependentLength($dataWeapons);
      $dataWeapons = $dataWeapons.concat(this._independentWeapons);
    }
    if (Yanfly.Param.ItemMaxArmors > 0) {
      var difArmors = $dataArmors.length - DataManager._baseArmorsLength;
      $dataArmors.splice(DataManager._baseArmorsLength, difArmors);
      this.setIndependentLength($dataArmors);
      $dataArmors = $dataArmors.concat(this._independentArmors);
    }
};

DataManager.setIndependentLength = function(group) {
    for (;;) {
      if (group.length > Yanfly.Param.ItemStartingId) break;
      group.push(null);
    }
};

DataManager.saveGameWithoutRescue = function(savefileId) {
    var json = JsonEx.stringify(this.makeSaveContents());
    StorageManager.save(savefileId, json);
    this._lastAccessedId = savefileId;
    var globalInfo = this.loadGlobalInfo() || [];
    globalInfo[savefileId] = this.makeSavefileInfo();
    this.saveGlobalInfo(globalInfo);
    return true;
};

Yanfly.Item.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var contents = Yanfly.Item.DataManager_makeSaveContents.call(this);
    contents.items = this._independentItems;
    contents.weapons = this._independentWeapons;
    contents.armors = this._independentArmors;
    return contents;
};

Yanfly.Item.DataManager_extractSaveContents =
    DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    Yanfly.Item.DataManager_extractSaveContents.call(this, contents);
    this._independentItems = contents.items || [];
    this._independentWeapons = contents.weapons || [];
    this._independentArmors = contents.armors || [];
    this.loadIndependentItems();
};

DataManager.createIndependentGroups = function() {
    this._independentItems = [];
    this._independentWeapons = [];
    this._independentArmors = [];
};

DataManager.isIndependent = function(item) {
    if (!item) return false;
    if (DataManager.isBattleTest()) return false;
    if (item.nonIndependent) return false;
    if (DataManager.isItem(item)) return Yanfly.Param.ItemMaxItems > 0;
    if (DataManager.isWeapon(item)) return Yanfly.Param.ItemMaxWeapons > 0;
    if (DataManager.isArmor(item)) return Yanfly.Param.ItemMaxArmors > 0;
    return false;
};

DataManager.registerNewItem = function(item) {
    if (!this.isNewItemValid(item)) return item;
    var newItem = JsonEx.makeDeepCopy(item);
    this.addNewIndependentItem(item, newItem);
    return newItem;
};

DataManager.isNewItemValid = function(item) {
    if (!item) return false;
    if (item.baseItemId) return false;
    return item.id === this.getDatabase(item).indexOf(item);
};

DataManager.addNewIndependentItem = function(baseItem, newItem) {
    newItem.id = this.getDatabase(baseItem).length;
    ItemManager.setNewIndependentItem(baseItem, newItem);
    ItemManager.customizeNewIndependentItem(baseItem, newItem);
    ItemManager.onCreationEval(baseItem, newItem);
    this.getDatabase(baseItem).push(newItem);
    this.getContainer(baseItem).push(newItem);
};

DataManager.removeIndependentItem = function(item) {
    if (!item) return;
    if (this.independentItemIsUsed(item)) return;
    var container = this.getContainer(item);
    var database = this.getDatabase(item);
    var index = container.indexOf(item);
    container[index] = null;
    var index = database.indexOf(item);
    database[index] = null;
};

DataManager.independentItemIsUsed = function(item) {
    if ($gameParty.numItems(item) > 0) return false;
    for (var i = 0; i < $dataActors.length; ++i) {
      var actor = $gameActors.actor(i);
      if (!actor) continue;
      if (actor.equips().contains(item)) return true;
    }
    return false;
};

DataManager.getDatabase = function(item) {
    if (!item) return [];
    if (DataManager.isItem(item)) return $dataItems;
    if (DataManager.isWeapon(item)) return $dataWeapons;
    if (DataManager.isArmor(item)) return $dataArmors;
    return [];
};

DataManager.getContainer = function(item) {
    if (!item) return [];
    if (DataManager.isItem(item)) return this._independentItems;
    if (DataManager.isWeapon(item)) return this._independentWeapons;
    if (DataManager.isArmor(item)) return this._independentArmors;
    return [];
};

DataManager.getBaseItem = function(item) {
    if (!this.isIndependent(item)) return item;
    if (!item.baseItemId) return item;
    var baseItemId = item.baseItemId;
    var baseItem = this.getDatabase(item)[baseItemId];
    return baseItem;
};

//=============================================================================
// ItemManager
//=============================================================================

function ItemManager() {
    throw new Error('This is a static class');
};

ItemManager.setNewIndependentItem = function(baseItem, newItem) {
    newItem.baseItemId = baseItem.id;
    newItem.baseItemName = baseItem.name;
    newItem.baseItemPrice = baseItem.price;
    newItem.baseItemIconIndex = baseItem.iconIndex;
    newItem.namePrefix = '';
    newItem.nameSuffix = '';
    if (baseItem.setPriorityName) {
      newItem.priorityName = baseItem.name;
    } else {
      newItem.priorityName = '';
    }
    newItem.boostCount = 0;
    if (!Yanfly.Param.ItemNoteParse) newItem.note = '';
};

ItemManager.customizeNewIndependentItem = function(baseItem, newItem) {
    this.randomizeInitialItem(baseItem, newItem);
    this.updateItemName(newItem);
};

ItemManager.randomizeInitialItem = function(baseItem, newItem) {
    if ($gameTemp.varianceStock()) return;
    if (DataManager.isItem(baseItem)) {
      this.randomizeInitialEffects(baseItem, newItem);
    } else {
      this.randomizeInitialStats(baseItem, newItem);
    }
};

ItemManager.randomizeInitialEffects = function(baseItem, newItem) {
    if (baseItem.randomVariance <= 0) return;
    var randomValue = baseItem.randomVariance * 2 + 1;
    var offset = baseItem.randomVariance;
    newItem.effects.forEach(function(effect) {
      if (effect.code === Game_Action.EFFECT_RECOVER_HP) {
        if (effect.value1 !== 0) {
          var boost = Math.floor(Math.random() * randomValue - offset);
          effect.value1 += boost * 0.01;
          effect.value1 = parseFloat(effect.value1.toFixed(2));
          effect.value1 = effect.value1.clamp(0, 1);
        }
        if (effect.value2 !== 0) {
          effect.value2 += Math.floor(Math.random() * randomValue - offset);
        }
      }
      if (effect.code === Game_Action.EFFECT_RECOVER_MP) {
        if (effect.value1 !== 0) {
          var boost = Math.floor(Math.random() * randomValue - offset);
          effect.value1 += boost * 0.01;
          effect.value1 = parseFloat(effect.value1.toFixed(2));
          effect.value1 = effect.value1.clamp(0, 1);
        }
        if (effect.value2 !== 0) {
          effect.value2 += Math.floor(Math.random() * randomValue - offset);
        }
      }
    }, this);
};

ItemManager.randomizeInitialStats = function(baseItem, newItem) {
    if (baseItem.randomVariance <= 0) return;
    var randomValue = baseItem.randomVariance * 2 + 1;
    var offset = baseItem.randomVariance;
    for (var i = 0; i < 8; ++i) {
      if (newItem.params[i] === 0) continue;
      newItem.params[i] += Math.floor(Math.random() * randomValue - offset);
      if (!Yanfly.Param.ItemNegVar && baseItem.params[i] >= 0) {
        newItem.params[i] = Math.max(newItem.params[i], 0);
      }
    }
};

ItemManager.setBaseName = function(item, value) {
    item.baseItemName = value;
};

ItemManager.setNamePrefix = function(item, value) {
    item.namePrefix = value;
    if (eval(Yanfly.Param.ItemNameSpacing) && item.namePrefix.length > 0) {
      item.namePrefix = item.namePrefix + ' ';
    }
};

ItemManager.setNameSuffix = function(item, value) {
    item.nameSuffix = value;
    if (eval(Yanfly.Param.ItemNameSpacing) && item.nameSuffix.length > 0) {
      item.nameSuffix = ' ' + item.nameSuffix;
    }
};

ItemManager.setPriorityName = function(item, value) {
    item.priorityName = value;
};

ItemManager.updateItemName = function(item) {
    if (item.priorityName && item.priorityName.length > 0) {
      item.name = item.priorityName;
      return;
    }
    var prefix = item.namePrefix || '';
    var baseName = item.baseItemName || '';
    var suffix = item.nameSuffix || '';
    var boostCount = item.boostCount || 0;
    var fmt = Yanfly.Param.ItemBoostFmt;
    var boostText = fmt.format(Yanfly.Util.toGroup(boostCount))
    if (boostText === fmt.format(0)) {
      boostText = '';
    } else if (eval(Yanfly.Param.ItemNameSpacing)) {
      boostText = ' ' + boostText;
    }
    fmt = Yanfly.Param.ItemNameFmt;
    item.name = fmt.format(prefix, baseName, suffix, boostText);
};

ItemManager.increaseItemBoostCount = function(item, value) {
    value = value || 1;
    if (!item.boostCount) item.boostCount = 0;
    item.boostCount += value;
    this.updateItemName(item);
};

ItemManager.onCreationEval = function(baseItem, newItem) {
    var item = newItem;
    if (item.onCreationEval === '') return;
    var weapon = item;
    var armor = item;
    var baseWeapon = baseItem;
    var baseArmor = baseItem;
    var s = $gameSwitches._data;
    var v = $gameVariables._data;
    eval(item.onCreationEval);
    item.onCreationEval = '';
};

//=============================================================================
// Game_Temp
//=============================================================================

Game_Temp.prototype.enableVarianceStock = function() {
    this._independentStock = true;
};

Game_Temp.prototype.disableVarianceStock = function() {
    this._independentStock = false;
};

Game_Temp.prototype.varianceStock = function() {
    return this._independentStock;
};

//=============================================================================
// Game_Actor
//=============================================================================

Yanfly.Item.Game_Actor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
    Yanfly.Item.Game_Actor_setup.call(this, actorId);
    if ($gameTemp._initializeStartingMemberEquipment) return;
    this.initIndependentEquips($dataActors[actorId].equips);
};

Game_Actor.prototype.initIndependentEquips = function(equips) {
    var equips = this.convertInitEquips(equips);
    this.equipInitIndependentEquips(equips);
    this.releaseUnequippableItems(true);
    this.recoverAll();
    this.refresh();
};

Game_Actor.prototype.convertInitEquips = function(equips) {
    var items = [];
    for (var i = 0; i < equips.length; ++i) {
      var equipId = equips[i];
      if (equipId <= 0) continue;
      var equipType = $dataSystem.equipTypes[i + 1];
      if (equipType === $dataSystem.equipTypes[1] ||
      (i === 1 && this.isDualWield())) {
        var equip = $dataWeapons[equipId];
      } else {
        var equip = $dataArmors[equipId];
      }
      items.push(equip);
    }
    return items;
};

Game_Actor.prototype.equipInitIndependentEquips = function(equips) {
    var slots = this.equipSlots();
    var maxSlots = slots.length;
    this._equips = [];
    for (var i = 0; i < maxSlots; ++i) {
      this._equips[i] = new Game_Item();
    }
    for (var i = 0; i < maxSlots; ++i) {
      var slotType = slots[i];
      var equip = this.grabInitEquips(equips, slotType);
      if (DataManager.isIndependent(equip) && this.canEquip(equip)) {
        var array = $gameParty.gainIndependentItem(equip, 1)
        if (array instanceof Array) {
          newItem = array[0];
          this.changeEquip(i, newItem);
        }
      } else if (this.canEquip(equip)) {
        this._equips[i].setObject(equip);
      }
    }
};

Game_Actor.prototype.grabInitEquips = function(equips, slotType) {
    var item = null;
    for (var i = 0; i < equips.length; ++i) {
      var equip = equips[i];
      if (!equip) continue;
      if (slotType === 1 && DataManager.isWeapon(equip)) {
        item = equip;
        break;
      } else if (equip.etypeId === slotType) {
        item = equip;
        break;
      }
    }
    if (item) equips[i] = null;
    return item;
};

Yanfly.Item.Game_Actor_hasWeapon = Game_Actor.prototype.hasWeapon;
Game_Actor.prototype.hasWeapon = function(weapon) {
    if (this.hasBaseItem(weapon)) return true;
    return Yanfly.Item.Game_Actor_hasWeapon.call(this, weapon);
};

Yanfly.Item.Game_Actor_hasArmor = Game_Actor.prototype.hasArmor;
Game_Actor.prototype.hasArmor = function(armor) {
    if (this.hasBaseItem(armor)) return true;
    return Yanfly.Item.Game_Actor_hasArmor.call(this, armor);
};

Game_Actor.prototype.hasBaseItem = function(baseItem) {
    if (!DataManager.isIndependent(baseItem)) return false;
    var type = (DataManager.isWeapon(baseItem)) ? 'weapon' : 'armor';
    for (var i = 0; i < this.equips().length; ++i) {
      var equip = this.equips()[i];
      if (!equip) continue;
      if (!equip.baseItemId) continue;
      if (DataManager.isWeapon(equip) && type === 'weapon') {
        if (equip.baseItemId === baseItem.id) return true;
      } else if (DataManager.isArmor(equip) && type === 'armor') {
        if (equip.baseItemId === baseItem.id) return true;
      }
    }
    return false;
};

Yanfly.Item.Game_Actor_changeEquipById = Game_Actor.prototype.changeEquipById;
Game_Actor.prototype.changeEquipById = function(etypeId, itemId) {
    if (itemId > 0) {
      var slotId = etypeId - 1;
      if (this.equipSlots()[slotId] === 1) {
        var baseItem = $dataWeapons[itemId];
      } else {
        var baseItem = $dataArmors[itemId];
      }
      if (!$gameParty.hasItem(baseItem)) {
        $gameParty.gainItem(baseItem, 1);
      }
      if (DataManager.isIndependent(baseItem)) {
        if (this.hasBaseItem(baseItem)) return;
        var item = $gameParty.getMatchingBaseItem(baseItem, false);
        if (item === null) {
          $gameTemp.enableVarianceStock();
          $gameParty.gainItem(baseItem, 1);
          $gameTemp.disableVarianceStock();
          item = $gameParty.getMatchingBaseItem(baseItem, false);
        }
        this.changeEquip(slotId, item);
        return;
      }
    }
    Yanfly.Item.Game_Actor_changeEquipById.call(this, etypeId, itemId)
};

Game_Actor.prototype.unequipItem = function(item) {
    for (var i = 0; i < this.equips().length; ++i) {
      var equip = this.equips()[i];
      if (!equip) continue;
      if (equip !== item) continue;
      this.changeEquip(i, null);
    }
};

//=============================================================================
// Game_Party
//=============================================================================

Yanfly.Item.Game_Party_setupStartingMembers =
    Game_Party.prototype.setupStartingMembers;
Game_Party.prototype.setupStartingMembers = function() {
    Yanfly.Item.Game_Party_setupStartingMembers.call(this);
    $gameTemp.enableVarianceStock();
    this.initActorEquips();
    $gameTemp.disableVarianceStock();
};

Game_Party.prototype.initActorEquips = function() {
    $gameTemp._initializeStartingMemberEquipment = true;
    for (var i = 0; i < $dataActors.length; ++i) {
      var actor = $gameActors.actor(i);
      if (actor) {
        var baseActor = $dataActors[i];
        actor.initIndependentEquips(baseActor.equips);
      }
    }
    $gameTemp._initializeStartingMemberEquipment = undefined;
};

Yanfly.Item.Game_Party_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
    if (DataManager.isIndependent(item)) {
      this.gainIndependentItem(item, amount, includeEquip);
    } else {
      Yanfly.Item.Game_Party_gainItem.call(this, item, amount, includeEquip);
    }
};

Game_Party.prototype.gainIndependentItem = function(item, amount, includeEquip) {
    var arr = [];
    if (amount > 0) {
      for (var i = 0; i < amount; ++i) {
        var newItem = DataManager.registerNewItem(item);
        this.registerNewItem(item, newItem);
        arr.push(newItem);
      }
    } else if (amount < 0) {
      amount = Math.abs(amount);
      for (var i = 0; i < amount; ++i) {
        if (item.baseItemId) {
          this.removeIndependentItem(item, includeEquip);
        } else if (DataManager.isIndependent(item)) {
          var target = $gameParty.getMatchingBaseItem(item, includeEquip);
          if (target !== null) this.removeIndependentItem(target, includeEquip);
        } else {
          this.removeBaseItem(item, includeEquip);
        }
      }
    }
    return arr;
};

Game_Party.prototype.getIndependentItemTypeMax = function(item) {
    if (!item) return 0;
    if (DataManager.isItem(item)) return Yanfly.Param.ItemMaxItems;
    if (DataManager.isWeapon(item)) return Yanfly.Param.ItemMaxWeapons;
    if (DataManager.isArmor(item)) return Yanfly.Param.ItemMaxArmors;
};

Game_Party.prototype.getIndependentItemTypeCur = function(item) {
    if (!item) return 0;
    if (DataManager.isItem(item)) return this.items().length;
    if (DataManager.isWeapon(item)) return this.weapons().length;
    if (DataManager.isArmor(item)) return this.armors().length;
};

Game_Party.prototype.registerNewItem = function(baseItem, newItem) {
    var container = this.itemContainer(baseItem);
    if (container) {
      var lastNumber = this.numItems(newItem);
      container[newItem.id] = 1;
    }
};

Game_Party.prototype.removeIndependentItem = function(item, includeEquip) {
    if (includeEquip && this.checkItemIsEquipped(item)) {
      for (var i = 1; i < $gameActors._data.length; ++i) {
        var actor = $gameActors.actor(i);
        if (!actor) continue;
        if (!actor.equips().contains(item)) continue;
        actor.unequipItem(item);
      }
    }
    var container = this.itemContainer(item);
    container[item.id] = 0;
    if (container[item.id] <= 0) delete container[item.id];

};

Game_Party.prototype.removeBaseItem = function(item, includeEquip) {
    var container = this.itemContainer(item);
    container[item.id]--;
    if (container[item.id] <= 0) delete container[item.id];
    if (includeEquip) this.discardMembersEquip(item, -1);
};

Game_Party.prototype.getMatchingBaseItem = function(baseItem, equipped) {
    if (!baseItem) return null;
    if (DataManager.isItem(baseItem)) var group = this.items();
    if (DataManager.isWeapon(baseItem)) var group = this.weapons();
    if (DataManager.isArmor(baseItem)) var group = this.armors();
    if (equipped) {
      for (var a = 0; a < this.members().length; ++a) {
        var actor = this.members()[a];
        if (!actor) continue;
        if (DataManager.isWeapon(baseItem)) {
          group = group.concat(actor.weapons());
        } else if (DataManager.isArmor(baseItem)) {
          group = group.concat(actor.armors());
        }
      }
    }
    var baseItemId = baseItem.id;
    for (var i = 0; i < group.length; ++i) {
      var item = group[i];
      if (!item) continue;
      if (!item.baseItemId) continue;
      if (item.baseItemId !== baseItemId) continue;
      return item;
    }
    return null;
};

Game_Party.prototype.checkItemIsEquipped = function(item) {
    for (var i = 1; i < $gameActors._data.length; ++i) {
      var actor = $gameActors.actor(i);
      if (!actor) continue;
      if (actor.equips().contains(item)) return true;
    }
    return false;
};

Yanfly.Item.Game_Party_items = Game_Party.prototype.items;
Game_Party.prototype.items = function() {
    var results = Yanfly.Item.Game_Party_items.call(this);
    results.sort(this.independentItemSort);
    return results;
};

Yanfly.Item.Game_Party_weapons = Game_Party.prototype.weapons;
Game_Party.prototype.weapons = function() {
    var results = Yanfly.Item.Game_Party_weapons.call(this);
    results.sort(this.independentItemSort);
    return results;
};

Yanfly.Item.Game_Party_armors = Game_Party.prototype.armors;
Game_Party.prototype.armors = function() {
    var results = Yanfly.Item.Game_Party_armors.call(this);
    results.sort(this.independentItemSort);
    return results;
};

Game_Party.prototype.independentItemSort = function(a, b) {
    var aa = (a.baseItemId) ? a.baseItemId : a.id;
    var bb = (b.baseItemId) ? b.baseItemId : b.id;
    if (aa < bb) return -1;
    if (aa >= bb) return 1;
    return 0;
};

Yanfly.Item.Game_Party_maxItems = Game_Party.prototype.maxItems;
Game_Party.prototype.maxItems = function(item) {
    if (DataManager.isIndependent(item)) return 1;
    return Yanfly.Item.Game_Party_maxItems.call(this, item);
};

Yanfly.Item.Game_Party_hasItem = Game_Party.prototype.hasItem;
Game_Party.prototype.hasItem = function(item, includeEquip) {
    if (DataManager.isIndependent(item)) {
      if (this.numIndependentItems(item) > 0) return true;
    }
    return Yanfly.Item.Game_Party_hasItem.call(this, item, includeEquip);
};

Yanfly.Item.Game_Party_isAnyMemberEquipped =
    Game_Party.prototype.isAnyMemberEquipped;
Game_Party.prototype.isAnyMemberEquipped = function(item) {
    if (DataManager.isIndependent(item)) {
      for (var i = 0; i < this.members().length; ++i) {
        var actor = this.members()[i];
        if (!actor) continue;
        if (actor.hasBaseItem(item)) return true;
      }
    }
    return Yanfly.Item.Game_Party_isAnyMemberEquipped.call(this, item);
};

Game_Party.prototype.numIndependentItems = function(baseItem) {
    var value = 0;
    if (!DataManager.isIndependent(baseItem)) return this.numItems(baseItem);
    var id = baseItem.id;
    if (DataManager.isItem(baseItem)) var group = this.items();
    if (DataManager.isWeapon(baseItem)) var group = this.weapons();
    if (DataManager.isArmor(baseItem)) var group = this.armors();
    for (var i = 0; i < group.length; ++i) {
      var item = group[i];
      if (!item) continue;
      if (item.baseItemId && item.baseItemId === id) value += 1;
    }
    return value;
};

Game_Party.prototype.clearAllMatchingBaseItems = function(baseItem, equipped) {
  if (!Imported.YEP_ItemCore) return;
  for (;;) {
    var item = this.getMatchingBaseItem(baseItem, equipped);
    if (item) {
      this.removeIndependentItem(item, equipped);
      DataManager.removeIndependentItem(item);
    } else {
      break;
    }
  }
};

//=============================================================================
// Game_Interpreter
//=============================================================================

Yanfly.Item.Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Yanfly.Item.Game_Interpreter_pluginCommand.call(this, command, args)
    if (command === 'EnableVarianceStock') $gameTemp.enableVarianceStock();
    if (command === 'DisableVarianceStock') $gameTemp.disableVarianceStock();
};

Yanfly.Item.Game_Interpreter_gDO = Game_Interpreter.prototype.gameDataOperand;
Game_Interpreter.prototype.gameDataOperand = function(type, param1, param2) {
  switch (type) {
  case 0:
    return $gameParty.numIndependentItems($dataItems[param1]);
    break;
  case 1:
    return $gameParty.numIndependentItems($dataWeapons[param1]);
    break;
  case 2:
    return $gameParty.numIndependentItems($dataArmors[param1]);
    break;
  default:
    return Yanfly.Item.Game_Interpreter_gDO.call(this, type, param1, param2);
    break;
  }
};

//=============================================================================
// Window_Base
//=============================================================================

Yanfly.Item.Window_Base_drawItemName = Window_Base.prototype.drawItemName;
Window_Base.prototype.drawItemName = function(item, wx, wy, ww) {
    ww = ww || 312;
    this.setItemTextColor(item);
    Yanfly.Item.Window_Base_drawItemName.call(this, item, wx, wy, ww);
    this._resetTextColor = undefined;
    this.resetTextColor();
};

Window_Base.prototype.setItemTextColor = function(item) {
    if (!item) return;
    if (item.textColor === undefined) return;
    this._resetTextColor = item.textColor;
};

Yanfly.Item.Window_Base_normalColor = Window_Base.prototype.normalColor;
Window_Base.prototype.normalColor = function() {
    if (this._resetTextColor !== undefined) {
      return this.textColor(this._resetTextColor);
    }
    return Yanfly.Item.Window_Base_normalColor.call(this);
};

//=============================================================================
// Window_ItemList
//=============================================================================

Yanfly.Item.Window_ItemList_makeItemList =
    Window_ItemList.prototype.makeItemList;
Window_ItemList.prototype.makeItemList = function() {
    Yanfly.Item.Window_ItemList_makeItemList.call(this);
    if (SceneManager._scene instanceof Scene_Item) this.listEquippedItems();
};

Window_ItemList.prototype.listEquippedItems = function() {
    if (!eval(Yanfly.Param.ItemShEquipped)) return;
    var results = [];
    for (var a = 0; a < $gameParty.members().length; ++a) {
      var actor = $gameParty.members()[a];
      if (!actor) continue;
      for (var i = 0; i < actor.equips().length; ++i) {
        var equip = actor.equips()[i];
        if (!equip) continue;
        if (!equip.baseItemId) continue;
        if (this.includes(equip)) results.push(equip);
      }
    }
    this._data = results.concat(this._data);
};

Yanfly.Item.Window_ItemList_drawItemNumber =
    Window_ItemList.prototype.drawItemNumber;
Window_ItemList.prototype.drawItemNumber = function(item, dx, dy, dw) {
    if (DataManager.isIndependent(item)) {
      this.drawItemCarryNumber(item, dx, dy, dw);
      return;
    }
    Yanfly.Item.Window_ItemList_drawItemNumber.call(this, item, dx, dy, dw);
};

Window_ItemList.prototype.drawItemCarryNumber = function(item, dx, dy, dw) {
    if (DataManager.isItem(item)) {
      var index = $gameParty.items().indexOf(item);
    } else if (DataManager.isWeapon(item)) {
      var index = $gameParty.weapons().indexOf(item);
    } else if (DataManager.isArmor(item)) {
      var index = $gameParty.armors().indexOf(item);
    }
    if (index < 0) return this.drawEquippedActor(item, dx, dy, dw);
    index += 1;
    var max = $gameParty.getIndependentItemTypeMax(item);
    var fmt = Yanfly.Param.ItemCarryFmt;
    var text = fmt.format(Yanfly.Util.toGroup(index), Yanfly.Util.toGroup(max));
    if (Yanfly.Param.ItemQuantitySize) {
      this.contents.fontSize = Yanfly.Param.ItemQuantitySize;
    }
    if (index > max) {
      this.changeTextColor(this.powerDownColor());
    } else if (index === max) {
      this.changeTextColor(this.crisisColor());
    } else {
      this.changeTextColor(this.normalColor());
    }
    this.drawText(text, dx, dy, dw, 'right');
    this.resetFontSettings();
};

Window_ItemList.prototype.drawEquippedActor = function(item, dx, dy, dw) {
    var carrier = null;
    for (var a = 0; a < $gameParty.members().length; ++a) {
      var actor = $gameParty.members()[a];
      if (!actor) continue;
      if (actor.equips().contains(item)) carrier = actor;
    };
    if (Yanfly.Param.ItemQuantitySize) {
      this.contents.fontSize = Yanfly.Param.ItemQuantitySize;
    }
    var text = carrier.name();
    this.drawText(text, dx, dy, dw, 'right');
    this.resetFontSettings();
};

//=============================================================================
// Window_EquipItem
//=============================================================================

Yanfly.Item.Window_EquipItem_includes = Window_EquipItem.prototype.includes;
Window_EquipItem.prototype.includes = function(item) {
    if (this._actor && item !== null) {
      if (!item) return false;
    }
    return Yanfly.Item.Window_EquipItem_includes.call(this, item);
};

//=============================================================================
// Window_ShopBuy
//=============================================================================

Yanfly.Item.Window_ShopBuy_isEnabled = Window_ShopBuy.prototype.isEnabled;
Window_ShopBuy.prototype.isEnabled = function(item) {
    if (DataManager.isIndependent(item)) {
      var typeMax = $gameParty.getIndependentItemTypeMax(item);
      var typeCur = $gameParty.getIndependentItemTypeCur(item);
      if (typeCur >= typeMax) return false;
    }
    return Yanfly.Item.Window_ShopBuy_isEnabled.call(this, item);
};

//=============================================================================
// Window_ShopStatus
//=============================================================================

Yanfly.Item.Window_ShopStatus_drawPossession =
    Window_ShopStatus.prototype.drawPossession;
Window_ShopStatus.prototype.drawPossession = function(x, y) {
    if (DataManager.isIndependent(this._item)) {
      return this.drawIndependentPossession(x, y);
    }
    Yanfly.Item.Window_ShopStatus_drawPossession.call(this, x, y);
};

Window_ShopStatus.prototype.drawIndependentPossession = function(x, y) {
    var width = this.contents.width - this.textPadding() - x;
    var baseItem = DataManager.getBaseItem(this._item);
    var value = $gameParty.numIndependentItems(baseItem);
    value = Yanfly.Util.toGroup(value);
    var possessionWidth = this.textWidth(value);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.possession, x, y, width - possessionWidth);
    this.resetTextColor();
    this.drawText(value, x, y, width, 'right');
};

//=============================================================================
// Scene_Equip
//=============================================================================

Yanfly.Item.Scene_Equip_refreshActor = Scene_Equip.prototype.refreshActor;
Scene_Equip.prototype.refreshActor = function() {
    this.actor().releaseUnequippableItems();
    Yanfly.Item.Scene_Equip_refreshActor.call(this);
};

//=============================================================================
// Scene_Shop
//=============================================================================

Yanfly.Item.Scene_Shop_doBuy = Scene_Shop.prototype.doBuy;
Scene_Shop.prototype.doBuy = function(number) {
    $gameTemp.enableVarianceStock();
    Yanfly.Item.Scene_Shop_doBuy.call(this, number);
    $gameTemp.disableVarianceStock();
};

Yanfly.Item.Scene_Shop_doSell = Scene_Shop.prototype.doSell;
Scene_Shop.prototype.doSell = function(number) {
    Yanfly.Item.Scene_Shop_doSell.call(this, number);
    if (!DataManager.isIndependent(this._item)) return;
    DataManager.removeIndependentItem(this._item);
};

//=============================================================================
// Scene_Item Update
//=============================================================================

if (eval(Yanfly.Param.ItemSceneItem)) {

//=============================================================================
// Window_ItemCategory
//=============================================================================

Yanfly.Item.Window_ItemCategory_windowWidth =
    Window_ItemCategory.prototype.windowWidth;
Window_ItemCategory.prototype.windowWidth = function() {
    if (SceneManager._scene instanceof Scene_Item) return 240;
    return Yanfly.Item.Window_ItemCategory_windowWidth.call(this);
};

Yanfly.Item.Window_ItemCategory_numVisibleRows =
    Window_ItemCategory.prototype.numVisibleRows;
Window_ItemCategory.prototype.numVisibleRows = function() {
    if (SceneManager._scene instanceof Scene_Item) return 4;
    return Yanfly.Item.Window_ItemCategory_numVisibleRows.call(this);
};

Yanfly.Item.Window_ItemCategory_maxCols = Window_ItemCategory.prototype.maxCols;
Window_ItemCategory.prototype.maxCols = function() {
    if (SceneManager._scene instanceof Scene_Item) return 1;
    return Yanfly.Item.Window_ItemCategory_maxCols.call(this);
};

Yanfly.Item.Window_ItemCategory_itemTextAlign =
    Window_ItemCategory.prototype.itemTextAlign;
Window_ItemCategory.prototype.itemTextAlign = function() {
    if (SceneManager._scene instanceof Scene_Item) {
      return Yanfly.Param.ItemCmdAlign;
    }
    return Yanfly.Item.Window_ItemCategory_itemTextAlign.call(this);
};

//=============================================================================
// Window_ItemList
//=============================================================================

Yanfly.Item.Window_ItemList_initialize = Window_ItemList.prototype.initialize;
Window_ItemList.prototype.initialize = function(x, y, width, height) {
    if (SceneManager._scene instanceof Scene_Item) {
      width = Graphics.boxWidth / 2;
    }
    Yanfly.Item.Window_ItemList_initialize.call(this, x, y, width, height);
};

Yanfly.Item.Window_ItemList_maxCols = Window_ItemList.prototype.maxCols;
Window_ItemList.prototype.maxCols = function() {
    if (SceneManager._scene instanceof Scene_Item) return 1;
    return Yanfly.Item.Window_ItemList_maxCols.call(this);
};

Yanfly.Item.Window_ItemList_isEnabled = Window_ItemList.prototype.isEnabled;
Window_ItemList.prototype.isEnabled = function(item) {
    if (!item) return false;
    if (SceneManager._scene instanceof Scene_Item) return true;
    return Yanfly.Item.Window_ItemList_isEnabled.call(this, item);
};

Window_ItemList.prototype.setStatusWindow = function(statusWindow) {
    this._statusWindow = statusWindow;
    this.update();
};

Window_ItemList.prototype.setInfoWindow = function(infoWindow) {
    this._infoWindow = infoWindow;
    this.update();
};

Yanfly.Item.Window_ItemList_updateHelp = Window_ItemList.prototype.updateHelp;
Window_ItemList.prototype.updateHelp = function() {
    Yanfly.Item.Window_ItemList_updateHelp.call(this);
    if (SceneManager._scene instanceof Scene_Item && this._statusWindow) {
      this._statusWindow.setItem(this.item());
    }
    if (SceneManager._scene instanceof Scene_Item && this._infoWindow) {
      this._infoWindow.setItem(this.item());
    }
};

//=============================================================================
// Window_ItemStatus
//=============================================================================

function Window_ItemStatus() {
    this.initialize.apply(this, arguments);
}

Window_ItemStatus.prototype = Object.create(Window_Base.prototype);
Window_ItemStatus.prototype.constructor = Window_ItemStatus;

Window_ItemStatus.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._item = null;
    this.deactivate();
    this.refresh();
};

Window_ItemStatus.prototype.setItem = function(item) {
    if (this._item === item) return;
    this._item = item;
    this.refresh();
};

Window_ItemStatus.prototype.refresh = function() {
    this.contents.clear();
    this.drawDarkRectEntries();
    if (!this._item) return;
    this.contents.fontSize = Yanfly.Param.ItemFontSize;
    this.drawItemEntry();
};

Window_ItemStatus.prototype.drawDarkRectEntries = function() {
    var rect = new Rectangle();
    if (eval(Yanfly.Param.ItemShowIcon)) {
      rect.width = Window_Base._faceWidth;
      rect.height = Window_Base._faceHeight;
      this.drawDarkRect(rect.x, rect.y, rect.width, rect.height);
      rect.width = (this.contents.width - Window_Base._faceWidth) / 2;
    } else {
      rect.width = this.contents.width / 2;
    }
    rect.height = this.lineHeight();
    for (var i = 0; i < 8; ++i) {
      rect = this.getRectPosition(rect, i);
      this.drawDarkRect(rect.x, rect.y, rect.width, rect.height);
    }
};

Window_ItemStatus.prototype.drawDarkRect = function(dx, dy, dw, dh) {
    var color = this.gaugeBackColor();
    this.changePaintOpacity(false);
    this.contents.fillRect(dx + 1, dy + 1, dw - 2, dh - 2, color);
    this.changePaintOpacity(true);
};

Window_ItemStatus.prototype.getRectPosition = function(rect, i) {
    if (i % 2 === 0) {
      if (eval(Yanfly.Param.ItemShowIcon)) {
        rect.x = Window_Base._faceWidth;
      } else {
        rect.x = 0;
      }
      rect.y = i / 2 * this.lineHeight();
    } else {
      if (eval(Yanfly.Param.ItemShowIcon)) {
        rect.x = Window_Base._faceWidth + rect.width;
      } else {
        rect.x = rect.width;
      }
    }
    return rect;
};

Window_ItemStatus.prototype.drawItemEntry = function() {
    var item = this._item;
    if (eval(Yanfly.Param.ItemShowIcon)) this.drawItemIcon(item);
    if (DataManager.isItem(item)) this.drawItemInfo(item);
    if (DataManager.isWeapon(item)) this.drawEquipInfo(item);
    if (DataManager.isArmor(item)) this.drawEquipInfo(item);
};

Window_ItemStatus.prototype.drawItemIcon = function() {
    this.drawLargeIcon();
};

Window_ItemStatus.prototype.drawLargeIcon = function() {
    var iconIndex = this._item.iconIndex;
    var bitmap = ImageManager.loadSystem('IconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    var dw = Yanfly.Param.ItemIconSize;
    var dh = Yanfly.Param.ItemIconSize;
    var dx = (Window_Base._faceWidth - dw) / 2;
    var dy = (Window_Base._faceHeight - dh) / 2;
    this.contents._context.imageSmoothingEnabled = false;
    this.contents.blt(bitmap, sx, sy, pw, ph, dx, dy, dw, dh);
    this.contents._context.imageSmoothingEnabled = true;
};

Window_ItemStatus.prototype.drawEquipInfo = function(item) {
    var rect = new Rectangle();
    if (eval(Yanfly.Param.ItemShowIcon)) {
      rect.width = (this.contents.width - Window_Base._faceWidth) / 2;
    } else {
      rect.width = this.contents.width / 2;
    }
    for (var i = 0; i < 8; ++i) {
      rect = this.getRectPosition(rect, i);
      var dx = rect.x + this.textPadding();
      var dw = rect.width - this.textPadding() * 2;
      this.changeTextColor(this.systemColor());
      this.drawText(TextManager.param(i), dx, rect.y, dw);
      this.changeTextColor(this.paramchangeTextColor(item.params[i]));
      var text = Yanfly.Util.toGroup(item.params[i]);
      if (item.params[i] >= 0) text = '+' + text;
      if (text === '+0') this.changePaintOpacity(false);
      this.drawText(text, dx, rect.y, dw, 'right');
      this.changePaintOpacity(true);
    }
};

Window_ItemStatus.prototype.drawItemInfo = function(item) {
    var rect = new Rectangle();
    if (eval(Yanfly.Param.ItemShowIcon)) {
      rect.width = (this.contents.width - Window_Base._faceWidth) / 2;
    } else {
      rect.width = this.contents.width / 2;
    }
    for (var i = 0; i < 8; ++i) {
      rect = this.getRectPosition(rect, i);
      var dx = rect.x + this.textPadding();
      var dw = rect.width - this.textPadding() * 2;
      this.changeTextColor(this.systemColor());
      var text = this.getItemInfoCategory(i);
      this.drawText(text, dx, rect.y, dw);
      this.drawItemData(i, dx, rect.y, dw);
    }
};

Window_ItemStatus.prototype.getItemInfoCategory = function(i) {
    var fmt = Yanfly.Param.ItemRecoverFmt;
    if (i === 0) return fmt.format(TextManager.param(0));
    if (i === 1) return fmt.format(TextManager.hp);
    if (i === 2) return fmt.format(TextManager.param(1));
    if (i === 3) return fmt.format(TextManager.mp);
    if (i === 4) return Yanfly.Param.ItemAddState;
    if (i === 5) return Yanfly.Param.ItemRemoveState;
    if (i === 6) return Yanfly.Param.ItemAddBuff;
    if (i === 7) return Yanfly.Param.ItemRemoveBuff;
    return '';
};

Window_ItemStatus.prototype.drawItemData = function(i, dx, dy, dw) {
    if (!this._item) return;
    var effect;
    var value = '---';
    var pre = '';
    var text = '';
    var icons = [];
    if (i === 0) {
      effect = this.getEffect(Game_Action.EFFECT_RECOVER_HP);
      value = (effect) ? effect.value1 : '---';
      if (value === 0) value = '---';
      if (value !== '---' && value !== 0) value *= 100;
    }
    if (i === 1) {
      effect = this.getEffect(Game_Action.EFFECT_RECOVER_HP);
      value = (effect) ? effect.value2 : '---';
      if (value === 0) value = '---';
    }
    if (i === 2) {
      effect = this.getEffect(Game_Action.EFFECT_RECOVER_MP);
      value = (effect) ? effect.value1 : '---';
      if (value === 0) value = '---';
      if (value !== '---' && value !== 0) value *= 100;
    }
    if (i === 3) {
      effect = this.getEffect(Game_Action.EFFECT_RECOVER_MP);
      value = (effect) ? effect.value2 : '---';
      if (value === 0) value = '---';
    }
    if (i >= 4) {
      icons = this.getItemIcons(i, icons);
    }
    this.changeTextColor(this.normalColor());
    if (value === '---') {
      this.changePaintOpacity(false);
    } else if (i < 4) {
      if (value > 0) pre = '+';
      value = Yanfly.Util.toGroup(parseInt(value));
      if ([0, 2].contains(i)) text = '%';
    }
    if (icons.length > 0) {
      this.changePaintOpacity(true);
      dx = dx + dw - icons.length * Window_Base._iconWidth;
      dx += this.textPadding() - 2;
      for (var j = 0; j < icons.length; ++j) {
        var icon = icons[j];
        this.drawIcon(icon, dx, dy + 2);
        dx += Window_Base._iconWidth;
      }
    } else {
      text = pre + value + text;
      this.drawText(text, dx, dy, dw, 'right');
      this.changePaintOpacity(true);
    }
};

Window_ItemStatus.prototype.getEffect = function(code) {
    var targetEffect;
    this._item.effects.forEach(function(effect) {
      if (effect.code === code) targetEffect = effect;
    }, this);
    return targetEffect;
};

Window_ItemStatus.prototype.getItemIcons = function(i, array) {
    this._item.effects.forEach(function(effect) {
      if (i === 4 && effect.code === Game_Action.EFFECT_ADD_STATE) {
        var state = $dataStates[effect.dataId];
        if (state && state.iconIndex !== 0) array.push(state.iconIndex);
      }
      if (i === 5 && effect.code === Game_Action.EFFECT_REMOVE_STATE) {
        var state = $dataStates[effect.dataId];
        if (state && state.iconIndex !== 0) array.push(state.iconIndex);
      }
      if (i === 6 && effect.code === Game_Action.EFFECT_ADD_BUFF) {
        var icon = Game_BattlerBase.ICON_BUFF_START + effect.dataId;
        array.push(icon);
      }
      if (i === 6 && effect.code === Game_Action.EFFECT_ADD_DEBUFF) {
        var icon = Game_BattlerBase.ICON_DEBUFF_START + effect.dataId;
        array.push(icon);
      }
      if (i === 7 && effect.code === Game_Action.EFFECT_REMOVE_BUFF) {
        var icon = Game_BattlerBase.ICON_BUFF_START + effect.dataId;
        array.push(icon);
      }
      if (i === 7 && effect.code === Game_Action.EFFECT_REMOVE_DEBUFF) {
        var icon = Game_BattlerBase.ICON_DEBUFF_START + effect.dataId;
        array.push(icon);
      }
    }, this);
    array = array.slice(0, Yanfly.Param.ItemMaxIcons);
    return array;
};

//=============================================================================
// Window_ItemInfo
//=============================================================================

function Window_ItemInfo() {
    this.initialize.apply(this, arguments);
}

Window_ItemInfo.prototype = Object.create(Window_Base.prototype);
Window_ItemInfo.prototype.constructor = Window_ItemInfo;

Window_ItemInfo.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._item = null;
    this.deactivate();
    this.refresh();
};

Window_ItemInfo.prototype.setItem = function(item) {
    if (this._item === item) return;
    this._item = item;
    this.refresh();
};

Window_ItemInfo.prototype.refresh = function() {
    this.contents.clear();
    var dy = 0;
    if (!this._item) return dy;
    this.preInfoEval();
    dy = this.drawPreItemInfo(dy);
    dy = this.drawItemInfo(dy);
    dy = this.drawItemInfoA(dy);
    dy = this.drawItemInfoB(dy);
    dy = this.drawItemInfoC(dy);
    dy = this.drawItemInfoD(dy);
    dy = this.drawItemInfoE(dy);
    return this.drawItemInfoF(dy);
};

Window_ItemInfo.prototype.preInfoEval = function() {
    var item = this._item;
    if (item.infoEval === undefined) {
      item.infoEval = DataManager.getBaseItem(item).infoEval;
    }
    if (item.infoEval === '') return;
    var weapon = this._item;
    var armor = this._item;
    var s = $gameSwitches._data;
    var v = $gameVariables._data;
    eval(item.infoEval);
};

Window_ItemInfo.prototype.drawPreItemInfo = function(dy) {
    return dy;
};

Window_ItemInfo.prototype.drawItemInfo = function(dy) {
    var dx = this.textPadding();
    var dw = this.contents.width - this.textPadding() * 2;
    this.resetFontSettings();
    this.drawItemName(this._item, dx, dy, dw);
    return dy + this.lineHeight();
};

Window_ItemInfo.prototype.drawItemInfoA = function(dy) {
    dy = this.drawInfoTextTop(dy);
    return dy;
};

Window_ItemInfo.prototype.drawItemInfoB = function(dy) {
    return dy;
};

Window_ItemInfo.prototype.drawItemInfoC = function(dy) {
    return dy;
};

Window_ItemInfo.prototype.drawItemInfoD = function(dy) {
    return dy;
};

Window_ItemInfo.prototype.drawItemInfoE = function(dy) {
    return dy;
};

Window_ItemInfo.prototype.drawItemInfoF = function(dy) {
    dy = this.drawInfoTextBottom(dy);
    return dy;
};

Window_ItemInfo.prototype.drawDarkRect = function(dx, dy, dw, dh) {
    var color = this.gaugeBackColor();
    this.changePaintOpacity(false);
    this.contents.fillRect(dx + 1, dy + 1, dw - 2, dh - 2, color);
    this.changePaintOpacity(true);
};

Window_ItemInfo.prototype.drawInfoTextTop = function(dy) {
    var item = this._item;
    if (item.infoTextTop === undefined) {
      item.infoTextTop = DataManager.getBaseItem(item).infoTextTop;
    }
    if (item.infoTextTop === '') return dy;
    var info = item.infoTextTop.split(/[\r\n]+/);
    for (var i = 0; i < info.length; ++i) {
      var line = info[i];
      this.resetFontSettings();
      this.drawTextEx(line, this.textPadding(), dy);
      dy += this.contents.fontSize + 8;
    }
    return dy;
};

Window_ItemInfo.prototype.drawInfoTextBottom = function(dy) {
    var item = this._item;
    if (item.infoTextBottom === undefined) {
      item.infoTextBottom = DataManager.getBaseItem(item).infoTextBottom;
    }
    if (item.infoTextBottom === '') return dy;
    var info = item.infoTextBottom.split(/[\r\n]+/);
    for (var i = 0; i < info.length; ++i) {
      var line = info[i];
      this.resetFontSettings();
      this.drawTextEx(line, this.textPadding(), dy);
      dy += this.contents.fontSize + 8;
    }
    return dy;
};

//=============================================================================
// Window_ItemActionCommand
//=============================================================================

function Window_ItemActionCommand() {
    this.initialize.apply(this, arguments);
}

Window_ItemActionCommand.prototype = Object.create(Window_Command.prototype);
Window_ItemActionCommand.prototype.constructor = Window_ItemActionCommand;

Window_ItemActionCommand.prototype.initialize = function(x, y) {
    this._windowHeight = Graphics.boxHeight - y;
    Window_Command.prototype.initialize.call(this, x, y);
    this._item = null;
    this.hide();
    this.deactivate();
};

Window_ItemActionCommand.prototype.windowWidth = function() {
    return Graphics.boxWidth / 2;
};

Window_ItemActionCommand.prototype.setItem = function(item) {
    this._item = item;
    this.refresh();
    this.show();
    this.activate();
    this.select(0);
};

Window_ItemActionCommand.prototype.windowHeight = function() {
    return this._windowHeight;
};

Window_ItemActionCommand.prototype.makeCommandList = function() {
    if (!this._item) return;
    this.addUseCommand();
    this.addCustomCommandsA();
    this.addCustomCommandsB();
    this.addCustomCommandsC();
    this.addCustomCommandsD();
    this.addCustomCommandsE();
    this.addCustomCommandsF();
    this.addCancelCommand();
};

Window_ItemActionCommand.prototype.addUseCommand = function() {
    var enabled = this.isEnabled(this._item);
    var fmt = Yanfly.Param.ItemUseCmd;
    text = '\\i[' + this._item.iconIndex + ']';
    if (this._item.textColor !== undefined) {
      text += '\\c[' + this._item.textColor + ']';
    }
    text += this._item.name;
    text = fmt.format(text);
    this.addCommand(text, 'use', enabled);
};

Window_ItemActionCommand.prototype.isEnabled = function(item) {
    if (!item) return false;
    return $gameParty.canUse(item);
};

Window_ItemActionCommand.prototype.addCustomCommandsA = function() {
};

Window_ItemActionCommand.prototype.addCustomCommandsB = function() {
};

Window_ItemActionCommand.prototype.addCustomCommandsC = function() {
};

Window_ItemActionCommand.prototype.addCustomCommandsD = function() {
};

Window_ItemActionCommand.prototype.addCustomCommandsE = function() {
};

Window_ItemActionCommand.prototype.addCustomCommandsF = function() {
};

Window_ItemActionCommand.prototype.addCancelCommand = function() {
    this.addCommand(TextManager.cancel, 'cancel');
};

Window_ItemActionCommand.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawTextEx(this.commandName(index), rect.x, rect.y);
};

//=============================================================================
// Scene_Item
//=============================================================================

Yanfly.Item.Scene_Item_createItemWindow = Scene_Item.prototype.createItemWindow;
Scene_Item.prototype.createItemWindow = function() {
    Yanfly.Item.Scene_Item_createItemWindow.call(this);
    this.createStatusWindow();
    this.createInfoWindow();
    this.createActionWindow();
    this._categoryWindow.setHandler('cancel', this.exitScene.bind(this));
};

Scene_Item.prototype.createStatusWindow = function() {
    var wx = this._categoryWindow.width;
    var wy = this._helpWindow.height;
    var ww = Graphics.boxWidth - wx;
    var wh = this._categoryWindow.height;
    this._statusWindow = new Window_ItemStatus(wx, wy, ww, wh);
    this._itemWindow.setStatusWindow(this._statusWindow);
    this.addWindow(this._statusWindow);
};

Scene_Item.prototype.createInfoWindow = function() {
    var wx = this._itemWindow.width;
    var wy = this._itemWindow.y;
    var ww = Graphics.boxWidth - wx;
    var wh = this._itemWindow.height;
    this._infoWindow = new Window_ItemInfo(wx, wy, ww, wh);
    this._itemWindow.setInfoWindow(this._infoWindow);
    this.addWindow(this._infoWindow);
};

Scene_Item.prototype.createActionWindow = function() {
    var wy = this._itemWindow.y;
    this._itemActionWindow = new Window_ItemActionCommand(0, wy);
    this._itemActionWindow.setHandler('use', this.onActionUse.bind(this));
    this._itemActionWindow.setHandler('cancel', this.onActionCancel.bind(this));
    this.addWindow(this._itemActionWindow);
};

Scene_Item.prototype.isCursorLeft = function() {
    return true;
};

Scene_Item.prototype.onItemOk = function() {
    var item = this.item();
    this._itemActionWindow.setItem(item);
};

Yanfly.Item.Scene_Item_onItemCancel = Scene_Item.prototype.onItemCancel;
Scene_Item.prototype.onItemCancel = function() {
    Yanfly.Item.Scene_Item_onItemCancel.call(this);
    this._statusWindow.setItem(null);
    this._infoWindow.setItem(null);
};

Scene_Item.prototype.onActionUse = function() {
    this._itemActionWindow.hide();
    this._itemActionWindow.deactivate();
    $gameParty.setLastItem(this.item());
    this.determineItem();
};

Scene_Item.prototype.onActionCancel = function() {
    this._itemActionWindow.hide();
    this._itemActionWindow.deactivate();
    this._itemWindow.activate();
};

Yanfly.Item.Scene_Item_applyItem = Scene_Item.prototype.applyItem;
Scene_Item.prototype.applyItem = function() {
    Yanfly.Item.Scene_Item_applyItem.call(this);
    if (DataManager.isIndependent(this.item())) this.onActorCancel();
};

Scene_Item.prototype.exitScene = function() {
    var length = $gameParty.members().length;
    for (var i = 0; i < length; ++i) {
      var member = $gameParty.members()[i];
      if (member) member.refresh();
    }
    this.popScene();
};

//=============================================================================
// Scene_Item Update
//=============================================================================

}; // End Scene_Item

//=============================================================================
// Utilities
//=============================================================================

Yanfly.Util = Yanfly.Util || {};

if (!Yanfly.Util.toGroup) {
   Yanfly.Util.toGroup = function(inVal) {
       return inVal;
   }
};

//=============================================================================
// End of File
//=============================================================================
