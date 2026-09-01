(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#1B2A4A', panel:'#22335a', text:'#f0f2ee', dim:'#a8b2c4', accent:'#FF5A5F', accent2:'#a8b2c4', border:'rgba(240,242,238,.16)', good:'#3ecf8e', bad:'#FF5A5F', display:"'Syne',sans-serif", mono:"'Poppins',sans-serif" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="canal-message"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Quel canal pour quel objectif ?', 'Quatre objectifs de campagne. Pour chacun, choisis le canal le plus adapté — pas le plus à la mode.');
    var Q = [
      { g: 'Faire connaître l\'existence du film à un public large, plusieurs mois avant la sortie', opts: ['Affichage physique + bande-annonce large diffusion', 'Community management quotidien sur Instagram'], good: 0, why: 'Pour une notoriété de masse en amont, la portée brute prime sur l\'engagement fin — l\'affichage et une bande-annonce largement distribuée touchent un volume que le community management seul ne peut pas atteindre à ce stade.' },
      { g: 'Convertir une communauté déjà acquise en achats de préventes la semaine du lancement', opts: ['Une nouvelle campagne d\'affichage', 'Community management ciblé + relances directes'], good: 1, why: 'Cette audience connaît déjà le film — l\'enjeu n\'est plus la découverte mais la conversion, ce que fait un community management actif bien mieux qu\'un affichage généraliste à ce stade tardif.' },
      { g: 'Obtenir une couverture presse qui légitime le film auprès des critiques', opts: ['Relations presse et influenceurs ciblés', 'Publicité payante sur les réseaux sociaux'], good: 0, why: 'La légitimité critique ne s\'achète pas en publicité — elle se construit par des relations presse construites en amont, avec des angles rédactionnels pensés pour chaque média.' },
      { g: 'Mesurer si la campagne a réellement vendu des billets, pas juste généré de l\'engagement', opts: ['Suivre les impressions et le taux d\'engagement', 'Suivre le CTR vers la billetterie et les préventes réelles'], good: 1, why: 'Impressions et engagement sont des indicateurs intermédiaires — le seul KPI qui compte vraiment à la fin est le nombre d\'entrées. Une campagne à 10M d\'impressions et 0 clic vers la billetterie n\'a pas atteint son objectif.' }
    ];
    var qi = 0;
    function render() {
      var q = Q[qi];
      u1.inner.innerHTML = '<p style="font-size:14.5px;color:'+C.text+';line-height:1.6;margin-bottom:14px;"><b>'+(qi+1)+'/'+Q.length+' —</b> '+q.g+'</p><div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;">' + q.opts.map(function(o,i){return '<button class="labo-btn" data-i="'+i+'" style="text-align:left;">'+o+'</button>';}).join('') + '</div>';
      u1.fb.className = 'labo-fb';
      u1.inner.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          var ok = +b.getAttribute('data-i') === q.good;
          LaboCore.say(u1.fb, (ok?'<b>Exact.</b> ':'<b>Plutôt : '+q.opts[q.good]+'.</b> ')+q.why + (qi<Q.length-1?'<br><br><button class="labo-btn" id="cfNext">Suivant →</button>':'<br><br><b>Terminé.</b> Le principe qui relie tout : chaque étape de la campagne (découverte, conversion, légitimité, mesure) a son propre canal le plus efficace — le bon réflexe n\'est jamais "le même partout".'), ok?'good':'bad');
          var next = u1.fb.querySelector('#cfNext');
          if (next) next.addEventListener('click', function () { qi++; render(); });
        });
      });
    }
    render();
  });
})();
