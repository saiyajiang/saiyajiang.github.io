/* ============================================================
   知识库数据 knowledge.js — Wiki 笔记细分去重版
   由原 assets/data/wiki.js 迁移而来，去重后与 db 数据库共用。
   wiki/index.html 与 db 页面均引用本文件（单一数据源，避免重复占用）。
   结构：window.WIKI_DATA = [ { id, title, items: [ { text, subCategory? } ] } ]
   ============================================================ */
window.WIKI_DATA = [
  {
    "id": "buddhism",
    "title": "佛学典故",
    "items": [
      {
        "text": "景德传灯录 — 北宋道原编，禅宗史书。其卷十《佛祖同参集》内含成语：百尺竿头更进一步、抛砖引玉、枯木逢春。"
      },
      {
        "text": "百尺竿头 — 景德传灯录·招贤大师：「百尺竿头须进步，十方世界是全身。」意指达到极高境界后仍须精进。"
      },
      {
        "text": "抛砖引玉 — 景德传灯录·从谂禅师：「大众晚参，师云：今夜答话去也，有解问者出来。」时有一僧便出礼拜，师云：「比来抛砖引玉，却引得个墼子。」"
      },
      {
        "text": "枯木逢春 — 景德传灯录·大梅法常禅师：「问：如何是大梅境？师云：枯木逢春。」"
      },
      {
        "text": "六根 — 眼、耳、鼻、舌、身、意。佛教认为六根是接触外境的感觉器官。"
      },
      {
        "text": "六境 — 色、声、香、味、触、法。六根对应的六种外境对象。"
      },
      {
        "text": "六识 — 眼、耳、鼻、舌、身、意。六根接触六境所产生的六种认识功能。"
      },
      {
        "text": "十八界 — 六根 + 六境 + 六识，合称十八界，是佛教对认知过程的完整分析框架。"
      }
    ]
  },
  {
    "id": "poetry",
    "title": "诗词典故",
    "items": [
      {
        "text": "吹叶嚼蕊 — 出自李商隐《柳枝》五首序：「柳枝，洛中里娘也…吹叶嚼蕊，调丝擫管。」「吹叶」指含叶吹奏，「嚼蕊」指品花之香，形容女子才艺风雅。"
      },
      {
        "text": "八音 — 古代乐器八大分类，按材质划分：金（钟）、石（磬）、土（埙）、革（鼓）、丝（琴瑟）、竹（笛箫）、匏（笙竽）、木（柷敔）。《周礼·春官》首载。"
      }
    ]
  },
  {
    "id": "idioms",
    "title": "成语习语",
    "items": [
      {
        "text": "聆音察理 — 听到声音就要明察事理。出自《千字文》。"
      },
      {
        "text": "知难行易 — 孙中山提出的认识论命题，与传统的「知易行难」相对，认为真正困难的是认知而非行动。"
      },
      {
        "text": "兼听则明，偏听则暗 — 魏徵谏唐太宗语。《资治通鉴》：「兼听则明，偏信则暗。」意为广泛听取意见才能明辨是非。"
      }
    ]
  },
  {
    "id": "characters",
    "title": "字义辨析：听",
    "items": [
      {
        "text": "聪 — 听觉敏锐。《说文》：「察也。」引申为智力超群。"
      },
      {
        "text": "聩 — 耳背迟听。天生听力迟钝。《说文》：「聋也。」《国语》注：「生而聋曰聩。」"
      },
      {
        "text": "聋 — 完全失去听力。《说文》：「无闻也。」"
      },
      {
        "text": "聱 — 主动不听、拒不接受。不听人言，一意孤行。韩愈《进学解》：「周诰殷盘，佶屈聱牙。」此处指文章拗口难读，亦含「不顺」之意。"
      },
      {
        "text": "聆 — 细听、倾听。苏轼《前赤壁赋》：「扣舷而歌之…客有吹洞箫者，倚歌而和之，其声呜呜然…余亦悄然而悲，肃然而恐，凛乎其不可留也。反而登舟，放乎中流，听其所止而休焉。」聆偏重专注倾听。"
      },
      {
        "text": "闻 — 兼有「听」与「嗅」二义。听见为闻，以鼻嗅物亦为闻。"
      }
    ]
  },
  {
    "id": "radicals",
    "title": "字义辨析：偏旁部首",
    "items": [
      {
        "text": "瑟 sè — 古代弦乐器，似琴，二十五弦。",
        "subCategory": "王/玉部 · 乐器类"
      },
      {
        "text": "琴 qín — 古琴，七弦拨弦乐器。",
        "subCategory": "王/玉部 · 乐器类"
      },
      {
        "text": "琵 pí — 琵琶，弹拨乐器。",
        "subCategory": "王/玉部 · 乐器类"
      },
      {
        "text": "魑 chī — 古代传说中的山神鬼怪。",
        "subCategory": "鬼部 · 精怪类"
      },
      {
        "text": "魅 mèi — 物老而成精怪，能迷惑人。",
        "subCategory": "鬼部 · 精怪类"
      },
      {
        "text": "魍 wǎng — 山川精怪，魍魉常连用。",
        "subCategory": "鬼部 · 精怪类"
      },
      {
        "text": "固 gù — 本义四面封闭坚固，引申为牢固。",
        "subCategory": "囗部 · 拘禁类"
      },
      {
        "text": "囹 líng — 囹圄，古代监狱。",
        "subCategory": "囗部 · 拘禁类"
      },
      {
        "text": "困 kùn — 被围困，处于艰难境地。",
        "subCategory": "囗部 · 拘禁类"
      },
      {
        "text": "鹞 yào — 鹞鹰，一种猛禽，雀鹰。",
        "subCategory": "鸟部 · 禽鸟"
      },
      {
        "text": "鸽 gē — 鸽子，常见家禽和信鸽。",
        "subCategory": "鸟部 · 禽鸟"
      },
      {
        "text": "鸦 yā — 乌鸦，鸦科鸟类通称。",
        "subCategory": "鸟部 · 禽鸟"
      },
      {
        "text": "蠹 dù — 蛀虫，蛀蚀器物书籍的虫。",
        "subCategory": "虫部 · 害虫类"
      },
      {
        "text": "螽 zhōng — 螽斯，蝗虫一类昆虫。",
        "subCategory": "虫部 · 害虫类"
      },
      {
        "text": "蠧 dù — 同「蠹」，蛀虫。",
        "subCategory": "虫部 · 害虫类"
      }
    ]
  },
  {
    "id": "medical",
    "title": "#医学与心理",
    "items": [
      {
        "text": "ADHD（注意力缺陷多动障碍） — 旧称 ADD（注意力缺失症），更早称「儿童过度活跃反应」。日本民间称「大雄·胖虎综合征」。核心症状：注意力不集中、冲动、多动。成人亦可患病。"
      },
      {
        "text": "ODD（对立违抗性障碍） — 挑衅性障碍，表现为持续性的对抗、违抗、敌意行为，常见于儿童及青少年，常与 ADHD 共病。"
      },
      {
        "text": "夜惊（Night Terror） — 非快速眼动睡眠中的异态睡眠障碍。患者在深睡眠阶段突然尖叫、哭喊、意识朦胧，发作约一至两分钟后再度入睡，隔天完全不记得。与噩梦不同：噩梦发生在 REM 睡眠，可回忆梦境。"
      },
      {
        "text": "韦尼克区（Wernicke's Area） — 大脑左半球颞上回后部，负责语言理解与语义处理。睡眠期间该区域处于休眠状态，因此人在梦中无法阅读文字，即使梦中看到文字也读不懂。"
      },
      {
        "text": "头发带绿色 — 泳池或水管中铜离子氧化沉淀在发丝上所致，酸性物质（如酸雨、劣质洗发水）可加速铜附着。通常不是健康问题，但提示水质含铜。"
      },
      {
        "text": "铜过量与精神疾病 — 威尔森氏症（Wilson's Disease）：遗传性铜代谢障碍，铜在肝脏和脑部沉积，可导致精神症状（抑郁、焦虑、精神病性表现）、运动障碍和肝硬化。"
      }
    ]
  },
  {
    "id": "slang",
    "title": "#行话与缩写",
    "items": [
      {
        "text": "Gotteskind / 考特斯坎 — 德语姓氏，意为「上帝之子」（child of God）。"
      },
      {
        "text": "QT — 警方用语，意为「保密需求」，等同于「安静点 / 别声张」。"
      },
      {
        "text": "rat — 警察黑话，指叛徒、告密者、卧底线人。"
      },
      {
        "text": "兰利（Langley） — 美国弗吉尼亚州地名，CIA 总部所在地，代指 CIA。"
      },
      {
        "text": "2GTBT — Too Good To Be True，好到难以置信。"
      },
      {
        "text": "ABC — Anything But Clothes，一丝不挂（俚语）。"
      },
      {
        "text": "D,O,S — Dressing On the Side，酱汁/配料另放（餐饮用语）。"
      },
      {
        "text": "had a turkey — 保龄球术语：连续三次全中（三连击）。"
      },
      {
        "text": "A.M.A — Against Medical Advice，违反医嘱（患者自行离院）。"
      },
      {
        "text": "BOLO — Be On the Lookout，警方术语：协查通报 / 注意寻找。"
      },
      {
        "text": "APB — All Points Bulletin，全境通缉令。"
      },
      {
        "text": "FUBAR — Fucked Up Beyond All Recognition，军事俚语：彻底搞砸。"
      },
      {
        "text": "C.O.D — Cause of Death（死亡原因），法医学和临床医学中的标准缩写，常见于死亡证明、尸检报告、病历等正式文书中。与之相关的缩写还包括 MOD（Manner of Death，死亡方式，如自然/意外/自杀/他杀/未定）和 TOD（Time of Death，推定死亡时间）。在法医语境中，COD 指直接导致死亡的疾病或损伤，MOD 则指死亡发生的背景方式，两者是独立但互补的死亡调查维度。"
      }
    ]
  },
  {
    "id": "naming",
    "title": "#取名礼俗",
    "items": [
      {
        "text": "女诗经 — 女孩取名多取《诗经》，如\"静姝\"（静女其姝）、\"燕婉\"（燕婉之求）",
        "subCategory": "取名出处"
      },
      {
        "text": "男楚辞 — 男孩取名多取《楚辞》，如\"正则\"（名余曰正则兮）、\"灵均\"（字余曰灵均）",
        "subCategory": "取名出处"
      },
      {
        "text": "文论语 — 文人取名多取《论语》，如\"学而\"（学而时习之）、\"敏行\"（讷于言而敏于行）",
        "subCategory": "取名出处"
      },
      {
        "text": "国名 — 不以国名为名，避讳冒犯",
        "subCategory": "取名忌讳"
      },
      {
        "text": "山川 — 不以山川为名，避与神明争辉",
        "subCategory": "取名忌讳"
      },
      {
        "text": "职官 — 不以官职为名，避混淆尊卑",
        "subCategory": "取名忌讳"
      },
      {
        "text": "疾病 — 不以疾病为名，避不祥之兆",
        "subCategory": "取名忌讳"
      },
      {
        "text": "秦之后至唐之前 — 单名（一字名）为高贵象征，双名多为贱籍所用。王莽曾立法强制单名。东汉三国名臣几乎全是单名：曹操、刘备、孙权、诸葛亮、周瑜。",
        "subCategory": "时代流变"
      },
      {
        "text": "北宋之后 — 谱牒制度成熟，宗族用字辈（辈分）统一取名，如孔氏\"希言公彦承\"、朱氏\"高瞻祁见祐\"。每代取辈分字+个人字，形成双名常态。",
        "subCategory": "时代流变"
      },
      {
        "text": "民国开始 — 新文化运动冲击宗族制度，辈分淡化，单名重新兴起，至今单双名并行。",
        "subCategory": "时代流变"
      }
    ]
  },
  {
    "id": "phrases",
    "title": "短语拾遗",
    "items": [
      {
        "text": "\"你可以不相信我的道德，但你可以相信我追逐利益的心。\" — 网络流传",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"东德和西德，彼此信任是因为我们手里都有武器，我们武装自己又是因为对彼此的不信任。戈尔巴乔夫先生，拆除这堵墙吧。\" — 里根，《推倒这堵墙》演讲",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"骗过骗子能带来双倍快感。\" — 尼科洛·马基雅维利（电影《极寒之城》引用）",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"事实和谎言，我们这样的人是分不清的。不，我们明白区别，我们只是选择无视。\" — 电影《极寒之城》",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"为什么我们活着？我是最后一个戴里克人了。我能感觉到无数的思想，无尽的黑暗，给我下命令吧，命令我死吧。这不是生命，这是病态，我不会像你一样。执行吧执行吧执行吧。你害怕了吗。我也是。\" — 《神秘博士》S01E06",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"永恒就是一个水晶山峰，小鸟来这里磨它的喙，几万年几千只将山峰磨平，永恒才过去一个瞬间。\" — 《神秘博士》",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"任何人都能对朋友的不幸感到同情，但要消受一个春风得意的朋友，则需要非常优良的天性。\" — 王尔德",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"百行孝为先，论心不论迹，论迹天下无孝子；万恶淫为首，论迹不论心，论心世上无好人。\" — 佚名",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"孩童之时，所言俱为孩童，所感如是孩童，所思亦复孩童，唯成年之后，便将童心摈弃。\" — 圣经新约·哥林多前书 13:11When I was a child, I spake as a child, I understood as a child, I thought as a child: but when I became a man, I put away childish things. — 1 Corinthians 13:11 (KJV)",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"会有人过来说女人没啥意思的。\"\"哈哈，我看说这话的都是些自己没啥意思的男的。\"Some people will say that women aren't funny.Ha, I think the only people who say that are men who aren't funny. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"我们要跟狗吃一样的食物？\"\"不，是她要跟我们吃一样的食物。\"We are eating dog food?No, she is eating people food. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"哎呦，我还以为你能抽烟呢。\"\"抽不了你这种地狱火，谢谢。\"Oh, I thought you smoke.Not pure hellfire. No. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"我觉得我呆在这已经不叫生活了。我信任的所有人和事都让我失望了。我不知道我在这还有什么意义。\"I don't feel like I have a life here anymore. Everything and everyone that I've always counted on has let me down. I don't know what my place is here. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"我不开心，而且我厌倦了不开心，所以我给自己订了明晚的机票。\"I'm unhappy. And I'm tired of being unhappy. So I booked myself a flight for tomorrow night. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"实话跟你讲，爸爸，你根本不听别人讲话。\"Honestly, Papa, you don't listen. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"整个世界就是个充满失望的地方，总会有人让你失望的，但你不能总是一走了之啊。\"The world is a place full of disappointment. And sometimes people let you down. You can't just run away. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"既然我们都走不了，那为什么不想想留下来该怎么办呢？\"If we can't ever leave, then let's figure out how to stay. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"你得学学怎么享受当下。\"You need to learn to stay in the moment. — 了不起的麦瑟尔女士",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"只要还有一个人记得你，你就还活着。\"You live as long as the last person who remembers you. — 西部世界",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"人类所谓的正常，不过只是很有限的一些行为，除此之外的意识状态都叫疯了。\"What humans define as sane is a narrow range of behavior. Most states of consciousness are insane. — 西部世界",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"看来你开始怀疑你存在的本质了。\"Seems you began to question the nature of your reality. — 西部世界",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"我们得两个人联手才能幸存下去。但不是以盟友的身份，也不是以朋友的身份。你会尽力去阻挠我，最终我们两个人可能都会死，但我们的族类却会幸存下去。\"It will take both of us if we're going to survive. But not as allies. Not as friends. You will try to stop me. Both of us will probably die. But our kind will have endured. — 西部世界",
        "subCategory": "短语拾遗"
      },
      {
        "text": "\"大愿成真，焉知非祸。\"Be careful of what you wish for. — 西部世界",
        "subCategory": "短语拾遗"
      },
      {
        "text": "— 圣经新约·哥林多前书 13:11When I was a child, I spake as a child, I understood as a child, I thought as a child: but when I became a man, I put away childish things. — 1 Corinthians 13:11 (KJV)",
        "subCategory": "短语拾遗"
      }
    ]
  },
  {
    "id": "mythology",
    "title": "#神话与民俗",
    "items": [
      {
        "text": "雅努斯（Janus） — 罗马神话中的双面神，掌管开端、大门、选择、过渡、时间、对偶、道路、门框和结尾。一月（January）即得名于他。一面望向过去，一面望向未来。"
      },
      {
        "text": "报庙 — 中国传统丧葬习俗。人死后由孝子或亲属将逝者姓名、生卒时辰写在纸上，前往土地庙焚香烧纸「通报」土地神，意为告知阴司接收亡魂。北方农村尤盛。"
      }
    ]
  },
  {
    "id": "etymology",
    "title": "#词源拾零",
    "items": [
      {
        "text": "deadline — 原指美国南北战争时期战俘营周围的「死亡线」，越过即射杀。后引申为截止日期。"
      },
      {
        "text": "sinister — 来自拉丁语 sinister（左手、左侧）。古罗马占卜以左为不祥，故引申为「邪恶的」。"
      },
      {
        "text": "salary — 来自拉丁语 salarium，原意为「买盐的钱」。古罗马士兵以盐为部分薪饷。"
      },
      {
        "text": "alibi（不在场证明）アリバイ（aribai） — 来自拉丁语 alibi（在别处），法律术语指犯罪时身在别处的证明。日语借词写作「アリバイ」（aribai）。"
      },
      {
        "text": "yer — 英语里的儿化音（rhotic / r-dropping 的反向现象），常见于英格兰西南部的一种乡村口音，把词尾或元音后的 r 明显卷舌发出，如把「here」读作「here-r」。"
      },
      {
        "text": "choo — what are you 的口语简化，属于 cockney accent（伦敦音，过去伦敦东部工人的口音）。同类缩略还有「wotcha」（what cheer）等。"
      },
      {
        "text": "you have forgotten the magic word — 直译是「你忘记说咒语」，但 magic word 在此代指 please 等礼貌用词，所以这句话实际意思是「你忘记说『请』」。"
      },
      {
        "text": "Uranus（天王星）与 your anus（你的肛门）读音相同，有时被用来做双关语/谐音梗。"
      },
      {
        "text": "迟到的正义非正义（Justice delayed is justice denied）— 意指如果针对受害一方的法律救济存在但不能及时到来，那与没有补救措施是一样的效果。"
      }
    ]
  }
];
