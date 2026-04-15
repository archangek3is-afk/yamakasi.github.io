/**
 * ═══════════════════════════════════════════════════════════════
 *  OKAPI WORLD MÉDIA — Agent Autonome V2
 *  Gmail → Drive + Firestore + Calendar + Slack + Notifications
 *  Version 2.0 · Avril 2026
 * ═══════════════════════════════════════════════════════════════
 *
 *  CAPACITÉS :
 *  ① Documents    — Pièces jointes clients → Drive organisé
 *  ② Paiements    — Détection PayPal/virement → Firestore
 *  ③ Échéances    — Alerte 5 jours avant chaque créance
 *  ④ Prospects    — Détection leads potentiels (mots-clés)
 *  ⑤ Accusé       — Brouillon de réponse auto quand doc reçu
 *  ⑥ Labels       — Auto-labeling Gmail par projet
 *  ⑦ Relances     — Brouillon de relance si créance en retard
 *  ⑧ Calendar     — Détection dates → brouillon événement
 *  ⑨ Résumé hebdo — Email récap chaque lundi 8h
 *  ⑩ Slack        — Notifications dans le Workspace OWM
 *
 *  INSTALLATION :
 *  1. Va sur https://script.google.com
 *  2. Connecte-toi avec okapistudios7@gmail.com
 *     (c'est le compte qui reçoit les mails yamakasi@)
 *  3. + Nouveau projet → colle tout ce code
 *  4. Exécuter → setupAgent()
 *  5. Autorise les permissions
 *  6. C'est tout — l'agent tourne tout seul
 *
 *  NOTE : Si tes clients écrivent aussi à archangek.3is@gmail.com,
 *  crée un second projet Apps Script sur ce compte et colle le
 *  même code. Les deux agents coexistent sans conflit.
 *
 * ═══════════════════════════════════════════════════════════════
 */


// ─── CONFIG ─────────────────────────────────────────────────────

const CONFIG = {

  // ── Clients ──────────────────────────────────────────────────
  clients: {
    'hortensebl@hotmail.com': {
      projet: 'MAÏLU',
      client: 'Hortense Boulet',
      dossier: 'MAÏLU — Hortense Boulet',
      label: 'OWM/MAÏLU',
    },
    'balletdeladiasporacamerounaise@gmail.com': {
      projet: 'BDC',
      client: 'Gabin Tchoupo',
      dossier: 'BDC — Gabin Tchoupo',
      label: 'OWM/BDC',
    },
    'aniela16@live.fr': {
      projet: 'Miroir',
      client: 'Ève Aniela',
      dossier: 'Le Miroir de l\'âme — Ève Aniela',
      label: 'OWM/Miroir',
    },
    'bmm.moudzouma@gmail.com': {
      projet: 'UNIKIDSLAND',
      client: 'Marie-Michelle Badelas',
      dossier: 'UNIKIDSLAND — Marie-Michelle',
      label: 'OWM/UNIKIDSLAND',
    },
  },

  // ── Paiements ────────────────────────────────────────────────
  paymentSenders: [
    'service@paypal.fr', 'service@paypal.com',
    'noreply@paypal.fr', 'noreply@paypal.com',
  ],
  paymentKeywords: [
    'reçu de l\'argent', 'vous avez reçu', 'payment received',
    'virement reçu', 'virement de', 'crédit de', 'règlement de',
    'je confirme le paiement', 'j\'ai effectué le virement',
    'je t\'ai envoyé', 'paiement effectué', 'virement effectué',
    'j\'ai payé', 'j\'ai viré', 'c\'est envoyé', 'c\'est fait pour le paiement',
  ],

  // ── Prospects (mots-clés qui déclenchent une alerte lead) ───
  prospectKeywords: [
    'film de marque', 'film corporate', 'direction créative',
    'identité visuelle', 'stratégie de contenu', 'brand content',
    'vidéo promotionnelle', 'clip', 'documentaire', 'court-métrage',
    'motion design', 'animation', 'budget', 'devis', 'tarif',
    'collaboration', 'prestation', 'besoin d\'un réalisateur',
    'besoin d\'un directeur créatif', 'campagne', 'lancement',
  ],

  // ── Firestore ────────────────────────────────────────────────
  firestore: {
    projectId: 'okapi-world-media',
    collection: 'dashboard',
    document: 'state',
    apiKey: 'AIzaSyDmRI3geAdrme2jRYi9G3X3pRg_tBro29Y',
  },

  // ── Drive ────────────────────────────────────────────────────
  driveRootFolderName: 'OWM — Clients',

  // ── Labels ───────────────────────────────────────────────────
  processedLabel: 'OWM-Traité',

  // ── Notifications ────────────────────────────────────────────
  notifyEmail: 'archangek.3is@gmail.com',

  // ── Slack (webhook optionnel — laisse vide si pas configuré)
  slackWebhook: '',
  // Pour activer Slack :
  // 1. Va sur api.slack.com/apps → crée une app pour ton Workspace
  // 2. Active "Incoming Webhooks" → copie l'URL ici
  // Ex: colle ici l'URL de ton webhook Slack

  // ── Créances (pour alertes et relances) ──────────────────────
  // Le script lit aussi le Firestore, mais ce tableau sert de fallback
  creances: [
    { lib: 'Solde MAÏLU (Stratégie + lancement)', mt: 600, dt: '2026-04-30', client: 'hortensebl@hotmail.com' },
    { lib: 'Miroir V1/3 — Signature', mt: 510, dt: '2026-04-10', client: 'aniela16@live.fr' },
    { lib: 'Miroir V2/3 — Montage', mt: 510, dt: '2026-06-01', client: 'aniela16@live.fr' },
    { lib: 'Miroir V3/3 — Livraison', mt: 680, dt: '2026-07-31', client: 'aniela16@live.fr' },
    { lib: 'BDC V1/5 — Signature', mt: 505, dt: '2026-03-15', client: 'balletdeladiasporacamerounaise@gmail.com' },
    { lib: 'BDC V2/5 — Post tournage T1', mt: 1010, dt: '2026-04-26', client: 'balletdeladiasporacamerounaise@gmail.com' },
    { lib: 'BDC V3/5 — Avant T3', mt: 1010, dt: '2026-09-25', client: 'balletdeladiasporacamerounaise@gmail.com' },
    { lib: 'BDC V4/5 — Avant T4', mt: 1010, dt: '2026-12-18', client: 'balletdeladiasporacamerounaise@gmail.com' },
    { lib: 'BDC V5/5 — Cut final', mt: 1515, dt: '2027-05-31', client: 'balletdeladiasporacamerounaise@gmail.com' },
    { lib: 'UKL V1 — Signature contrat', mt: 700, dt: '2026-05-01', client: 'bmm.moudzouma@gmail.com' },
    { lib: 'UKL V2 — Designs validés', mt: 1000, dt: '2026-05-15', client: 'bmm.moudzouma@gmail.com' },
    { lib: 'UKL V3 — Animatique EP01', mt: 1000, dt: '2026-06-15', client: 'bmm.moudzouma@gmail.com' },
  ],
};


// ─── SETUP (lancer UNE SEULE FOIS) ─────────────────────────────

function setupAgent() {
  // 1. Créer les labels Gmail
  ensureLabel_(CONFIG.processedLabel);
  for (const email in CONFIG.clients) {
    ensureLabel_(CONFIG.clients[email].label);
  }
  ensureLabel_('OWM/Prospects');
  Logger.log('✅ Labels Gmail créés');

  // 2. Créer l'arborescence Drive
  const rootFolder = getOrCreateFolder_(null, CONFIG.driveRootFolderName);
  for (const email in CONFIG.clients) {
    const c = CONFIG.clients[email];
    const clientFolder = getOrCreateFolder_(rootFolder, c.dossier);
    getOrCreateFolder_(clientFolder, 'Documents reçus');
    getOrCreateFolder_(clientFolder, 'Contrats');
    getOrCreateFolder_(clientFolder, 'Paiements');
  }
  Logger.log('✅ Arborescence Drive créée');

  // 3. Supprimer les anciens triggers
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // 4. Trigger principal : scan toutes les 5 minutes
  ScriptApp.newTrigger('scanGmail').timeBased().everyMinutes(5).create();

  // 5. Trigger hebdomadaire : résumé du lundi à 8h
  ScriptApp.newTrigger('weeklyDigest').timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8).create();

  // 6. Trigger quotidien : alertes échéances à 9h
  ScriptApp.newTrigger('checkDeadlines').timeBased()
    .everyDays(1).atHour(9).create();

  Logger.log('✅ Agent OWM V2 installé — 3 triggers actifs');
}


// ═══════════════════════════════════════════════════════════════
//  ① SCAN PRINCIPAL (toutes les 5 min)
// ═══════════════════════════════════════════════════════════════

function scanGmail() {
  const processedLabel = GmailApp.getUserLabelByName(CONFIG.processedLabel);
  if (!processedLabel) { Logger.log('Lance setupAgent() d\'abord.'); return; }

  const actions = [];

  // ── A. Mails clients ──────────────────────────────────────
  for (const email in CONFIG.clients) {
    const c = CONFIG.clients[email];
    const threads = GmailApp.search(`from:${email} -label:${CONFIG.processedLabel} newer_than:1d`, 0, 20);

    threads.forEach(thread => {
      // ⑥ Auto-labeling
      applyProjectLabel_(thread, c.label);

      thread.getMessages().forEach(msg => {
        // ① Documents → Drive
        const docActions = saveAttachments_(msg, c);
        if (docActions.length > 0) {
          actions.push(...docActions);
          // ⑤ Accusé de réception (brouillon)
          createAckDraft_(msg, c);
        }

        // ② Paiement mentionné par le client
        const payAction = detectPaymentInMessage_(msg, c);
        if (payAction) actions.push(payAction);

        // ⑧ Détection dates → Calendar
        const calAction = detectDatesForCalendar_(msg, c);
        if (calAction) actions.push(calAction);
      });

      thread.addLabel(processedLabel);
    });
  }

  // ── B. Notifications de paiement (PayPal, banque) ─────────
  CONFIG.paymentSenders.forEach(sender => {
    const threads = GmailApp.search(`from:${sender} -label:${CONFIG.processedLabel} newer_than:1d`, 0, 10);
    threads.forEach(thread => {
      thread.getMessages().forEach(msg => {
        const r = processPaymentNotification_(msg);
        if (r) actions.push(r);
      });
      thread.addLabel(processedLabel);
    });
  });

  // ── C. Détection prospects ────────────────────────────────
  const prospectActions = scanForProspects_();
  actions.push(...prospectActions);

  // ── D. Notifications ──────────────────────────────────────
  if (actions.length > 0) {
    sendNotification_(actions);
    sendSlack_(actions);
  }
}


// ═══════════════════════════════════════════════════════════════
//  ① DOCUMENTS → DRIVE
// ═══════════════════════════════════════════════════════════════

function saveAttachments_(msg, clientConfig) {
  const actions = [];
  const attachments = msg.getAttachments();
  if (attachments.length === 0) return actions;

  const date = msg.getDate();
  const subject = msg.getSubject();
  const rootFolder = getOrCreateFolder_(null, CONFIG.driveRootFolderName);
  const clientFolder = getOrCreateFolder_(rootFolder, clientConfig.dossier);

  attachments.forEach(att => {
    const name = att.getName();
    const lower = name.toLowerCase();

    // Classifier automatiquement
    let sub = 'Documents reçus';
    if (lower.match(/contrat|contract|sign[eé]|avenant/)) sub = 'Contrats';
    else if (lower.match(/facture|invoice|re[çc]u|receipt|paiement|payment/)) sub = 'Paiements';

    const folder = getOrCreateFolder_(clientFolder, sub);
    const dateStr = fmtDate_(date);
    const finalName = `${dateStr}_${name}`;

    if (!folder.getFilesByName(finalName).hasNext()) {
      folder.createFile(att.copyBlob().setName(finalName));
      actions.push({
        type: '📎 DOCUMENT',
        projet: clientConfig.projet,
        detail: `${name} → ${clientConfig.dossier}/${sub}`,
        date: dateStr, subject
      });
    }
  });

  return actions;
}


// ═══════════════════════════════════════════════════════════════
//  ② PAIEMENTS → FIRESTORE
// ═══════════════════════════════════════════════════════════════

function processPaymentNotification_(msg) {
  const body = (msg.getPlainBody() || msg.getBody()).toLowerCase();
  const subject = msg.getSubject();

  const nameMap = {
    'hortense': 'hortensebl@hotmail.com', 'boulet': 'hortensebl@hotmail.com',
    'gabin': 'balletdeladiasporacamerounaise@gmail.com', 'tchoupo': 'balletdeladiasporacamerounaise@gmail.com',
    'ballet': 'balletdeladiasporacamerounaise@gmail.com',
    'aniela': 'aniela16@live.fr', 'ève': 'aniela16@live.fr', 'eve': 'aniela16@live.fr',
    'marie-michelle': 'bmm.moudzouma@gmail.com', 'badelas': 'bmm.moudzouma@gmail.com',
    'moudzouma': 'bmm.moudzouma@gmail.com',
  };

  let matched = null;
  for (const name in nameMap) {
    if (body.includes(name)) { matched = CONFIG.clients[nameMap[name]]; break; }
  }
  if (!matched) return null;

  const amount = extractAmount_(body);
  if (!amount) return null;

  const dateStr = fmtDate_(msg.getDate());
  addPaymentToFirestore_(matched.projet, amount, dateStr);

  return {
    type: '💰 PAIEMENT',
    projet: matched.projet,
    detail: `${amount}€ reçu (PayPal/Virement)`,
    date: dateStr, subject
  };
}

function detectPaymentInMessage_(msg, clientConfig) {
  const body = (msg.getPlainBody() || msg.getBody()).toLowerCase();
  const isPayment = CONFIG.paymentKeywords.some(kw => body.includes(kw));
  if (!isPayment) return null;

  const amount = extractAmount_(body);
  const dateStr = fmtDate_(msg.getDate());

  return {
    type: '💬 PAIEMENT ANNONCÉ',
    projet: clientConfig.projet,
    detail: amount
      ? `${clientConfig.client} annonce ${amount}€`
      : `${clientConfig.client} mentionne un paiement (montant non détecté — vérifie manuellement)`,
    date: dateStr, subject: msg.getSubject()
  };
}

function addPaymentToFirestore_(projet, amount, dateStr) {
  try {
    const fs = CONFIG.firestore;
    const url = `https://firestore.googleapis.com/v1/projects/${fs.projectId}/databases/(default)/documents/${fs.collection}/${fs.document}?key=${fs.apiKey}`;

    const getResp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (getResp.getResponseCode() !== 200) return false;

    const doc = JSON.parse(getResp.getContentText());
    const db = JSON.parse(doc.fields.state.stringValue);

    db.encaisse.push({ lib: `${projet} — Paiement reçu`, mt: amount, dt: dateStr, auto: true });

    const mi = parseInt(dateStr.split('-')[1]) - 1;
    if (mi >= 0 && mi < 12) db.flux2026[mi] = (db.flux2026[mi] || 0) + amount;

    const newDoc = {
      fields: {
        state: { stringValue: JSON.stringify(db) },
        _clientId: { stringValue: 'owm-agent-v2' },
        _ts: { integerValue: String(Date.now()) },
        _schemaVersion: doc.fields._schemaVersion || { integerValue: '1' },
      }
    };

    UrlFetchApp.fetch(url, {
      method: 'patch', contentType: 'application/json',
      payload: JSON.stringify(newDoc), muteHttpExceptions: true
    });
    return true;
  } catch (e) { Logger.log('Firestore err: ' + e.message); return false; }
}


// ═══════════════════════════════════════════════════════════════
//  ③ ALERTES ÉCHÉANCES (quotidien 9h)
// ═══════════════════════════════════════════════════════════════

function checkDeadlines() {
  const today = new Date();
  const actions = [];

  CONFIG.creances.forEach(cr => {
    const due = new Date(cr.dt);
    const daysLeft = Math.ceil((due - today) / 86400000);

    // Alerte 5 jours avant
    if (daysLeft >= 0 && daysLeft <= 5) {
      const clientConfig = CONFIG.clients[cr.client];
      const clientName = clientConfig ? clientConfig.client : 'Client';

      actions.push({
        type: '⏰ ÉCHÉANCE',
        projet: clientConfig ? clientConfig.projet : '???',
        detail: `${cr.lib} — ${cr.mt}€ dû dans ${daysLeft} jour(s) (${cr.dt})`,
        date: fmtDate_(today), subject: ''
      });
    }

    // ⑦ Relance si en retard de 7+ jours
    if (daysLeft < -7 && daysLeft > -30) {
      const clientConfig = CONFIG.clients[cr.client];
      if (clientConfig) {
        createRelanceDraft_(cr, clientConfig);
        actions.push({
          type: '📨 RELANCE CRÉÉE',
          projet: clientConfig.projet,
          detail: `Brouillon de relance pour ${cr.lib} (${cr.mt}€, ${Math.abs(daysLeft)}j de retard)`,
          date: fmtDate_(today), subject: ''
        });
      }
    }
  });

  if (actions.length > 0) {
    sendNotification_(actions);
    sendSlack_(actions);
  }
}


// ═══════════════════════════════════════════════════════════════
//  ④ DÉTECTION PROSPECTS
// ═══════════════════════════════════════════════════════════════

function scanForProspects_() {
  const actions = [];
  const knownEmails = Object.keys(CONFIG.clients);
  const ownEmails = ['archangek.3is@gmail.com', 'okapistudios7@gmail.com', 'yamakasi@okapiworldmedia.com'];

  // Chercher des mails récents avec des mots-clés business
  const keywordGroups = [
    'film marque OR direction créative OR identité visuelle',
    'devis OR tarif OR budget OR prestation',
    'documentaire OR court-métrage OR clip OR campagne',
  ];

  keywordGroups.forEach(kw => {
    const query = `(${kw}) -label:${CONFIG.processedLabel} -label:OWM/Prospects newer_than:1d`;
    const threads = GmailApp.search(query, 0, 5);

    threads.forEach(thread => {
      const msg = thread.getMessages()[0];
      const sender = msg.getFrom().replace(/.*</, '').replace(/>.*/, '').toLowerCase().trim();

      // Exclure les clients connus, soi-même, et les newsletters
      if (knownEmails.includes(sender)) return;
      if (ownEmails.includes(sender)) return;
      if (sender.includes('noreply') || sender.includes('newsletter') || sender.includes('info@')) return;

      // C'est un prospect potentiel
      applyProjectLabel_(thread, 'OWM/Prospects');

      const label = GmailApp.getUserLabelByName(CONFIG.processedLabel);
      if (label) thread.addLabel(label);

      actions.push({
        type: '🔥 PROSPECT',
        projet: 'Nouveau lead',
        detail: `${sender} — "${msg.getSubject()}"`,
        date: fmtDate_(msg.getDate()),
        subject: msg.getSubject()
      });
    });
  });

  return actions;
}


// ═══════════════════════════════════════════════════════════════
//  ⑤ ACCUSÉ DE RÉCEPTION (brouillon)
// ═══════════════════════════════════════════════════════════════

function createAckDraft_(msg, clientConfig) {
  const prenom = clientConfig.client.split(' ')[0];
  const nbFiles = msg.getAttachments().length;
  const s = nbFiles > 1 ? 's' : '';

  const body = `Salut ${prenom},\n\n`
    + `Bien reçu ton${s.length ? 's' : ''} ${nbFiles} document${s}, merci ! `
    + `Je regarde ça et je te fais un retour rapidement.\n\n`
    + `Yamakasi\n`
    + `—\n`
    + `Archange Kiyindou\n`
    + `Directeur créatif · Okapi World Média`;

  const replyTo = msg.getFrom().replace(/.*</, '').replace(/>.*/, '').trim();

  GmailApp.createDraft(
    replyTo,
    `Re: ${msg.getSubject()}`,
    body
  );
}


// ═══════════════════════════════════════════════════════════════
//  ⑥ AUTO-LABELING
// ═══════════════════════════════════════════════════════════════

function applyProjectLabel_(thread, labelName) {
  let label = GmailApp.getUserLabelByName(labelName);
  if (!label) label = GmailApp.createLabel(labelName);
  thread.addLabel(label);
}


// ═══════════════════════════════════════════════════════════════
//  ⑦ RELANCE CRÉANCES EN RETARD (brouillon)
// ═══════════════════════════════════════════════════════════════

function createRelanceDraft_(creance, clientConfig) {
  // Vérifier qu'on n'a pas déjà créé un brouillon récemment
  const drafts = GmailApp.getDrafts();
  const alreadyDrafted = drafts.some(d =>
    d.getMessage().getSubject().includes(creance.lib)
  );
  if (alreadyDrafted) return;

  const prenom = clientConfig.client.split(' ')[0];

  const body = `Salut ${prenom},\n\n`
    + `Je me permets de te recontacter concernant le règlement de ${creance.mt}€ `
    + `correspondant à "${creance.lib}" dont l'échéance était fixée au ${creance.dt}.\n\n`
    + `Je comprendrai parfaitement si c'est un oubli — n'hésite pas à me dire `
    + `si tu as besoin d'un aménagement ou si le virement est déjà en cours.\n\n`
    + `Mon RIB pour rappel :\n`
    + `FR76 1469 0000 0158 0006 8277 078\n`
    + `CMCIFRP1MON\n`
    + `M ARCHANGE KIYINDOU MAYINGUIDI\n\n`
    + `PayPal : archangek.3is@gmail.com\n\n`
    + `Merci et à très vite,\n\n`
    + `Yamakasi\n`
    + `—\n`
    + `Archange Kiyindou\n`
    + `Directeur créatif · Okapi World Média`;

  const replyTo = Object.keys(CONFIG.clients).find(
    e => CONFIG.clients[e].projet === clientConfig.projet
  );

  GmailApp.createDraft(
    replyTo,
    `Rappel de paiement — ${creance.lib} · Okapi World Média`,
    body
  );
}


// ═══════════════════════════════════════════════════════════════
//  ⑧ DÉTECTION DATES → CALENDAR
// ═══════════════════════════════════════════════════════════════

function detectDatesForCalendar_(msg, clientConfig) {
  const body = (msg.getPlainBody() || msg.getBody());

  // Patterns de dates courantes
  const patterns = [
    /(?:tournage|rdv|rendez-vous|réunion|meeting|visio|zoom|livraison|deadline)\s*(?:le|du|:)?\s*(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(\d{4})?/gi,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
  ];

  const monthMap = {
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
  };

  for (const pattern of patterns) {
    const match = pattern.exec(body);
    if (match) {
      let eventDate;
      if (match[2] && monthMap[match[2].toLowerCase()] !== undefined) {
        const day = parseInt(match[1]);
        const month = monthMap[match[2].toLowerCase()];
        const year = match[3] ? parseInt(match[3]) : 2026;
        eventDate = new Date(year, month, day, 10, 0);
      } else if (match[3] && match[3].length === 4) {
        eventDate = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]), 10, 0);
      }

      if (eventDate && eventDate > new Date()) {
        // Créer un événement Calendar
        try {
          CalendarApp.getDefaultCalendar().createEvent(
            `${clientConfig.projet} — ${msg.getSubject().substring(0, 50)}`,
            eventDate,
            new Date(eventDate.getTime() + 3600000), // +1h
            {
              description: `Détecté automatiquement par l'Agent OWM\nMail: ${msg.getSubject()}\nDe: ${clientConfig.client}`,
              guests: Object.keys(CONFIG.clients).find(e => CONFIG.clients[e].projet === clientConfig.projet),
            }
          );
        } catch (e) { Logger.log('Calendar err: ' + e.message); }

        return {
          type: '📅 CALENDAR',
          projet: clientConfig.projet,
          detail: `Événement créé le ${fmtDate_(eventDate)} (détecté dans le mail)`,
          date: fmtDate_(msg.getDate()), subject: msg.getSubject()
        };
      }
    }
  }

  return null;
}


// ═══════════════════════════════════════════════════════════════
//  ⑨ RÉSUMÉ HEBDOMADAIRE (lundi 8h)
// ═══════════════════════════════════════════════════════════════

function weeklyDigest() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const weekAhead = new Date(now.getTime() + 7 * 86400000);

  let body = `🤖 RÉSUMÉ HEBDOMADAIRE OWM\n`;
  body += `Semaine du ${fmtDate_(now)}\n`;
  body += `${'═'.repeat(50)}\n\n`;

  // ── Paiements reçus cette semaine ──
  body += `💰 PAIEMENTS REÇUS\n${'─'.repeat(30)}\n`;
  try {
    const db = readFirestore_();
    const recentPayments = (db.encaisse || []).filter(p => {
      const pDate = new Date(p.dt);
      return pDate >= weekAgo && pDate <= now;
    });
    if (recentPayments.length > 0) {
      let total = 0;
      recentPayments.forEach(p => { body += `  • ${p.lib} : ${p.mt}€\n`; total += p.mt; });
      body += `  → Total : ${total}€\n\n`;
    } else {
      body += `  Aucun paiement reçu cette semaine.\n\n`;
    }
  } catch (e) { body += `  (Erreur lecture Firestore)\n\n`; }

  // ── Créances à venir (7 prochains jours) ──
  body += `⏰ ÉCHÉANCES À VENIR (7 jours)\n${'─'.repeat(30)}\n`;
  let upcomingTotal = 0;
  CONFIG.creances.forEach(cr => {
    const due = new Date(cr.dt);
    const daysLeft = Math.ceil((due - now) / 86400000);
    if (daysLeft >= 0 && daysLeft <= 7) {
      const clientConfig = CONFIG.clients[cr.client];
      body += `  ⚠️ ${cr.lib} — ${cr.mt}€ (${daysLeft}j) → ${clientConfig ? clientConfig.client : '?'}\n`;
      upcomingTotal += cr.mt;
    }
  });
  if (upcomingTotal === 0) body += `  Rien cette semaine.\n`;
  body += `\n`;

  // ── Créances en retard ──
  body += `🚨 CRÉANCES EN RETARD\n${'─'.repeat(30)}\n`;
  let overdueTotal = 0;
  CONFIG.creances.forEach(cr => {
    const due = new Date(cr.dt);
    const daysLate = Math.ceil((now - due) / 86400000);
    if (daysLate > 0) {
      const clientConfig = CONFIG.clients[cr.client];
      body += `  🔴 ${cr.lib} — ${cr.mt}€ (${daysLate}j de retard) → ${clientConfig ? clientConfig.client : '?'}\n`;
      overdueTotal += cr.mt;
    }
  });
  if (overdueTotal === 0) body += `  Aucun retard.\n`;
  else body += `  → Total en retard : ${overdueTotal}€\n`;
  body += `\n`;

  // ── Documents classés cette semaine ──
  body += `📎 ACTIVITÉ DRIVE\n${'─'.repeat(30)}\n`;
  let docsCount = 0;
  const rootFolder = getOrCreateFolder_(null, CONFIG.driveRootFolderName);
  for (const email in CONFIG.clients) {
    const c = CONFIG.clients[email];
    try {
      const cf = rootFolder.getFoldersByName(c.dossier);
      if (cf.hasNext()) {
        const folder = cf.next();
        const subs = ['Documents reçus', 'Contrats', 'Paiements'];
        subs.forEach(s => {
          const sf = folder.getFoldersByName(s);
          if (sf.hasNext()) {
            const files = sf.next().getFiles();
            while (files.hasNext()) {
              const f = files.next();
              if (f.getDateCreated() >= weekAgo) { docsCount++; }
            }
          }
        });
      }
    } catch (e) {}
  }
  body += `  ${docsCount} document(s) classé(s) cette semaine.\n\n`;

  // ── Liens ──
  body += `${'═'.repeat(50)}\n`;
  body += `Dashboard : https://okapiworldmedia.com/dashboard.html\n`;
  body += `Drive : Google Drive → ${CONFIG.driveRootFolderName}\n`;

  GmailApp.sendEmail(CONFIG.notifyEmail, `🤖 OWM Résumé hebdo · ${fmtDate_(now)}`, body);
  sendSlackMessage_(`📋 Résumé hebdo envoyé à ${CONFIG.notifyEmail}`);
}


// ═══════════════════════════════════════════════════════════════
//  ⑩ SLACK
// ═══════════════════════════════════════════════════════════════

function sendSlack_(actions) {
  if (!CONFIG.slackWebhook) return;
  const lines = actions.map(a => `${a.type} *${a.projet}* — ${a.detail}`);
  sendSlackMessage_(lines.join('\n'));
}

function sendSlackMessage_(text) {
  if (!CONFIG.slackWebhook) return;
  try {
    UrlFetchApp.fetch(CONFIG.slackWebhook, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ text }),
      muteHttpExceptions: true,
    });
  } catch (e) { Logger.log('Slack err: ' + e.message); }
}


// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS EMAIL
// ═══════════════════════════════════════════════════════════════

function sendNotification_(actions) {
  const dateStr = Utilities.formatDate(new Date(), 'Europe/Paris', 'dd/MM/yyyy HH:mm');

  let body = `🤖 Agent OWM V2 — ${dateStr}\n`;
  body += `${'─'.repeat(50)}\n\n`;
  body += `${actions.length} action(s) :\n\n`;

  actions.forEach((a, i) => {
    body += `${i + 1}. ${a.type} · ${a.projet}\n`;
    body += `   ${a.detail}\n`;
    if (a.subject) body += `   📧 ${a.subject}\n`;
    body += `   📅 ${a.date}\n\n`;
  });

  body += `${'─'.repeat(50)}\n`;
  body += `Dashboard : https://okapiworldmedia.com/dashboard.html\n`;

  GmailApp.sendEmail(
    CONFIG.notifyEmail,
    `🤖 OWM · ${actions.length} action(s) · ${dateStr}`,
    body
  );
}


// ═══════════════════════════════════════════════════════════════
//  UTILITAIRES
// ═══════════════════════════════════════════════════════════════

function getOrCreateFolder_(parent, name) {
  const it = parent ? parent.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : (parent ? parent.createFolder(name) : DriveApp.createFolder(name));
}

function ensureLabel_(name) {
  if (!GmailApp.getUserLabelByName(name)) GmailApp.createLabel(name);
}

function fmtDate_(d) {
  return Utilities.formatDate(d, 'Europe/Paris', 'yyyy-MM-dd');
}

function extractAmount_(text) {
  const patterns = [
    /(\d[\d\s]*\d)[,.](\d{2})\s*(?:€|EUR)/i,
    /(\d[\d\s]*\d)\s*(?:€|EUR)/i,
    /(\d+)[,.](\d{2})\s*(?:€|EUR)/i,
    /(\d+)\s*(?:€|EUR)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      let n = parseFloat(m[1].replace(/\s/g, ''));
      if (m[2]) n = parseFloat(m[1].replace(/\s/g, '') + '.' + m[2]);
      if (n > 0 && n < 100000) return n;
    }
  }
  return null;
}

function readFirestore_() {
  const fs = CONFIG.firestore;
  const url = `https://firestore.googleapis.com/v1/projects/${fs.projectId}/databases/(default)/documents/${fs.collection}/${fs.document}?key=${fs.apiKey}`;
  const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) return {};
  const doc = JSON.parse(resp.getContentText());
  return JSON.parse(doc.fields.state.stringValue);
}


// ═══════════════════════════════════════════════════════════════
//  FONCTIONS MANUELLES
// ═══════════════════════════════════════════════════════════════

/** Test : lance un scan complet manuellement */
function testScan() { scanGmail(); Logger.log('Scan terminé.'); }

/** Test : lance le résumé hebdo manuellement */
function testWeekly() { weeklyDigest(); Logger.log('Résumé envoyé.'); }

/** Test : vérifie les échéances */
function testDeadlines() { checkDeadlines(); Logger.log('Check terminé.'); }

/** Debug : affiche l'état Firestore */
function debugFirestore() {
  const db = readFirestore_();
  Logger.log('Encaisse: ' + JSON.stringify(db.encaisse, null, 2));
  Logger.log('Flux 2026: ' + JSON.stringify(db.flux2026));
}

/** Désinstalle l'agent */
function uninstall() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('❌ Agent OWM désinstallé.');
}
