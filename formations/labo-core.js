/**
 * OKAPI STUDIOS — L'ÉCOLE OKAPI
 * Socle commun des laboratoires interactifs : habillage visuel + petits
 * utilitaires partagés (shell de module, retour pédagogique). Chaque
 * manuel definit ensuite ses propres jeux dans son propre fichier, en
 * s'appuyant sur window.LaboCore. Theme-agnostique : chaque page fournit
 * ses propres couleurs via LaboCore.theme(...).
 */
(function () {
  'use strict';

  var T = {
    bg: '#141414', panel: '#1c1c1c', text: '#f4f1e8', dim: '#8a8a85',
    accent: '#e4312b', accent2: '#8a8a85', border: 'rgba(244,241,232,.14)',
    good: '#3a8f5c', bad: '#c9524a',
    display: "'Archivo',sans-serif", mono: "'IBM Plex Mono',monospace"
  };

  function injectCSS() {
    var css = [
      '.labo{border:1px solid ' + T.border + ';background:' + T.panel + ';margin:26px 0;border-radius:3px;overflow:hidden;}',
      '.labo-head{padding:14px 18px;border-bottom:1px solid ' + T.border + ';display:flex;align-items:center;gap:10px;flex-wrap:wrap;}',
      '.labo-tag{font-family:' + T.mono + ';font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:' + T.bg + ';background:' + T.accent + ';padding:4px 9px;border-radius:2px;}',
      '.labo-title{font-weight:700;font-size:15px;color:' + T.text + ';font-family:' + T.display + ';}',
      '.labo-body{padding:18px;}',
      '.labo-hint{font-size:13px;line-height:1.65;color:' + T.dim + ';margin:0 0 14px;}',
      '.labo-btn{font-family:' + T.mono + ';font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:10px 16px;border:1px solid ' + T.accent + ';background:transparent;color:' + T.accent + ';cursor:pointer;border-radius:2px;transition:.15s;}',
      '.labo-btn:hover{background:' + T.accent + ';color:' + T.bg + ';}',
      '.labo-btn.on{background:' + T.accent + ';color:' + T.bg + ';}',
      '.labo-fb{margin-top:14px;padding:13px 15px;border-left:3px solid ' + T.accent + ';background:rgba(255,255,255,.04);font-size:13.5px;line-height:1.65;color:' + T.text + ';display:none;}',
      '.labo-fb.show{display:block;}',
      '.labo-fb.good{border-left-color:' + T.good + ';background:rgba(58,143,92,.12);}',
      '.labo-fb.bad{border-left-color:' + T.bad + ';background:rgba(201,82,74,.12);}',
      '.labo-cap{font-size:12.5px;color:' + T.dim + ';text-align:center;margin-top:8px;font-family:' + T.mono + ';}',
      '.labo-ctl label{display:block;font-family:' + T.mono + ';font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:' + T.dim + ';margin:12px 0 5px;}',
      '.labo-ctl input[type=range]{width:100%;accent-color:' + T.accent + ';}',
      '.labo-val{font-family:' + T.mono + ';font-size:11px;color:' + T.accent + ';}',
      '.labo-grid2{display:grid;grid-template-columns:1fr;gap:16px;}',
      '@media(min-width:720px){.labo-grid2{grid-template-columns:1fr 1fr;}}',
      '.labo-scene{border:1px solid ' + T.border + ';border-radius:2px;overflow:hidden;background:' + T.bg + ';}',
      '.labo-card{border:2px solid transparent;border-radius:2px;overflow:hidden;cursor:pointer;background:none;padding:0;}',
      '.labo-card.sel{border-color:' + T.accent + ';}',
      '.labo-dd-pool{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;}',
      '.labo-dd-item{font-size:12.5px;padding:8px 12px;border:1px solid ' + T.border + ';background:' + T.bg + ';color:' + T.text + ';border-radius:2px;cursor:grab;user-select:none;line-height:1.3;}',
      '.labo-dd-item.placed{opacity:.35;cursor:default;}',
      '.labo-dd-zone{border:1px dashed ' + T.border + ';border-radius:2px;min-height:64px;padding:8px;display:flex;flex-direction:column;gap:6px;}',
      '.labo-dd-zone .labo-dd-item{cursor:default;width:100%;box-sizing:border-box;}'
    ].join('');
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function shell(anchor, tag, title, hintHtml) {
    var box = document.createElement('div');
    box.className = 'labo';
    box.innerHTML =
      '<div class="labo-head"><span class="labo-tag">' + tag + '</span>' +
      '<span class="labo-title">' + title + '</span></div>' +
      '<div class="labo-body"><p class="labo-hint">' + hintHtml + '</p>' +
      '<div class="labo-inner"></div>' +
      '<div class="labo-fb"></div></div>';
    anchor.appendChild(box);
    return { inner: box.querySelector('.labo-inner'), fb: box.querySelector('.labo-fb') };
  }

  function say(fb, html, kind) {
    fb.className = 'labo-fb show' + (kind ? ' ' + kind : '');
    fb.innerHTML = html;
  }

  window.LaboCore = {
    theme: function (custom) {
      for (var k in custom) { if (custom.hasOwnProperty(k)) T[k] = custom[k]; }
      injectCSS();
    },
    colors: T,
    shell: shell,
    say: say,
    ready: function (fn) {
      if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', fn); }
      else { fn(); }
    }
  };
})();
