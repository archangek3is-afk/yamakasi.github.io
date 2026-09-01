/**
 * Jeux interactifs — manuel Directeur de la Photographie.
 * (Le simulateur de temperature de couleur existe deja nativement dans le
 * manuel — ce fichier ne couvre que l'eclairage 3 points, qui n'a pas
 * encore de version interactive.)
 * Nécessite labo-core.js chargé avant ce fichier.
 */
(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;

  LaboCore.ready(function () {
    LaboCore.theme({
      bg: '#0d0d0f', panel: '#17171a', text: '#eae4d3', dim: '#8f8b81',
      accent: '#f2a154', accent2: '#6fa8c9', border: 'rgba(234,228,211,.14)',
      good: '#3a8f5c', bad: '#c9524a',
      display: "'Space Grotesk',sans-serif", mono: "'IBM Plex Mono',monospace"
    });
    var C = LaboCore.colors;

    var a2 = document.querySelector('[data-labo="eclairage-3-points"]');
    if (a2) {
      var u2 = LaboCore.shell(a2, 'Labo', 'Éclairage 3 points — active ou coupe chaque source',
        'Clique sur KEY, FILL et RIM pour les allumer ou les éteindre, et regarde ce que chacune apporte réellement au visage.');

      u2.inner.innerHTML =
        '<div class="labo-grid2"><div class="labo-scene"><svg viewBox="0 0 300 220" style="width:100%;height:auto;display:block;">' +
        '<rect width="300" height="220" fill="#101012"/>' +
        '<ellipse id="l3Face" cx="150" cy="110" rx="52" ry="66" fill="#4a3f33"/>' +
        '<ellipse id="l3Shadow" cx="185" cy="110" rx="30" ry="60" fill="#050505" opacity=".75"/>' +
        '<ellipse id="l3Rim" cx="150" cy="110" rx="54" ry="68" fill="none" stroke="' + C.accent2 + '" stroke-width="0" opacity="0"/>' +
        '</svg></div>' +
        '<div><div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="labo-btn on" data-l="key">KEY</button>' +
        '<button class="labo-btn" data-l="fill">FILL</button>' +
        '<button class="labo-btn" data-l="rim">RIM</button>' +
        '</div><p class="labo-hint" id="l3Txt" style="margin-top:14px;">Le KEY seul est allumé : c\'est la source principale, celle qui sculpte le visage.</p></div></div>';

      var state = { key: true, fill: false, rim: false };
      var face = u2.inner.querySelector('#l3Face'), shadow = u2.inner.querySelector('#l3Shadow'), rim = u2.inner.querySelector('#l3Rim');
      var txt = u2.inner.querySelector('#l3Txt');
      var TXT = {
        key: 'Le KEY seul est allumé : c\'est la source principale, celle qui sculpte le visage — sans elle, il n\'y a pas d\'image du tout.',
        keyFill: 'Le FILL vient adoucir l\'ombre laissée par le KEY, sans jamais l\'effacer complètement. Trop de FILL et l\'image s\'aplatit ; pas de FILL et le contraste devient dur, presque menaçant.',
        keyRim: 'Le RIM dessine un filet de lumière sur le contour — il sépare le sujet du fond, surtout utile sur un décor sombre.',
        all: 'Les trois ensemble : un visage lisible, un peu de mystère dans l\'ombre restante, et une silhouette bien détachée du fond. C\'est le montage classique, pas une règle absolue — beaucoup de styles cassent volontairement cet équilibre.'
      };
      function render() {
        shadow.setAttribute('opacity', state.fill ? '.25' : '.75');
        rim.setAttribute('stroke-width', state.rim ? '4' : '0');
        rim.setAttribute('opacity', state.rim ? '1' : '0');
        face.setAttribute('fill', state.key ? '#4a3f33' : '#1a1610');
        var msg = !state.key ? 'Sans KEY, il n\'y a rien à voir — juste une forme dans le noir.' :
          (state.fill && state.rim) ? TXT.all : state.fill ? TXT.keyFill : state.rim ? TXT.keyRim : TXT.key;
        txt.textContent = msg;
      }
      u2.inner.querySelectorAll('[data-l]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-l');
          state[k] = !state[k];
          b.classList.toggle('on', state[k]);
          render();
        });
      });
      render();
    }
  });
})();
