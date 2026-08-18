/**
 * OKAPI STUDIOS — Système de progression par chapitres v4.0
 *
 * Trois formats détectés automatiquement :
 *   A — Standard  : .chapitre[data-ch]  (14 manuels accordion)
 *   B — Deco      : section.chapter[id^="ch"]  (decoration-cinema)
 *   C — Acteur    : #acte1 / #acte2  (acteur-vivant)
 *
 * Deux modes de complétion par chapitre :
 *   TEXTAREA — exercice rédigé en ligne (≥100 car.) — manuels standard
 *   FORM     — livraison via Google Form (photos, audio…) — 3 manuels pratiques
 *
 * Progression sauvegardée dans localStorage (cache) ET dans Google Sheets
 * via Apps Script (source de vérité — permet réinitialisation admin).
 */
(function () {
  'use strict';

  /* ─── Configuration ──────────────────────────────────────────── */
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLNVnXaY7Zr0E4xczwJbX74rrPfkRleZBuwlrflLlD0bickCK3dXgUW2u-abypLAy-xw/exec';
  var MIN_CHARS = 100;

  /* Emails admins — accès complet sans progression requise */
  var ADMIN_EMAILS = ['archangek.3is@gmail.com'];

  /*
   * Configuration Google Forms — granularité par chapitre.
   * email / ch / text = entry IDs des champs pré-remplis.
   * Le champ "ch" reçoit l'index du chapitre (0-8) en chiffre seul,
   * cohérent avec le paramètre &ch= envoyé à checkForm côté Apps Script.
   * chapters[] = index des chapitres qui utilisent le Form (livrable
   *   photo/audio) ; les autres chapitres du même manuel utilisent
   *   automatiquement le textarea standard.
   *
   */
  var FORM_CONFIGS = {
    'decoration-cinema': {
      url:   'https://docs.google.com/forms/d/e/1FAIpQLSegfrRWJMvMz2dyE3l2IRD9qxZ68iWWVQwD7SmGpuTGy34akg/viewform',
      email: '1544973329',
      ch:    '1289460951',
      text:  '1104388559',
      chapters: [0,1,2,3,4,5,6,7,8]  /* tous — chaque exercice est photo/planche */
    },
    'directeur-photographie': {
      url:   'https://docs.google.com/forms/d/e/1FAIpQLSdjgmcJdUv1ldmwTuL2qPbwNxLL8hSWSv2A_syXXfcZnFY7xQ/viewform',
      email: '1544973329',
      ch:    '1289460951',
      text:  '1104388559',
      chapters: [1,2,3]  /* Ex02 (deux focales), Ex03 (une lampe), Ex04 (chasse aux mélanges) */
    },
    'ingenieur-son': {
      url:   'https://docs.google.com/forms/d/e/1FAIpQLScr_ntSBt-0mJa7NUS1XGcjOkSUiZaIxyvWFp13Tw_YfCwzRw/viewform',
      email: '1544973329',
      ch:    '1289460951',
      text:  '1104388559',
      chapters: [2]  /* Ex03 — "Enregistre-toi avec ton téléphone", seul exercice audio */
    },
    'scenariste': {
      url:   'https://docs.google.com/forms/d/e/1FAIpQLScVdO3bpxrJvJzzW4Nr4o9gO2Wb9QIrDFnzazDohOHvm-FmgA/viewform',
      email: '1544973329',
      ch:    '1289460951',
      text:  '1104388559',
      chapters: [7]  /* Ex08 — "Pitche à voix haute... Enregistre-toi", seul exercice audio */
    }
    /* costumiere et regisseur-general retirés : aucun de leurs exercices
       n'exige un livrable fichier — ils repassent en textarea standard
       sur tous leurs chapitres, comme les 10 autres manuels classiques. */
  };

  var _manual      = null;
  var _email       = null;
  var _chapters    = null;
  var _quizSection = null;
  var _format      = null; /* 'A' | 'B' | 'C' */

  function chapterUsesForm(chIndex) {
    var cfg = FORM_CONFIGS[_manual];
    return !!(cfg && cfg.chapters && cfg.chapters.indexOf(chIndex) !== -1);
  }
  function isFormManual() { return !!FORM_CONFIGS[_manual]; }
  /* isFormManual() reste utilisée telle quelle pour initDeco (Format B,
     decoration-cinema uniquement) — tous ses chapitres sont dans chapters[]. */
  function isAdmin() { return _email && ADMIN_EMAILS.indexOf(_email.toLowerCase().trim()) !== -1; }

  /* ─── CSS injecté ─────────────────────────────────────────────── */
  document.head.insertAdjacentHTML('beforeend', '<style>\
/* === Format A : accordion standard === */\
.chapitre.ch-locked{opacity:.42;}\
.chapitre.ch-locked .ch-head{cursor:not-allowed !important;}\
.chapitre.ch-locked .ch-body{display:none !important;max-height:0 !important;}\
.chapitre.ch-locked .ch-chev{display:none !important;}\
.ch-lock-label{display:none;align-items:center;gap:8px;\
  font-family:var(--mono,monospace);font-size:10px;color:#8a8a85;\
  letter-spacing:.07em;text-transform:uppercase;}\
.chapitre.ch-locked .ch-lock-label{display:flex;}\
.ch-done-label{display:none;align-items:center;gap:8px;\
  font-family:var(--mono,monospace);font-size:10px;color:#7a9a7a;\
  letter-spacing:.07em;text-transform:uppercase;}\
.chapitre.ch-done .ch-done-label{display:flex;}\
.chapitre.ch-done:not(.ch-locked) .ch-chev{color:#7a9a7a !important;}\
/* === Textarea exercice (A) — fond clair (parchemin) === */\
.ch-exo-wrap{margin-top:22px;border-top:1px solid rgba(0,0,0,.1);padding-top:18px;}\
.ch-exo-label{display:block;margin-bottom:8px;\
  font-family:var(--mono,monospace);font-size:10px;\
  color:#5a5550;letter-spacing:.08em;text-transform:uppercase;}\
.ch-exo-ta{\
  display:block;width:100%;box-sizing:border-box;\
  min-height:120px;padding:12px 14px;\
  background:#fff !important;border:1px solid rgba(0,0,0,.18);\
  color:#1a1a18 !important;-webkit-text-fill-color:#1a1a18 !important;\
  font-family:var(--mono,monospace);font-size:13px;\
  line-height:1.7;resize:vertical;transition:border-color .2s;\
}\
.ch-exo-ta:focus{outline:none;border-color:var(--rouge,#e4312b);}\
.ch-exo-ta:disabled{background:#f0ece4 !important;color:#555 !important;\
  -webkit-text-fill-color:#555 !important;opacity:.6;cursor:not-allowed;resize:none;}\
.ch-exo-counter{margin-top:6px;font-family:var(--mono,monospace);font-size:10px;\
  color:#888;text-align:right;letter-spacing:.05em;}\
.ch-exo-counter.ok{color:#4a7a4a;}\
/* === Bouton complétion textarea (A + C) === */\
.ch-complete-btn{\
  display:block;width:100%;margin-top:16px;padding:15px 22px;\
  background:transparent;border:1px solid #e4312b;color:#e4312b;\
  font-family:var(--mono,monospace);font-size:11px;\
  letter-spacing:.1em;text-transform:uppercase;\
  cursor:pointer;text-align:center;transition:background .2s,color .2s;\
}\
.ch-complete-btn:hover:not(:disabled){background:#e4312b;color:#f4f1e8;}\
.ch-complete-btn:disabled{border-color:#555;color:#555;cursor:not-allowed;}\
/* === Form widget (A + B) — thème sombre === */\
.ch-form-wrap{\
  margin-top:22px;border-top:1px solid rgba(244,241,232,.12);padding-top:18px;\
}\
.ch-form-desc{\
  font-family:var(--mono,monospace);font-size:11px;color:#8a8a85;\
  letter-spacing:.05em;line-height:1.7;margin-bottom:14px;\
}\
.ch-form-open-btn{\
  display:block;width:100%;padding:14px 20px;margin-bottom:10px;\
  background:#e4312b;border:none;color:#f4f1e8;\
  font-family:var(--mono,monospace);font-size:11px;letter-spacing:.1em;\
  text-transform:uppercase;cursor:pointer;text-align:center;\
  transition:opacity .2s;\
}\
.ch-form-open-btn:hover:not(:disabled){opacity:.82;}\
.ch-form-open-btn:disabled{background:#444;cursor:not-allowed;}\
.ch-form-verify-btn{\
  display:block;width:100%;padding:12px 20px;\
  background:transparent;border:1px solid #555;color:#666;\
  font-family:var(--mono,monospace);font-size:11px;letter-spacing:.1em;\
  text-transform:uppercase;text-align:center;transition:border-color .2s,color .2s;\
  cursor:not-allowed;\
}\
.ch-form-verify-btn:not(:disabled){\
  border-color:#e4312b;color:#e4312b;cursor:pointer;\
}\
.ch-form-verify-btn:not(:disabled):hover{background:#e4312b;color:#f4f1e8;}\
.ch-form-status{\
  margin-top:8px;font-family:var(--mono,monospace);font-size:10px;\
  text-align:center;letter-spacing:.05em;min-height:16px;\
}\
.ch-form-status-err{color:#e4312b;}\
.ch-form-status-ok{color:#7a9a7a;}\
/* === Form widget — thème clair (decoration-cinema) === */\
.ch-form-wrap-deco{\
  margin:18px 0 12px;border-top:1px solid var(--ligne,#ccc);padding-top:16px;\
}\
.ch-form-wrap-deco .ch-form-desc{color:var(--encre-dim,#777);}\
.ch-form-wrap-deco .ch-form-open-btn{\
  background:var(--prusse,#1F4E5F);color:var(--papier,#faf7f0);\
}\
.ch-form-wrap-deco .ch-form-verify-btn:not(:disabled){\
  border-color:var(--prusse,#1F4E5F);color:var(--prusse,#1F4E5F);\
}\
.ch-form-wrap-deco .ch-form-verify-btn:not(:disabled):hover{\
  background:var(--prusse,#1F4E5F);color:var(--papier,#faf7f0);\
}\
.ch-form-wrap-deco .ch-form-status-err{color:var(--rose,#c97b63);}\
.ch-form-wrap-deco .ch-form-status-ok{color:var(--vert,#4a7a4a);}\
/* === Textarea exercice — Format B (deco clair) === */\
.ch-exo-wrap-deco{margin:18px 0 12px;border-top:1px solid var(--ligne,#ccc);padding-top:16px;}\
.ch-exo-label-deco{display:block;margin-bottom:8px;\
  font-family:var(--mono,monospace);font-size:10px;\
  color:var(--encre-dim,#777);letter-spacing:.08em;text-transform:uppercase;}\
.ch-exo-ta-deco{\
  display:block;width:100%;box-sizing:border-box;\
  min-height:110px;padding:11px 13px;\
  background:var(--papier,#faf7f0);border:1px solid var(--ligne,#ccc);\
  color:var(--encre,#1a1a18);font-family:var(--body,Georgia,serif);font-size:13.5px;\
  line-height:1.7;resize:vertical;transition:border-color .2s;\
}\
.ch-exo-ta-deco:focus{outline:none;border-color:var(--prusse,#1F4E5F);}\
.ch-exo-ta-deco:disabled{opacity:.5;cursor:not-allowed;resize:none;}\
.ch-exo-counter-deco{margin-top:5px;font-family:var(--mono,monospace);font-size:10px;\
  color:var(--encre-dim,#777);text-align:right;letter-spacing:.05em;}\
.ch-exo-counter-deco.ok{color:var(--vert,#4a7a4a);}\
/* === Format C : acteur-vivant === */\
.acte-locked>*:not(.acte-shield){display:none !important;}\
.ch-exo-wrap-acte{margin-top:22px;border-top:1px solid rgba(201,150,60,.2);padding-top:18px;}\
.ch-exo-label-acte{display:block;margin-bottom:8px;\
  font-family:var(--mono,monospace);font-size:10px;\
  color:var(--or,#c9963c);letter-spacing:.08em;text-transform:uppercase;}\
.ch-exo-ta-acte{\
  display:block;width:100%;box-sizing:border-box;\
  min-height:120px;padding:12px 14px;\
  background:rgba(201,150,60,.05);border:1px solid rgba(201,150,60,.25);\
  color:var(--ivoire,#f4f0e2);font-family:var(--mono,monospace);font-size:13px;\
  line-height:1.7;resize:vertical;transition:border-color .2s;\
}\
.ch-exo-ta-acte:focus{outline:none;border-color:var(--or,#c9963c);}\
.ch-exo-ta-acte:disabled{opacity:.5;cursor:not-allowed;resize:none;}\
.ch-exo-counter-acte{margin-top:6px;font-family:var(--mono,monospace);font-size:10px;\
  color:rgba(201,150,60,.6);text-align:right;letter-spacing:.05em;}\
.ch-exo-counter-acte.ok{color:var(--or,#c9963c);}\
/* === Format B gate === */\
section.chapter.ch-locked>*:not(.chapter-head):not(.deco-gate){display:none !important;}\
.deco-gate{\
  display:none;padding:28px 20px;text-align:center;margin-bottom:0;\
  border:1px dashed var(--encre-dim,#9a9a95);background:var(--platre,#f5f0e8);\
}\
section.chapter.ch-locked .deco-gate{display:block;}\
.deco-gate p{font-family:var(--mono,monospace);font-size:11px;\
  color:var(--encre-dim,#777);text-transform:uppercase;letter-spacing:.08em;}\
/* === Statut neutre (en attente) === */\
.ch-form-status-info{color:#b8a56a;}\
/* === Quiz gate === */\
#quiz.quiz-gated>*:not(.quiz-gate-okapi){display:none !important;}\
.quiz-gate-okapi{\
  display:none;padding:48px 24px;text-align:center;\
  border:1px solid rgba(244,241,232,.14);background:rgba(20,20,23,.85);\
}\
#quiz.quiz-gated .quiz-gate-okapi{display:block;}\
.quiz-gate-okapi .qg-icon{font-size:28px;margin-bottom:14px;}\
.quiz-gate-okapi p{\
  font-family:var(--mono,monospace);font-size:11px;color:#8a8a85;\
  text-transform:uppercase;letter-spacing:.08em;line-height:1.9;\
}\
.quiz-gate-okapi .qg-count{\
  margin-top:14px;font-weight:700;font-size:20px;color:#e4312b;\
  font-family:var(--display,sans-serif);\
}\
</style>');

  /* ─── Helpers localStorage ────────────────────────────────────── */
  function getManual() {
    var gs = document.querySelector('script[src*="gate.js"][data-manual]');
    return gs ? gs.getAttribute('data-manual') : null;
  }
  function storageKey()   { return 'okapi_ch_' + _manual; }
  function exStorageKey() { return 'okapi_ex_' + _manual; }
  function getP()  { try { return JSON.parse(localStorage.getItem(storageKey()))  || {}; } catch(e) { return {}; } }
  function saveP(p){ try { localStorage.setItem(storageKey(), JSON.stringify(p)); } catch(e) {} }
  function getEx() { try { return JSON.parse(localStorage.getItem(exStorageKey())) || {}; } catch(e) { return {}; } }
  function saveEx(ex){ try { localStorage.setItem(exStorageKey(), JSON.stringify(ex)); } catch(e) {} }

  /* ─── Sync serveur (Apps Script) ─────────────────────────────── */
  function jsonpCall(params, cb) {
    var cbName = 'okapiCb_' + Math.random().toString(36).slice(2);
    var sc;
    var tid = setTimeout(function () {
      delete window[cbName];
      if (sc && sc.parentNode) sc.parentNode.removeChild(sc);
      if (cb) cb(null);
    }, 10000);
    window[cbName] = function (data) {
      clearTimeout(tid);
      delete window[cbName];
      if (sc && sc.parentNode) sc.parentNode.removeChild(sc);
      if (cb) cb(data);
    };
    var qs = Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    sc = document.createElement('script');
    sc.src = APPS_SCRIPT_URL + '?' + qs + '&callback=' + cbName;
    document.body.appendChild(sc);
  }

  /* ─── Auth helpers ───────────────────────────────────────────── */
  function getPwd() {
    return sessionStorage.getItem('okapi_pwd') || '';
  }
  function handleAuthError(data) {
    if (data && data.ok === false && data.error === 'Authentification requise') {
      var existing = document.getElementById('okapi-auth-err');
      if (existing) return true;
      var msg = document.createElement('div');
      msg.id = 'okapi-auth-err';
      msg.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;' +
        'background:#c0392b;color:#fff;text-align:center;padding:14px 20px;' +
        'font-family:system-ui,sans-serif;font-size:13px;letter-spacing:.02em;';
      msg.textContent = 'Votre session a expir\u00e9 — rechargez la page pour vous reconnecter.';
      document.body.appendChild(msg);
      return true;
    }
    return false;
  }

  function serverSync(done) {
    if (!_email || !_manual) { if (done) done(); return; }
    jsonpCall({ action: 'getProgress', email: _email, manual: _manual, password: getPwd() }, function (data) {
      if (handleAuthError(data)) { if (done) done(); return; }
      if (data && typeof data === 'object' && !data.error) saveP(data);
      if (done) done();
    });
  }
  function serverSetChapter(chIndex) {
    if (!_email || !_manual) return;
    jsonpCall({ action: 'setChapter', email: _email, manual: _manual, ch: chIndex, password: getPwd() }, function (data) { handleAuthError(data); });
  }
  function serverSaveExerciseText(chIndex, text) {
    if (!_email || !_manual) return;
    jsonpCall({ action: 'saveExerciseText', email: _email, manual: _manual, ch: chIndex, text: text, password: getPwd() }, function (data) { handleAuthError(data); });
  }
  function serverGetExerciseText(chIndex, cb) {
    if (!_email || !_manual) return;
    jsonpCall({ action: 'getExerciseText', email: _email, manual: _manual, ch: chIndex, password: getPwd() }, function (data) {
      if (handleAuthError(data)) return;
      if (cb) cb(data);
    });
  }
  function reapply() {
    if (_format === 'A') applyStandard(_chapters, _quizSection);
    else if (_format === 'B') applyDeco(_chapters, _quizSection);
    else if (_format === 'C') applyActeur(_chapters, _quizSection);
  }

  /* ─── Form widget (manuels pratiques) ────────────────────────── */
  function buildFormWidget(chIndex, isDeco, onVerified) {
    var wrap = document.createElement('div');
    wrap.className = isDeco ? 'ch-form-wrap ch-form-wrap-deco' : 'ch-form-wrap';

    var desc = document.createElement('p');
    desc.className = 'ch-form-desc';
    desc.textContent = 'Cet exercice demande une livraison (photos, fichiers\u2026). '
      + 'Compl\u00e8te le formulaire puis clique sur \u00ab\u00a0V\u00e9rifier\u00a0\u00bb pour valider le chapitre.';

    var openBtn = document.createElement('button');
    openBtn.className = 'ch-form-open-btn';
    openBtn.textContent = 'Faire l\u2019exercice \u2192';

    var formOpenedKey = 'okapi_form_' + _manual + '_' + chIndex;
    var verifyBtn = document.createElement('button');
    verifyBtn.className = 'ch-form-verify-btn';
    verifyBtn.textContent = 'V\u00e9rifier ma soumission';
    verifyBtn.disabled = !localStorage.getItem(formOpenedKey);

    var statusMsg = document.createElement('div');
    statusMsg.className = 'ch-form-status';

    openBtn.addEventListener('click', function () {
      var cfg = FORM_CONFIGS[_manual];
      var url = cfg.url
        + '?usp=pp_url'
        + '&entry.' + cfg.email + '=' + encodeURIComponent(_email || '')
        + '&entry.' + cfg.ch    + '=' + encodeURIComponent(String(chIndex))
        + '&entry.' + cfg.text  + '=';
      window.open(url, '_blank');
      try { localStorage.setItem(formOpenedKey, '1'); } catch(e) {}
      setTimeout(function () { verifyBtn.disabled = false; }, 1500);
    });

    /* ── Polling automatique ── */
    var pollTimer = null;
    function stopPolling() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }
    function handleCheckResult(data) {
      if (handleAuthError(data)) { stopPolling(); return; }
      var st = data && data.status;
      if (data && (data.ok || st === 'valide')) {
        stopPolling();
        statusMsg.className = 'ch-form-status ch-form-status-ok';
        statusMsg.textContent = '\u2713 Soumission accept\u00e9e \u2014 chapitre valid\u00e9\u00a0!';
        onVerified();
      } else if (st === 'en_attente') {
        statusMsg.className = 'ch-form-status ch-form-status-info';
        statusMsg.textContent = 'En attente de v\u00e9rification. Si votre soumission est valid\u00e9e le chapitre suivant sera disponible.';
        verifyBtn.textContent = 'V\u00e9rifier \u00e0 nouveau';
        verifyBtn.disabled = false;
        if (!pollTimer) {
          pollTimer = setInterval(function () {
            jsonpCall({ action: 'checkForm', email: _email, manual: _manual, ch: chIndex, password: getPwd() }, handleCheckResult);
          }, 17000);
        }
      } else if (st === 'refuse') {
        stopPolling();
        statusMsg.className = 'ch-form-status ch-form-status-err';
        statusMsg.textContent = 'Ta soumission a \u00e9t\u00e9 refus\u00e9e \u2014 revois ton exercice et renvoie-le.';
        verifyBtn.textContent = 'R\u00e9essayer';
        verifyBtn.disabled = false;
      } else if (st === 'aucune_soumission') {
        stopPolling();
        statusMsg.className = 'ch-form-status ch-form-status-err';
        statusMsg.textContent = 'Aucune soumission trouv\u00e9e pour ce chapitre. Compl\u00e8te le formulaire puis clique sur V\u00e9rifier.';
        verifyBtn.textContent = 'R\u00e9essayer';
        verifyBtn.disabled = false;
      } else {
        /* Erreur réseau / timeout JSONP (data === null).
           Si le polling est déjà actif, ignorer ce tick silencieusement
           et laisser le prochain interval réessayer — NE PAS stopper. */
        if (pollTimer) return;
        statusMsg.className = 'ch-form-status ch-form-status-err';
        statusMsg.textContent = 'Soumission non trouv\u00e9e. V\u00e9rifie avoir valid\u00e9 le formulaire, puis r\u00e9essaie.';
        verifyBtn.textContent = 'R\u00e9essayer';
        verifyBtn.disabled = false;
      }
    }
    window.addEventListener('beforeunload', stopPolling);

    verifyBtn.addEventListener('click', function () {
      if (verifyBtn.disabled) return;
      if (!_email) {
        statusMsg.className = 'ch-form-status ch-form-status-err';
        statusMsg.textContent = 'Connecte-toi d\u2019abord pour v\u00e9rifier.';
        return;
      }
      stopPolling();
      verifyBtn.disabled = true;
      verifyBtn.textContent = 'V\u00e9rification\u2026';
      statusMsg.className = 'ch-form-status';
      statusMsg.textContent = '';
      jsonpCall({ action: 'checkForm', email: _email, manual: _manual, ch: chIndex, password: getPwd() }, handleCheckResult);
    });

    wrap.appendChild(desc);
    wrap.appendChild(openBtn);
    wrap.appendChild(verifyBtn);
    wrap.appendChild(statusMsg);

    return { wrap: wrap, openBtn: openBtn, verifyBtn: verifyBtn, statusMsg: statusMsg };
  }

  /* ─── Textarea widget (manuels standard) ─────────────────────── */
  function buildTextarea(taClass, labelClass, counterClass, placeholder) {
    var wrapClass = taClass === 'ch-exo-ta' ? 'ch-exo-wrap'
      : taClass === 'ch-exo-ta-deco' ? 'ch-exo-wrap-deco' : 'ch-exo-wrap-acte';
    var wrap = document.createElement('div');
    wrap.className = wrapClass;
    var label = document.createElement('label');
    label.className = labelClass;
    label.textContent = 'Ta r\u00e9ponse \u2014 r\u00e9dige ci-dessous (' + MIN_CHARS + '\u00a0car. min.)';
    var ta = document.createElement('textarea');
    ta.className = taClass;
    ta.placeholder = placeholder || 'Rédige ta réponse ici…';
    ta.rows = 5;
    var counter = document.createElement('div');
    counter.className = counterClass;
    counter.textContent = '0\u00a0/\u00a0' + MIN_CHARS;
    wrap.appendChild(label);
    wrap.appendChild(ta);
    wrap.appendChild(counter);
    return { wrap: wrap, ta: ta, counter: counter };
  }

  /* ─── Quiz gate ───────────────────────────────────────────────── */
  function buildQuizGate(quizSection, total, unit) {
    var gate = document.createElement('div');
    gate.className = 'quiz-gate-okapi';
    gate.innerHTML =
      '<div class="qg-icon">\uD83D\uDD12</div>' +
      '<p>Terminez les\u00a0' + total + '\u00a0' + unit +
      ' pour acc\u00e9der au quiz\u00a0final.</p>' +
      '<div class="qg-count"></div>';
    quizSection.insertBefore(gate, quizSection.firstChild);
  }
  function refreshQuizGate(quizSection, done, total) {
    var cnt = quizSection.querySelector('.qg-count');
    if (isAdmin() || done >= total) {
      quizSection.classList.remove('quiz-gated');
    } else {
      quizSection.classList.add('quiz-gated');
      if (cnt) cnt.textContent = done + '\u00a0/\u00a0' + total + ' compl\u00e9t\u00e9s';
    }
  }

  /* ══════════════════════════════════════════════════════════════
     FORMAT A — Standard : .chapitre[data-ch]
  ══════════════════════════════════════════════════════════════ */
  function initStandard(chapters) {
    var quizSection = _quizSection;
    if (quizSection) buildQuizGate(quizSection, chapters.length, 'chapitres');
    var ex = getEx();
    var useForm; /* recalculé par chapitre plus bas */

    chapters.forEach(function (ch, i) {
      useForm = chapterUsesForm(i);
      /* Header badges */
      var head = ch.querySelector('.ch-head');
      if (head) {
        head.insertAdjacentHTML('beforeend',
          '<span class="ch-lock-label">\uD83D\uDD12\u00a0\u00a0Terminez le chapitre pr\u00e9c\u00e9dent</span>' +
          '<span class="ch-done-label">\u2713\u00a0\u00a0Termin\u00e9</span>');
        head.addEventListener('click', function (e) {
          if (ch.classList.contains('ch-locked')) {
            e.stopImmediatePropagation(); e.preventDefault();
          }
        }, true);
      }

      var body = ch.querySelector('.ch-body');
      if (!body) return;
      var exercice = body.querySelector('.exercice');

      if (useForm) {
        /* ── Mode Form ── */
        var fw = buildFormWidget(i, false, function () {
          var p = getP();
          p['ch' + i] = 1;
          saveP(p);
          serverSetChapter(i);
          applyStandard(chapters, quizSection);
          var next = chapters[i + 1];
          if (next && !next.classList.contains('ch-locked')) {
            document.querySelectorAll('.chapitre.open').forEach(function (c) { c.classList.remove('open'); });
            next.classList.add('open');
            setTimeout(function () { next.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180);
          } else if (!next && quizSection) {
            setTimeout(function () { quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180);
          }
        });
        if (exercice) exercice.appendChild(fw.wrap);
        else body.appendChild(fw.wrap);
        ch._lockBtn     = fw.verifyBtn;
        ch._lockOpenBtn = fw.openBtn;
        ch._lockTa      = null;

      } else {
        /* ── Mode Textarea ── */
        var t = buildTextarea('ch-exo-ta', 'ch-exo-label', 'ch-exo-counter', 'Rédige ta réponse ici…');
        var ta = t.ta; var counter = t.counter;
        if (ex['ch' + i]) ta.value = ex['ch' + i];

        var btn = document.createElement('button');
        btn.className = 'ch-complete-btn';
        btn.textContent = 'R\u00e9dige l\u2019exercice pour continuer';
        btn.disabled = true;

        function updateCounter() {
          var len = ta.value.trim().length;
          counter.textContent = len + '\u00a0/\u00a0' + MIN_CHARS;
          counter.classList.toggle('ok', len >= MIN_CHARS);
          if (!getP()['ch' + i]) {
            btn.disabled = len < MIN_CHARS;
            btn.textContent = len >= MIN_CHARS
              ? 'Exercice termin\u00e9 \u2014 chapitre suivant \u2192'
              : 'R\u00e9dige l\u2019exercice pour continuer';
          }
        }
        ta.addEventListener('input', function () {
          var curEx = getEx(); curEx['ch' + i] = ta.value; saveEx(curEx);
          updateCounter();
        });
        if (exercice) exercice.appendChild(t.wrap); else body.appendChild(t.wrap);
        body.appendChild(btn);
        ch._lockBtn     = btn;
        ch._lockTa      = ta;
        ch._lockOpenBtn = null;

        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          var p = getP(); p['ch' + i] = 1; saveP(p);
          serverSetChapter(i);
          serverSaveExerciseText(i, ta.value.trim());
          applyStandard(chapters, quizSection);
          var next = chapters[i + 1];
          if (next && !next.classList.contains('ch-locked')) {
            document.querySelectorAll('.chapitre.open').forEach(function (c) { c.classList.remove('open'); });
            next.classList.add('open');
            setTimeout(function () { next.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180);
          } else if (!next && quizSection) {
            setTimeout(function () { quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180);
          }
        });
        updateCounter();
        serverGetExerciseText(i, function (res) {
          if (res && res.found && res.text) {
            ta.value = res.text;
            var curEx = getEx(); curEx['ch' + i] = res.text; saveEx(curEx);
            updateCounter();
          }
        });
      }
    });

    applyStandard(chapters, quizSection);
  }

  function applyStandard(chapters, quizSection) {
    var p = getP(); var done = 0;
    var admin = isAdmin();
    chapters.forEach(function (ch, i) {
      var isDone = admin || !!p['ch' + i];
      var btn     = ch._lockBtn;
      var ta      = ch._lockTa;
      var openBtn = ch._lockOpenBtn;

      if (admin || i === 0) { ch.classList.remove('ch-locked'); }
      else {
        if (p['ch' + (i - 1)]) { ch.classList.remove('ch-locked'); }
        else { ch.classList.add('ch-locked'); ch.classList.remove('open'); }
      }

      if (isDone) {
        ch.classList.add('ch-done');
        if (ta)      { ta.disabled = true; }
        if (openBtn) { openBtn.textContent = '\u2713 Exercice soumis'; openBtn.disabled = true; }
        if (btn)     { btn.textContent = '\u2713 Chapitre termin\u00e9'; btn.disabled = true; }
        done++;
      } else {
        ch.classList.remove('ch-done');
        if (ta)  { ta.disabled = false; }
        if (openBtn) { openBtn.disabled = false; }
        if (btn && !ta) {
          /* form mode — bouton verify reste tel quel, géré par buildFormWidget */
        } else if (btn && ta) {
          var hasEnough = ta.value.trim().length >= MIN_CHARS;
          btn.disabled = !hasEnough;
          btn.textContent = hasEnough
            ? 'Exercice termin\u00e9 \u2014 chapitre suivant \u2192'
            : 'R\u00e9dige l\u2019exercice pour continuer';
        }
      }
    });
    if (quizSection) refreshQuizGate(quizSection, done, chapters.length);
  }

  /* ══════════════════════════════════════════════════════════════
     FORMAT B — decoration-cinema : section.chapter[id^="ch"]
  ══════════════════════════════════════════════════════════════ */
  function initDeco(chapters) {
    var quizSection = _quizSection;
    var useForm = isFormManual(); /* true pour decoration-cinema */

    if (quizSection) {
      buildQuizGate(quizSection, chapters.length, 'chapitres');
      var qg = quizSection.querySelector('.quiz-gate-okapi');
      if (qg) {
        qg.style.background = 'var(--platre,#f5f0e8)';
        qg.style.border = '1px dashed var(--encre-dim,#999)';
        var qp = qg.querySelector('p');
        if (qp) qp.style.color = 'var(--encre-dim,#666)';
        var qc = qg.querySelector('.qg-count');
        if (qc) qc.style.color = 'var(--prusse,#1F4E5F)';
      }
    }

    var ex = getEx();

    chapters.forEach(function (ch, i) {
      /* Panneau verrou */
      var dg = document.createElement('div');
      dg.className = 'deco-gate';
      dg.innerHTML =
        '<div style="font-size:20px;margin-bottom:10px;">\uD83D\uDD12</div>' +
        '<p>Terminez l\u2019exercice du chapitre pr\u00e9c\u00e9dent pour continuer</p>';
      ch.insertBefore(dg, ch.firstChild);

      var doneRow = ch.querySelector('.done-row');
      var check   = ch.querySelector('.exo-check');

      if (useForm) {
        /* ── Mode Form ── */
        /* Désactiver la checkbox native — la validation passe par le form */
        if (check) { check.disabled = true; check.style.opacity = '.4'; }

        var fw = buildFormWidget(i, true, function () {
          var p = getP(); p['ch' + i] = 1; saveP(p);
          serverSetChapter(i);
          if (check) check.checked = true;
          applyDeco(chapters, quizSection);
        });
        if (doneRow) doneRow.parentNode.insertBefore(fw.wrap, doneRow);
        else ch.appendChild(fw.wrap);

        ch._lockTa      = null;
        ch._lockOpenBtn = fw.openBtn;
        ch._lockVerifyBtn = fw.verifyBtn;

      } else {
        /* ── Mode Textarea ── */
        var t = buildTextarea('ch-exo-ta-deco', 'ch-exo-label-deco', 'ch-exo-counter-deco', 'Rédige ta réponse ici…');
        var ta = t.ta; var counter = t.counter;
        if (check) check.disabled = true;
        if (ex['ch' + i]) ta.value = ex['ch' + i];

        function updateDecoCounter() {
          var len = ta.value.trim().length;
          counter.textContent = len + '\u00a0/\u00a0' + MIN_CHARS;
          counter.classList.toggle('ok', len >= MIN_CHARS);
          if (check && !getP()['ch' + i]) check.disabled = len < MIN_CHARS;
        }
        ta.addEventListener('input', function () {
          var curEx = getEx(); curEx['ch' + i] = ta.value; saveEx(curEx);
          updateDecoCounter();
        });
        if (doneRow) doneRow.parentNode.insertBefore(t.wrap, doneRow);
        else ch.appendChild(t.wrap);
        ch._lockTa = ta;
        ch._lockOpenBtn = null;
        ch._lockVerifyBtn = null;

        if (check) {
          check.addEventListener('change', function () {
            if (!check.checked) return;
            if (ta.value.trim().length < MIN_CHARS) { check.checked = false; return; }
            var p = getP(); p['ch' + i] = 1; saveP(p);
            serverSetChapter(i);
            serverSaveExerciseText(i, ta.value.trim());
            applyDeco(chapters, quizSection);
          });
        }
        updateDecoCounter();
        serverGetExerciseText(i, function (res) {
          if (res && res.found && res.text) {
            ta.value = res.text;
            var curEx = getEx(); curEx['ch' + i] = res.text; saveEx(curEx);
            updateDecoCounter();
          }
        });
      }
    });

    applyDeco(chapters, quizSection);
  }

  function applyDeco(chapters, quizSection) {
    var p = getP(); var done = 0;
    var admin = isAdmin();
    chapters.forEach(function (ch, i) {
      var isDone = admin || !!p['ch' + i];
      if (isDone) done++;

      if (admin || i === 0) { ch.classList.remove('ch-locked'); }
      else {
        if (p['ch' + (i - 1)]) { ch.classList.remove('ch-locked'); }
        else { ch.classList.add('ch-locked'); }
      }

      var ta         = ch._lockTa;
      var check      = ch.querySelector('.exo-check');
      var openBtn    = ch._lockOpenBtn;
      var verifyBtn  = ch._lockVerifyBtn;

      if (isDone) {
        if (ta)        { ta.disabled = true; }
        if (openBtn)   { openBtn.textContent = '\u2713 Exercice soumis'; openBtn.disabled = true; }
        if (verifyBtn) { verifyBtn.textContent = '\u2713 Chapitre valid\u00e9'; verifyBtn.disabled = true; }
        if (check)     { check.checked = true; check.disabled = true; }
      } else {
        if (ta)        { ta.disabled = false; }
        if (openBtn)   { openBtn.disabled = false; }
        if (check && ta) check.disabled = !ta || ta.value.trim().length < MIN_CHARS;
        if (check && !ta) check.disabled = true; /* form mode: checkbox non utilisée */
      }
    });
    if (quizSection) refreshQuizGate(quizSection, done, chapters.length);
  }

  /* ══════════════════════════════════════════════════════════════
     FORMAT C — acteur-vivant : #acte1 + #acte2
  ══════════════════════════════════════════════════════════════ */
  function initActeur(actes) {
    var quizSection = _quizSection;
    if (quizSection) buildQuizGate(quizSection, actes.length, 'modules');
    var ex = getEx();

    actes.forEach(function (acte, i) {
      if (i > 0) {
        var shield = document.createElement('div');
        shield.className = 'acte-shield';
        shield.id = 'acte-shield-' + i;
        shield.style.cssText =
          'padding:44px 24px;text-align:center;' +
          'border:1px solid rgba(244,241,232,.12);background:rgba(20,20,23,.9);';
        shield.innerHTML =
          '<div style="font-size:26px;margin-bottom:14px;">\uD83D\uDD12</div>' +
          '<p style="font-family:var(--mono,monospace);font-size:11px;color:#8a8a85;' +
          'text-transform:uppercase;letter-spacing:.08em;line-height:1.9;">' +
          'Terminez le Module\u00a0' + i + ' pour acc\u00e9der au Module\u00a0' + (i + 1) + '</p>';
        acte.insertBefore(shield, acte.firstChild);
      }

      var t = buildTextarea('ch-exo-ta-acte', 'ch-exo-label-acte', 'ch-exo-counter-acte', 'Rédige ta réponse à l\'exercice ici…');
      var ta = t.ta; var counter = t.counter;
      if (ex['ch' + i]) ta.value = ex['ch' + i];

      var btn = document.createElement('button');
      btn.className = 'ch-complete-btn';
      btn.style.cssText = 'border-color:var(--or,#c9963c);color:var(--or,#c9963c);max-width:480px;margin-left:auto;margin-right:auto;';
      btn.textContent = 'R\u00e9dige l\u2019exercice pour continuer';
      btn.disabled = true;

      function updateActeCounter() {
        var len = ta.value.trim().length;
        counter.textContent = len + '\u00a0/\u00a0' + MIN_CHARS;
        counter.classList.toggle('ok', len >= MIN_CHARS);
        if (!getP()['ch' + i]) {
          btn.disabled = len < MIN_CHARS;
          btn.textContent = len >= MIN_CHARS ? 'Module termin\u00e9 \u2014 continuer \u2192' : 'R\u00e9dige l\u2019exercice pour continuer';
        }
      }
      ta.addEventListener('input', function () {
        var curEx = getEx(); curEx['ch' + i] = ta.value; saveEx(curEx);
        updateActeCounter();
      });

      acte.appendChild(t.wrap);
      acte.appendChild(btn);
      acte._lockBtn = btn;
      acte._lockTa  = ta;

      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var p = getP(); p['ch' + i] = 1; saveP(p);
        serverSetChapter(i);
        serverSaveExerciseText(i, ta.value.trim());
        applyActeur(actes, quizSection);
        var next = actes[i + 1];
        if (next) { setTimeout(function () { next.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180); }
        else if (quizSection) { setTimeout(function () { quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180); }
      });
      updateActeCounter();
      serverGetExerciseText(i, function (res) {
        if (res && res.found && res.text) {
          ta.value = res.text;
          var curEx = getEx(); curEx['ch' + i] = res.text; saveEx(curEx);
          updateActeCounter();
        }
      });
    });
    applyActeur(actes, quizSection);
  }

  function applyActeur(actes, quizSection) {
    var p = getP(); var done = 0;
    var admin = isAdmin();
    actes.forEach(function (acte, i) {
      var isDone = admin || !!p['ch' + i];
      if (isDone) done++;
      var btn = acte._lockBtn; var ta = acte._lockTa;
      var shield = document.getElementById('acte-shield-' + i);
      if (i > 0) {
        if (admin || p['ch' + (i - 1)]) { acte.classList.remove('acte-locked'); if (shield) shield.style.display = 'none'; }
        else { acte.classList.add('acte-locked'); if (shield) shield.style.display = ''; }
      }
      if (isDone) {
        if (ta)  ta.disabled = true;
        if (btn) { btn.textContent = '\u2713 Module termin\u00e9'; btn.disabled = true; }
      } else {
        if (ta)  ta.disabled = false;
        if (btn) {
          var hasEnough = ta && ta.value.trim().length >= MIN_CHARS;
          btn.disabled = !hasEnough;
          btn.textContent = hasEnough ? 'Module termin\u00e9 \u2014 continuer \u2192' : 'R\u00e9dige l\u2019exercice pour continuer';
        }
      }
    });
    if (quizSection) refreshQuizGate(quizSection, done, actes.length);
  }

  /* ─── Détection du format & initialisation ────────────────────── */
  function init() {
    _manual = getManual();
    if (!_manual) return;
    _email = localStorage.getItem('okapi_email') || null;

    var stdChapters = Array.from(document.querySelectorAll('.chapitre[data-ch]'));
    if (stdChapters.length) {
      _format = 'A'; _chapters = stdChapters;
      _quizSection = document.getElementById('quiz');
      initStandard(stdChapters); return;
    }
    var decoChapters = Array.from(document.querySelectorAll('section.chapter[id^="ch"]'));
    if (decoChapters.length) {
      _format = 'B'; _chapters = decoChapters;
      _quizSection = document.getElementById('quiz');
      initDeco(decoChapters); return;
    }
    var actes = ['acte1', 'acte2'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (actes.length) {
      _format = 'C'; _chapters = actes;
      _quizSection = document.getElementById('quiz');
      initActeur(actes);
    }
  }

  /* ─── Écoute déverrouillage gate ─────────────────────────────── */
  document.addEventListener('okapi:unlocked', function (e) {
    _email = (e.detail && e.detail.email) ? e.detail.email : localStorage.getItem('okapi_email');
    if (_email && _manual) serverSync(function () { reapply(); });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
