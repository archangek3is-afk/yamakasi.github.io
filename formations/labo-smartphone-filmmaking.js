(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#0D0D0D', panel:'#161616', text:'#f0f2ee', dim:'#8a938e', accent:'#C6FF3D', accent2:'#8a938e', border:'rgba(240,242,238,.14)', good:'#C6FF3D', bad:'#c9524a', display:"'Plus Jakarta Sans',sans-serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="essentiel-gadget"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Essentiel ou gadget marketing ?', 'Huit accessoires vendus pour le smartphone filmmaking. Classe chacun avant de valider ton budget.');
    var IT = [
      { id:0, t:'Micro-cravate ou micro directionnel externe', z:'essentiel' },
      { id:1, t:'Trépied ou gorillapod avec rotule fluide', z:'essentiel' },
      { id:2, t:'Filtre ND variable', z:'essentiel' },
      { id:3, t:'Batterie externe haute capacité', z:'essentiel' },
      { id:4, t:'Objectif grand-angle clip-on générique', z:'gadget' },
      { id:5, t:'Cage complète à 300€ pour téléphone', z:'gadget' },
      { id:6, t:'Micro à condensateur large membrane (alimentation phantom)', z:'gadget' },
      { id:7, t:'Coque promettant un "rendu optique professionnel"', z:'gadget' }
    ];
    var shuffled = IT.slice().sort(function(){return Math.random()-0.5;});
    u1.inner.innerHTML =
      '<div class="labo-dd-pool" id="sfPool">' + shuffled.map(function(s){return '<div class="labo-dd-item" draggable="true" data-id="'+s.id+'">'+s.t+'</div>';}).join('') + '</div>' +
      '<div class="labo-grid2" style="margin-top:16px;">' +
      '<div><div style="font-family:'+C.mono+';font-size:11px;color:'+C.dim+';margin-bottom:6px;">✅ ESSENTIEL</div><div class="labo-dd-zone" data-z="essentiel" style="min-height:150px;"></div></div>' +
      '<div><div style="font-family:'+C.mono+';font-size:11px;color:'+C.dim+';margin-bottom:6px;">❌ GADGET</div><div class="labo-dd-zone" data-z="gadget" style="min-height:150px;"></div></div></div>' +
      '<div style="margin-top:14px;"><button class="labo-btn" id="sfCheck">Vérifier</button></div>';
    var dragged = null, placement = {};
    u1.inner.querySelectorAll('.labo-dd-item').forEach(function(el){ el.addEventListener('dragstart', function(){ dragged = el; }); });
    u1.inner.querySelectorAll('.labo-dd-zone').forEach(function(zone){
      zone.addEventListener('dragover', function(e){ e.preventDefault(); });
      zone.addEventListener('drop', function(e){
        e.preventDefault(); if (!dragged) return;
        var id = +dragged.getAttribute('data-id');
        zone.appendChild(dragged); dragged.classList.add('placed'); dragged.setAttribute('draggable','false');
        placement[id] = zone.getAttribute('data-z'); dragged = null;
      });
    });
    u1.inner.querySelector('#sfCheck').addEventListener('click', function () {
      if (Object.keys(placement).length < 8) { LaboCore.say(u1.fb, 'Classe les 8 accessoires avant de vérifier.', 'bad'); return; }
      var correct = 0;
      IT.forEach(function(s){ if (placement[s.id] === s.z) correct++; });
      var ok = correct === 8;
      LaboCore.say(u1.fb, ok ? '<b>Les 8 sont bien classés.</b> Retiens l\'ordre d\'investissement : son d\'abord, stabilisation ensuite, optique en dernier — et jamais un objectif clip-on générique à la place de l\'objectif natif, qui reste presque toujours meilleur.' : '<b>'+correct+'/8 bien classés.</b> Le test à appliquer : est-ce que cet accessoire résout un problème réel que tu as rencontré, ou un problème que tu imagines avoir ?', ok?'good':'bad');
    });
  });
})();
