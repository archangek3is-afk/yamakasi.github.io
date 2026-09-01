(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#12141a', panel:'#1a1d24', text:'#eef0f3', dim:'#8891a0', accent:'#8891a0', accent2:'#e4a94a', border:'rgba(238,240,243,.14)', good:'#3ecf8e', bad:'#c9524a', display:"'Big Shoulders',sans-serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="contingence"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'Répartis 20 000€ de contingence entre 3 urgences', 'Trois départements réclament simultanément un dépassement. Tu as 20 000€ de contingence, pas plus. Répartis-les avec les curseurs.');
    u1.inner.innerHTML =
      '<div style="font-size:13.5px;line-height:1.7;color:'+C.dim+';margin-bottom:16px;">' +
      '<div><b style="color:'+C.text+';">Déco</b> — un décor extérieur inondé, réparation urgente avant tournage demain (demande : 12 000€)</div>' +
      '<div style="margin-top:6px;"><b style="color:'+C.text+';">Casting</b> — un acteur principal indisponible, remplacement + réécriture express (demande : 9 000€)</div>' +
      '<div style="margin-top:6px;"><b style="color:'+C.text+';">Régie</b> — permis de tournage refusé sur le lieu prévu, relocalisation en urgence (demande : 7 000€)</div></div>' +
      '<div class="labo-ctl">' +
      '<label>Déco <span class="labo-val" id="dpD">0€</span></label><input type="range" id="dpDeco" min="0" max="20000" step="500" value="0">' +
      '<label>Casting <span class="labo-val" id="dpC">0€</span></label><input type="range" id="dpCast" min="0" max="20000" step="500" value="0">' +
      '<label>Régie <span class="labo-val" id="dpR">0€</span></label><input type="range" id="dpReg" min="0" max="20000" step="500" value="0">' +
      '</div><div class="labo-cap" style="text-align:left;">Total alloué : <span id="dpTotal">0€</span> / 20 000€</div>';
    var deco = u1.inner.querySelector('#dpDeco'), cast = u1.inner.querySelector('#dpCast'), reg = u1.inner.querySelector('#dpReg');
    function update() {
      var d = +deco.value, c = +cast.value, r = +reg.value, total = d+c+r;
      u1.inner.querySelector('#dpD').textContent = d+'€'; u1.inner.querySelector('#dpC').textContent = c+'€'; u1.inner.querySelector('#dpR').textContent = r+'€';
      u1.inner.querySelector('#dpTotal').textContent = total+'€';
      if (total > 20000) { LaboCore.say(u1.fb, '<b>Dépassement du budget de contingence lui-même.</b> Tu alloues plus que ce que tu as — ça n\'existe pas dans la vraie vie, il faut trancher, pas tout donner.', 'bad'); return; }
      if (total < 20000) { u1.fb.className = 'labo-fb'; return; }
      var covers = (d>=12000?1:0)+(c>=9000?1:0)+(r>=7000?1:0);
      if (covers === 3) { LaboCore.say(u1.fb, 'Mathématiquement impossible de couvrir les 3 en entier avec 20 000€ (total demandé : 28 000€) — si tu vois ce message, revérifie tes chiffres.', 'bad'); }
      else { LaboCore.say(u1.fb, '<b>Tu as fait un choix — et c\'est le vrai métier.</b> Il n\'y a pas de bonne réponse unique ici : la question qu\'un directeur de production se pose toujours est "lequel de ces 3 problèmes, si je ne le résous pas, arrête complètement le tournage demain ?" C\'est celui-là qui doit être financé en premier, quitte à négocier un délai pour les deux autres.', 'good'); }
    }
    [deco, cast, reg].forEach(function(i){ i.addEventListener('input', update); });
    update();
  });
})();
