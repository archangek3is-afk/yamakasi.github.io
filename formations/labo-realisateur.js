/**
 * Jeux interactifs — manuel Le Réalisateur.
 * Nécessite labo-core.js chargé avant ce fichier.
 */
(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;

  LaboCore.ready(function () {
    LaboCore.theme({
      bg: '#141414', panel: '#1c1c1c', text: '#f4f1e8', dim: '#8a8a85',
      accent: '#e4312b', accent2: '#4c5b66', border: 'rgba(244,241,232,.14)',
      good: '#3a8f5c', bad: '#c9524a',
      display: "'Archivo',sans-serif", mono: "'IBM Plex Mono',monospace"
    });

    var C = LaboCore.colors;

    /* ═══ 1 — LA LIGNE DES 180° EN DIRECT ═══ */
    var a1 = document.querySelector('[data-labo="180-ligne"]');
    if (a1) {
      var u1 = LaboCore.shell(a1, 'Labo 01', 'Déplace la caméra autour de la ligne des 180°',
        'Fais glisser le curseur : la caméra tourne autour des deux personnages. Regarde ce qui arrive à leur position à l\'écran quand tu franchis la ligne imaginaire.');

      u1.inner.innerHTML =
        '<svg viewBox="0 0 440 260" style="width:100%;height:auto;display:block;background:' + C.bg + ';">' +
        '<line x1="70" y1="130" x2="370" y2="130" stroke="' + C.accent2 + '" stroke-width="1.5" stroke-dasharray="5 4"/>' +
        '<circle id="rlA" cx="130" cy="130" r="11" fill="' + C.accent + '"/>' +
        '<text x="130" y="160" text-anchor="middle" font-family="' + C.mono + '" font-size="11" fill="' + C.text + '">A</text>' +
        '<circle id="rlB" cx="310" cy="130" r="11" fill="' + C.text + '"/>' +
        '<text x="310" y="160" text-anchor="middle" font-family="' + C.mono + '" font-size="11" fill="' + C.text + '">B</text>' +
        '<polygon id="rlCam" points="0,-9 16,0 0,9" fill="' + C.accent + '" transform="translate(220,50)"/>' +
        '<text id="rlZone" x="220" y="230" text-anchor="middle" font-family="' + C.mono + '" font-size="12" fill="' + C.good + '">ZONE AUTORISÉE</text>' +
        '</svg>' +
        '<div class="labo-ctl"><label>Angle de la caméra <span class="labo-val" id="rlDeg">45°</span></label>' +
        '<input type="range" id="rlSlider" min="0" max="360" value="45"></div>' +
        '<div id="rlScreens" style="display:flex;gap:10px;margin-top:14px;">' +
        '<div style="flex:1;border:1px solid ' + C.border + ';padding:14px;text-align:center;font-family:' + C.mono + ';font-size:12px;color:' + C.dim + ';">ÉCRAN — PLAN 1<div id="rlS1" style="margin-top:8px;font-size:16px;color:' + C.text + ';font-weight:700;">A · · · · · B</div></div>' +
        '<div style="flex:1;border:1px solid ' + C.border + ';padding:14px;text-align:center;font-family:' + C.mono + ';font-size:12px;color:' + C.dim + ';">ÉCRAN — PLAN 2<div id="rlS2" style="margin-top:8px;font-size:16px;color:' + C.text + ';font-weight:700;">A · · · · · B</div></div>' +
        '</div>';

      var slider = u1.inner.querySelector('#rlSlider'), deg = u1.inner.querySelector('#rlDeg');
      var cam = u1.inner.querySelector('#rlCam'), zone = u1.inner.querySelector('#rlZone');
      var s1 = u1.inner.querySelector('#rlS1'), s2 = u1.inner.querySelector('#rlS2');
      var firstSide = null, sideFlipped = false;

      function update() {
        var a = +slider.value;
        deg.textContent = a + '°';
        var rad = (a - 90) * Math.PI / 180;
        var cx = 220 + 175 * Math.cos(rad);
        var cy = 130 + 175 * Math.sin(rad) * 0.55;
        cam.setAttribute('transform', 'translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ') rotate(' + (a + 90) + ')');
        var below = cy > 130;
        zone.textContent = below ? 'ZONE AUTORISÉE' : 'ZONE INTERDITE — ligne franchie';
        zone.setAttribute('fill', below ? C.good : C.bad);

        var order = below ? 'A · · · · · B' : 'B · · · · · A';
        if (firstSide === null) { firstSide = below; s1.textContent = order; }
        else if (below !== firstSide && !sideFlipped) {
          s2.textContent = order;
          sideFlipped = true;
          LaboCore.say(u1.fb, '<b>Regarde l\'écran 2 — A et B ont échangé leur place !</b> Rien n\'a bougé sur le plateau, seule la caméra est passée de l\'autre côté de la ligne. C\'est exactement l\'erreur de raccord que la règle des 180° empêche : le spectateur perd ses repères sans savoir pourquoi.', 'bad');
        } else if (below === firstSide) {
          s2.textContent = order;
          if (sideFlipped) { sideFlipped = false; u1.fb.className = 'labo-fb'; }
        }
      }
      slider.addEventListener('input', update);
      update();
    }

    /* ═══ 2 — QUIZ : QUELLE VALEUR DE PLAN ? ═══ */
    var a2 = document.querySelector('[data-labo="valeurs-plan-quiz"]');
    if (a2) {
      var u2 = LaboCore.shell(a2, 'Labo 02', 'Quelle valeur de plan pour ce moment ?',
        'Lis la situation, choisis la valeur de plan qui la sert le mieux dramatiquement.');

      var Q = [
        { situ: 'Un personnage retient ses larmes en écoutant une mauvaise nouvelle au téléphone.', good: 'Gros plan', why: 'Le gros plan capte le combat intérieur sur le visage — c\'est le moment où l\'émotion doit remplir tout l\'écran, sans échappatoire pour le regard.' },
        { situ: 'Le héros arrive seul dans une ville qu\'il ne connaît pas, pour la première fois.', good: 'Plan large', why: 'Le plan large écrase le personnage face à l\'espace — exactement le sentiment de petitesse et de dépaysement que la scène doit transmettre.' },
        { situ: 'Deux personnages négocient calmement autour d\'une table, aucune tension particulière.', good: 'Plan moyen', why: 'Rien ne justifie un rapprochement dramatique ici — le plan moyen reste le choix par défaut pour une conversation sans intensité particulière.' },
        { situ: 'Un indice crucial (une bague, une date griffonnée) doit être remarqué par le spectateur.', good: 'Très gros plan', why: 'Le très gros plan isole le détail de tout le reste — c\'est un signal direct au spectateur : "retiens ça, ça va compter".' }
      ];
      var OPTS = ['Plan large', 'Plan moyen', 'Plan rapproché', 'Gros plan', 'Très gros plan'];
      var qi = 0;

      function render() {
        var q = Q[qi];
        u2.inner.innerHTML =
          '<p style="font-size:14.5px;color:' + C.text + ';line-height:1.6;margin-bottom:14px;"><b>Situation ' + (qi + 1) + '/' + Q.length + ' —</b> ' + q.situ + '</p>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
          OPTS.map(function (o) { return '<button class="labo-btn" data-o="' + o + '">' + o + '</button>'; }).join('') +
          '</div>';
        u2.fb.className = 'labo-fb';
        u2.inner.querySelectorAll('button').forEach(function (b) {
          b.addEventListener('click', function () {
            var ok = b.getAttribute('data-o') === q.good;
            LaboCore.say(u2.fb, (ok ? '<b>Exact — ' : '<b>Plutôt : ') + q.good + '.</b><br>' + q.why +
              (qi < Q.length - 1 ? '<br><br><button class="labo-btn" id="rlNext">Situation suivante →</button>' : '<br><br><b>Les 4 situations sont passées.</b> Retiens le réflexe : la valeur de plan n\'est jamais un hasard, elle sert toujours ce que le personnage ressent à cet instant.'),
              ok ? 'good' : 'bad');
            var next = u2.fb.querySelector('#rlNext');
            if (next) next.addEventListener('click', function () { qi++; render(); });
          });
        });
      }
      render();
    }
  });
})();
