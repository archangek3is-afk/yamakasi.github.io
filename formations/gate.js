/**
 * OKAPI STUDIOS — Centre de formation
 * Vérifie qu'un visiteur a un accès valide (?token=...) avant d'afficher le manuel.
 * Doit être servi depuis le même dossier que Code.gs pointe (SITE_BASE), aux côtés
 * de chaque manuel HTML.
 */
(function(){
  // Remplace par l'URL /exec obtenue après déploiement de Code.gs (Apps Script)
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbtOmEY1MQF9K119ilIURwwnOH4IulD0dkKwxofhUqTM1DslW4IyzvI0CR-V4FjAgxUw/exec";

  var scriptTag = document.currentScript;
  var manual = scriptTag.getAttribute('data-manual');
  var params = new URLSearchParams(window.location.search);
  var token = params.get('token');

  function setMsg(text){
    var el = document.getElementById('gateMsg');
    if (el) el.textContent = text;
  }
  function hideRequestLink(){
    var el = document.getElementById('gateRequestLink');
    if (el) el.style.display = 'none';
  }
  function unlock(){
    document.body.classList.add('gate-unlocked');
  }

  if (!token) {
    setMsg("Ce manuel est réservé aux personnes ayant demandé et obtenu l'accès.");
    return;
  }

  if (APPS_SCRIPT_URL.indexOf('COLLE_ICI') === 0) {
    setMsg("Le système d'accès n'est pas encore configuré (URL Apps Script manquante).");
    return;
  }

  var cbName = 'gateCb_' + Math.random().toString(36).slice(2);
  window[cbName] = function(res){
    if (res.approved && (res.manual === manual || res.manual === 'all')) {
      unlock();
      try { localStorage.setItem('gate_' + manual, token); } catch(e){}
    } else if (res.status === 'En attente') {
      setMsg("Ta demande est en cours d'examen. Tu recevras un email dès qu'elle sera validée.");
      hideRequestLink();
    } else if (res.status === 'Refusé') {
      setMsg("Cette demande d'accès n'a pas été validée.");
      hideRequestLink();
    } else {
      setMsg("Ce lien n'est plus valide. Demande un nouvel accès ci-dessous.");
    }
    delete window[cbName];
    loader.remove();
  };

  var loader = document.createElement('script');
  loader.src = APPS_SCRIPT_URL + '?check=1&token=' + encodeURIComponent(token) + '&callback=' + cbName;
  document.body.appendChild(loader);
})();
