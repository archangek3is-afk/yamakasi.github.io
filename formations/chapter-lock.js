/**
 * OKAPI STUDIOS — Système de progression par chapitres v1.0
 *
 * Trois formats détectés automatiquement :
 *   A — Standard  : .chapitre[data-ch]  (14 manuels accordion)
 *   B — Deco      : section.chapter[id^="ch"]  (decoration-cinema)
 *   C — Acteur    : #acte1 / #acte2  (acteur-vivant)
 *
 * Progression sauvegardée dans localStorage (clé : okapi_ch_<manual>).
 * Chaque chapitre se déverrouille quand le précédent est marqué terminé.
 * Le quiz final est bloqué jusqu'à completion de tous les chapitres.
 */
(function () {
  'use strict';

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
/* === Bouton de complétion (A + C) === */\
.ch-complete-btn{\
  display:block;width:100%;margin-top:28px;padding:15px 22px;\
  background:transparent;border:1px solid #e4312b;color:#e4312b;\
  font-family:var(--mono,monospace);font-size:11px;\
  letter-spacing:.1em;text-transform:uppercase;\
  cursor:pointer;text-align:center;\
  transition:background .2s,color .2s;\
}\
.ch-complete-btn:hover:not(:disabled){background:#e4312b;color:#f4f1e8;}\
.ch-complete-btn:disabled{border-color:#7a9a7a;color:#7a9a7a;cursor:default;}\
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
/* === Format C : acteur-vivant === */\
.acte-locked>*:not(.acte-shield){display:none !important;}\
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
  var _manual = null;

  function getManual() {
    var gs = document.querySelector('script[src*="gate.js"][data-manual]');
    return gs ? gs.getAttribute('data-manual') : null;
  }

  function storageKey() { return 'okapi_ch_' + _manual; }

  function getP() {
    try { return JSON.parse(localStorage.getItem(storageKey())) || {}; }
    catch (e) { return {}; }
  }

  function saveP(p) {
    try { localStorage.setItem(storageKey(), JSON.stringify(p)); }
    catch (e) {}
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
    var quizSection = document.getElementById('quiz');
    if (quizSection) buildQuizGate(quizSection, chapters.length, 'chapitres');

    chapters.forEach(function (ch, i) {
      /* Badges dans le header */
      var head = ch.querySelector('.ch-head');
      if (head) {
        head.insertAdjacentHTML('beforeend',
          '<span class="ch-lock-label">\uD83D\uDD12\u00a0\u00a0Terminez le chapitre pr\u00e9c\u00e9dent</span>' +
          '<span class="ch-done-label">\u2713\u00a0\u00a0Termin\u00e9</span>');
        /* Bloquer le toggle quand verrouillé */
        head.addEventListener('click', function (e) {
          if (ch.classList.contains('ch-locked')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }, true);
      }

      /* Bouton de complétion */
      var body = ch.querySelector('.ch-body');
      if (body) {
        var btn = document.createElement('button');
        btn.className = 'ch-complete-btn';
        btn.textContent = 'Exercice termin\u00e9 \u2014 chapitre suivant \u2192';
        body.appendChild(btn);
        ch._lockBtn = btn;

        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          var p = getP();
          p['ch' + i] = 1;
          saveP(p);
          applyStandard(chapters, quizSection);
          /* Auto-scroll vers le chapitre suivant */
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

      /* Verrou */
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

      /* État "terminé" */
      if (isDone) {
        ch.classList.add('ch-done');
        if (btn) { btn.textContent = '\u2713 Chapitre termin\u00e9'; btn.disabled = true; }
        done++;
      } else {
        ch.classList.remove('ch-done');
        if (btn) {
          btn.textContent = 'Exercice termin\u00e9 \u2014 chapitre suivant \u2192';
          btn.disabled = false;
        }
      }
    });

    if (quizSection) refreshQuizGate(quizSection, done, chapters.length);
  }

  /* ══════════════════════════════════════════════════════════════
     FORMAT B — decoration-cinema : section.chapter[id^="ch"]
  ══════════════════════════════════════════════════════════════ */
  function initDeco(chapters) {
    var quizSection = document.getElementById('quiz');

    /* Quiz gate — adapter la palette claire du fichier */
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

    chapters.forEach(function (ch, i) {
      /* Panneau de verrouillage */
      var dg = document.createElement('div');
      dg.className = 'deco-gate';
      dg.innerHTML =
        '<div style="font-size:20px;margin-bottom:10px;">\uD83D\uDD12</div>' +
        '<p>Cochez l\u2019exercice du chapitre pr\u00e9c\u00e9dent pour continuer</p>';
      ch.insertBefore(dg, ch.firstChild);

      /* Hooker la checkbox existante */
      var check = ch.querySelector('.exo-check');
      if (check) {
        check.addEventListener('change', function () {
          if (!check.checked) return;
          var p = getP();
          p['ch' + i] = 1;
          saveP(p);
          applyDeco(chapters, quizSection);
        });
      }
    });

    applyDeco(chapters, quizSection);
  }

  function applyDeco(chapters, quizSection) {
    var p = getP();
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

      /* Restaurer la checkbox depuis localStorage */
      var check = ch.querySelector('.exo-check');
      if (check && isDone && !check.checked) check.checked = true;
    });

    if (quizSection) refreshQuizGate(quizSection, done, chapters.length);
  }

  /* ══════════════════════════════════════════════════════════════
     FORMAT C — acteur-vivant : #acte1 + #acte2
  ══════════════════════════════════════════════════════════════ */
  function initActeur(actes) {
    var quizSection = document.getElementById('quiz');
    if (quizSection) {
      buildQuizGate(quizSection, actes.length, 'modules');
    }

    actes.forEach(function (acte, i) {
      /* Shield de verrouillage (sauf module 1) */
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

      /* Bouton de complétion */
      var btn = document.createElement('button');
      btn.className = 'ch-complete-btn';
      btn.style.cssText =
        'border-color:var(--or,#c9963c);color:var(--or,#c9963c);' +
        'max-width:480px;margin-left:auto;margin-right:auto;';
      btn.textContent = 'Module termin\u00e9 \u2014 continuer \u2192';
      acte.appendChild(btn);
      acte._lockBtn = btn;

      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var p = getP();
        p['ch' + i] = 1;
        saveP(p);
        applyActeur(actes, quizSection);
        var next = actes[i + 1];
        if (next) {
          setTimeout(function () { next.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180);
        } else if (quizSection) {
          setTimeout(function () { quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 180);
        }
      });
    });

    applyActeur(actes, quizSection);
  }

  function applyActeur(actes, quizSection) {
    var p = getP();
    var done = 0;

    actes.forEach(function (acte, i) {
      var isDone = !!p['ch' + i];
      if (isDone) done++;

      var btn = acte._lockBtn;
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

      if (btn) {
        if (isDone) {
          btn.textContent = '\u2713 Module termin\u00e9';
          btn.disabled = true;
        } else {
          btn.textContent = 'Module termin\u00e9 \u2014 continuer \u2192';
          btn.disabled = false;
        }
      }
    });

    if (quizSection) refreshQuizGate(quizSection, done, actes.length);
  }

  /* ─── Détection du format & initialisation ────────────────────── */
  function init() {
    _manual = getManual();
    if (!_manual) return;

    /* Format A */
    var stdChapters = Array.from(document.querySelectorAll('.chapitre[data-ch]'));
    if (stdChapters.length) { initStandard(stdChapters); return; }

    /* Format B */
    var decoChapters = Array.from(
      document.querySelectorAll('section.chapter[id^="ch"]')
    );
    if (decoChapters.length) { initDeco(decoChapters); return; }

    /* Format C */
    var actes = ['acte1', 'acte2']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (actes.length) { initActeur(actes); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
