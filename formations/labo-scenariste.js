/**
 * Jeux interactifs — manuel Le Scénariste.
 * Nécessite labo-core.js chargé avant ce fichier.
 */
(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;

  LaboCore.ready(function () {
    LaboCore.theme({
      bg: '#171512', panel: '#211e19', text: '#f2ede0', dim: '#9a9488',
      accent: '#b23a2f', accent2: '#8a8477', border: 'rgba(242,237,224,.14)',
      good: '#3a8f5c', bad: '#c9524a',
      display: "'Courier Prime',monospace", mono: "'Courier Prime',monospace"
    });
    var C = LaboCore.colors;

    /* ═══ 1 — REMETS LA STRUCTURE EN 3 ACTES DANS L'ORDRE ═══ */
    var a1 = document.querySelector('[data-labo="structure-3-actes"]');
    if (a1) {
      var u1 = LaboCore.shell(a1, 'Labo 01', 'Remets ces scènes dans le bon ordre',
        'Ces 5 beats d\'une même histoire sont mélangés. Fais-les glisser dans les cases, dans l\'ordre de la structure en trois actes.');

      var BEATS = [
        { id: 0, t: 'L\'incident déclencheur — le monde ordinaire du héros bascule', pos: 0 },
        { id: 1, t: 'La situation initiale — on découvre le héros dans son quotidien', pos: -1 },
        { id: 2, t: 'Le point médian — le héros croit avoir gagné, puis tout se retourne', pos: 1 },
        { id: 3, t: 'Le climax — la confrontation finale, tout se joue', pos: 2 },
        { id: 4, t: 'La résolution — le nouveau monde du héros, après transformation', pos: 3 }
      ];
      var order = [-1, 0, 1, 2, 3];
      var shuffled = BEATS.slice().sort(function () { return Math.random() - 0.5; });

      u1.inner.innerHTML =
        '<div class="labo-dd-pool" id="scPool">' +
        shuffled.map(function (b) { return '<div class="labo-dd-item" draggable="true" data-id="' + b.id + '">' + b.t + '</div>'; }).join('') +
        '</div>' +
        '<div style="margin-top:16px;display:grid;gap:6px;">' +
        [0, 1, 2, 3, 4].map(function (i) { return '<div class="labo-dd-zone" data-slot="' + i + '"><span style="font-family:' + C.mono + ';font-size:10px;color:' + C.dim + ';">CASE ' + (i + 1) + '</span></div>'; }).join('') +
        '</div>' +
        '<div style="margin-top:14px;display:flex;gap:8px;"><button class="labo-btn" id="scCheck">Vérifier l\'ordre</button><button class="labo-btn" id="scReset">Réessayer</button></div>';

      var pool = u1.inner.querySelector('#scPool');
      var dragged = null;
      var placement = {};

      u1.inner.querySelectorAll('.labo-dd-item').forEach(function (el) {
        el.addEventListener('dragstart', function () { dragged = el; });
      });
      u1.inner.querySelectorAll('.labo-dd-zone').forEach(function (zone) {
        zone.addEventListener('dragover', function (e) { e.preventDefault(); });
        zone.addEventListener('drop', function (e) {
          e.preventDefault();
          if (!dragged || zone.children.length > 1) return;
          var id = +dragged.getAttribute('data-id');
          zone.appendChild(dragged);
          dragged.classList.add('placed');
          dragged.setAttribute('draggable', 'false');
          placement[zone.getAttribute('data-slot')] = id;
          dragged = null;
        });
      });
      u1.inner.querySelector('#scReset').addEventListener('click', function () {
        var pool = u1.inner.querySelector('#scPool');
        u1.inner.querySelectorAll('.labo-dd-item.placed').forEach(function (el) {
          el.classList.remove('placed');
          el.setAttribute('draggable', 'true');
          pool.appendChild(el);
        });
        placement = {};
        u1.fb.className = 'labo-fb';
      });

      u1.inner.querySelector('#scCheck').addEventListener('click', function () {
        if (Object.keys(placement).length < 5) {
          LaboCore.say(u1.fb, 'Place les 5 beats avant de vérifier.', 'bad');
          return;
        }
        var correct = 0;
        for (var slot = 0; slot < 5; slot++) {
          var beatId = placement[slot];
          var beat = BEATS[beatId];
          if (order.indexOf(beat.pos) === slot || (beat.pos === -1 && slot === 0)) correct++;
        }
        var ok = correct === 5;
        LaboCore.say(u1.fb, ok ?
          '<b>Ordre parfait.</b> Situation initiale → incident déclencheur → point médian → climax → résolution. C\'est le squelette de presque toutes les histoires efficaces — pas une camisole, un point de départ.' :
          '<b>' + correct + '/5 bien placés.</b> Regarde particulièrement où se situe le point médian par rapport au climax — c\'est l\'erreur la plus fréquente.',
          ok ? 'good' : 'bad');
      });
    }

    /* ═══ 2 — CE DIALOGUE SONNE-T-IL JUSTE ? ═══ */
    var a2 = document.querySelector('[data-labo="dialogue-quiz"]');
    if (a2) {
      var u2 = LaboCore.shell(a2, 'Labo 02', 'Ce dialogue sonne-t-il juste ?',
        'Lis chaque réplique. Sonne-t-elle comme quelqu\'un qui parle vraiment, ou comme un scénariste qui explique la situation au spectateur ?');

      var D = [
        { line: '« Comme tu le sais, Marie, ça fait 10 ans qu\'on est mariés et que tu me caches que tu détestes ton travail. »', bad: true, why: 'C\'est un dialogue d\'exposition pur — personne ne rappelle à sa propre femme des faits qu\'elle connaît déjà. C\'est écrit pour informer le spectateur, pas pour que Marie l\'entende.' },
        { line: '« Encore en retard. » (silence) « Le dossier Petit-Jean, tu l\'as fini ? »', bad: false, why: 'Ça sonne juste : des phrases courtes, une tension sous-entendue plutôt qu\'expliquée, rien n\'est dit frontalement mais tout est compris.' },
        { line: '« Je suis tellement en colère contre toi depuis que tu as trahi notre amitié la semaine dernière au bureau ! »', bad: true, why: 'Personne ne verbalise aussi proprement sa propre émotion en temps réel. Un vrai personnage en colère crie, se tait, ou change de sujet — il n\'annonce pas son état comme une didascalie.' },
        { line: '« T\'as mangé ? » « Pas faim. » « Ok. »', bad: false, why: 'Minimaliste et crédible — le sous-texte (l\'inquiétude, le refus d\'en parler) passe sans qu\'un seul mot ne le nomme directement.' }
      ];
      var qi = 0;

      function render() {
        var d = D[qi];
        u2.inner.innerHTML =
          '<p style="font-size:14.5px;color:' + C.text + ';line-height:1.7;margin-bottom:14px;font-style:italic;">' + (qi + 1) + '/' + D.length + ' — ' + d.line + '</p>' +
          '<div style="display:flex;gap:8px;">' +
          '<button class="labo-btn" data-a="juste">Sonne juste</button>' +
          '<button class="labo-btn" data-a="faux">Sonne faux (exposition)</button>' +
          '</div>';
        u2.fb.className = 'labo-fb';
        u2.inner.querySelectorAll('button').forEach(function (b) {
          b.addEventListener('click', function () {
            var said = b.getAttribute('data-a');
            var ok = (said === 'faux') === d.bad;
            LaboCore.say(u2.fb, (ok ? '<b>Exact.</b> ' : '<b>Pas tout à fait.</b> ') + d.why +
              (qi < D.length - 1 ? '<br><br><button class="labo-btn" id="scNext">Réplique suivante →</button>' : '<br><br><b>Terminé.</b> Le réflexe à garder : si un personnage dit à voix haute une information que l\'autre connaît déjà, c\'est presque toujours pour le spectateur, pas pour la scène.'),
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
