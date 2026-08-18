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
  function unlock(email, pwdCustomized){
    document.body.classList.add('gate-unlocked');
    /* Persiste l'email pour que chapter-lock.js puisse syncer avec le serveur */
    try { localStorage.setItem('okapi_email', email); } catch(e) {}
    /* Signale aux autres scripts que l'accès vient d'être accordé */
    document.dispatchEvent(new CustomEvent('okapi:unlocked', { detail: { email: email, pwdCustomized: !!pwdCustomized } }));
  }

  function init(){
    var form = document.getElementById('gateLoginForm');
    var input = document.getElementById('gateEmailInput');
    var passwordInput = document.getElementById('gatePasswordInput');
    var btn = document.getElementById('gateLoginBtn');
    if (!form || !input || !btn) return;

    if (APPS_SCRIPT_URL.indexOf('COLLE_ICI') === 0) {
      setMsg("Le systeme d'acces n'est pas encore configure (URL Apps Script manquante).");
      return;
    }

    form.addEventListener('submit', function(evt){
      evt.preventDefault();
      var email = input.value.trim();
      var password = passwordInput ? passwordInput.value.trim() : '';
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
          unlock(email, res.pwdCustomized);
        } else {
          setMsg("Email ou mot de passe incorrect, ou acces non autorise a ce manuel. Verifie tes identifiants, ou demande l'acces ci-dessous.");
        }
        delete window[cbName];
        loaderScript.remove();
      };

      function startLogin(ip){
        loaderScript = document.createElement('script');
        loaderScript.src = APPS_SCRIPT_URL + '?login=1&email=' + encodeURIComponent(email) +
          '&password=' + encodeURIComponent(password) +
          '&manuel=' + encodeURIComponent(manual) + '&ip=' + encodeURIComponent(ip || '') +
          '&callback=' + cbName;
        document.body.appendChild(loaderScript);
      }

      var loaderScript;
      /* Recupere l'IP publique du visiteur pour alerter si un meme email se
         connecte depuis une IP jamais vue auparavant. En cas d'echec du
         service (bloque, hors ligne), la connexion continue quand meme
         sans IP plutot que de bloquer l'etudiant. */
      fetch('https://api.ipify.org?format=json')
        .then(function(r){ return r.json(); })
        .then(function(d){ startLogin(d && d.ip); })
        .catch(function(){ startLogin(''); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
