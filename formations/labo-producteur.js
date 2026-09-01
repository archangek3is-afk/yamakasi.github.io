(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#0d1210', panel:'#161c19', text:'#f0f2ee', dim:'#8a938e', accent:'#3ecf8e', accent2:'#8a938e', border:'rgba(240,242,238,.14)', good:'#3ecf8e', bad:'#c9524a', display:"'Libre Franklin',sans-serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="atl-btl"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Range ces postes en ATL ou BTL', 'Above the line = ce qu\'on paie pour la VISION (avant tournage). Below the line = ce qu\'on paie pour l\'EXÉCUTION (pendant). Fais glisser chaque poste dans la bonne colonne.');
    var IT = [
      { id:0, t:'Cachet du réalisateur', z:'atl' }, { id:1, t:'Cachet des acteurs principaux', z:'atl' },
      { id:2, t:'Droits d\'adaptation du scénario', z:'atl' }, { id:3, t:'Cachet du producteur exécutif', z:'atl' },
      { id:4, t:'Location de caméras et matériel', z:'btl' }, { id:5, t:'Salaires de l\'équipe technique', z:'btl' },
      { id:6, t:'Post-production et montage', z:'btl' }, { id:7, t:'Catering et logistique de tournage', z:'btl' }
    ];
    var shuffled = IT.slice().sort(function(){return Math.random()-0.5;});
    u1.inner.innerHTML =
      '<div class="labo-dd-pool" id="prPool">' + shuffled.map(function(s){return '<div class="labo-dd-item" draggable="true" data-id="'+s.id+'">'+s.t+'</div>';}).join('') + '</div>' +
      '<div class="labo-grid2" style="margin-top:16px;">' +
      '<div><div style="font-family:'+C.mono+';font-size:11px;color:'+C.dim+';margin-bottom:6px;">ABOVE THE LINE</div><div class="labo-dd-zone" data-z="atl" style="min-height:150px;"></div></div>' +
      '<div><div style="font-family:'+C.mono+';font-size:11px;color:'+C.dim+';margin-bottom:6px;">BELOW THE LINE</div><div class="labo-dd-zone" data-z="btl" style="min-height:150px;"></div></div></div>' +
      '<div style="margin-top:14px;"><button class="labo-btn" id="prCheck">Vérifier</button></div>';
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
    u1.inner.querySelector('#prCheck').addEventListener('click', function () {
      if (Object.keys(placement).length < 8) { LaboCore.say(u1.fb, 'Place les 8 postes avant de vérifier.', 'bad'); return; }
      var correct = 0;
      IT.forEach(function(s){ if (placement[s.id] === s.z) correct++; });
      var ok = correct === 8;
      LaboCore.say(u1.fb, ok ? '<b>Les 8 sont bien placés.</b> Remarque le pattern : l\'ATL, ce sont des personnes et des droits — payés pour QUI ils sont, pas pour combien de temps ils travaillent. Le BTL, c\'est tout ce qui se compte en jours, en heures, en location.' : '<b>'+correct+'/8 bien placés.</b> Le doute vient souvent des cachets — retiens que même un producteur exécutif est ATL, parce qu\'il est payé pour la vision, pas l\'exécution.', ok?'good':'bad');
    });
  });
})();
