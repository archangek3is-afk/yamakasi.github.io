/**
 * Jeux interactifs — manuel L'Ingénieur du Son.
 * Nécessite labo-core.js chargé avant ce fichier.
 */
(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;

  LaboCore.ready(function () {
    LaboCore.theme({
      bg: '#0b0f0d', panel: '#141917', text: '#eef2ef', dim: '#8a938e',
      accent: '#5fd68f', accent2: '#8a938e', border: 'rgba(238,242,239,.14)',
      good: '#5fd68f', bad: '#c9524a',
      display: "'Unbounded',sans-serif", mono: "'IBM Plex Mono',monospace"
    });
    var C = LaboCore.colors;

    /* ═══ 1 — CARVING FRÉQUENTIEL EN DIRECT ═══ */
    var a1 = document.querySelector('[data-labo="carving"]');
    if (a1) {
      var u1 = LaboCore.shell(a1, 'Labo 01', 'Trouve la place du dialogue dans le mix',
        'Deux curseurs : le volume de la musique, et l\'espace que tu "creuses" pour le dialogue sur sa zone de fréquences (300Hz-3kHz). Cherche le moment où le dialogue redevient intelligible.');

      var bars = [30, 45, 35, 80, 90, 75, 30, 50, 40];
      u1.inner.innerHTML =
        '<div style="display:flex;align-items:flex-end;gap:4px;height:120px;border-bottom:1px solid ' + C.border + ';" id="isChart">' +
        bars.map(function (h, i) {
          var isDialogueZone = i >= 3 && i <= 5;
          return '<div class="is-bar" data-zone="' + (isDialogueZone ? 1 : 0) + '" data-base="' + h + '" style="flex:1;height:' + h + '%;background:' + (isDialogueZone ? C.accent : C.dim) + ';"></div>';
        }).join('') + '</div>' +
        '<div class="labo-cap">20Hz (grave) — zone dialogue 300Hz-3kHz au centre — 20kHz (aigu)</div>' +
        '<div class="labo-ctl"><label>Volume musique <span class="labo-val" id="isMusVal">100 %</span></label>' +
        '<input type="range" id="isMus" min="20" max="100" value="100">' +
        '<label>Espace creusé pour le dialogue <span class="labo-val" id="isCarveVal">0 %</span></label>' +
        '<input type="range" id="isCarve" min="0" max="100" value="0"></div>';

      var mus = u1.inner.querySelector('#isMus'), carve = u1.inner.querySelector('#isCarve');
      var musVal = u1.inner.querySelector('#isMusVal'), carveVal = u1.inner.querySelector('#isCarveVal');
      var barsEls = u1.inner.querySelectorAll('.is-bar');

      function update() {
        var m = +mus.value, c = +carve.value;
        musVal.textContent = m + ' %';
        carveVal.textContent = c + ' %';
        barsEls.forEach(function (el) {
          var base = +el.getAttribute('data-base');
          var isZone = el.getAttribute('data-zone') === '1';
          var h = isZone ? base * (m / 100) * (1 - c / 130) : base * (m / 100);
          el.style.height = Math.max(4, h) + '%';
        });
        var clash = (m / 100) * (1 - c / 130);
        if (clash > 0.55) {
          LaboCore.say(u1.fb, '<b>Le dialogue est écrasé.</b> La musique occupe toujours la zone 300Hz-3kHz — exactement la même bande que la voix humaine. Un spectateur devra remonter le volume ou activer les sous-titres pour comprendre.', 'bad');
        } else if (clash < 0.25) {
          LaboCore.say(u1.fb, '<b>Le dialogue respire.</b> C\'est le principe derrière le mix de Mad Max: Fury Road — même avec 3000 explosions, le dialogue reste protégé dans son propre corridor de fréquences, quel que soit le chaos autour.', 'good');
        } else {
          LaboCore.say(u1.fb, 'Ça s\'améliore — continue à creuser la musique sur la zone du dialogue, ou baisse encore un peu son volume global.', '');
        }
      }
      mus.addEventListener('input', update);
      carve.addEventListener('input', update);
      update();
    }

    /* ═══ 2 — QUIZ FOLEY ═══ */
    var a2 = document.querySelector('[data-labo="foley-quiz"]');
    if (a2) {
      var u2 = LaboCore.shell(a2, 'Labo 02', 'Quel objet fait vraiment ce bruit ?',
        'Le son réel sonne rarement "vrai" à l\'écran. Devine quel objet insolite un artiste foley utilise pour chaque effet.');

      var Q = [
        { situ: 'Des pas dans la neige fraîche', opts: ['De la vraie neige', 'De la fécule de maïs pressée dans un sac'], good: 1, why: 'Un pas dans de la vraie neige sonne souvent "faux" à l\'image — la fécule de maïs pressée reproduit le grincement caractéristique que l\'oreille associe au froid.' },
        { situ: 'Un os qui se brise', opts: ['Une branche de céleri cassée', 'Un vrai os de poulet'], good: 0, why: 'Le céleri a une texture fibreuse qui, une fois cassée près du micro, produit un craquement bien plus net et "propre" qu\'un os réel — plus lisible pour l\'oreille du spectateur.' },
        { situ: 'Le costume de Batman qui bouge (The Dark Knight)', opts: ['Du cuir véritable froissé à la main', 'Un enregistrement de costume en latex'], good: 0, why: 'Richard King a utilisé du cuir véritable froissé à la main pour obtenir la granularité organique du mouvement — un poids physique crédible qu\'un synthétique n\'aurait pas donné.' },
        { situ: 'Tous les sons d\'ambiance de l\'île déserte (Cast Away)', opts: ['Enregistrés sur une vraie île', 'Recréés en studio, sur un sol de sable construit spécialement'], good: 1, why: 'Le seul personnage étant Tom Hanks sans interlocuteur, chaque son a été recréé en foley dans un studio spécialement construit avec du vrai sable — la seule façon d\'obtenir la texture juste.' }
      ];
      var qi = 0;

      function render() {
        var q = Q[qi];
        u2.inner.innerHTML =
          '<p style="font-size:14.5px;color:' + C.text + ';line-height:1.6;margin-bottom:14px;"><b>' + (qi + 1) + '/' + Q.length + ' —</b> ' + q.situ + '</p>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
          q.opts.map(function (o, i) { return '<button class="labo-btn" data-i="' + i + '">' + o + '</button>'; }).join('') +
          '</div>';
        u2.fb.className = 'labo-fb';
        u2.inner.querySelectorAll('button').forEach(function (b) {
          b.addEventListener('click', function () {
            var ok = +b.getAttribute('data-i') === q.good;
            LaboCore.say(u2.fb, (ok ? '<b>Exact.</b> ' : '<b>En réalité : ' + q.opts[q.good] + '.</b> ') + q.why +
              (qi < Q.length - 1 ? '<br><br><button class="labo-btn" id="isNext">Suivant →</button>' : '<br><br><b>Terminé.</b> Le principe à retenir : le foley ne reproduit pas le son réel, il reproduit l\'idée que le spectateur se fait du son réel.'),
              ok ? 'good' : 'bad');
            var next = u2.fb.querySelector('#isNext');
            if (next) next.addEventListener('click', function () { qi++; render(); });
          });
        });
      }
      render();
    }
  });
})();
