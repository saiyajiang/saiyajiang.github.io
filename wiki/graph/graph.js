/* ============================================================
   词条图谱板块逻辑 — graph.js（球体 3D 布局版）
   依赖：wiki/db/data/knowledge.js（window.WIKI_DATA，11 板块全条目）
         themes.js（window.WIKI_THEMES，主题节点映射）
   职责：全库词条关联解析（links 显式 + 主题归属）、图例着色、
         纯 SVG 球体图谱渲染（自实现，无外部 CDN）：
         · 节点分布在球体表面，按主题聚类（主题锚点 + 球面力导向一次性收敛）
         · 连线为球面关联投影，按深度透明增强立体感
         · 动画为整体匀速旋转（固定 3D 坐标，仅旋转相机），无节点反复震荡
         节点点击聚焦（旋转至正前方）或跳转词条详情页 entry.html?t=词条名
   ============================================================ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* 11 个板块的强调色（与图例一致） */
  var BOARD_COLORS = {
    buddhism: '#f0a63c',
    poetry: '#e05fa0',
    idioms: '#7cc576',
    characters: '#4fd8e0',
    radicals: '#8f9ce8',
    medical: '#ef5b5b',
    slang: '#c58be8',
    naming: '#f2b54c',
    phrases: '#35d6c4',
    mythology: '#e2b93d',
    etymology: '#6fb3e0'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function setText(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }
  function hexToRgb(hex) {
    var m = String(hex).replace('#', '');
    if (m.length !== 6) return '176, 124, 240';
    return [
      parseInt(m.slice(0, 2), 16),
      parseInt(m.slice(2, 4), 16),
      parseInt(m.slice(4, 6), 16)
    ].join(', ');
  }
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* ---------- 词条解析（与 db.js 同款算法，保证关联一致） ---------- */
  function extractName(text) {
    var i = String(text).indexOf(' — ');
    return i > 0 ? String(text).slice(0, i).trim() : '';
  }
  function coreNameOf(name) {
    return String(name).replace(/[a-zA-Z\u00C0-\u024F\u2019']/g, '').trim();
  }
  function isHan(ch) { return ch && /[\u4E00-\u9FFF]/.test(ch); }
  function nameMatches(name, kw) {
    if (!kw) return false;
    var core = coreNameOf(name);
    if (name === kw || core === kw) return true;
    if (kw.length >= 2 && (name.indexOf(kw) !== -1 || core.indexOf(kw) !== -1)) return true;
    if (core && name.length >= 2 && (kw.indexOf(name) !== -1 || kw.indexOf(core) !== -1)) return true;
    return false;
  }
  function textHits(text, target) {
    var kw = coreNameOf(target.name) || target.name;
    if (!kw) return false;
    var idx = text.indexOf(kw);
    if (idx === -1) return false;
    if (kw.length >= 2) return true;
    var before = idx > 0 ? text.charAt(idx - 1) : '';
    var after = idx + kw.length < text.length ? text.charAt(idx + kw.length) : '';
    return !isHan(before) && !isHan(after);
  }

  /* ---------- 数据收集 ---------- */
  var wiki = window.WIKI_DATA || [];
  var boards = [];   // {id, title, color, count}
  var entries = [];  // {boardId, name, core, text, links, related}

  wiki.forEach(function (sec) {
    var items = sec.items || [];
    boards.push({
      id: sec.id,
      title: sec.title || sec.id,
      color: BOARD_COLORS[sec.id] || '#b07cf0',
      count: items.length
    });
    items.forEach(function (it) {
      var text = it.text || '';
      var name = extractName(text) || text.slice(0, 12);
      entries.push({
        boardId: sec.id,
        name: name,
        core: coreNameOf(name),
        text: text,
        links: it.links || []
      });
    });
  });

  /* ---------- 主题节点：词条间不再直连，改由共同主题节点中转 ----------
     规则：词条↔词条 的边全部移除；词条只连到其所属主题节点——
     · 多个词条都与佛教有关 → 各自连到「佛教」节点
     · 多个词条都与某个作品有关 → 各自连到该作品节点（不在图谱中则新增）
     · 其余无佛教/作品归属的词条 → 连到板块兜底主题，避免孤立
     主题节点名称/描述为新增信息，原词条节点字段（名称/描述/链接）一律不动 */
  var THEME_COLOR = '#b07cf0';
  // 主题定义与词条详情页（entry.js）共享，见 themes.js
  var THEMES = window.WIKI_THEMES || [];

  // 构建主题条目（boardId 用独立值 'theme'，节点信息为新增，不动原词条）
  // 若主题名与已有词条同名（如作品「景德传灯录」本身即词条），复用该词条节点，避免重复
  var themeByName = {};
  THEMES.forEach(function (th) {
    var existing = null;
    entries.forEach(function (e) {
      if (e.boardId !== 'theme' && e.name === th.name) existing = e;
    });
    if (existing) {
      themeByName[th.name] = existing;
      return;
    }
    var te = {
      boardId: 'theme',
      name: th.name,
      core: coreNameOf(th.name),
      text: th.desc || '',
      links: []
    };
    entries.push(te);
    themeByName[th.name] = te;
  });

  // 词条 → 所属主题归属：
  //  ① 先收集精确命中主题（词条名 === 成员名，或去英文核心名相等）
  //  ② 若存在精确命中 → 只返回精确命中的主题（避免包含误连，如「铜过量与精神疾病」不再因含「疾病」二字连取名礼俗）
  //  ③ 若完全无精确命中（典型为 phrases 长句条目）→ 退回宽松 nameMatches 兜底，保证长句能归入对应作品主题
  function themesOf(e) {
    var themes = THEMES;
    var exact = [];
    var ecore = coreNameOf(e.name);
    themes.forEach(function (th) {
      var hit = (th.members || []).some(function (m) {
        return m && (e.name === m || (ecore && coreNameOf(m) && ecore === coreNameOf(m)));
      });
      if (hit) exact.push(th);
    });
    if (exact.length) return exact;
    var out = [];
    themes.forEach(function (th) {
      var hit = (th.members || []).some(function (m) { return nameMatches(e.name, m); });
      if (hit) out.push(th);
    });
    return out;
  }

  entries.forEach(function (e) {
    if (e.boardId === 'theme') return;
    e.related = themesOf(e).map(function (th) { return themeByName[th.name]; });
  });
  // 主题 → 成员词条（用于聚焦时环绕展示；复用词条作为作品主题时不覆盖其自身词条关联）
  THEMES.forEach(function (th) {
    var te = themeByName[th.name];
    te.related = te.related || [];
    entries.forEach(function (e) {
      if (e.boardId === 'theme') return;
      var inTheme = themesOf(e).some(function (t) { return t.name === th.name; });
      if (inTheme && te.related.indexOf(e) === -1) te.related.push(e);
    });
  });

  var entriesByBoard = {};
  entries.forEach(function (e) {
    (entriesByBoard[e.boardId] = entriesByBoard[e.boardId] || []).push(e);
  });

  /* ---------- 球体布局：主题锚点 + 球面聚类（一次性确定，固定不抖） ---------- */
  function hash01(s) {
    var h = 0, i;
    for (i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    return (h % 100000) / 100000;
  }
  function norm3(v) {
    var l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1e-6;
    v.x /= l; v.y /= l; v.z /= l;
  }

  var SPHERE_R = 260;              // 球体半径（世界单位，外轮廓与主题锚点所在球面）
  var R_MIN = SPHERE_R * 0.30;     // 词条径向半径下限（0.3R）
  var R_MAX = SPHERE_R * 1.00;     // 词条径向半径上限（1.0R）
  var LAYERS = 8;                  // 径向分层数：主题交错分配不同半径层，避免整簇落在同一壳面
  var THEME_PTS = {};              // 主题名 → 单位方向向量（Fibonacci 球面锚点）
  var THEME_R = {};                // 主题名 → 目标径向半径

  (function layoutSphere() {
    var i;
    // 1) 主题锚点：Fibonacci 球面均匀分布；径向层按主题序号交错分配
    var N = THEMES.length;
    var GA = Math.PI * (3 - Math.sqrt(5));
    THEMES.forEach(function (th, idx) {
      var y = 1 - (2 * idx + 1) / N;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var tht = GA * idx;
      THEME_PTS[th.name] = { x: Math.cos(tht) * r, y: y, z: Math.sin(tht) * r };
      var layer = idx % LAYERS;
      THEME_R[th.name] = R_MIN + (layer / (LAYERS - 1)) * (R_MAX - R_MIN);
    });
    // 2) 词条初始：方向 = 所属主题锚点加权平均（多主题取折中）后加切向微扰，
    //    让同主题成员一开始就散开在锚点周围的锥形内；无主题 → 名字哈希随机方向。
    //    径向半径 = 所属主题目标层均值，叠加成员级抖动，避免同层同心重叠
    var TANG_S = 0.22; // 切向微扰幅度（弧度量级）
    entries.forEach(function (e) {
      var v = { x: 0, y: 0, z: 0 };
      var rel = (e.related || []).filter(function (r) { return THEME_PTS[r.name]; });
      if (rel.length) {
        rel.forEach(function (r) {
          var p = THEME_PTS[r.name];
          v.x += p.x; v.y += p.y; v.z += p.z;
        });
        norm3(v);
        // 切平面正交基（u1, u2 ⊥ v），用于在锚点周围加确定性微扰
        var ref = Math.abs(v.y) < 0.95 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
        var u1 = {
          x: v.y * ref.z - v.z * ref.y,
          y: v.z * ref.x - v.x * ref.z,
          z: v.x * ref.y - v.y * ref.x
        };
        norm3(u1);
        var u2 = { x: v.y * u1.z - v.z * u1.y, y: v.z * u1.x - v.x * u1.z, z: v.x * u1.y - v.y * u1.x };
        var ox = (hash01(e.name + '|tx') * 2 - 1) * TANG_S;
        var oy = (hash01(e.name + '|ty') * 2 - 1) * TANG_S;
        v.x += u1.x * ox + u2.x * oy;
        v.y += u1.y * ox + u2.y * oy;
        v.z += u1.z * ox + u2.z * oy;
        norm3(v);
      } else {
        var a = hash01(e.name + '|a') * Math.PI * 2;
        var b = Math.acos(2 * hash01(e.name + '|b') - 1);
        v.x = Math.sin(b) * Math.cos(a);
        v.y = Math.cos(b);
        v.z = Math.sin(b) * Math.sin(a);
      }
      e._dir = v;
      var rt = 0, cnt = 0;
      rel.forEach(function (r) { rt += THEME_R[r.name]; cnt++; });
      if (!cnt) rt = R_MIN + hash01(e.name + '|r') * (R_MAX - R_MIN);
      else rt /= cnt;
      e._targetR = rt;
      e._r = rt * (0.90 + hash01(e.name + '|j') * 0.20); // 同层抖动 ±10%
      e._r = clamp(e._r, R_MIN, R_MAX);
    });
    // 主题节点固定在球面锚点（半径 = SPHERE_R），只作引力源与斥力源
    THEMES.forEach(function (th) {
      var te = themeByName[th.name];
      te._dir = THEME_PTS[th.name];
      te._r = SPHERE_R;
      te._fixed = true;
    });
    // 3) 球体积内力导向（一次性迭代收敛，坐标固定后不参与每帧计算）：
    //    3D 斥力让节点在体积内互相散开；切向引力把词条拉回主题锚点方向；
    //    径向弹簧把词条保持在目标半径层（0.3R~1.0R）
    var ITER = 360;
    var REP_R = SPHERE_R * 0.47;    // 斥力作用半径（≈ 期望节点间距，略增大以提升节点间距）
    var REP_F = 0.02;
    var GRAV = 0.008;
    var SPRING = 0.05;
    var i2;
    for (i2 = 0; i2 < ITER; i2++) {
      entries.forEach(function (a) {
        if (a._fixed) return;
        var ax = a._dir.x * a._r, ay = a._dir.y * a._r, az = a._dir.z * a._r;
        var fx = 0, fy = 0, fz = 0;
        entries.forEach(function (b) {
          if (b === a) return;
          var bx = b._dir.x * b._r, by = b._dir.y * b._r, bz = b._dir.z * b._r;
          var dx = ax - bx, dy = ay - by, dz = az - bz;
          var d2 = dx * dx + dy * dy + dz * dz;
          if (d2 >= REP_R * REP_R) return;
          var dist = Math.sqrt(d2);
          if (dist < 1e-3) dist = 1e-3;
          var f = REP_F * (1 - dist / REP_R) / dist;
          fx += dx * f; fy += dy * f; fz += dz * f;
        });
        (a.related || []).forEach(function (r) {
          var p = THEME_PTS[r.name];
          if (!p) return;
          fx += (p.x - a._dir.x) * GRAV;
          fy += (p.y - a._dir.y) * GRAV;
          fz += (p.z - a._dir.z) * GRAV;
        });
        var rForce = (a._targetR - a._r) * SPRING;
        // 应用力：切平面投影（保持球面方向）+ 径向分量
        var dot = fx * a._dir.x + fy * a._dir.y + fz * a._dir.z;
        a._dir.x += fx - dot * a._dir.x;
        a._dir.y += fy - dot * a._dir.y;
        a._dir.z += fz - dot * a._dir.z;
        norm3(a._dir);
        a._r = clamp(a._r + rForce, R_MIN, R_MAX);
      });
    }
    // 4) 写回世界坐标（固定，不再参与任何每帧计算）
    entries.forEach(function (e) {
      e._x = e._dir.x * e._r;
      e._y = e._dir.y * e._r;
      e._z = e._dir.z * e._r;
    });
  })();

  /* ---------- 图例 ---------- */
  function renderLegend() {
    var legend = document.getElementById('graphLegend');
    if (!legend) return;
    legend.innerHTML = '';
    boards.forEach(function (b) {
      var item = document.createElement('div');
      item.className = 'graph-legend-item';
      item.innerHTML =
        '<span class="graph-legend-swatch" style="background:' + b.color + '"></span>' +
        '<span>' + esc(b.title) + '</span>' +
        '<b>' + b.count + ' 条</b>';
      legend.appendChild(item);
    });
    if (THEMES.length) {
      var tItem = document.createElement('div');
      tItem.className = 'graph-legend-item';
      tItem.innerHTML =
        '<span class="graph-legend-swatch" style="background:' + THEME_COLOR + '"></span>' +
        '<span>主题节点（佛教/作品/板块）</span>' +
        '<b>' + THEMES.length + ' 个</b>';
      legend.appendChild(tItem);
    }
  }

  /* ---------- 图谱渲染：纯 SVG 球体 3D（无外部 CDN） ---------- */
  function renderGraph() {
    var wrap = document.getElementById('graphWrap');
    var svg = document.getElementById('graphSvg');
    if (!wrap || !svg) return;
    svg.innerHTML = '';

    var W = wrap.clientWidth || 900;
    var H = wrap.clientHeight || 560;
    var gMain = document.createElementNS(NS, 'g');
    svg.appendChild(gMain);

    var byName = {};
    var nodes = entries.map(function (e) {
      var n = { e: e, g: null, rect: null, _w: 0, _px: 0, _py: 0, _pz: 0, _sn: 1, _op: 1 };
      byName[e.name] = n;
      return n;
    });

    var edges = [];
    var seenEdge = {};
    nodes.forEach(function (n) {
      n.e.related.forEach(function (r) {
        var t = byName[r.name];
        if (!t || t === n) return;  // 跳过自身环（主题复用词条时）
        var key = n.e.name < r.name ? n.e.name + '|' + r.name : r.name + '|' + n.e.name;
        if (seenEdge[key]) return;
        seenEdge[key] = true;
        edges.push({ a: n, b: t, key: key, line: null, depth: 0 });
      });
    });
    setText('statEdge', edges.length);

    // 初始视口缩放：按球体外径自适应
    var scale = clamp(Math.min(W, H) / (2 * (SPHERE_R * 1.28)), 0.6, 1.4);

    // 相机参数：yaw 绕 Y 轴、pitch 绕 X 轴；F 为透视焦距
    var yaw = 0.3, pitch = 0.42;
    var ROT_SPEED = 0.0011;              // 自动旋转角速度（rad/帧），平滑匀速
    var autoRotate = true;

    // 3D → 2D 透视投影（近端 Z2 大 → 节点放大且更亮）
    function project(x, y, z, cy_, sy_, cp_, sp_, cx, cy, F) {
      var X = x * cy_ + z * sy_;
      var Y = y;
      var Z = -x * sy_ + z * cy_;
      var Y2 = Y * cp_ - Z * sp_;
      var Z2 = Y * sp_ + Z * cp_;
      var persp = F / (F - Z2);
      return {
        x: cx + X * persp * scale,
        y: cy - Y2 * persp * scale,
        z: Z2,
        sn: clamp(persp, 0.66, 1.38),
        op: 0.30 + 0.70 * (Z2 + SPHERE_R) / (2 * SPHERE_R)
      };
    }

    // 球体轮廓辅助线（赤道 + 两条经线），随旋转正确投影
    var gOrbit = document.createElementNS(NS, 'g');
    var orbitPolys = [];   // {el, gen: function(idx) -> {x,y,z}}
    var ORB_N = 56;
    var orbitSeeds = [
      { kind: 'eq' },   // 赤道 y=0
      { kind: 'lon1' }, // 经线 x=0
      { kind: 'lon2' }  // 经线 z=0
    ];
    orbitSeeds.forEach(function (s) {
      var el = document.createElementNS(NS, 'polyline');
      el.setAttribute('class', 'graph-orbit');
      gOrbit.appendChild(el);
      orbitPolys.push({ el: el, kind: s.kind });
    });
    gMain.appendChild(gOrbit);

    function orbitPoint(kind, idx) {
      var t = (idx / ORB_N) * 2 * Math.PI;
      if (kind === 'eq') return { x: SPHERE_R * Math.cos(t), y: 0, z: SPHERE_R * Math.sin(t) };
      if (kind === 'lon1') return { x: 0, y: SPHERE_R * Math.cos(t), z: SPHERE_R * Math.sin(t) };
      return { x: SPHERE_R * Math.cos(t), y: SPHERE_R * Math.sin(t), z: 0 };
    }
    function drawOrbit(cy_, sy_, cp_, sp_, cx, cy, F) {
      orbitPolys.forEach(function (o) {
        var pts = [];
        for (var i = 0; i <= ORB_N; i++) {
          var p = orbitPoint(o.kind, i);
          var pr = project(p.x, p.y, p.z, cy_, sy_, cp_, sp_, cx, cy, F);
          pts.push(pr.x.toFixed(1) + ',' + pr.y.toFixed(1));
        }
        o.el.setAttribute('points', pts.join(' '));
      });
    }

    /* ============ 聚焦模式：旋转至根节点正前方 + 邻居环绕高亮 ============ */
    var focusName = null;            // 当前聚焦词条名；null = 全图谱视图
    var focusNeighbors = null;       // 当前聚焦邻居名集合 {name:true}
    var focusEdgeKeys = {};          // 聚焦模式下仅显示的边 key（根↔邻居）
    var anim = null;                 // 相机补间动画（旋转+缩放）
    var hitLink = null;              // pointerdown 命中的「详情 ↗」链接
    var linkA = null;                // 根节点「详情 ↗」入口（SVG <a>）
    var exitBtn = null;              // 「退出聚焦」按钮

    function neighborsOf(n) {
      var out = [];
      n.e.related.forEach(function (r) {
        var t = byName[r.name];
        if (t && t !== n) out.push(t);
      });
      return out;
    }

    // 将某方向向量转到相机正前方所需的角度（yaw 取最短路径）
    function anglesFor(dir) {
      var r = Math.sqrt(dir.x * dir.x + dir.z * dir.z) || 1e-6;
      var yawT = -Math.atan2(dir.x, dir.z);
      var pitchT = clamp(Math.atan2(dir.y, r), -1.15, 1.15);
      var dy = yawT - yaw;
      while (dy > Math.PI) dy -= 2 * Math.PI;
      while (dy < -Math.PI) dy += 2 * Math.PI;
      return { yaw: yaw + dy, pitch: pitchT };
    }

    function buildDetailLink() {
      linkA = document.createElementNS(NS, 'a');
      linkA.setAttribute('class', 'graph-node-link');
      var linkText = document.createElementNS(NS, 'text');
      linkText.setAttribute('class', 'graph-node-detail-text');
      linkText.textContent = '详情 ↗';
      linkText.setAttribute('text-anchor', 'middle');
      linkA.appendChild(linkText);
      gMain.appendChild(linkA);
      linkA.style.display = 'none';
    }

    function buildExitBtn() {
      exitBtn = document.createElement('button');
      exitBtn.type = 'button';
      exitBtn.className = 'graph-focus-exit';
      exitBtn.textContent = '退出聚焦';
      exitBtn.addEventListener('click', exitFocus);
      wrap.appendChild(exitBtn);
      exitBtn.style.display = 'none';
    }

    // 聚焦到指定词条（进入或切换）：平滑旋转使根朝前、邻居环绕、非邻居淡出
    function focusTo(name) {
      if (anim) return; // 动画进行中忽略新请求
      var root = byName[name];
      if (!root) return;
      focusName = name;
      focusNeighbors = {};
      neighborsOf(root).forEach(function (m) { focusNeighbors[m.e.name] = true; });
      focusEdgeKeys = {};
      edges.forEach(function (ed) {
        var aN = ed.a.e.name, bN = ed.b.e.name;
        if ((aN === name && focusNeighbors[bN]) || (bN === name && focusNeighbors[aN])) {
          focusEdgeKeys[ed.key] = true;
        }
      });
      nodes.forEach(function (n) {
        n.g.classList.toggle('graph-node-root', n.e.name === name);
      });
      if (!linkA) buildDetailLink();
      linkA.style.display = '';
      if (root.e.boardId === 'theme') {
        // 主题节点无独立词条详情页：仅高亮其成员，隐藏「详情 ↗」入口
        linkA.style.display = 'none';
      } else {
        linkA.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
          'entry.html?t=' + encodeURIComponent(name));
      }
      if (!exitBtn) buildExitBtn();
      exitBtn.style.display = '';
      // 相机补间：旋转到根正前方 + 轻微放大
      var a = anglesFor(root.e._dir);
      anim = {
        t0: performance.now(), dur: 520,
        fYaw: yaw, tYaw: a.yaw,
        fPitch: pitch, tPitch: a.pitch,
        fScale: scale, tScale: Math.max(scale, 1.22),
        onDone: null
      };
      autoRotate = false;
    }

    // 退出聚焦：恢复全量显示，恢复自动旋转（角度从当前平滑延续）
    function exitFocus() {
      if (!focusName) return;
      focusName = null;
      focusNeighbors = null;
      focusEdgeKeys = {};
      anim = null;
      nodes.forEach(function (n) { n.g.classList.remove('graph-node-root'); });
      if (linkA) linkA.style.display = 'none';
      if (exitBtn) exitBtn.style.display = 'none';
      autoRotate = true;
    }

    /* ---------- 绘制一帧 ---------- */
    function paint() {
      var i, n;
      var cy_ = Math.cos(yaw), sy_ = Math.sin(yaw);
      var cp_ = Math.cos(pitch), sp_ = Math.sin(pitch);
      var cx = W / 2, cy = H / 2;
      var F = SPHERE_R * 2.2;

      // 投影所有节点
      nodes.forEach(function (n) {
        var p = project(n.e._x, n.e._y, n.e._z, cy_, sy_, cp_, sp_, cx, cy, F);
        n._px = p.x; n._py = p.y; n._pz = p.z; n._sn = p.sn; n._op = p.op;
      });

      // 球体轮廓
      drawOrbit(cy_, sy_, cp_, sp_, cx, cy, F);

      // 边：复用 DOM，更新端点 + 深度透明度
      edges.forEach(function (ed) {
        ed.depth = (ed.a._pz + ed.b._pz) / 2;
        if (!ed.line) {
          ed.line = document.createElementNS(NS, 'line');
          ed.line.setAttribute('class', 'graph-edge');
          gMain.appendChild(ed.line);
        }
        ed.line.setAttribute('x1', ed.a._px); ed.line.setAttribute('y1', ed.a._py);
        ed.line.setAttribute('x2', ed.b._px); ed.line.setAttribute('y2', ed.b._py);
      });

      // 节点 DOM（首次创建）
      nodes.forEach(function (n) {
        if (n.g) return;
        n.g = document.createElementNS(NS, 'g');
        n.g.setAttribute('class', 'graph-node');
        n.g.setAttribute('data-name', n.e.name);
        n.rect = document.createElementNS(NS, 'rect');
        n.rect.setAttribute('rx', 8); n.rect.setAttribute('ry', 8);
        var titleEl = document.createElementNS(NS, 'title');
        titleEl.textContent = n.e.name;
        n.rect.appendChild(titleEl);
        n.g.appendChild(n.rect);
        n.dispName = n.e.name.length > 8 ? n.e.name.slice(0, 8) + '…' : n.e.name;
        var t = document.createElementNS(NS, 'text');
        t.textContent = n.dispName;
        t.setAttribute('class', 'graph-node-label');
        n.label = t;
        n.g.appendChild(t);
        gMain.appendChild(n.g);
        var color = n.e.boardId === 'theme' ? THEME_COLOR : (BOARD_COLORS[n.e.boardId] || '#b07cf0');
        var isTheme = n.e.boardId === 'theme';
        var w = Math.max(60, n.dispName.length * 11 + 22);
        n._w = w;
        n.rect.setAttribute('x', -w / 2); n.rect.setAttribute('y', -14);
        n.rect.setAttribute('width', w); n.rect.setAttribute('height', 28);
        n.rect.setAttribute('rx', isTheme ? 14 : 8); n.rect.setAttribute('ry', isTheme ? 14 : 8);
        n.rect.setAttribute('fill', 'rgba(' + hexToRgb(color) + ', 0.13)');
        n.rect.setAttribute('stroke', color);
        n.rect.setAttribute('stroke-dasharray', isTheme ? '6 3' : '');
        var tt = n.g.querySelector('text');
        tt.setAttribute('x', 0); tt.setAttribute('y', 4);
        tt.setAttribute('text-anchor', 'middle');
        // 悬浮时强制显示标签（即使处于远端隐藏区）
        n._hover = false;
        n.g.addEventListener('pointerenter', function () { n._hover = true; });
        n.g.addEventListener('pointerleave', function () { n._hover = false; });
      });

      // 聚焦可见性（与深度透明度结合）
      nodes.forEach(function (n) {
        var vis = !focusName || n.e.name === focusName || (focusNeighbors && focusNeighbors[n.e.name]);
        n.g.style.opacity = vis ? n._op : 0.06;
        n.g.style.pointerEvents = vis ? 'auto' : 'none';
        // 标签显示策略：非聚焦按深度渐隐（背面/中后层标签隐藏，避免前后层文字互盖）；
        // 聚焦时仅可视节点显示标签；悬浮节点强制显示标签
        var lo;
        if (!focusName) {
          var dt = (n._pz + SPHERE_R) / (2 * SPHERE_R);   // 0=背面 1=正面
          lo = dt < 0.30 ? 0 : (dt < 0.55 ? 0.25 + (dt - 0.30) / 0.25 * 0.75 : 1);
          lo *= vis ? 1 : 0.06;
        } else {
          lo = vis ? 1 : 0.06;
        }
        if (n._hover) lo = 1;
        if (n.label) n.label.style.opacity = lo;
      });
      edges.forEach(function (ed) {
        var vis = !focusName || focusEdgeKeys[ed.key];
        var op = 0.12 + 0.55 * (ed.depth + SPHERE_R) / (2 * SPHERE_R);
        ed.line.style.opacity = vis ? op : 0;
      });

      // 深度排序重绘（远的先画，近的覆盖其上）
      var items = [{ el: gOrbit, depth: -1e9 }];
      edges.forEach(function (ed) { items.push({ el: ed.line, depth: ed.depth }); });
      nodes.forEach(function (n) { items.push({ el: n.g, depth: n._pz }); });
      items.sort(function (a, b) { return a.depth - b.depth; });
      items.forEach(function (it) { gMain.appendChild(it.el); });

      // 节点变换 + 聚焦根节点的「详情 ↗」跟随
      nodes.forEach(function (n) {
        n.g.setAttribute('transform', 'translate(' + n._px.toFixed(2) + ',' + n._py.toFixed(2) + ') scale(' + n._sn.toFixed(3) + ')');
      });
      if (focusName) {
        var rn = byName[focusName];
        if (rn && linkA) linkA.setAttribute('transform', 'translate(' + rn._px.toFixed(2) + ',' + (rn._py + 30).toFixed(2) + ')');
      }
    }

    function tick() {
      if (anim) {
        var now = performance.now();
        var p = Math.min(1, (now - anim.t0) / anim.dur);
        var e = 1 - Math.pow(1 - p, 3);
        yaw = anim.fYaw + (anim.tYaw - anim.fYaw) * e;
        pitch = anim.fPitch + (anim.tPitch - anim.fPitch) * e;
        scale = anim.fScale + (anim.tScale - anim.fScale) * e;
        if (p >= 1) { anim = null; }
      } else if (autoRotate) {
        yaw += ROT_SPEED;
      }
      paint();
      requestAnimationFrame(tick);
    }

    /* ---------- 交互：拖动旋转球体 / 滚轮缩放 / 点击聚焦 / Esc 退出 ---------- */
    var dragging = false, moved = 0, downX = 0, downY = 0;
    var hitNode = null;

    svg.addEventListener('pointerdown', function (ev) {
      var linkEl = ev.target.closest ? ev.target.closest('.graph-node-link') : null;
      hitLink = linkEl;
      var nEl = ev.target.closest ? ev.target.closest('.graph-node') : null;
      hitNode = nEl;
      downX = ev.clientX; downY = ev.clientY; moved = 0;
      dragging = true;
      svg.setPointerCapture(ev.pointerId);
    });
    svg.addEventListener('pointermove', function (ev) {
      moved = Math.max(moved, Math.abs(ev.clientX - downX) + Math.abs(ev.clientY - downY));
      if (!dragging || hitLink) return;
      // 拖动（节点或空白）→ 旋转球体
      var dyaw = (ev.clientX - downX) * 0.006;
      var dpitch = (ev.clientY - downY) * 0.006;
      downX = ev.clientX; downY = ev.clientY;
      yaw += dyaw;
      pitch = clamp(pitch + dpitch, -1.2, 1.2);
      anim = null;                       // 打断聚焦补间
      autoRotate = false;
      if (focusName) exitFocus();        // 聚焦中拖动 → 直接退出聚焦并旋转
    });
    function endDrag(ev) {
      var nEl = hitNode; hitNode = null;
      var linkEl = hitLink; hitLink = null;
      dragging = false;
      if (moved >= 5) return;            // 拖拽结束，不视为点击
      // 「详情 ↗」入口：仍跳词条详情页
      if (linkEl) {
        if (focusName) window.location.href = 'entry.html?t=' + encodeURIComponent(focusName);
        return;
      }
      if (nEl) {
        var name = nEl.getAttribute('data-name');
        if (name) {
          if (focusName) {
            // 聚焦模式下点击邻居 → 平滑切换聚焦；点击根自身忽略
            if (name !== focusName && focusNeighbors && focusNeighbors[name]) focusTo(name);
          } else {
            focusTo(name); // 非聚焦模式：进入聚焦
          }
          return;
        }
      }
      // 点击画布空白：聚焦时退出聚焦；否则恢复自动旋转
      if (focusName) exitFocus();
      else autoRotate = true;
    }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && focusName) exitFocus();
    });
    svg.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      scale = clamp(scale * (ev.deltaY < 0 ? 1.12 : 0.9), 0.55, 3.0);
    }, { passive: false });

    tick();
  }

  /* ---------- 初始化 ---------- */
  function init() {
    renderLegend();
    setText('statBoard', boards.length);
    setText('statNode', entries.filter(function (e) { return e.boardId !== 'theme'; }).length);
    setText('statPhrase', (entriesByBoard.phrases || []).length);
    renderGraph();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
