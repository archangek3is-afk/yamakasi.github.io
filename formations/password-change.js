/**
 * OKAPI STUDIOS — Centre de formation
 * Fenetre "Changer mon mot de passe", qui s'affiche automatiquement a
 * chaque connexion tant que le mot de passe n'a pas ete personnalise
 * (statut connu du serveur, colonne "Perso" du Sheet — pas d'une simple
 * memorisation locale). Des qu'un changement reussit, le serveur marque
 * le compte comme personnalise et la fenetre ne revient plus.
 * Entierement auto-contenu : injecte son propre HTML/CSS au chargement.
 */
(function(){
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLNVnXaY7Zr0E4xczwJbX74rrPfkRleZBuwlrflLlD0bickCK3dXgUW2u-abypLAy-xw/exec";

  function init(){
    var style = document.createElement('style');
    style.textContent =
      '.pwd-change-modal{position:fixed;inset:0;z-index:9999;background:rgba(10,9,16,0.92);' +
      'display:none;align-items:center;justify-content:center;padding:20px;}' +
      '.pwd-change-modal.open{display:flex;}' +
      '.pwd-change-box{background:#0A0A0A;border:1px solid #C9A84C;max-width:340px;width:100%;' +
      'padding:28px 24px;font-family:Arial,Helvetica,sans-serif;text-align:center;border-radius:2px;}' +
      '.pwd-change-box h3{color:#F5F0E8;font-size:17px;margin:0 0 18px;font-weight:700;}' +
      '.pwd-change-box input{width:100%;box-sizing:border-box;padding:12px 14px;margin-bottom:10px;' +
      'background:transparent;border:1px solid rgba(255,255,255,.25);color:#F5F0E8;' +
      'font-size:13px;text-align:center;font-family:inherit;border-radius:2px;}' +
      '.pwd-change-box input::placeholder{color:rgba(255,255,255,.4);}' +
      '.pwd-change-box button{width:100%;padding:12px;background:#C9A84C;color:#0A0A0A;border:none;' +
      'font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;' +
      'margin-top:6px;border-radius:2px;font-family:inherit;}' +
      '.pwd-change-box button:disabled{opacity:.6;cursor:default;}' +
      '.pwd-change-box .pwd-close{margin-top:16px;font-size:11px;color:#8a8a85;cursor:pointer;' +
      'text-decoration:underline;}' +
      '.pwd-change-msg{font-size:12px;color:#8a8a85;margin-top:12px;min-height:16px;line-height:1.5;}' +
      '.pwd-banner-overlay{position:fixed;inset:0;z-index:9997;background:rgba(10,9,16,0.92);' +
      'display:none;align-items:center;justify-content:center;padding:20px;}' +
      '.pwd-banner-overlay.open{display:flex;}' +
      '.pwd-banner-box{background:#0A0A0A;border:1px solid #C9A84C;max-width:360px;width:100%;' +
      'padding:30px 26px;font-family:Arial,Helvetica,sans-serif;text-align:center;border-radius:2px;}' +
      '.pwd-banner-box span{color:#F5F0E8;font-size:15px;line-height:1.6;display:block;margin-bottom:22px;}' +
      '.pwd-banner-box button{width:100%;border:none;padding:12px;font-size:12px;font-weight:700;' +
      'text-transform:uppercase;letter-spacing:.5px;cursor:pointer;border-radius:2px;' +
      'font-family:inherit;margin-bottom:10px;}' +
      '.pwd-banner-yes{background:#C9A84C;color:#0A0A0A;}' +
      '.pwd-banner-no{background:transparent;color:#8a8a85;' +
      'border:1px solid rgba(255,255,255,.2)!important;margin-bottom:0!important;}';
    document.head.appendChild(style);

    var banner = document.createElement('div');
    banner.className = 'pwd-banner-overlay';
    banner.innerHTML =
      '<div class="pwd-banner-box">' +
        '<span>\uD83D\uDD11 Envie de personnaliser ton mot de passe ?</span>' +
        '<button class="pwd-banner-yes" id="pwdBannerYes">Le changer maintenant</button>' +
        '<button class="pwd-banner-no" id="pwdBannerNo">Plus tard</button>' +
      '</div>';
    document.body.appendChild(banner);

    var modal = document.createElement('div');
    modal.className = 'pwd-change-modal';
    modal.innerHTML =
      '<div class="pwd-change-box">' +
        '<h3>Changer mon mot de passe</h3>' +
        '<input type="password" id="pwdOld" placeholder="Mot de passe actuel">' +
        '<input type="password" id="pwdNew" placeholder="Nouveau mot de passe">' +
        '<button id="pwdSubmit">Valider</button>' +
        '<div class="pwd-change-msg" id="pwdMsg"></div>' +
        '<div class="pwd-close" id="pwdClose">Fermer</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('pwdClose').addEventListener('click', function(){
      modal.classList.remove('open');
    });
    modal.addEventListener('click', function(e){
      if (e.target === modal) modal.classList.remove('open');
    });

    // Affichage : uniquement pilote par le statut serveur (pwdCustomized
    // transmis par gate.js dans le detail de l'evenement okapi:unlocked).
    // "Plus tard" ferme juste pour cette visite — la fenetre revient a la
    // prochaine connexion tant que le mot de passe n'a pas ete change.
    function showBanner(){
      banner.classList.add('open');
    }
    document.getElementById('pwdBannerYes').addEventListener('click', function(){
      banner.classList.remove('open');
      document.getElementById('pwdMsg').textContent = '';
      modal.classList.add('open');
    });
    document.getElementById('pwdBannerNo').addEventListener('click', function(){
      banner.classList.remove('open');
    });

    document.addEventListener('okapi:unlocked', function(e){
      var customized = e && e.detail && e.detail.pwdCustomized;
      if (!customized) showBanner();
    });

    var btn = document.getElementById('pwdSubmit');
    btn.addEventListener('click', function(){
      var email = '';
      try { email = localStorage.getItem('okapi_email') || ''; } catch(e){}
      var oldPwd = document.getElementById('pwdOld').value.trim();
      var newPwd = document.getElementById('pwdNew').value.trim();
      var msg = document.getElementById('pwdMsg');

      if (!email) { msg.textContent = "Reconnecte-toi d'abord, puis reessaie."; return; }
      if (!oldPwd || !newPwd) { msg.textContent = 'Remplis les deux champs.'; return; }
      if (newPwd.length < 4) { msg.textContent = 'Le nouveau mot de passe est trop court.'; return; }

      var originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';
      msg.textContent = 'Verification en cours...';

      var cbName = 'pwdCb_' + Math.random().toString(36).slice(2);
      var timeoutId = setTimeout(function(){
        if (window[cbName]) {
          msg.textContent = 'La verification a pris trop de temps. Reessaie.';
          btn.disabled = false;
          btn.textContent = originalLabel;
          delete window[cbName];
        }
      }, 12000);

      window[cbName] = function(res){
        clearTimeout(timeoutId);
        btn.disabled = false;
        btn.textContent = originalLabel;
        if (res && res.ok) {
          msg.textContent = 'Mot de passe change avec succes !';
          document.getElementById('pwdOld').value = '';
          document.getElementById('pwdNew').value = '';
        } else {
          msg.textContent = (res && res.error) || 'Ancien mot de passe incorrect.';
        }
        delete window[cbName];
        loader.remove();
      };

      var loader = document.createElement('script');
      loader.src = APPS_SCRIPT_URL + '?action=changePassword&email=' + encodeURIComponent(email) +
        '&oldPassword=' + encodeURIComponent(oldPwd) + '&newPassword=' + encodeURIComponent(newPwd) +
        '&callback=' + cbName;
      document.body.appendChild(loader);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
