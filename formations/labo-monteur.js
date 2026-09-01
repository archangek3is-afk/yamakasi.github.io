/**
 * Jeux interactifs — manuel Le Monteur.
 * Nécessite labo-core.js chargé avant ce fichier.
 */
(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;

  LaboCore.ready(function () {
    LaboCore.theme({
      bg: '#0e1113', panel: '#171b1e', text: '#eef2f1', dim: '#8a938f',
      accent: '#2dd4bf', accent2: '#c084fc', border: 'rgba(238,242,241,.14)',
      good: '#3a8f5c', bad: '#c9524a',
      display: "'JetBrains Mono',monospace", mono: "'JetBrains Mono',monospace"
    });
    var C = LaboCore.colors;

    /* ═══ 1 — J-CUT / L-CUT EN DIRECT ═══ */
    var a1 = document.querySelector('[data-labo="jl-cut"]');
    if (a1) {
      var u1 = LaboCore.shell(a1, 'Labo 01', 'Décale le son, regarde le type de coupe changer',
        'Le bloc du haut est l\'image, celui du bas est le son. Fais glisser le curseur pour décaler le son par rapport à l\'image, et observe ce que ça devient.');

      u1.inner.innerHTML =
        '<svg viewBox="0 0 400 120" style="width:100%;height:auto;display:block;">' +
        '<rect x="20" y="20" width="360" height="26" fill="' + C.accent + '" opacity=".85"/>' +
        '<text x="20" y="16" font-family="' + C.mono + '" font-size="10" fill="' + C.accent + '">IMAGE</text>' +
        '<rect id="mSound" x="20" y="70" width="360" height="26" fill="' + C.accent2 + '" opacity=".85"/>' +
        '<text x="20" y="66" font-family="' + C.mono + '" font-size="10" fill="' + C.accent2 + '">SON</text>' +
        '<line x1="200" y1="10" x2="200" y2="106" stroke="' + C.dim + '" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<text x="200" y="115" text-anchor="middle" font-family="' + C.mono + '" font-size="9" fill="' + C.dim + '">POINT DE COUPE</text>' +
        '</svg>' +
        '<div class="labo-ctl"><label>Décalage du son <span class="labo-val" id="mDeg">0 — coupe sèche</span></label>' +
        '<input type="range" id="mSlider" min="-80" max="80" value="0"></div>';

      var slider = u1.inner.querySelector('#mSlider'), deg = u1.inner.querySelector('#mDeg'), sound = u1.inner.querySelector('#mSound');

      function update() {
        var v = +slider.value;
        sound.setAttribute('x', 20 + v);
        if (Math.abs(v) < 8) {
          deg.textContent = '0 — coupe sèche';
          LaboCore.say(u1.fb, '<b>Coupe sèche.</b> Image et son changent exactement au même instant. C\'est la coupe par défaut — efficace, mais elle peut sonner mécanique si elle est utilisée sur chaque plan d\'une conversation.', '');
        } else if (v < 0) {
          deg.textContent = v + ' — J-CUT';
          LaboCore.say(u1.fb, '<b>J-cut.</b> Le son du plan suivant arrive avant son image — on entend la réponse avant de voir qui répond. Ça anticipe, ça tire le spectateur vers l\'avant.', 'good');
        } else {
          deg.textContent = '+' + v + ' — L-CUT';
          LaboCore.say(u1.fb, '<b>L-cut.</b> Le son du plan précédent continue après que l\'image a changé — on reste avec ce qui vient d\'être dit pendant qu\'on regarde déjà ailleurs. Ça retient, ça prolonge un moment.', 'good');
        }
      }
      slider.addEventListener('input', update);
      update();
    }

    /* ═══ 2 — MONTE LA SCÈNE ═══ */
    var a2 = document.querySelector('[data-labo="monte-la-scene"]');
    if (a2) {
      var u2 = LaboCore.shell(a2, 'Labo 02', 'Monte cette scène de dialogue',
        'Un personnage révèle une trahison à l\'autre. Range ces 4 plans dans l\'ordre qui crée le plus de tension — pas forcément celui qu\'on croit.');

      var SH = [
        { id: 0, t: 'Plan large — établit les deux personnages à table', pos: 0 },
        { id: 1, t: 'Plan sur celui qui parle — il révèle la trahison', pos: 1 },
        { id: 2, t: 'Plan de RÉACTION — celui qui écoute, silence prolongé', pos: 2 },
        { id: 3, t: 'Retour large — les deux dans le même cadre, la distance s\'est installée', pos: 3 }
      ];
      var shuffled = SH.slice().sort(function () { return Math.random() - 0.5; });

      u2.inner.innerHTML =
        '<div class="labo-dd-pool" id="mPool">' +
        shuffled.map(function (s) { return '<div class="labo-dd-item" draggable="true" data-id="' + s.id + '">' + s.t + '</div>'; }).join('') +
        '</div>' +
        '<div style="margin-top:16px;display:grid;gap:6px;">' +
        [0, 1, 2, 3].map(function (i) { return '<div class="labo-dd-zone" data-slot="' + i + '"><span style="font-family:' + C.mono + ';font-size:10px;color:' + C.dim + ';">PLAN ' + (i + 1) + '</span></div>'; }).join('') +
        '</div>' +
        '<div style="margin-top:14px;"><button class="labo-btn" id="mCheck">Vérifier le montage</button></div>';

      var dragged = null, placement = {};
      u2.inner.querySelectorAll('.labo-dd-item').forEach(function (el) {
        el.addEventListener('dragstart', function () { dragged = el; });
      });
      u2.inner.querySelectorAll('.labo-dd-zone').forEach(function (zone) {
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
      u2.inner.querySelector('#mCheck').addEventListener('click', function () {
        if (Object.keys(placement).length < 4) { LaboCore.say(u2.fb, 'Place les 4 plans avant de vérifier.', 'bad'); return; }
        var correct = 0;
        for (var slot = 0; slot < 4; slot++) { if (SH[placement[slot]].pos === slot) correct++; }
        var ok = correct === 4;
        LaboCore.say(u2.fb, ok ?
          '<b>C\'est le montage classique — et il fonctionne.</b> Le point clé : le plan de réaction dure plus longtemps qu\'on ne le pense naturellement. C\'est le silence de celui qui écoute, pas les mots de celui qui parle, qui porte la scène.' :
          '<b>' + correct + '/4 bien placés.</b> Repense à où se situe le plan de réaction — c\'est souvent lui qu\'on place trop tôt ou trop tard, alors que c\'est le cœur émotionnel de la scène.',
          ok ? 'good' : 'bad');
      });
    }
  });
})();
