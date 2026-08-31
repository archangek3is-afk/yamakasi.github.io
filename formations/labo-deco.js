/**
 * OKAPI STUDIOS — L'ÉCOLE OKAPI
 * Labo interactif du manuel « Le Décor » — 5 modules ludo-éducatifs.
 * Entierement auto-contenu : injecte son propre CSS et se greffe sur des
 * ancres <div data-labo="..."></div> placees dans le HTML du manuel.
 * Aucun module ne s'affiche si son ancre est absente — le fichier est donc
 * sans effet sur les autres manuels.
 */
(function () {
  'use strict';

  var CSS = [
    '.labo{border:1px solid rgba(35,43,43,.18);background:var(--papier,#F3F4EE);margin:26px 0;border-radius:3px;overflow:hidden;}',
    '.labo-head{padding:14px 18px;border-bottom:1px solid rgba(35,43,43,.14);display:flex;align-items:center;gap:10px;flex-wrap:wrap;}',
    '.labo-tag{font-family:var(--mono,monospace);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:var(--prusse,#1F4E5F);padding:4px 9px;border-radius:2px;}',
    '.labo-title{font-weight:700;font-size:15px;color:var(--encre,#232B2B);}',
    '.labo-body{padding:18px;}',
    '.labo-hint{font-size:13px;line-height:1.65;color:var(--encre-dim,#5A6360);margin:0 0 14px;}',
    '.labo-btn{font-family:var(--mono,monospace);font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:10px 16px;border:1px solid var(--prusse,#1F4E5F);background:transparent;color:var(--prusse,#1F4E5F);cursor:pointer;border-radius:2px;transition:.15s;}',
    '.labo-btn:hover{background:var(--prusse,#1F4E5F);color:#fff;}',
    '.labo-btn.on{background:var(--prusse,#1F4E5F);color:#fff;}',
    '.labo-fb{margin-top:14px;padding:13px 15px;border-left:3px solid var(--ocre,#D9A441);background:rgba(217,164,65,.09);font-size:13.5px;line-height:1.65;color:var(--encre,#232B2B);display:none;}',
    '.labo-fb.show{display:block;}',
    '.labo-fb.good{border-left-color:var(--vert,#5E7C58);background:rgba(94,124,88,.1);}',
    '.labo-fb.bad{border-left-color:var(--rose,#C97B63);background:rgba(201,123,99,.1);}',
    /* 1 — curseurs TSV */
    '.tsv-wrap{display:grid;grid-template-columns:1fr;gap:16px;}',
    '@media(min-width:720px){.tsv-wrap{grid-template-columns:1fr 1fr;}}',
    '.tsv-scene{border:1px solid rgba(35,43,43,.16);border-radius:2px;overflow:hidden;min-height:210px;}',
    '.tsv-ctl label{display:block;font-family:var(--mono,monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--encre-dim,#5A6360);margin:12px 0 5px;}',
    '.tsv-ctl input[type=range]{width:100%;accent-color:var(--prusse,#1F4E5F);}',
    '.tsv-val{font-family:var(--mono,monospace);font-size:11px;color:var(--prusse,#1F4E5F);}',
    /* 3 — cercle chromatique */
    '.cc-wrap{display:grid;grid-template-columns:1fr;gap:18px;align-items:center;}',
    '@media(min-width:720px){.cc-wrap{grid-template-columns:280px 1fr;}}',
    '.cc-seg{cursor:pointer;transition:opacity .15s;}',
    '.cc-seg:hover{opacity:.82;}',
    '.cc-out{border:1px solid rgba(35,43,43,.16);border-radius:2px;overflow:hidden;min-height:150px;}',
    /* 4 — quiz palettes */
    '.pq-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
    '@media(min-width:720px){.pq-grid{grid-template-columns:repeat(4,1fr);}}',
    '.pq-card{border:2px solid transparent;border-radius:2px;overflow:hidden;cursor:pointer;background:none;padding:0;}',
    '.pq-card.sel{border-color:var(--prusse,#1F4E5F);}',
    '.pq-sw{height:74px;display:flex;}',
    '.pq-sw i{flex:1;}',
    '.pq-opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}',
    /* 5 — glisser-deposer decor */
    '.dd-wrap{display:grid;grid-template-columns:1fr;gap:16px;}',
    '@media(min-width:720px){.dd-wrap{grid-template-columns:1fr 190px;}}',
    '.dd-room{position:relative;min-height:250px;border:1px solid rgba(35,43,43,.2);border-radius:2px;background:linear-gradient(#EDEBE3 62%,#DCD8CC 62%);overflow:hidden;}',
    '.dd-pool{display:flex;flex-wrap:wrap;gap:7px;align-content:flex-start;}',
    '.dd-obj{font-size:12px;padding:7px 10px;border:1px solid rgba(35,43,43,.22);background:#fff;border-radius:2px;cursor:grab;user-select:none;line-height:1.2;}',
    '.dd-obj:active{cursor:grabbing;}',
    '.dd-room .dd-obj{position:absolute;box-shadow:0 1px 4px rgba(0,0,0,.12);}',
    /* 6 — anachronismes */
    '.an-scene{position:relative;border:1px solid rgba(35,43,43,.2);border-radius:2px;background:linear-gradient(#E9E4D8 60%,#D8CFBE 60%);min-height:250px;overflow:hidden;}',
    '.an-item{position:absolute;font-size:12px;padding:7px 10px;background:#fff;border:1px solid rgba(35,43,43,.22);border-radius:2px;cursor:pointer;line-height:1.2;}',
    '.an-item.found{background:var(--vert,#5E7C58);color:#fff;border-color:var(--vert,#5E7C58);}',
    '.an-item.wrong{animation:anShake .35s;}',
    '@keyframes anShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}',
    '.an-count{font-family:var(--mono,monospace);font-size:11px;color:var(--prusse,#1F4E5F);letter-spacing:.08em;}'
  ].join('');

  function injectCSS() {
    var s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function shell(anchor, tag, title, hintHtml) {
    var box = document.createElement('div');
    box.className = 'labo';
    box.innerHTML =
      '<div class="labo-head"><span class="labo-tag">' + tag + '</span>' +
      '<span class="labo-title">' + title + '</span></div>' +
      '<div class="labo-body"><p class="labo-hint">' + hintHtml + '</p>' +
      '<div class="labo-inner"></div>' +
      '<div class="labo-fb"></div></div>';
    anchor.appendChild(box);
    return {
      inner: box.querySelector('.labo-inner'),
      fb: box.querySelector('.labo-fb')
    };
  }

  function say(fb, html, kind) {
    fb.className = 'labo-fb show' + (kind ? ' ' + kind : '');
    fb.innerHTML = html;
  }

  /* ═══ 1 — TEINTE / SATURATION / VALEUR ═══ */
  function moduleTSV(anchor) {
    var u = shell(anchor, 'Labo 01', 'Teinte, saturation, valeur — teste en direct',
      'Bouge les curseurs et regarde le décor changer. Cherche le moment où la pièce cesse de faire « toc » pour devenir crédible — puis lis ce que le manuel en dit.');

    u.inner.innerHTML =
      '<div class="tsv-wrap">' +
      '<div class="tsv-scene"><svg viewBox="0 0 320 210" style="width:100%;height:auto;display:block;">' +
      '<rect id="tsvWall" x="0" y="0" width="320" height="150" fill="#c8b9a6"/>' +
      '<rect id="tsvFloor" x="0" y="150" width="320" height="60" fill="#9c8a72"/>' +
      '<rect id="tsvSofa" x="40" y="112" width="130" height="46" rx="5" fill="#b8564a"/>' +
      '<rect id="tsvCushion" x="55" y="120" width="34" height="26" rx="3" fill="#d8a24a"/>' +
      '<rect id="tsvFrame" x="215" y="42" width="62" height="46" fill="#dcd6c8" stroke="#6b6257" stroke-width="2"/>' +
      '<rect id="tsvLamp" x="252" y="112" width="12" height="46" fill="#6b6257"/>' +
      '<ellipse id="tsvShade" cx="258" cy="106" rx="26" ry="14" fill="#e0c98f"/>' +
      '</svg></div>' +
      '<div class="tsv-ctl">' +
      '<label>Teinte <span class="tsv-val" id="tsvHV">0°</span></label>' +
      '<input type="range" id="tsvH" min="-180" max="180" value="0">' +
      '<label>Saturation <span class="tsv-val" id="tsvSV">100 %</span></label>' +
      '<input type="range" id="tsvS" min="0" max="180" value="100">' +
      '<label>Valeur (clarté) <span class="tsv-val" id="tsvLV">100 %</span></label>' +
      '<input type="range" id="tsvL" min="45" max="155" value="100">' +
      '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button class="labo-btn" id="tsvReal">Réglage crédible</button>' +
      '<button class="labo-btn" id="tsvToc">Réglage « toc »</button>' +
      '<button class="labo-btn" id="tsvReset">Reset</button>' +
      '</div></div></div>';

    var scene = u.inner.querySelector('svg');
    var h = u.inner.querySelector('#tsvH'), s = u.inner.querySelector('#tsvS'), l = u.inner.querySelector('#tsvL');
    var hv = u.inner.querySelector('#tsvHV'), sv = u.inner.querySelector('#tsvSV'), lv = u.inner.querySelector('#tsvLV');

    function apply() {
      scene.style.filter = 'hue-rotate(' + h.value + 'deg) saturate(' + (s.value / 100) + ') brightness(' + (l.value / 100) + ')';
      hv.textContent = h.value + '°';
      sv.textContent = s.value + ' %';
      lv.textContent = l.value + ' %';
    }
    [h, s, l].forEach(function (i) { i.addEventListener('input', apply); });

    u.inner.querySelector('#tsvReal').addEventListener('click', function () {
      h.value = -6; s.value = 62; l.value = 96; apply();
      say(u.fb, '<b>Voilà le réglage crédible.</b> La saturation est descendue à ~60 %, et rien d\'autre n\'a vraiment bougé. C\'est exactement le raccourci du manuel : « la vraie vie est délavée, baisse tout de 20 % ». Un décor trop coloré se lit comme un décor — un décor légèrement désaturé se lit comme un lieu où quelqu\'un habite.', 'good');
    });
    u.inner.querySelector('#tsvToc').addEventListener('click', function () {
      h.value = 8; s.value = 175; l.value = 118; apply();
      say(u.fb, '<b>Le fameux effet « toc ».</b> Saturation poussée et image trop claire : les couleurs deviennent des aplats publicitaires. C\'est le piège classique du décor de débutant — chaque objet crie, aucun ne raconte. Compare avec le réglage crédible.', 'bad');
    });
    u.inner.querySelector('#tsvReset').addEventListener('click', function () {
      h.value = 0; s.value = 100; l.value = 100; apply();
      u.fb.className = 'labo-fb';
    });
    apply();
  }

  /* ═══ 3 — CERCLE CHROMATIQUE INTERACTIF ═══ */
  function moduleCercle(anchor) {
    var u = shell(anchor, 'Labo 02', 'Trouve la complémentaire',
      'Clique une couleur sur le cercle : sa complémentaire s\'allume automatiquement en face, et tu vois la paire appliquée à un décor.');

    var COL = [
      { n: 'Rouge', hex: '#e4312b', kind: 'primaire' },
      { n: 'Orange', hex: '#e87722', kind: 'secondaire' },
      { n: 'Jaune', hex: '#f0c419', kind: 'primaire' },
      { n: 'Vert', hex: '#3a8f5c', kind: 'secondaire' },
      { n: 'Bleu', hex: '#2e6db4', kind: 'primaire' },
      { n: 'Violet', hex: '#7b4fa3', kind: 'secondaire' }
    ];
    var PATHS = [
      'M 140 100 L 140 30 A 110 110 0 0 1 235.3 85 L 175 120 A 40 40 0 0 0 140 100 Z',
      'M 175 120 L 235.3 85 A 110 110 0 0 1 235.3 195 L 175 160 A 40 40 0 0 0 175 120 Z',
      'M 175 160 L 235.3 195 A 110 110 0 0 1 140 250 L 140 180 A 40 40 0 0 0 175 160 Z',
      'M 140 180 L 140 250 A 110 110 0 0 1 44.7 195 L 105 160 A 40 40 0 0 0 140 180 Z',
      'M 105 160 L 44.7 195 A 110 110 0 0 1 44.7 85 L 105 120 A 40 40 0 0 0 105 160 Z',
      'M 105 120 L 44.7 85 A 110 110 0 0 1 140 30 L 140 100 A 40 40 0 0 0 105 120 Z'
    ];

    var segs = PATHS.map(function (d, i) {
      return '<path class="cc-seg" data-i="' + i + '" d="' + d + '" fill="' + COL[i].hex + '" stroke="#F3F4EE" stroke-width="2"/>';
    }).join('');

    u.inner.innerHTML =
      '<div class="cc-wrap">' +
      '<svg viewBox="0 0 280 280" style="width:100%;height:auto;">' + segs +
      '<circle id="ccRing" cx="140" cy="140" r="0" fill="none" stroke="#232B2B" stroke-width="0"/>' +
      '<text id="ccMid" x="140" y="145" text-anchor="middle" font-family="Courier Prime,monospace" font-size="10" fill="#5A6360">clique</text>' +
      '</svg>' +
      '<div><div class="cc-out"><svg viewBox="0 0 300 150" style="width:100%;height:auto;display:block;">' +
      '<rect id="ccBg" width="300" height="150" fill="#ddd"/>' +
      '<rect id="ccObj" x="96" y="52" width="108" height="62" rx="5" fill="#bbb"/>' +
      '</svg></div><div id="ccTxt" style="margin-top:10px;font-size:13.5px;line-height:1.6;color:var(--encre-dim,#5A6360);">Le fond prend la couleur choisie, l\'objet prend sa complémentaire.</div></div>' +
      '</div>';

    var bg = u.inner.querySelector('#ccBg'), obj = u.inner.querySelector('#ccObj');
    var txt = u.inner.querySelector('#ccTxt'), mid = u.inner.querySelector('#ccMid');

    u.inner.querySelectorAll('.cc-seg').forEach(function (p) {
      p.addEventListener('click', function () {
        var i = +p.getAttribute('data-i');
        var opp = (i + 3) % 6;
        bg.setAttribute('fill', COL[i].hex);
        obj.setAttribute('fill', COL[opp].hex);
        mid.textContent = COL[i].n.toLowerCase();
        u.inner.querySelectorAll('.cc-seg').forEach(function (o) { o.setAttribute('stroke-width', '2'); o.setAttribute('stroke', '#F3F4EE'); });
        p.setAttribute('stroke', '#232B2B'); p.setAttribute('stroke-width', '3');
        u.inner.querySelector('[data-i="' + opp + '"]').setAttribute('stroke', '#232B2B');
        u.inner.querySelector('[data-i="' + opp + '"]').setAttribute('stroke-width', '3');
        txt.innerHTML = '<b>' + COL[i].n + '</b> (' + COL[i].kind + ') a pour complémentaire <b>' + COL[opp].n + '</b> (' + COL[opp].kind + ') — toujours à l\'opposé exact sur le cercle.';
        say(u.fb, 'Regarde comme l\'objet se détache violemment du fond : c\'est le contraste maximal entre deux couleurs. C\'est puissant, donc à doser — utilisé partout, l\'œil sature ; utilisé sur un seul élément, il devient un projecteur qui dit au spectateur « regarde ici ».');
      });
    });
  }

  /* ═══ 4 — QUIZ PALETTES / ÉMOTION ═══ */
  function moduleQuiz(anchor) {
    var u = shell(anchor, 'Labo 03', 'Quelle ambiance raconte cette palette ?',
      'Quatre palettes pour une même pièce. Choisis une palette, puis dis quelle ambiance elle installe.');

    var P = [
      { c: ['#8a4a2f', '#c07a44', '#e0b878', '#f2e2c4'], a: 'chaleureux', e: 'Bruns, ambres et crèmes : des couleurs chaudes et peu saturées, qu\'on associe au bois, au feu, à la peau. Le spectateur se sent invité dans la pièce.' },
      { c: ['#dfe6e8', '#bcc9ce', '#8fa3ab', '#eef2f3'], a: 'clinique', e: 'Bleus-gris désaturés et blancs froids : aucune trace de chaleur humaine. C\'est la palette des hôpitaux et des bureaux — elle installe la distance et le contrôle.' },
      { c: ['#1c2620', '#33463a', '#5c3a2e', '#7a1f18'], a: 'menaçant', e: 'Verts profonds et rouges sombres, valeurs très basses : l\'œil ne distingue plus bien les contours, donc il se méfie. L\'obscurité fait le travail avant même le scénario.' },
      { c: ['#c9b8a0', '#d9c9a8', '#a89878', '#efe5d0'], a: 'nostalgique', e: 'Beiges passés et jaunis, comme une photo qui a vieilli. La désaturation générale signale au spectateur que ce qu\'il voit appartient au passé.' }
    ];
    var OPTS = ['chaleureux', 'clinique', 'menaçant', 'nostalgique'];
    var picked = null;

    u.inner.innerHTML =
      '<div class="pq-grid">' + P.map(function (p, i) {
        return '<button class="pq-card" data-i="' + i + '"><div class="pq-sw">' +
          p.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') +
          '</div></button>';
      }).join('') + '</div>' +
      '<div class="pq-opts" id="pqOpts" style="display:none;">' +
      OPTS.map(function (o) { return '<button class="labo-btn" data-a="' + o + '">' + o + '</button>'; }).join('') +
      '</div>';

    var opts = u.inner.querySelector('#pqOpts');
    u.inner.querySelectorAll('.pq-card').forEach(function (b) {
      b.addEventListener('click', function () {
        u.inner.querySelectorAll('.pq-card').forEach(function (o) { o.classList.remove('sel'); });
        b.classList.add('sel');
        picked = +b.getAttribute('data-i');
        opts.style.display = 'flex';
        say(u.fb, 'Palette choisie. Maintenant : quelle ambiance installe-t-elle ?');
      });
    });
    opts.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (picked === null) return;
        var p = P[picked];
        var ok = b.getAttribute('data-a') === p.a;
        say(u.fb, (ok ? '<b>Exact — ' : '<b>Pas tout à fait. Celle-ci installe plutôt une ambiance ') + p.a + '.</b><br>' + p.e, ok ? 'good' : 'bad');
      });
    });
  }

  /* ═══ 5 — COMPOSER LE DÉCOR D'UN PERSONNAGE ═══ */
  function moduleDecor(anchor) {
    var u = shell(anchor, 'Labo 04', 'Compose le décor d\'un personnage',
      'Fais glisser des objets dans la pièce vide, puis demande ce que ton décor raconte. Trois objets bien choisis suffisent — c\'est tout l\'enjeu.');

    var OBJ = [
      { t: '📚 Pile de livres', k: 'intello' }, { t: '🏆 Trophée', k: 'ambition' },
      { t: '🧸 Peluche', k: 'enfance' }, { t: '🍷 Verre à moitié vide', k: 'solitude' },
      { t: '💻 Laptop ouvert', k: 'travail' }, { t: '🌱 Plante bien soignée', k: 'soin' },
      { t: '📦 Cartons non déballés', k: 'transition' }, { t: '🖼 Photo de famille', k: 'attache' },
      { t: '🧾 Factures empilées', k: 'précarité' }, { t: '🎸 Guitare', k: 'création' }
    ];
    var placed = [];

    u.inner.innerHTML =
      '<div class="dd-wrap">' +
      '<div class="dd-room" id="ddRoom"></div>' +
      '<div><div class="dd-pool" id="ddPool">' +
      OBJ.map(function (o, i) { return '<div class="dd-obj" draggable="true" data-i="' + i + '">' + o.t + '</div>'; }).join('') +
      '</div><div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button class="labo-btn" id="ddRead">Que raconte mon décor ?</button>' +
      '<button class="labo-btn" id="ddClear">Vider</button></div></div></div>';

    var room = u.inner.querySelector('#ddRoom');
    var dragged = null;

    u.inner.querySelectorAll('.dd-obj').forEach(function (el) {
      el.addEventListener('dragstart', function (e) {
        dragged = el; try { e.dataTransfer.setData('text/plain', el.getAttribute('data-i')); } catch (x) {}
      });
      el.addEventListener('click', function () { drop(el, 20 + placed.length * 12, 150 + (placed.length % 3) * 22); });
    });
    room.addEventListener('dragover', function (e) { e.preventDefault(); });
    room.addEventListener('drop', function (e) {
      e.preventDefault();
      if (!dragged) return;
      var r = room.getBoundingClientRect();
      drop(dragged, e.clientX - r.left - 40, e.clientY - r.top - 14);
      dragged = null;
    });

    function drop(el, x, y) {
      var i = +el.getAttribute('data-i');
      if (placed.indexOf(i) !== -1) return;
      placed.push(i);
      var c = el.cloneNode(true);
      c.style.left = Math.max(4, Math.min(x, room.clientWidth - 130)) + 'px';
      c.style.top = Math.max(4, Math.min(y, room.clientHeight - 36)) + 'px';
      c.removeAttribute('draggable');
      c.addEventListener('click', function () {
        c.remove(); placed.splice(placed.indexOf(i), 1); el.style.opacity = '1';
      });
      room.appendChild(c);
      el.style.opacity = '.35';
    }

    u.inner.querySelector('#ddClear').addEventListener('click', function () {
      room.innerHTML = ''; placed = [];
      u.inner.querySelectorAll('#ddPool .dd-obj').forEach(function (e) { e.style.opacity = '1'; });
      u.fb.className = 'labo-fb';
    });

    u.inner.querySelector('#ddRead').addEventListener('click', function () {
      if (!placed.length) { say(u.fb, 'Place d\'abord au moins un objet dans la pièce.', 'bad'); return; }
      var kinds = placed.map(function (i) { return OBJ[i].k; });
      var msg = '<b>Ton décor raconte :</b> ' + kinds.join(', ') + '.<br><br>';
      if (placed.length > 4) {
        msg += 'Tu as placé <b>' + placed.length + ' objets</b>. Attention — au-delà de 3 ou 4 intentions, le décor devient bavard et le spectateur ne sait plus quoi regarder. Un décor fort dit peu de choses, mais clairement. Essaie d\'en retirer jusqu\'à n\'en garder que trois : lesquels sacrifies-tu ? C\'est exactement la décision d\'un chef décorateur.';
      } else if (placed.length === 1) {
        msg += 'Un seul objet, c\'est courageux mais risqué : tout repose sur lui. Ajoutes-en un ou deux qui le <i>contredisent</i> légèrement — un décor intéressant contient toujours une petite contradiction (le trophée à côté des factures impayées, par exemple).';
      } else {
        msg += 'Bon dosage. Maintenant la vraie question : y a-t-il une <b>contradiction</b> entre tes objets ? Un décor plat dit une seule chose ; un décor vivant en dit deux qui s\'opposent — c\'est là que naît un personnage crédible plutôt qu\'un cliché.';
      }
      say(u.fb, msg, 'good');
    });
  }

  /* ═══ 6 — DÉTECTEUR D'ANACHRONISMES ═══ */
  function moduleAnachro(anchor) {
    var u = shell(anchor, 'Labo 05', 'Chasse à l\'anachronisme',
      'Décor annoncé : <b>un appartement parisien, 1962</b>. Quatre objets n\'ont rien à faire là. Clique dessus pour les repérer.');

    var ITEMS = [
      { t: '📻 Poste TSF', x: 6, y: 12, bad: false },
      { t: '📱 Smartphone', x: 62, y: 16, bad: true, why: 'Le premier téléphone mobile grand public date des années 1980 — trois décennies trop tôt.' },
      { t: '🪑 Chaise en formica', x: 10, y: 46, bad: false },
      { t: '💡 Ampoule LED', x: 66, y: 48, bad: true, why: 'L\'éclairage LED domestique n\'arrive qu\'au tournant des années 2010. En 1962, c\'est une ampoule à incandescence.' },
      { t: '📺 TV noir & blanc', x: 8, y: 74, bad: false },
      { t: '🥤 Gobelet à emporter', x: 38, y: 72, bad: true, why: 'Le café à emporter en gobelet carton se généralise dans les années 1990 — impensable dans un intérieur français de 1962.' },
      { t: '☎️ Téléphone à cadran', x: 40, y: 20, bad: false },
      { t: '🎧 Casque bluetooth', x: 68, y: 76, bad: true, why: 'Le Bluetooth date de 1999. En 1962, un casque serait filaire, large et en mousse.' }
    ];
    var found = 0, total = ITEMS.filter(function (i) { return i.bad; }).length;

    u.inner.innerHTML =
      '<div class="an-scene" id="anScene">' +
      ITEMS.map(function (it, i) {
        return '<div class="an-item" data-i="' + i + '" style="left:' + it.x + '%;top:' + it.y + '%;">' + it.t + '</div>';
      }).join('') + '</div>' +
      '<div style="margin-top:12px;" class="an-count">Trouvés : <span id="anN">0</span> / ' + total + '</div>';

    u.inner.querySelectorAll('.an-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var it = ITEMS[+el.getAttribute('data-i')];
        if (el.classList.contains('found')) return;
        if (it.bad) {
          el.classList.add('found'); found++;
          u.inner.querySelector('#anN').textContent = found;
          say(u.fb, '<b>Bien vu — ' + it.t + '.</b> ' + it.why + (found === total ?
            '<br><br><b>Les quatre sont trouvés.</b> C\'est le travail quotidien d\'un décorateur : chaque objet doit pouvoir exister dans l\'époque du film. Un seul anachronisme visible, et le spectateur décroche — même s\'il ne saurait pas dire pourquoi.' : ''), 'good');
        } else {
          el.classList.add('wrong');
          setTimeout(function () { el.classList.remove('wrong'); }, 400);
          say(u.fb, '<b>' + it.t + '</b> est parfaitement d\'époque — on pouvait le trouver dans un intérieur de 1962. Cherche encore.', 'bad');
        }
      });
    });
  }

  var MODULES = {
    'tsv': moduleTSV,
    'cercle': moduleCercle,
    'quiz-palette': moduleQuiz,
    'decor': moduleDecor,
    'anachronisme': moduleAnachro
  };

  function init() {
    var anchors = document.querySelectorAll('[data-labo]');
    if (!anchors.length) return;
    injectCSS();
    anchors.forEach(function (a) {
      var fn = MODULES[a.getAttribute('data-labo')];
      if (fn) { try { fn(a); } catch (e) {} }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
