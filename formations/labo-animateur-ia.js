(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#0c0b10', panel:'#161419', text:'#f2eee6', dim:'#948d9e', accent:'#9d6ce0', accent2:'#948d9e', border:'rgba(242,238,230,.14)', good:'#7a9a6e', bad:'#c9524a', display:"'Sora',sans-serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="build-prompt"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Construis un prompt cinématographique', 'Glisse un bloc dans chaque catégorie pour assembler un prompt complet. Regarde le résultat final se construire en direct.');
    var CATS = [
      { key: 'shot', label: 'VALEUR DE PLAN', opts: ['Gros plan', 'Plan large', 'Plan moyen'] },
      { key: 'subj', label: 'SUJET', opts: ['une femme d\'une trentaine d\'années, cheveux courts', 'un vieil homme au regard fatigué', 'un enfant seul dans une pièce vide'] },
      { key: 'action', label: 'ACTION', opts: ['regarde par la fenêtre, immobile', 'marche lentement vers la caméra', 'tourne la tête brusquement'] },
      { key: 'light', label: 'LUMIÈRE', opts: ['lumière dorée de fin d\'après-midi', 'clair-obscur dramatique, une seule source', 'lumière plate et froide, ciel couvert'] },
      { key: 'cam', label: 'CAMÉRA / OPTIQUE', opts: ['ARRI Alexa, 50mm, faible profondeur de champ', 'caméra à l\'épaule, 35mm, grain léger', 'Steadicam, 85mm, image très stable'] }
    ];
    var picked = {};
    u1.inner.innerHTML =
      CATS.map(function (c) {
        return '<div style="margin-bottom:14px;"><div style="font-family:'+C.mono+';font-size:10px;color:'+C.dim+';margin-bottom:6px;letter-spacing:.06em;">'+c.label+'</div><div style="display:flex;flex-wrap:wrap;gap:6px;">' +
          c.opts.map(function(o,i){return '<button class="labo-btn" data-cat="'+c.key+'" data-v="'+o.replace(/"/g,'&quot;')+'" style="font-size:10.5px;padding:8px 12px;">'+o+'</button>';}).join('') + '</div></div>';
      }).join('') +
      '<div style="margin-top:8px;padding:14px;border:1px solid '+C.border+';background:'+C.bg+';font-family:'+C.mono+';font-size:12.5px;color:'+C.accent+';line-height:1.7;min-height:50px;" id="promptOut">— choisis un bloc dans chaque catégorie —</div>';
    function refresh() {
      var out = u1.inner.querySelector('#promptOut');
      var order = ['shot','subj','action','light','cam'];
      var parts = order.map(function(k){ return picked[k]; }).filter(Boolean);
      if (parts.length === 0) { out.textContent = '— choisis un bloc dans chaque catégorie —'; return; }
      out.textContent = parts.join(', ') + '.';
      if (Object.keys(picked).length === 5) {
        LaboCore.say(u1.fb, '<b>Prompt complet.</b> Remarque la structure : valeur de plan → sujet → action → lumière → référence caméra/optique réelle. C\'est exactement l\'ordre qui oriente un modèle vers un rendu hyperréaliste plutôt que générique — la caméra et l\'optique réelles ne sont jamais un détail cosmétique.', 'good');
      }
    }
    u1.inner.querySelectorAll('button[data-cat]').forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-cat');
        u1.inner.querySelectorAll('[data-cat="'+cat+'"]').forEach(function(o){ o.classList.remove('on'); });
        b.classList.add('on');
        picked[cat] = b.getAttribute('data-v');
        refresh();
      });
    });
  });
})();
