(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#181513', panel:'#211d19', text:'#f5efe6', dim:'#a89b8c', accent:'#c98b7a', accent2:'#8a9099', border:'rgba(245,239,230,.14)', good:'#7a9a6e', bad:'#c9524a', display:"'Cormorant Garamond',serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="continuite"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Trouve la rupture de continuité', 'Deux photos du même personnage, prises à deux moments du tournage de la même scène. Clique sur les 3 éléments qui ont changé sans raison scénaristique.');
    u1.inner.innerHTML =
      '<div class="labo-grid2">' +
      '<div class="labo-scene" style="padding:16px;"><div style="font-family:' + C.mono + ';font-size:10px;color:' + C.dim + ';margin-bottom:8px;">PRISE — MATIN</div>' +
      '<div style="font-size:13.5px;line-height:1.8;color:' + C.text + ';">Veste en cuir <b>zippée</b>, écharpe <span class="co-hit" data-w="rouge">rouge</span> autour du cou, montre au <span class="co-hit" data-w="poignet gauche">poignet gauche</span>, <span class="co-hit" data-w="3 boutons ouverts">chemise à 3 boutons ouverts</span> sous la veste.</div></div>' +
      '<div class="labo-scene" style="padding:16px;"><div style="font-family:' + C.mono + ';font-size:10px;color:' + C.dim + ';margin-bottom:8px;">PRISE — APRÈS-MIDI (même scène)</div>' +
      '<div style="font-size:13.5px;line-height:1.8;color:' + C.text + ';">Veste en cuir zippée, écharpe <span class="co-hit" data-w="bleue">bleue</span> autour du cou, montre au <span class="co-hit" data-w="poignet droit">poignet droit</span>, <span class="co-hit" data-w="1 seul bouton ouvert">chemise à 1 seul bouton ouvert</span> sous la veste.</div></div>' +
      '</div><div class="labo-cap" style="text-align:left;">Trouvés : <span id="coN">0</span> / 3</div>';
    var style = document.createElement('style');
    style.textContent = '.co-hit{cursor:pointer;border-bottom:1px dashed ' + C.accent + ';} .co-hit.found{color:' + C.good + ';border-bottom-color:' + C.good + ';font-weight:700;}';
    document.head.appendChild(style);
    var found = 0;
    u1.inner.querySelectorAll('.co-hit').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.classList.contains('found')) return;
        el.classList.add('found'); found++;
        u1.inner.querySelector('#coN').textContent = Math.min(found, 3);
        if (found >= 3) {
          LaboCore.say(u1.fb, '<b>Les 3 ruptures sont trouvées :</b> la couleur de l\'écharpe, le poignet de la montre, et le nombre de boutons ouverts. Aucune de ces différences n\'est justifiée par l\'histoire — c\'est exactement le genre de détail qu\'une costumière doit ficher en photo au clap de chaque prise, sans exception.', 'good');
        }
      });
    });
  });
})();
