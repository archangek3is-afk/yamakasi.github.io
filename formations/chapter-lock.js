/**
 * OKAPI STUDIOS — Système de progression par chapitres v3.0
 *
 * Trois formats détectés automatiquement :
 *   A — Standard  : .chapitre[data-ch]  (14 manuels accordion)
 *   B — Deco      : section.chapter[id^="ch"]  (decoration-cinema)
 *   C — Acteur    : #acte1 / #acte2  (acteur-vivant)
 *
 * Progression sauvegardée dans localStorage (cache) ET dans Google Sheets
 * via Apps Script (source de vérité — permet réinitialisation admin).
 * Réponses aux exercices sauvegardées dans localStorage uniquement.
 * Chaque chapitre se déverrouille quand l'exercice du précédent est rédigé (≥100 car.)
 * Le quiz final est bloqué jusqu'à completion de tous les chapitres.
 */
(function () {
  'use strict';

  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLNVnXaY7Zr0E4xczwJbX74rrPfkRleZBuwlrflLlD0bickCK3dXgUW2u-abypLAy-xw/exec';
  var MIN_CHARS = 100;

  var _manual = null;
  var _email  = null;
  /* Références gardées pour re-appliquer l'état après sync serveur */
  var _chapters    = null;
  var _quizSection = null;
  var _format      = null; /* 'A' | 'B' | 'C' */

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
/* === Textarea exercice (A) — fond clair car dans .exercice (parchemin) === */\
.ch-exo-wrap{\
  margin-top:22px;\
  border-top:1px solid rgba(0,0,0,.1);\
  padding-top:18px;\
}\
.ch-exo-label{\
  display:block;margin-bottom:8px;\
  font-family:var(--mono,monospace);font-size:10px;\
  color:#5a5550;letter-spacing:.08em;text-transform:uppercase;\
}\
.ch-exo-ta{\
  display:block;width:100%;box-sizing:border-box;\
  min-height:120px;padding:12px 14px;\
  background:#fff !important;\
  border:1px solid rgba(0,0,0,.18);\
  color:#1a1a18 !important;-webkit-text-fill-color:#1a1a18 !important;\
  font-family:var(--mono,monospace);font-size:13px;\
  line-height:1.7;resize:vertical;\
  transition:border-color .2s;\
}\
.ch-exo-ta:focus{outline:none;border-color:var(--rouge,#e4312b);}\
.ch-exo-ta:disabled{background:#f0ece4 !important;color:#555 !important;-webkit-text-fill-color:#555 !important;opacity:.6;cursor:not-allowed;resize:none;}\
.ch-exo-counter{\
  margin-top:6px;font-family:var(--mono,monospace);font-size:10px;\
  color:#888;text-align:right;letter-spacing:.05em;\
}\
.ch-exo-counter.ok{color:#4a7a4a;}\
/* === Bouton de complétion (A + C) === */\
.ch-complete-btn{\
  display:block;width:100%;margin-top:16px;padding:15px 22px;\
  background:transparent;border:1px solid #e4312b;color:#e4312b;\
  font-family:var(--mono,monospace);font-size:11px;\
  letter-spacing:.1em;text-transform:uppercase;\
  cursor:pointer;text-align:center;\
  transition:background .2s,color .2s;\
}\
.ch-complete-btn:hover:not(:disabled){background:#e4312b;color:#f4f1e8;}\
.ch-complete-btn:disabled{border-color:#555;color:#555;cursor:not-allowed;}\
/* === Format B : decoration-cinema === */\
section.chapter.ch-locked>*:not(.chapter-head):not(.deco-gate){display:none !important;}\
.deco-gate{\
  display:none;padding:28px 20px;text-align:center;margin-bottom:0;\
  border:1px dashed var(--encre-dim,#9a9a95);\
  background:var(--platre,#f5f0e8);\
}\
section.chapter.ch-locked .deco-gate{display:block;}\
.deco-gate p{font-family:var(--mono,monospace);font-size:11px;\
  color:var(--encre-dim,#777);text-transform:uppercase;letter-spacing:.08em;}\
/* === Textarea exercice — Format B (deco clair) === */\
.ch-exo-wrap-deco{\
  margin:18px 0 12px;\
  border-top:1px solid var(--ligne,#ccc);\
  padding-top:16px;\
}\
.ch-exo-label-deco{\
  display:block;margin-bottom:8px;\
  font-family:var(--mono,monospace);font-size:10px;\
  color:var(--encre-dim,#777);letter-spacing:.08em;text-transform:uppercase;\
}\
.ch-exo-ta-deco{\
  display:block;width:100%;box-sizing:border-box;\
  min-height:110px;padding:11px 13px;\
  background:var(--papier,#faf7f0);\
  border:1px solid var(--ligne,#ccc);\
  color:var(--encre,#1a1a18);font-family:var(--body,Georgia,serif);font-size:13.5px;\
  line-height:1.7;resize:vertical;\
  transition:border-color .2s;\
}\
.ch-exo-ta-deco:focus{outline:none;border-color:var(--prusse,#1F4E5F);}\
.ch-exo-ta-deco:disabled{opacity:.5;cursor:not-allowed;resize:none;}\
.ch-exo-counter-deco{\
  margin-top:5px;font-family:var(--mono,monospace);font-size:10px;\
  color:var(--encre-dim,#777);text-align:right;letter-spacing:.05em;\
}\
.ch-exo-counter-deco.ok{color:var(--vert,#4a7a4a);}\
/* === Format C : acteur-vivant === */\
.acte-locked>*:not(.acte-shield){display:none !important;}\
/* === Textarea exercice — Format C (deco sombre or) === */\
.ch-exo-wrap-acte{\
  margin-top:22px;\
  border-top:1px solid rgba(201,150,60,.2);\
  padding-top:18px;\
}\
.ch-exo-label-acte{\
  display:block;margin-bottom:8px;\
  font-family:var(--mono,monospace);font-size:10px;\
  color:var(--or,#c9963c);letter-spacing:.08em;text-transform:uppercase;\
}\
.ch-exo-ta-acte{\
  display:block;width:100%;box-sizing:border-box;\
  min-height:120px;padding:12px 14px;\
  background:rgba(201,150,60,.05);\
  border:1px solid rgba(201,150,60,.25);\
  color:var(--ivoire,#f4f0e2);font-family:var(--mono,monospace);font-size:13px;\
  line-height:1.7;resize:vertical;\
  transition:border-color .2s;\
}\
.ch-exo-ta-acte:focus{outline:none;border-color:var(--or,#c9963c);}\
.ch-exo-ta-acte:disabled{opacity:.5;cursor:not-allowed;resize:none;}\
.ch-exo-counter-acte{\
  margin-top:6px;font-family:var(--mono,monospace);font-size:10px;\
  color:rgba(201,150,60,.6);text-align:right;letter-spacing:.05em;\
}\
.ch-exo-counter-acte.ok{color:var(--or,#c9963c);}\
/* === Quiz gate (tous formats) === */\
#quiz.quiz-gated>*:not(.quiz-gate-okapi){display:none !important;}\
.quiz-gate-okapi{\
  display:none;padding:48px 24px;text-align:center;\
  border:1px solid rgba(244,241,232,.14);\
  background:rgba(20,20,23,.85);\
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

  function getP() {
    try { return JSON.parse(localStorage.getItem(storageKey())) || {}; }
    catch (e) { return {}; }
  }
  function saveP(p) {
    try { localStorage.setItem(storageKey(), JSON.stringify(p)); }
    catch (e) {}
  }
  function getEx() {
    try { return JSON.parse(localStorage.getItem(exStorageKey())) || {}; }
    catch (e) { return {}; }
  }
  function saveEx(ex) {
    try { localStorage.setItem(exStorageKey(), JSON.stringify(ex)); }
    catch (e) {}
  }

  /* ─── Sync serveur (Apps Script) ────────────────────────────── */
  function jsonpCall(params, cb) {
    var cbName = 'okapiCb_' + Math.random().toString(36).slice(2);
    var tid = setTimeout(function () {
      delete window[cbName];
      if (sc && sc.parentNode) sc.parentNode.removeChild(sc);
      if (cb) cb(null);
    }, 8000);
    window[cbName] = function (data) {
      clearTimeout(tid);
      delete window[cbName];
      if (sc && sc.parentNode) sc.parentNode.removeChild(sc);
      if (cb) cb(data);
    };
    var qs = Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    var sc = document.createElement('script');
    sc.src = APPS_SCRIPT_URL + '?' + qs + '&callback=' + cbName;
    document.body.appendChild(sc);
  }

  /* Récupère la progression depuis le serveur et écrase le localStorage */
  function serverSync(done) {
    if (!_email || !_manual) { if (done) done(); return; }
    jsonpCall({ action: 'getProgress', email: _email, manual: _manual }, function (data) {
      if (data && typeof data === 'object' && !data.error) {
        saveP(data); /* le serveur est la source de vérité */
      }
      if (done) done();
    });
  }

  /* Notifie le serveur qu'un chapitre est complété */
  function serverSetChapter(chIndex) {
    if (!_email || !_manual) return;
    jsonpCall({ action: 'setChapter', email: _email, manual: _manual, ch: chIndex }, null);
  }

  /* Re-applique l'état après sync serveur */
  function reapply() {
    if (_format === 'A') applyStandard(_chapters, _quizSection);
    else if (_format === 'B') applyDeco(_chapters, _quizSection);
    else if (_format === 'C') applyActeur(_chapters, _quizSection);
  }

  /* ─── Construit une textarea d'exercice ──────────────────────── */
  function buildTextarea(taClass, labelClass, counterClass, placeholder) {
    var wrapClass = taClass === 'ch-exo-ta'
      ? 'ch-exo-wrap'
      : taClass === 'ch-exo-ta-deco'
        ? 'ch-exo-wrap-deco'
        : 'ch-exo-wrap-acte';

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

  /* ─── Quiz gate helper ────────────────────────────────────────── */
  function buildQuizGate(quizSection, total, unit) {
    var gate = document.createElement('div');
    gate.className = 'quiz-gate-okapi';
    gate.innerHTML =
      '<div class="qg-icon">\uD83D\uDD12</div>' +
      '<p>Terminez les\u00a0' + total + '\u00a0' + unit +
      ' pour acc\u00e9der au quiz\u00a0final.</p>' +
      '<div class="qg-count"></div>';
    quizSection.insertBefore(gate, quizSection.firstChild);
    return gate;
  }

  function refreshQuizGate(quizSection, done, total) {
    var cnt = quizSection.querySelector('.qg-count');
    if (done >= total) {
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

    chapters.forEach(function (ch, i) {
      var head = ch.querySelector('.ch-head');
      if (head) {
        head.insertAdjacentHTML('beforeend',
          '<span class="ch-lock-label">\uD83D\uDD12\u00a0\u00a0Terminez le chapitre pr\u00e9c\u00e9dent</span>' +
          '<span class="ch-done-label">\u2713\u00a0\u00a0Termin\u00e9</span>');
        head.addEventListener('click', function (e) {
          if (ch.classList.contains('ch-locked')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }, true);
      }

      var body = ch.querySelector('.ch-body');
      if (body) {
        var exercice = body.querySelector('.exercice');
        var t = buildTextarea('ch-exo-ta', 'ch-exo-label', 'ch-exo-counter', 'Rédige ta réponse ici…');
        var ta = t.ta;
        var counter = t.counter;

        var btn = document.createElement('button');
        btn.className = 'ch-complete-btn';
        btn.textContent = 'R\u00e9dige l\u2019exercice pour continuer';
        btn.disabled = true;

        if (ex['ch' + i]) ta.value = ex['ch' + i];

        function updateCounter() {
          var len = ta.value.trim().length;
          counter.textContent = len + '\u00a0/\u00a0' + MIN_CHARS;
          if (len >= MIN_CHARS) {
            counter.classList.add('ok');
          } else {
            counter.classList.remove('ok');
          }
          if (!getP()['ch' + i]) {
            btn.disabled = len < MIN_CHARS;
            btn.textContent = len >= MIN_CHARS
              ? 'Exercice termin\u00e9 \u2014 chapitre suivant \u2192'
              : 'R\u00e9dige l\u2019exercice pour continuer';
          }
        }

        ta.addEventListener('input', function () {
          var curEx = getEx();
          curEx['ch' + i] = ta.value;
          saveEx(curEx);
          updateCounter();
        });

        if (exercice) {
          exercice.appendChild(t.wrap);
        } else {
          body.appendChild(t.wrap);
        }
        body.appendChild(btn);
        ch._lockBtn = btn;
        ch._lockTa  = ta;

        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          var p = getP();
          p['ch' + i] = 1;
          saveP(p);
          serverSetChapter(i); /* sync serveur en arrière-plan */
          applyStandard(chapters, quizSection);
          var next = chapters[i + 1];
          if (next && !next.classList.contains('ch-locked')) {
            document.querySelectorAll('.chapitre.open').forEach(function (c) {
              c.classList.remove('open');
            });
            next.classList.add('open');
            setTimeout(function () {
              next.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 180);
          } else if (!next && quizSection) {
            setTimeout(function () {
              quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 180);
          }
        });

        updateCounter();
      }
    });

    applyStandard(chapters, quizSection);
  }

  function applyStandard(chapters, quizSection) {
    var p = getP();
    var done = 0;

    chapters.forEach(function (ch, i) {
      var isDone = !!p['ch' + i];
      var btn = ch._lockBtn;
      var ta  = ch._lockTa;

      if (i === 0) {
        ch.classList.remove('ch-locked');
      } else {
        if (p['ch' + (i - 1)]) {
          ch.classList.remove('ch-locked');
        } else {
          ch.classList.add('ch-locked');
          ch.classList.remove('open');
        }
      }

      if (isDone) {
        ch.classList.add('ch-done');
        if (ta)  ta.disabled = true;
        if (btn) { btn.textContent = '\u2713 Chapitre termin\u00e9'; btn.disabled = true; }
        done++;
      } else {
        ch.classList.remove('ch-done');
        if (ta)  ta.disabled = false;
        if (btn) {
          var hasEnough = ta && ta.value.trim().length >= MIN_CHARS;
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
      var dg = document.createElement('div');
      dg.className = 'deco-gate';
      dg.innerHTML =
        '<div style="font-size:20px;margin-bottom:10px;">\uD83D\uDD12</div>' +
        '<p>Terminez l\u2019exercice du chapitre pr\u00e9c\u00e9dent pour continuer</p>';
      ch.insertBefore(dg, ch.firstChild);

      var t = buildTextarea('ch-exo-ta-deco', 'ch-exo-label-deco', 'ch-exo-counter-deco', 'Rédige ta réponse ici…');
      var ta      = t.ta;
      var counter = t.counter;

      var doneRow = ch.querySelector('.done-row');
      var check   = ch.querySelector('.exo-check');
      if (check) check.disabled = true;

      if (ex['ch' + i]) ta.value = ex['ch' + i];

      function updateDecoCounter() {
        var len = ta.value.trim().length;
        counter.textContent = len + '\u00a0/\u00a0' + MIN_CHARS;
        if (len >= MIN_CHARS) {
          counter.classList.add('ok');
          if (check && !getP()['ch' + i]) check.disabled = false;
        } else {
          counter.classList.remove('ok');
          if (check && !getP()['ch' + i]) check.disabled = true;
        }
      }

      ta.addEventListener('input', function () {
        var curEx = getEx();
        curEx['ch' + i] = ta.value;
        saveEx(curEx);
        updateDecoCounter();
      });

      if (doneRow) {
        doneRow.parentNode.insertBefore(t.wrap, doneRow);
      } else {
        ch.appendChild(t.wrap);
      }

      ch._lockTa = ta;

      if (check) {
        check.addEventListener('change', function () {
          if (!check.checked) return;
          if (ta.value.trim().length < MIN_CHARS) { check.checked = false; return; }
          var p = getP();
          p['ch' + i] = 1;
          saveP(p);
          serverSetChapter(i); /* sync serveur en arrière-plan */
          applyDeco(chapters, quizSection);
        });
      }

      updateDecoCounter();
    });

    applyDeco(chapters, quizSection);
  }

  function applyDeco(chapters, quizSection) {
    var p    = getP();
    var done = 0;

    chapters.forEach(function (ch, i) {
      var isDone = !!p['ch' + i];
      if (isDone) done++;

      if (i === 0) {
        ch.classList.remove('ch-locked');
      } else {
        if (p['ch' + (i - 1)]) {
          ch.classList.remove('ch-locked');
        } else {
          ch.classList.add('ch-locked');
        }
      }

      var ta    = ch._lockTa;
      var check = ch.querySelector('.exo-check');

      if (isDone) {
        if (ta)    ta.disabled = true;
        if (check) { check.checked = true; check.disabled = true; }
      } else {
        if (ta)    ta.disabled = false;
        if (check) check.disabled = !ta || ta.value.trim().length < MIN_CHARS;
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
          'border:1px solid rgba(244,241,232,.12);' +
          'background:rgba(20,20,23,.9);';
        shield.innerHTML =
          '<div style="font-size:26px;margin-bottom:14px;">\uD83D\uDD12</div>' +
          '<p style="font-family:var(--mono,monospace);font-size:11px;color:#8a8a85;' +
          'text-transform:uppercase;letter-spacing:.08em;line-height:1.9;">' +
          'Terminez le Module\u00a0' + i + ' pour acc\u00e9der au Module\u00a0' + (i + 1) + '</p>';
        acte.insertBefore(shield, acte.firstChild);
      }

      var t = buildTextarea('ch-exo-ta-acte', 'ch-exo-label-acte', 'ch-exo-counter-acte', 'Rédige ta réponse à l\'exercice ici…');
      var ta      = t.ta;
      var counter = t.counter;

      var btn = document.createElement('button');
      btn.className = 'ch-complete-btn';
      btn.style.cssText =
        'border-color:var(--or,#c9963c);color:var(--or,#c9963c);' +
        'max-width:480px;margin-left:auto;margin-right:auto;';
      btn.textContent = 'R\u00e9dige l\u2019exercice pour continuer';
      btn.disabled = true;

      if (ex['ch' + i]) ta.value = ex['ch' + i];

      function updateActeCounter() {
        var len = ta.value.trim().length;
        counter.textContent = len + '\u00a0/\u00a0' + MIN_CHARS;
        if (len >= MIN_CHARS) {
          counter.classList.add('ok');
          if (!getP()['ch' + i]) {
            btn.disabled = false;
            btn.textContent = 'Module termin\u00e9 \u2014 continuer \u2192';
          }
        } else {
          counter.classList.remove('ok');
          if (!getP()['ch' + i]) {
            btn.disabled = true;
            btn.textContent = 'R\u00e9dige l\u2019exercice pour continuer';
          }
        }
      }

      ta.addEventListener('input', function () {
        var curEx = getEx();
        curEx['ch' + i] = ta.value;
        saveEx(curEx);
        updateActeCounter();
      });

      acte.appendChild(t.wrap);
      acte.appendChild(btn);
      acte._lockBtn = btn;
      acte._lockTa  = ta;

      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var p = getP();
        p['ch' + i] = 1;
        saveP(p);
        serverSetChapter(i); /* sync serveur en arrière-plan */
        applyActeur(actes, quizSection);
        var next = actes[i + 1];
        if (next) {
          setTimeout(function () { next.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180);
        } else if (quizSection) {
          setTimeout(function () { quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180);
        }
      });

      updateActeCounter();
    });

    applyActeur(actes, quizSection);
  }

  function applyActeur(actes, quizSection) {
    var p    = getP();
    var done = 0;

    actes.forEach(function (acte, i) {
      var isDone = !!p['ch' + i];
      if (isDone) done++;

      var btn    = acte._lockBtn;
      var ta     = acte._lockTa;
      var shield = document.getElementById('acte-shield-' + i);

      if (i > 0) {
        if (p['ch' + (i - 1)]) {
          acte.classList.remove('acte-locked');
          if (shield) shield.style.display = 'none';
        } else {
          acte.classList.add('acte-locked');
          if (shield) shield.style.display = '';
        }
      }

      if (isDone) {
        if (ta)  ta.disabled = true;
        if (btn) { btn.textContent = '\u2713 Module termin\u00e9'; btn.disabled = true; }
      } else {
        if (ta)  ta.disabled = false;
        if (btn) {
          var hasEnough = ta && ta.value.trim().length >= MIN_CHARS;
          btn.disabled = !hasEnough;
          btn.textContent = hasEnough
            ? 'Module termin\u00e9 \u2014 continuer \u2192'
            : 'R\u00e9dige l\u2019exercice pour continuer';
        }
      }
    });

    if (quizSection) refreshQuizGate(quizSection, done, actes.length);
  }

  /* ─── Détection du format & initialisation ────────────────────── */
  function init() {
    _manual = getManual();
    if (!_manual) return;
    _email  = localStorage.getItem('okapi_email') || null;

    var stdChapters = Array.from(document.querySelectorAll('.chapitre[data-ch]'));
    if (stdChapters.length) {
      _format = 'A'; _chapters = stdChapters;
      _quizSection = document.getElementById('quiz');
      initStandard(stdChapters);
      return;
    }

    var decoChapters = Array.from(document.querySelectorAll('section.chapter[id^="ch"]'));
    if (decoChapters.length) {
      _format = 'B'; _chapters = decoChapters;
      _quizSection = document.getElementById('quiz');
      initDeco(decoChapters);
      return;
    }

    var actes = ['acte1', 'acte2']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (actes.length) {
      _format = 'C'; _chapters = actes;
      _quizSection = document.getElementById('quiz');
      initActeur(actes);
    }
  }

  /* ─── Écoute le déverrouillage de la gate ────────────────────── */
  /* Déclenché par gate.js après connexion réussie */
  document.addEventListener('okapi:unlocked', function (e) {
    _email = (e.detail && e.detail.email) ? e.detail.email : localStorage.getItem('okapi_email');
    if (_email && _manual) {
      /* Sync serveur → override localStorage → re-applique l'état */
      serverSync(function () { reapply(); });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
