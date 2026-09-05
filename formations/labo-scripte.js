/**
 * Jeux interactifs — manuel Le Scripte.
 * Nécessite labo-core.js chargé avant ce fichier.
 */
(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;

  LaboCore.ready(function () {
    LaboCore.theme({
      bg: '#0c0f10', panel: '#15191b', text: '#e5dece', dim: '#7a8086',
      accent: '#2d5fad', accent2: '#c0392b', border: 'rgba(229,222,206,.14)',
      good: '#3a8f5c', bad: '#c0392b',
      display: "'Special Elite',cursive", mono: "'IBM Plex Mono',monospace"
    });
    var C = LaboCore.colors;

    /* ═══ 1 — TROUVE LA RUPTURE DE CONTINUITÉ ═══ */
    var a1 = document.querySelector('[data-labo="rupture-continuite"]');
    if (a1) {
      var u1 = LaboCore.shell(a1, 'Labo 01', 'Trouve la rupture de continuité',
        'Même scène, deux prises tournées à quelques minutes d\'écart. Clique sur les 3 éléments qui ont changé sans raison scénaristique.');

      u1.inner.innerHTML =
        '<div class="labo-grid2">' +
        '<div class="labo-scene" style="padding:16px;"><div style="font-family:' + C.mono + ';font-size:10px;color:' + C.dim + ';margin-bottom:8px;">PRISE 2</div>' +
        '<div style="font-size:13.5px;line-height:1.8;color:' + C.text + ';">Le personnage tient sa tasse de café dans la <span class="sc-hit" data-w="main droite">main droite</span>, la lettre posée sur la table est <span class="sc-hit" data-w="fermée">fermée</span>, la fenêtre derrière lui est <span class="sc-hit" data-w="entrouverte">entrouverte</span>.</div></div>' +
        '<div class="labo-scene" style="padding:16px;"><div style="font-family:' + C.mono + ';font-size:10px;color:' + C.dim + ';margin-bottom:8px;">PRISE 5 (même scène)</div>' +
        '<div style="font-size:13.5px;line-height:1.8;color:' + C.text + ';">Le personnage tient sa tasse de café dans la <span class="sc-hit" data-w="main gauche">main gauche</span>, la lettre posée sur la table est <span class="sc-hit" data-w="ouverte">ouverte</span>, la fenêtre derrière lui est <span class="sc-hit" data-w="fermée2">fermée</span>.</div></div>' +
        '</div><div class="labo-cap" style="text-align:left;">Trouvés : <span id="scN">0</span> / 3</div>';

      var style = document.createElement('style');
      style.textContent = '.sc-hit{cursor:pointer;border-bottom:1px dashed ' + C.accent2 + ';} .sc-hit.found{color:' + C.good + ';border-bottom-color:' + C.good + ';font-weight:700;}';
      document.head.appendChild(style);

      var found = 0;
      u1.inner.querySelectorAll('.sc-hit').forEach(function (el) {
        el.addEventListener('click', function () {
          if (el.classList.contains('found')) return;
          el.classList.add('found'); found++;
          u1.inner.querySelector('#scN').textContent = Math.min(found, 3);
          if (found >= 3) {
            LaboCore.say(u1.fb, '<b>Les 3 ruptures sont trouvées :</b> la main qui tient la tasse, l\'état de la lettre, l\'ouverture de la fenêtre. Rien dans le scénario ne justifie ces changements — c\'est exactement le genre de détail qu\'une scripte doit ficher (avec photo si possible) à chaque prise, sans exception. Au montage, ces deux prises pourraient être coupées ensemble, et l\'incohérence sauterait aux yeux du spectateur en une fraction de seconde.', 'good');
          }
        });
      });
    }

    /* ═══ 2 — CIRCLED OU PAS ? ═══ */
    var a2 = document.querySelector('[data-labo="circled-take"]');
    if (a2) {
      var u2 = LaboCore.shell(a2, 'Labo 02', 'Cette prise doit-elle être "circled" ?',
        'Le réalisateur vient de dire quelque chose après une prise. À toi de décider si tu l\'entoures (bonne prise à garder) ou non.');

      var Q = [
        { l: '« Ouais... on la garde, mais on refait une variante plus lente juste au cas où. »', good: true, why: 'Un "on la garde" clair, même suivi d\'une prudence, se traduit par un cercle. La variante suivante sera une NOUVELLE prise à juger séparément — celle-ci reste "circled" jusqu\'à preuve du contraire.' },
        { l: '« Non, on la refait, le jeu était juste avant le bon rythme. »', good: false, why: 'Un refus explicite du réalisateur = pas de cercle. Cette prise reste "NG" (No Good) dans le rapport, même si elle est techniquement propre — la décision artistique prime toujours sur la propreté technique.' },
        { l: '« Parfait, exactement ça. » (aucune autre prise tournée ensuite pour ce plan)', good: true, why: 'Validation explicite, et confirmée par le fait qu\'aucune autre prise ne suit — c\'est la prise unique du plan, donc "circled" sans ambiguïté.' },
        { l: '« Le son a un problème, mais le jeu était top. On refait pour le son. »', good: false, why: 'Même avec un excellent jeu, un problème technique connu (ici le son) empêche de circled cette prise — elle doit être notée comme techniquement invalide, jeu à réutiliser en référence mais pas la prise elle-même.' }
      ];
      var qi = 0;

      function render() {
        var q = Q[qi];
        u2.inner.innerHTML =
          '<p style="font-size:14.5px;color:' + C.text + ';line-height:1.7;margin-bottom:14px;font-style:italic;">' + (qi + 1) + '/' + Q.length + ' — ' + q.l + '</p>' +
          '<div style="display:flex;gap:8px;">' +
          '<button class="labo-btn" data-a="1">⭕ Circled</button>' +
          '<button class="labo-btn" data-a="0">❌ Pas circled</button>' +
          '</div>';
        u2.fb.className = 'labo-fb';
        u2.inner.querySelectorAll('button').forEach(function (b) {
          b.addEventListener('click', function () {
            var ok = (b.getAttribute('data-a') === '1') === q.good;
            LaboCore.say(u2.fb, (ok ? '<b>Exact.</b> ' : '<b>Pas tout à fait.</b> ') + q.why +
              (qi < Q.length - 1 ? '<br><br><button class="labo-btn" id="scNext">Situation suivante →</button>' : '<br><br><b>Terminé.</b> Le réflexe à garder : circled n\'est jamais automatique — c\'est une décision du réalisateur, que la scripte transcrit fidèlement, jamais une évaluation personnelle de la qualité du jeu.'),
              ok ? 'good' : 'bad');
            var next = u2.fb.querySelector('#scNext');
            if (next) next.addEventListener('click', function () { qi++; render(); });
          });
        });
      }
      render();
    }
  });
})();
