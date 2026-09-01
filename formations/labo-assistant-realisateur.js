/**
 * Jeux interactifs — manuel Assistant Réalisateur.
 * Nécessite labo-core.js chargé avant ce fichier.
 */
(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;

  LaboCore.ready(function () {
    LaboCore.theme({
      bg: '#121417', panel: '#1a1d21', text: '#f1f3f5', dim: '#8a9099',
      accent: '#f0c136', accent2: '#8a9099', border: 'rgba(241,243,245,.14)',
      good: '#3a8f5c', bad: '#c9524a',
      display: "'Barlow Condensed',sans-serif", mono: "'IBM Plex Mono',monospace"
    });
    var C = LaboCore.colors;

    /* ═══ 1 — CASSE-TÊTE DU PLAN DE TRAVAIL ═══ */
    var a1 = document.querySelector('[data-labo="plan-de-travail"]');
    if (a1) {
      var u1 = LaboCore.shell(a1, 'Labo 01', 'Range ces 6 scènes sur 2 jours de tournage',
        'Fais glisser chaque scène dans Jour 1 ou Jour 2. Le bon plan de travail regroupe les scènes par lieu — pas par ordre chronologique de l\'histoire.');

      var SC = [
        { id: 0, t: 'SC 1 — INT. CUISINE — JOUR', loc: 'maison' },
        { id: 1, t: 'SC 14 — EXT. PARKING — NUIT', loc: 'parking' },
        { id: 2, t: 'SC 3 — INT. SALON — JOUR', loc: 'maison' },
        { id: 3, t: 'SC 22 — EXT. PARKING — JOUR', loc: 'parking' },
        { id: 4, t: 'SC 8 — INT. CHAMBRE — NUIT', loc: 'maison' },
        { id: 5, t: 'SC 30 — EXT. PARKING — JOUR (suite)', loc: 'parking' }
      ];
      var shuffled = SC.slice().sort(function () { return Math.random() - 0.5; });

      u1.inner.innerHTML =
        '<div class="labo-dd-pool" id="arPool">' +
        shuffled.map(function (s) { return '<div class="labo-dd-item" draggable="true" data-id="' + s.id + '">' + s.t + '</div>'; }).join('') +
        '</div>' +
        '<div class="labo-grid2" style="margin-top:16px;">' +
        '<div><div style="font-family:' + C.mono + ';font-size:11px;color:' + C.dim + ';margin-bottom:6px;">JOUR 1</div><div class="labo-dd-zone" data-day="1" style="min-height:140px;"></div></div>' +
        '<div><div style="font-family:' + C.mono + ';font-size:11px;color:' + C.dim + ';margin-bottom:6px;">JOUR 2</div><div class="labo-dd-zone" data-day="2" style="min-height:140px;"></div></div>' +
        '</div>' +
        '<div style="margin-top:14px;display:flex;gap:8px;"><button class="labo-btn" id="arCheck">Vérifier le plan</button><button class="labo-btn" id="arReset">Réessayer</button></div>';

      var dragged = null, placement = {};
      u1.inner.querySelectorAll('.labo-dd-item').forEach(function (el) {
        el.addEventListener('dragstart', function () { dragged = el; });
      });
      u1.inner.querySelectorAll('.labo-dd-zone').forEach(function (zone) {
        zone.addEventListener('dragover', function (e) { e.preventDefault(); });
        zone.addEventListener('drop', function (e) {
          e.preventDefault();
          if (!dragged) return;
          var id = +dragged.getAttribute('data-id');
          zone.appendChild(dragged);
          dragged.classList.add('placed');
          dragged.setAttribute('draggable', 'false');
          placement[id] = zone.getAttribute('data-day');
          dragged = null;
        });
      });
      
    u1.inner.querySelector('#arReset').addEventListener('click', function () {
      var pool = u1.inner.querySelector('#arPool');
      u1.inner.querySelectorAll('.labo-dd-item.placed').forEach(function (el) {
        el.classList.remove('placed');
        el.setAttribute('draggable', 'true');
        pool.appendChild(el);
      });
      placement = {};
      u1.fb.className = 'labo-fb';
    });

    u1.inner.querySelector('#arCheck').addEventListener('click', function () {
        if (Object.keys(placement).length < 6) {
          LaboCore.say(u1.fb, 'Place les 6 scènes avant de vérifier.', 'bad');
          return;
        }
        var byLoc = {};
        SC.forEach(function (s) {
          byLoc[s.loc] = byLoc[s.loc] || {};
          byLoc[s.loc][placement[s.id]] = true;
        });
        var locsSplit = Object.keys(byLoc).filter(function (l) { return Object.keys(byLoc[l]).length > 1; });
        if (locsSplit.length === 0) {
          LaboCore.say(u1.fb, '<b>Plan de travail efficace.</b> Toutes les scènes "maison" sont groupées, tout comme le "parking" — un seul déplacement d\'équipe et de matériel entre les deux jours. C\'est exactement le réflexe qu\'un 1<sup>er</sup> AD applique en premier : jamais l\'ordre du scénario, toujours l\'ordre des lieux.', 'good');
        } else {
          LaboCore.say(u1.fb, '<b>Ce plan ferait perdre du temps.</b> Le lieu "' + locsSplit[0] + '" est réparti sur les deux jours — ça veut dire déplacer toute l\'équipe et remonter le matériel deux fois pour le même décor. Regroupe plutôt toutes les scènes d\'un même lieu ensemble, peu importe leur ordre dans le scénario.', 'bad');
        }
      });
    }

    /* ═══ 2 — DÉPOUILLEMENT EXPRESS ═══ */
    var a2 = document.querySelector('[data-labo="depouillement"]');
    if (a2) {
      var u2 = LaboCore.shell(a2, 'Labo 02', 'Dépouille cette scène en 20 secondes',
        'Clique sur chaque élément du texte qui devra être prêt avant le tournage (costume, accessoire, figuration, effet, véhicule). Il y en a 5.');

      var text = 'INT. BAR — NUIT. Marc entre, <span class="ar-hit" data-w="un imperméable trempé">un imperméable trempé</span>. Il commande <span class="ar-hit" data-w="un whisky">un whisky</span> pendant qu\'<span class="ar-hit" data-w="une dizaine de clients">une dizaine de clients</span> discutent en fond. Dehors, <span class="ar-hit" data-w="une moto pétarade">une moto pétarade</span>. Marc pose <span class="ar-hit" data-w="un revolver">un revolver</span> sur le comptoir.';
      var total = 5, found = 0;

      u2.inner.innerHTML =
        '<p style="font-size:14.5px;line-height:1.9;color:' + C.text + ';">' + text + '</p>' +
        '<div class="labo-cap" style="text-align:left;margin-top:6px;">Trouvés : <span id="arN">0</span> / ' + total + '</div>';

      var style = document.createElement('style');
      style.textContent = '.ar-hit{cursor:pointer;border-bottom:1px dashed ' + C.accent + ';} .ar-hit.found{color:' + C.good + ';border-bottom-color:' + C.good + ';font-weight:700;}';
      document.head.appendChild(style);

      u2.inner.querySelectorAll('.ar-hit').forEach(function (el) {
        el.addEventListener('click', function () {
          if (el.classList.contains('found')) return;
          el.classList.add('found');
          found++;
          u2.inner.querySelector('#arN').textContent = found;
          if (found === total) {
            LaboCore.say(u2.fb, '<b>Les 5 éléments sont repérés.</b> Costume (imperméable trempé — prévoir un double sec pour les prises suivantes), accessoires (whisky, revolver), figuration (10 clients à briefer et costumer), effet sonore de tournage (moto). C\'est exactement ce niveau de détail qu\'un dépouillement doit atteindre, scène après scène.', 'good');
          }
        });
      });
    }
  });
})();
