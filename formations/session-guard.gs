/**
 * OKAPI STUDIOS — Session Guard (à coller dans Code.gs)
 * =====================================================
 * Limite chaque email étudiant à 2 sessions actives simultanées :
 *   - 1 desktop  +  1 mobile  (ou 2 desktop, ou 2 mobile)
 * Au-delà, envoie un email d'alerte à l'admin avec un bouton
 * "Restreindre l'accès" pour bloquer immédiatement cet email.
 *
 * INSTALLATION
 * ------------
 * 1. Ouvrir Apps Script → Code.gs
 * 2. Coller tout ce fichier À LA SUITE du code existant
 * 3. Créer la feuille "Sessions" dans le Google Sheet (ou laisser
 *    getSessionsSheet() la créer automatiquement au 1er appel)
 * 4. Dans doGet(e), ajouter dans le switch / if-else existant :
 *
 *      if (p.action === 'sessionOpen')      return sessionOpen(p);
 *      if (p.action === 'sessionHeartbeat') return sessionHeartbeat(p);
 *      if (p.action === 'sessionClose')     return sessionClose(p);
 *      if (p.action === 'restrictAccess')   return restrictAccess(p);
 *
 *    ET dans le bloc login, avant de retourner {approved:true}, ajouter :
 *
 *      if (isEmailRestricted(email)) return jsonpOut(callback, {approved:false});
 *
 * 5. Redéployer le projet Apps Script (Déployer → Gérer les déploiements →
 *    Nouvelle version → Déployer).
 */

/* ─────────────────────────────────────────────
   CONFIG
   ───────────────────────────────────────────── */
var SESSION_MAX         = 2;          // max sessions simultanées par email
var SESSION_TIMEOUT_MIN = 5;          // minutes sans heartbeat → session expirée
var ALERT_COOLDOWN_MIN  = 30;         // minutes entre deux alertes pour le même email
var ADMIN_EMAIL         = 'okapistudios7@gmail.com';

/* ─────────────────────────────────────────────
   FEUILLE SESSIONS
   Colonnes : Email | SessionId | DeviceType | Manuel | OpenedAt | LastHeartbeat | Status
   ───────────────────────────────────────────── */
function getSessionsSheet(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Sessions');
  if (!sh){
    sh = ss.insertSheet('Sessions');
    sh.appendRow(['Email','SessionId','DeviceType','Manuel','OpenedAt','LastHeartbeat','Status']);
    sh.setFrozenRows(1);
  }
  return sh;
}

/* Supprime (ou marque closed) les sessions expirées */
function cleanExpiredSessions(sh){
  var now   = new Date();
  var cutoff = new Date(now.getTime() - SESSION_TIMEOUT_MIN * 60 * 1000);
  var data  = sh.getDataRange().getValues();
  // parcours à l'envers pour pouvoir supprimer des lignes
  for (var i = data.length - 1; i >= 1; i--){
    var status = data[i][6];
    var lastHb = data[i][5];
    if (status === 'open' && lastHb && new Date(lastHb) < cutoff){
      sh.deleteRow(i + 1);
    } else if (status === 'closed'){
      sh.deleteRow(i + 1);
    }
  }
}

/* Retourne les sessions actives (après nettoyage) pour un email donné */
function getActiveSessions(sh, email){
  var data = sh.getDataRange().getValues();
  var active = [];
  for (var i = 1; i < data.length; i++){
    if (data[i][0] === email && data[i][6] === 'open'){
      active.push({ row: i + 1, sessionId: data[i][1], deviceType: data[i][2] });
    }
  }
  return active;
}

/* ─────────────────────────────────────────────
   LISTE NOIRE (Script Properties)
   ───────────────────────────────────────────── */
function isEmailRestricted(email){
  var props = PropertiesService.getScriptProperties();
  var list  = (props.getProperty('restricted_emails') || '').split(',').map(function(s){ return s.trim().toLowerCase(); });
  return list.indexOf(email.toLowerCase()) !== -1;
}

function restrictEmail(email){
  var props = PropertiesService.getScriptProperties();
  var list  = (props.getProperty('restricted_emails') || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  if (list.indexOf(email) === -1) list.push(email);
  props.setProperty('restricted_emails', list.join(','));
}

/* ─────────────────────────────────────────────
   ALERTE ADMIN
   ───────────────────────────────────────────── */
function maybeSendSuspiciousAlert(email, activeSessions, newDevice, manuel){
  var props    = PropertiesService.getScriptProperties();
  var key      = 'last_alert_' + email.replace(/[^a-z0-9]/gi,'_');
  var lastAlert = props.getProperty(key);
  var now      = new Date();

  if (lastAlert && (now.getTime() - new Date(lastAlert).getTime()) < ALERT_COOLDOWN_MIN * 60 * 1000){
    return; // cooldown : pas de spam
  }
  props.setProperty(key, now.toISOString());

  /* Génère un token à usage unique pour le bouton "Restreindre" */
  var token = Utilities.getUuid();
  props.setProperty('restrict_token_' + token, email);

  /* Résumé des sessions actives */
  var sessionLines = activeSessions.map(function(s){
    return '• ' + s.sessionId + ' (' + s.deviceType + ')';
  }).join('\n');

  /* URL du bouton d'action */
  var scriptUrl = ScriptApp.getService().getUrl();
  var restrictUrl = scriptUrl + '?action=restrictAccess&token=' + encodeURIComponent(token);

  var subject = '[OKAPI] Connexions suspectes — ' + email;
  var body = [
    'Bonjour,',
    '',
    'L\'email <b>' + email + '</b> vient d\'ouvrir une ' + (activeSessions.length + 1) + 'e session simultanée (manuel : ' + (manuel || '?') + ', device : ' + newDevice + ').',
    '',
    'Sessions déjà actives :',
    sessionLines,
    '',
    'Si tu souhaites bloquer immédiatement cet email, clique sur le lien ci-dessous :',
    '<a href="' + restrictUrl + '" style="background:#e53e3e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">Restreindre l\'accès</a>',
    '',
    'Si tu ne fais rien, l\'accès reste ouvert.',
    '',
    '— Okapi Studios (alerte automatique)'
  ].join('\n');

  GmailApp.sendEmail(ADMIN_EMAIL, subject, body.replace(/<[^>]+>/g,''), { htmlBody: body });
}

/* ─────────────────────────────────────────────
   HANDLERS (appelés depuis doGet)
   ───────────────────────────────────────────── */

/**
 * Ouvre une session. Appelé dès que l'étudiant passe la gate.
 * Paramètres attendus : email, sessionId, deviceType, manuel
 */
function sessionOpen(p){
  var email      = (p.email      || '').trim();
  var sessionId  = (p.sessionId  || '').trim();
  var deviceType = (p.deviceType || 'desktop').trim();
  var manuel     = (p.manuel     || '').trim();

  if (!email || !sessionId) return ContentService.createTextContent('').setMimeType(ContentService.MimeType.TEXT);

  var sh  = getSessionsSheet();
  cleanExpiredSessions(sh);

  var active = getActiveSessions(sh, email);

  /* Évite les doublons (rechargement rapide du même onglet) */
  var alreadyOpen = active.some(function(s){ return s.sessionId === sessionId; });
  if (!alreadyOpen){
    var now = new Date();
    sh.appendRow([email, sessionId, deviceType, manuel, now, now, 'open']);

    if (active.length >= SESSION_MAX){
      /* On vient de dépasser la limite — alerte admin */
      maybeSendSuspiciousAlert(email, active, deviceType, manuel);
    }
  }

  return ContentService.createTextContent('').setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Heartbeat toutes les 2 min — maintient la session vivante.
 * Paramètres : email, sessionId
 */
function sessionHeartbeat(p){
  var email     = (p.email     || '').trim();
  var sessionId = (p.sessionId || '').trim();
  if (!email || !sessionId) return ContentService.createTextContent('').setMimeType(ContentService.MimeType.TEXT);

  var sh   = getSessionsSheet();
  var data = sh.getDataRange().getValues();
  var now  = new Date();

  for (var i = 1; i < data.length; i++){
    if (data[i][0] === email && data[i][1] === sessionId && data[i][6] === 'open'){
      sh.getRange(i + 1, 6).setValue(now); // colonne LastHeartbeat
      break;
    }
  }

  return ContentService.createTextContent('').setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Ferme une session (best-effort, appelé via pagehide).
 * Paramètres : email, sessionId
 */
function sessionClose(p){
  var email     = (p.email     || '').trim();
  var sessionId = (p.sessionId || '').trim();
  if (!email || !sessionId) return ContentService.createTextContent('').setMimeType(ContentService.MimeType.TEXT);

  var sh   = getSessionsSheet();
  var data = sh.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--){
    if (data[i][0] === email && data[i][1] === sessionId){
      sh.deleteRow(i + 1);
      break;
    }
  }

  return ContentService.createTextContent('').setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Restreint l'accès d'un email via un token à usage unique (lien dans l'email admin).
 * Retourne une page HTML de confirmation.
 * Paramètres : token
 */
function restrictAccess(p){
  var token = (p.token || '').trim();
  var props = PropertiesService.getScriptProperties();
  var email = props.getProperty('restrict_token_' + token);

  if (!email){
    return HtmlService.createHtmlOutput('<p>Lien invalide ou déjà utilisé.</p>');
  }

  /* Token à usage unique */
  props.deleteProperty('restrict_token_' + token);
  restrictEmail(email);

  /* Ferme toutes les sessions actives de cet email */
  var sh   = getSessionsSheet();
  var data = sh.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--){
    if (data[i][0] === email){ sh.deleteRow(i + 1); }
  }

  return HtmlService.createHtmlOutput(
    '<html><body style="font-family:sans-serif;padding:40px;max-width:500px;">' +
    '<h2 style="color:#e53e3e;">Accès restreint</h2>' +
    '<p>L\'email <strong>' + email + '</strong> a été bloqué.<br>' +
    'Il ne pourra plus se connecter aux manuels Okapi Studios.</p>' +
    '<p style="color:#666;font-size:13px;">Pour lever la restriction, supprime cet email ' +
    'de la propriété <code>restricted_emails</code> dans les Script Properties.</p>' +
    '</body></html>'
  );
}

/* ─────────────────────────────────────────────
   SNIPPET À AJOUTER DANS doGet(e)
   ───────────────────────────────────────────── */
/*

  // --- COLLER DANS LE doGet EXISTANT ---
  var p = e.parameter;

  // Vérification liste noire au login
  if (p.login && p.email && isEmailRestricted(p.email)) {
    var cb = p.callback || '';
    return ContentService
      .createTextContent(cb + '(' + JSON.stringify({approved:false}) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // Actions de session (pas de JSONP, réponse vide suffit)
  if (p.action === 'sessionOpen')      return sessionOpen(p);
  if (p.action === 'sessionHeartbeat') return sessionHeartbeat(p);
  if (p.action === 'sessionClose')     return sessionClose(p);
  if (p.action === 'restrictAccess')   return restrictAccess(p);

*/
