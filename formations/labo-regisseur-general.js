(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#15130f', panel:'#1e1b15', text:'#f3efe4', dim:'#a8a184', accent:'#9a9366', accent2:'#c9524a', border:'rgba(243,239,228,.14)', good:'#7a9a6e', bad:'#c9524a', display:"'Barlow Condensed',sans-serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="reperage"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Repérage — trouve les 4 problèmes cachés', 'Fiche de repérage d\'un lieu, visitée à 14h en plein jour. Clique sur les 4 éléments du texte qui poseront un vrai problème le jour du tournage, prévu à 6h du matin.');
    var text = 'Loft industriel, 3<sup>e</sup> étage. <span class="rg-hit" data-w="Ascenseur unique">Ascenseur unique</span>, capacité 6 personnes. <span class="rg-hit" data-w="Rue résidentielle calme">Rue résidentielle calme</span> — quelques passants. Prise électrique standard dans chaque pièce, <span class="rg-hit" data-w="tableau à 16A seulement">tableau à 16A seulement</span>. Grandes baies vitrées orientées est, <span class="rg-hit" data-w="très lumineux en journée">très lumineux en journée</span>. Bar à l\'angle de la rue ouvre à 6h.';
    var total = 4, found = 0;
    u1.inner.innerHTML = '<p style="font-size:14.5px;line-height:1.9;color:'+C.text+';">'+text+'</p><div class="labo-cap" style="text-align:left;">Trouvés : <span id="rgN">0</span> / '+total+'</div>';
    var style = document.createElement('style');
    style.textContent = '.rg-hit{cursor:pointer;border-bottom:1px dashed '+C.accent+';} .rg-hit.found{color:'+C.good+';border-bottom-color:'+C.good+';font-weight:700;}';
    document.head.appendChild(style);
    var WHY = {
      'Ascenseur unique': 'Un seul ascenseur pour monter caméras, éclairage et décor au 3e étage — un vrai goulot d\'étranglement à l\'installation, à prévoir dans le planning.',
      'Rue résidentielle calme': 'Calme à 14h ne veut rien dire à 6h — les riverains dorment encore, et un camion de production qui décharge peut déclencher des plaintes immédiates.',
      'tableau à 16A seulement': 'Un tableau à 16A ne supportera jamais l\'éclairage professionnel d\'un tournage — il faudra un groupe électrogène, donc un budget et une autorisation supplémentaires.',
      'très lumineux en journée': 'Vérifié à 14h en plein jour — mais le tournage est à 6h du matin, où cette même pièce sera plongée dans la pénombre. La lumière naturelle qui a séduit au repérage n\'existera pas à l\'heure du tournage.'
    };
    u1.inner.querySelectorAll('.rg-hit').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.classList.contains('found')) return;
        el.classList.add('found'); found++;
        u1.inner.querySelector('#rgN').textContent = found;
        var w = el.getAttribute('data-w');
        LaboCore.say(u1.fb, '<b>'+w+' —</b> '+WHY[w] + (found===total ? '<br><br><b>Les 4 sont trouvés.</b> C\'est exactement le principe du repérage à l\'heure réelle du tournage : ce qu\'on voit à 14h ne dit presque rien de ce qu\'on trouvera à 6h.' : ''), 'good');
      });
    });
  });
})();
