(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#10151c', panel:'#181e27', text:'#eef1f5', dim:'#8b93a0', accent:'#4a7fd6', accent2:'#8b93a0', border:'rgba(238,241,245,.14)', good:'#3ecf8e', bad:'#c9524a', display:"'Work Sans',sans-serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="revision-scenario"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Une nouvelle version du scénario arrive — que fais-tu ?', 'Cinq situations liées au contrôle de version. Choisis le bon réflexe à chaque fois.');
    var Q = [
      { s: 'Le réalisateur t\'envoie 3 pages modifiées par email, sans préciser la couleur de révision.', opts: ['Je les distribue telles quelles à l\'équipe', 'Je demande la couleur de révision avant toute diffusion'], good: 1, why: 'Sans couleur de révision, personne ne peut savoir si sa version est à jour — c\'est la base absolue du contrôle de version au cinéma. Ne jamais diffuser une page non datée/colorée.' },
      { s: 'La DP te dit qu\'elle travaille encore sur les pages bleues alors que le scénario est passé aux pages roses.', opts: ['Ce n\'est pas grave, elle rattrapera', 'Je lui envoie immédiatement les pages roses et confirme qu\'elle les a bien reçues'], good: 1, why: 'Un chef de poste qui prépare sur une version obsolète peut faire des choix (décor, matériel, budget) totalement caducs — c\'est exactement le genre d\'erreur silencieuse que le rôle existe pour empêcher.' },
      { s: 'Deux départements ont chacun une version différente de la dernière révision.', opts: ['Je diffuse une nouvelle version unique à tout le monde, avec accusé de réception', 'Je laisse chacun garder sa version, ça se recoupera au tournage'], good: 0, why: 'Une divergence entre deux départements ne se résout jamais toute seule — la reforcer à une seule source de vérité, avec confirmation de réception, est le seul moyen de la refermer proprement.' },
      { s: 'Une scène est coupée du scénario la veille du tournage.', opts: ['Je préviens uniquement le planning', 'Je vérifie l\'impact sur TOUS les départements concernés (déco, costumes, figuration, régie) avant de valider'], good: 1, why: 'Une scène coupée libère du temps, mais peut aussi annuler une location de décor, une figuration réservée, un accessoire déjà loué — chaque département doit être vérifié, pas seulement le planning.' },
      { s: 'Tu reçois une révision 10 minutes avant l\'impression des feuilles de service du lendemain.', opts: ['Je l\'intègre quand même, même dans l\'urgence, plutôt que de la reporter au lendemain', 'Je l\'ignore pour ce soir et l\'intègre demain'], good: 0, why: 'Une révision non intégrée à temps peut faire tourner toute une équipe sur une scène qui n\'existe plus — mieux vaut retarder légèrement l\'envoi que distribuer une feuille de service déjà fausse.' }
    ];
    var qi = 0;
    function render() {
      var q = Q[qi];
      u1.inner.innerHTML = '<p style="font-size:14.5px;color:'+C.text+';line-height:1.6;margin-bottom:14px;"><b>'+(qi+1)+'/'+Q.length+' —</b> '+q.s+'</p><div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;">' + q.opts.map(function(o,i){return '<button class="labo-btn" data-i="'+i+'" style="text-align:left;">'+o+'</button>';}).join('') + '</div>';
      u1.fb.className = 'labo-fb';
      u1.inner.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          var ok = +b.getAttribute('data-i') === q.good;
          LaboCore.say(u1.fb, (ok?'<b>Bon réflexe.</b> ':'<b>Le bon réflexe : '+q.opts[q.good]+'.</b> ')+q.why + (qi<Q.length-1?'<br><br><button class="labo-btn" id="cpNext">Suivant →</button>':'<br><br><b>Terminé.</b> Le fil conducteur : chaque révision est une info qui doit atteindre TOUT le monde, en même temps, sans exception.'), ok?'good':'bad');
          var next = u1.fb.querySelector('#cpNext');
          if (next) next.addEventListener('click', function () { qi++; render(); });
        });
      });
    }
    render();
  });
})();
