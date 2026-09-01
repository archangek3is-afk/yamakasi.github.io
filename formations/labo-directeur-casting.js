(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#171514', panel:'#201d1a', text:'#f4efe8', dim:'#a89a8c', accent:'#a89a8c', accent2:'#c9524a', border:'rgba(244,239,232,.14)', good:'#7a9a6e', bad:'#c9524a', display:"'DM Serif Display',serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="self-tape"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Vert ou rouge — évalue cette self-tape', 'Cinq observations sur une bande d\'essai reçue. Pour chacune, dis si c\'est un signal encourageant ou un vrai problème à régler avant de la revisionner sérieusement.');
    var Q = [
      { o: 'La lumière est plate et le cadrage un peu large, mais le jeu est précis et les intentions sont claires.', good: true, why: 'La forme est perfectible, mais ce n\'est jamais rédhibitoire — un directeur de casting sait regarder au-delà d\'un mauvais éclairage. Le jeu, lui, ne se maquille pas.' },
      { o: 'La scène est jouée sans jamais varier de rythme ni d\'intention du début à la fin.', good: false, why: 'Un jeu plat, sans variation interne, est un vrai signal d\'alerte — même avec une belle image. La performance doit respirer, pas rester sur une seule note.' },
      { o: 'L\'acteur regarde légèrement à côté de la caméra plutôt que dans l\'objectif.', good: true, why: 'C\'est même recommandé pour une scène à deux — regarder légèrement à côté de l\'objectif simule un partenaire de jeu et rend l\'échange plus crédible qu\'un regard caméra frontal.' },
      { o: 'Le son est saturé et une partie du texte est inaudible.', good: false, why: 'Contrairement à l\'image, un son inexploitable empêche littéralement d\'évaluer la performance — c\'est un problème technique qui, lui, doit être corrigé avant tout revisionnage.' },
      { o: 'L\'acteur a fait 3 prises différentes et envoyé la meilleure, pas la première.', good: true, why: 'C\'est le principe même de la self-tape — contrairement à une audition en salle, le candidat a le temps de chercher. Envoyer sa meilleure prise n\'est pas de la triche, c\'est l\'usage.' }
    ];
    var qi = 0;
    function render() {
      var q = Q[qi];
      u1.inner.innerHTML =
        '<p style="font-size:14.5px;color:' + C.text + ';line-height:1.6;margin-bottom:14px;"><b>' + (qi+1) + '/' + Q.length + ' —</b> ' + q.o + '</p>' +
        '<div style="display:flex;gap:8px;"><button class="labo-btn" data-a="1">🟢 Signal encourageant</button><button class="labo-btn" data-a="0">🔴 Problème à régler</button></div>';
      u1.fb.className = 'labo-fb';
      u1.inner.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          var ok = (b.getAttribute('data-a') === '1') === q.good;
          LaboCore.say(u1.fb, (ok ? '<b>Exact.</b> ' : '<b>Pas tout à fait.</b> ') + q.why + (qi < Q.length-1 ? '<br><br><button class="labo-btn" id="dcNext">Suivant →</button>' : '<br><br><b>Terminé.</b> Le réflexe à garder : sépare toujours ce qui relève de la forme (réparable) de ce qui relève du jeu (le vrai critère).'), ok ? 'good' : 'bad');
          var next = u1.fb.querySelector('#dcNext');
          if (next) next.addEventListener('click', function () { qi++; render(); });
        });
      });
    }
    render();
  });
})();
