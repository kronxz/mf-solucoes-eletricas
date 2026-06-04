/**
 * MF Soluções — Rastreamento de Visitantes + QR Codes
 * Registra visitas, cliques WhatsApp e conversões em landing_visits (Firestore)
 * Não altera nenhum elemento visual da página.
 */
(function () {
    'use strict';

    var FIREBASE_CONFIG = {
        apiKey:            'AIzaSyD8OBOl1hUfsrWWT0-L19uuI-F273IvBgU',
        authDomain:        'mf-solucoes-crm.firebaseapp.com',
        projectId:         'mf-solucoes-crm',
        storageBucket:     'mf-solucoes-crm.firebasestorage.app',
        messagingSenderId: '492242482187',
        appId:             '1:492242482187:web:34c99a57f3b99c2260030e'
    };

    var VISIT_SESSION_KEY = 'mf_visit_ok';
    var _db = null;

    /* ── Firebase (reusa instância já criada por firebase-leads.js) ── */
    function getDb() {
        if (_db) return _db;
        try {
            if (typeof firebase === 'undefined') return null;
            if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
            _db = firebase.firestore();
        } catch (e) { console.warn('[MF-Visit] Firebase init:', e.message); }
        return _db;
    }

    /* ── SessionId (reutiliza o mesmo gerado por firebase-leads.js) ── */
    function getSessionId() {
        var k = 'mf_sessionId';
        if (!localStorage.getItem(k)) {
            localStorage.setItem(k, 'mf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6));
        }
        return localStorage.getItem(k);
    }

    /* ── UTMs — URL tem prioridade, fallback para localStorage ── */
    function getParam(key) {
        return new URLSearchParams(window.location.search).get(key)
            || localStorage.getItem('mf_' + key)
            || '';
    }

    /* ── OBJETIVO 1 — Registrar visita (uma vez por sessão) ── */
    function registrarVisita() {
        var sid = getSessionId();
        if (sessionStorage.getItem(VISIT_SESSION_KEY) === sid) return; // já registrada

        var db = getDb();
        if (!db) return;

        var dados = {
            sessionId:    sid,
            timestamp:    new Date().toISOString(),
            utm_source:   getParam('utm_source'),
            utm_medium:   getParam('utm_medium'),
            utm_campaign: getParam('utm_campaign'),
            utm_content:  getParam('utm_content'),
            utm_term:     getParam('utm_term'),
            userAgent:    navigator.userAgent.slice(0, 200),
            referer:      document.referrer || 'direto',
            whatsappClicks: 0,
            leadConvertido: false,
            leadId:       ''
        };

        // Usa sessionId como ID do documento para poder atualizar depois
        db.collection('landing_visits').doc(sid).set(dados, { merge: true })
            .then(function () {
                sessionStorage.setItem(VISIT_SESSION_KEY, sid);
                console.log('[MF-Visit] Visita registrada | campaign:', dados.utm_campaign || '(sem campaign)');
            })
            .catch(function (e) { console.warn('[MF-Visit] Erro visita:', e.message); });
    }

    /* ── OBJETIVO 2 — Registrar clique WhatsApp ── */
    function registrarWhatsapp() {
        var sid = getSessionId();
        var db  = getDb();
        if (!db) return;
        db.collection('landing_visits').doc(sid).update({
            whatsappClicks: firebase.firestore.FieldValue.increment(1),
            ultimoWhatsapp: new Date().toISOString()
        }).catch(function (e) { console.warn('[MF-Visit] Erro WhatsApp:', e.message); });
    }

    /* ── OBJETIVO 3 — Registrar lead convertido ── */
    function registrarLeadConvertido(leadId) {
        var sid = getSessionId();
        var db  = getDb();
        if (!db) return;
        db.collection('landing_visits').doc(sid).update({
            leadConvertido:   true,
            leadId:           leadId || '',
            leadConvertidoEm: new Date().toISOString()
        }).catch(function (e) { console.warn('[MF-Visit] Erro lead:', e.message); });
    }

    /* ── Listeners ── */
    document.addEventListener('click', function (e) {
        var a = e.target.closest('a');
        if (a && a.href && (a.href.indexOf('wa.me') > -1 || a.href.indexOf('whatsapp') > -1)) {
            registrarWhatsapp();
        }
    }, { passive: true });

    /* ── Init — aguarda SDK Firebase carregar ── */
    function init() { setTimeout(registrarVisita, 400); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ── API pública ── */
    window.mfVisitTracking = { registrarLeadConvertido: registrarLeadConvertido };

})();
