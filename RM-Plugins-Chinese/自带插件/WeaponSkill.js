//=============================================================================
// WeaponSkill.js
//=============================================================================

/*:
 * @plugindesc 改变每个武器攻击的技能ID
 * @author Sasuke KANNAZUKI
 *
 * @help 此插件不提供插件命令
 *
 * 当<skill_id:3> 写在武器注释用 
 * 技能id#3 会被用在这个武器的攻击上
 * 如果没写,则使用默认ID(ID=1)
 *
 * 检查点:
 * - 装备多个武器时（日文写的是双持（二刀流））,主手的武器技能ID将启用
 * - 技能类型为无(=0)是最有利的,否则当你的技能被阻止时你不能攻击
 * 
 *
 * 插件的使用示例:
 * - 创造全方面的武器
 * - 创造双重攻击或三重攻击的武器
 * - 当您将恢复魔法指定为攻击时，可以选择您的队友并恢复
 * - 可以制作一个功能类似于防御指令的武器。
 */

/*:ja
 * @plugindesc 武器ごとに通常攻撃のスキルIDを変更します。
 * @author 神無月サスケ
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 *  武器の「メモ」欄に、<skill_id:3> と書いた場合、
 * 通常攻撃の際、3番のスキルが発動します。
 * ※特に記述がなければ、通常通り1番のスキルが採用されます。
 *
 * チェックポイント:
 * - 二刀流の場合、利き腕(先に定義された方)に持っているスキルIDが採用されます。
 * - スキルタイプは「なし」にするのが望ましいです。
 * さもなくば、技などを封じられたとき、攻撃が出来なくなります。
 *
 * 想定される用途:
 * - 全体攻撃可能な武器
 * - 2回攻撃、3回攻撃する武器
 * - 回復魔法をスキルに指定した場合、
 * 「攻撃」を選んだ際、味方の選択が出来、その仲間を回復します
 * - 防御コマンドなどと同等になる武器も実現可能です。
 */

(function() {

  //
  // set skill id for attack.
  //
  Game_Actor.prototype.attackSkillId = function() {
    var normalId = Game_BattlerBase.prototype.attackSkillId.call(this);
    if(this.hasNoWeapons()){
      return normalId;
    }
    var weapon = this.weapons()[0];  // at plural weapon, one's first skill.
    var id = weapon.meta.skill_id;
    return id ? Number(id) : normalId;
  };

  //
  // for command at battle
  //
  var _Scene_Battle_commandAttack = Scene_Battle.prototype.commandAttack;
  Scene_Battle.prototype.commandAttack = function() {
    BattleManager.inputtingAction().setAttack();
    // normal attack weapon (or other single attack weapon)
    var action = BattleManager.inputtingAction();
    if(action.needsSelection() && action.isForOpponent()){
      _Scene_Battle_commandAttack.call(this);
      return;
    }
    // special skill weapon
    this.onSelectAction();
  };

})();

