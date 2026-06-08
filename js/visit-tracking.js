/**
 * MF Soluções — Visit Tracking
 * Registra visita em landing_visits (Firestore) para métricas de QR Code.
 * Executa após firebase-leads.js (que inicializa Firebase e cria sessionId).
 */
(function () {
    'use strict';

    // Uma visita por sessão de navegador
    if (sessionStorage.getItem('mf_visit_ok')) return;

    setTimeout(function () {
        try {
            if (typeof firebase === 'undefined' || !firebase.apps.length) return;

            var params   = new URLSearchParams(window.location.search);
            var ls       = function (k) { return params.get(k) || localStorage.getItem('mf_' + k) || ''; };
            var sessionId = localStorage.getItem('mf_sessionId') || '';

            var registro = {
                sessionId:    sessionId,
                utm_source:   ls('utm_source')   || 'direto',
                utm_medium:   ls('utm_medium'),
                utm_campaign: ls('utm_campaign'),
                utm_content:  ls('utm_content'),
                referrer:     document.referrer || '',
                timestamp:    new Date().toISOString()
            };

            firebase.firestore().collection('landing_visits').add(registro)
                .then(function () {
                    sessionStorage.setItem('mf_visit_ok', '1');
                })
                .catch(function () { /* silencioso */ });
        } catch (e) { /* silencioso */ }
    }, 800); // aguarda firebase-leads.js inicializar Firebase
})();
