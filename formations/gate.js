/**
 * OKAPI STUDIOS — Centre de formation
 * Connexion par email a chaque visite. Aucun token dans l'URL : l'email
 * saisi est verifie en direct contre la liste des acces approuves, et
 * chaque tentative (reussie ou non) est journalisee cote serveur.
 */
(function(){
  // URL /exec du deploiement Apps Script (Code.gs)
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLNVnXaY7Zr0E4xczwJbX74rrPfkRleZBuwlrflLlD0bickCK3dXgUW2u-abypLAy-xw/exec";

  var scriptTag = document.currentScript;
  var manual = scriptTag.getAttribute('data-manual');

  function setMsg(text){
    var el = document.getElementById('gateMsg');
    if (el) el.textContent = text;
  }
  function unlock(email){
    document.body.classList.add('gate-unlocked');
    /* Persiste l'email pour que chapter-lock.js puisse syncer avec le serveur */
    try { localStorage.setItem('okapi_email', email); } catch(e) {}
    /* Signale aux autres scripts que l'accès vient d'être accordé */
    document.dispatchEvent(new CustomEvent('okapi:unlocked', { detail: { email: email } }));
  }

  function init(){
    var form = document.getElementById('gateLoginForm');
    var input = document.getElementById('gateEmailInput');
    var btn = document.getElementById('gateLoginBtn');
    if (!form || !input || !btn) return;

    if (APPS_SCRIPT_URL.indexOf('COLLE_ICI') === 0) {
      setMsg("Le systeme d'acces n'est pas encore configure (URL Apps Script manquante).");
      return;
    }

    form.addEventListener('submit', function(evt){
      evt.preventDefault();
      var email = input.value.trim();
      if (!email) return;

      var originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';
      setMsg('Verification en cours...');

      var cbName = 'gateCb_' + Math.random().toString(36).slice(2);
      var timeoutId = setTimeout(function(){
        if (window[cbName]) {
          setMsg("La verification a pris trop de temps. Reessaie.");
          btn.disabled = false;
          btn.textContent = originalLabel;
          delete window[cbName];
        }
      }, 12000);

      window[cbName] = function(res){
        clearTimeout(timeoutId);
        btn.disabled = false;
        btn.textContent = originalLabel;
        if (res && res.approved) {
          unlock(email);
        } else {
          setMsg("Cet email n'a pas d'acces autorise a ce manuel. Verifie l'adresse, ou demande l'acces ci-dessous.");
        }
        delete window[cbName];
        loaderScript.remove();
      };

      var loaderScript = document.createElement('script');
      loaderScript.src = APPS_SCRIPT_URL + '?login=1&email=' + encodeURIComponent(email) +
        '&manuel=' + encodeURIComponent(manual) + '&callback=' + cbName;
      document.body.appendChild(loaderScript);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
