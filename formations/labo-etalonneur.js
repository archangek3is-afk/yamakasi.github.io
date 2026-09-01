(function () {
  'use strict';
  if (!window.LaboCore) return;
  var LaboCore = window.LaboCore;
  LaboCore.ready(function () {
    LaboCore.theme({ bg:'#0a0c0d', panel:'#131617', text:'#eef2f1', dim:'#8a938f', accent:'#2fa89e', accent2:'#e4a94a', border:'rgba(238,242,241,.14)', good:'#2fa89e', bad:'#c9524a', display:"'Manrope',sans-serif", mono:"'IBM Plex Mono',monospace" });
    var C = LaboCore.colors;
    var a1 = document.querySelector('[data-labo="lift-gamma-gain"]');
    if (!a1) return;
    var u1 = LaboCore.shell(a1, 'Labo', 'La roue à trois voies, en direct', 'Lift touche les ombres, gamma les tons moyens, gain les hautes lumières. Bouge les trois et observe ce que chacun contrôle vraiment sur l\'image.');
    u1.inner.innerHTML =
      '<div class="labo-scene"><svg id="etScene" viewBox="0 0 320 180" style="width:100%;height:auto;display:block;">' +
      '<rect width="320" height="180" fill="#1a1a1a"/>' +
      '<rect x="0" y="0" width="320" height="60" fill="#0a0a0a" id="etShadow"/>' +
      '<rect x="0" y="60" width="320" height="60" fill="#707070" id="etMid"/>' +
      '<rect x="0" y="120" width="320" height="60" fill="#d8d8d8" id="etHigh"/>' +
      '<text x="10" y="35" font-family="' + C.mono + '" font-size="10" fill="#888">OMBRES</text>' +
      '<text x="10" y="95" font-family="' + C.mono + '" font-size="10" fill="#aaa">TONS MOYENS</text>' +
      '<text x="10" y="155" font-family="' + C.mono + '" font-size="10" fill="#333">HAUTES LUMIÈRES</text>' +
      '</svg></div>' +
      '<div class="labo-ctl">' +
      '<label>Lift (ombres) <span class="labo-val" id="etLiftV">0</span></label><input type="range" id="etLift" min="-40" max="40" value="0">' +
      '<label>Gamma (tons moyens) <span class="labo-val" id="etGammaV">0</span></label><input type="range" id="etGamma" min="-40" max="40" value="0">' +
      '<label>Gain (hautes lumières) <span class="labo-val" id="etGainV">0</span></label><input type="range" id="etGain" min="-40" max="40" value="0">' +
      '</div>';
    var lift = u1.inner.querySelector('#etLift'), gamma = u1.inner.querySelector('#etGamma'), gain = u1.inner.querySelector('#etGain');
    var liftV = u1.inner.querySelector('#etLiftV'), gammaV = u1.inner.querySelector('#etGammaV'), gainV = u1.inner.querySelector('#etGainV');
    var sh = u1.inner.querySelector('#etShadow'), mid = u1.inner.querySelector('#etMid'), hi = u1.inner.querySelector('#etHigh');
    function clamp(v){ return Math.max(0, Math.min(255, v)); }
    function update() {
      var l = +lift.value, g = +gamma.value, n = +gain.value;
      liftV.textContent = l; gammaV.textContent = g; gainV.textContent = n;
      var shv = clamp(20 + l * 2), mv = clamp(112 + g * 2), hv = clamp(216 + n * 2);
      sh.setAttribute('fill', 'rgb(' + shv + ',' + shv + ',' + shv + ')');
      mid.setAttribute('fill', 'rgb(' + mv + ',' + mv + ',' + mv + ')');
      hi.setAttribute('fill', 'rgb(' + hv + ',' + hv + ',' + hv + ')');
      var touched = [Math.abs(l)>8?'lift':null, Math.abs(g)>8?'gamma':null, Math.abs(n)>8?'gain':null].filter(Boolean);
      if (touched.length === 0) { u1.fb.className = 'labo-fb'; return; }
      var msgs = { lift:'Le lift bouge — remarque qu\'il touche presque uniquement le bandeau OMBRES, les hautes lumières restent stables.', gamma:'Le gamma bouge — c\'est la roue la plus utilisée en premier, elle change l\'ambiance générale sans jamais vraiment toucher les extrêmes noir/blanc.', gain:'Le gain bouge — il agit sur les HAUTES LUMIÈRES, les ombres restent quasiment intactes.' };
      LaboCore.say(u1.fb, msgs[touched[touched.length-1]], 'good');
    }
    [lift, gamma, gain].forEach(function(i){ i.addEventListener('input', update); });
    update();
  });
})();
