/**
 * MF Soluções — Firebase Leads V1
 * Captura de leads da landing page → Firestore (lp_leads)
 *
 * ANTES DO DEPLOY: preencher MF_FIREBASE_CONFIG e MF_RECAPTCHA_KEY
 */
(function () {
    'use strict';

    /* ============================================================
       CONFIGURAÇÃO
       ============================================================ */
    var MF_FIREBASE_CONFIG = {
        apiKey:            "AIzaSyD8OBOl1hUfsrWWT0-L19uuI-F273IvBgU",
        authDomain:        "mf-solucoes-crm.firebaseapp.com",
        projectId:         "mf-solucoes-crm",
        storageBucket:     "mf-solucoes-crm.firebasestorage.app",
        messagingSenderId: "492242482187",
        appId:             "1:492242482187:web:34c99a57f3b99c2260030e"
    };

    // reCAPTCHA v3: registrar site em https://www.google.com/recaptcha/admin
    var MF_RECAPTCHA_KEY = "COLE_AQUI_siteKey_v3";

    var FIREBASE_PRONTO = MF_FIREBASE_CONFIG.apiKey !== "COLE_AQUI_apiKey";

    /* ============================================================
       TAREFA 3 — UTM + GCLID + FBCLID (não sobrescrever)
       ============================================================ */
    function capturarParametros() {
        var params = new URLSearchParams(window.location.search);
        var chaves = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
        chaves.forEach(function (k) {
            var val = params.get(k);
            if (val && !localStorage.getItem('mf_' + k)) {
                localStorage.setItem('mf_' + k, val);
            }
        });
        if (!localStorage.getItem('mf_referrer'))    localStorage.setItem('mf_referrer',    document.referrer || 'direto');
        if (!localStorage.getItem('mf_landingPage')) localStorage.setItem('mf_landingPage', window.location.href);
        if (!localStorage.getItem('mf_firstVisit'))  localStorage.setItem('mf_firstVisit',  new Date().toISOString());
    }

    /* ============================================================
       TAREFA 4 — SESSION ID único
       ============================================================ */
    function obterSessionId() {
        var key = 'mf_sessionId';
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, 'mf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6));
        }
        return localStorage.getItem(key);
    }

    function coletarUTMs() {
        var chaves = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term',
                      'gclid','fbclid','referrer','landingPage','firstVisit'];
        var resultado = {};
        chaves.forEach(function (k) {
            var v = localStorage.getItem('mf_' + k);
            if (v) resultado[k] = v;
        });
        resultado.sessionId = obterSessionId();
        return resultado;
    }

    /* ============================================================
       FIREBASE INIT
       ============================================================ */
    function iniciarFirebase() {
        if (!FIREBASE_PRONTO) return null;
        try {
            if (typeof firebase === 'undefined') return null;
            if (!firebase.apps.length) firebase.initializeApp(MF_FIREBASE_CONFIG);
            return firebase.firestore();
        } catch (e) {
            console.warn('[mfLeads] Firebase init:', e.message);
            return null;
        }
    }

    /* ============================================================
       TAREFA 7 — RECAPTCHA V3 (silencioso)
       ============================================================ */
    function obterTokenRecaptcha(acao) {
        return new Promise(function (resolve) {
            try {
                if (typeof grecaptcha === 'undefined' || MF_RECAPTCHA_KEY === 'COLE_AQUI_siteKey_v3') {
                    resolve('');
                    return;
                }
                grecaptcha.ready(function () {
                    grecaptcha.execute(MF_RECAPTCHA_KEY, { action: acao })
                        .then(resolve)
                        .catch(function () { resolve(''); });
                });
            } catch (e) { resolve(''); }
        });
    }

    /* ============================================================
       TAREFA 5 — SALVAR LEAD (Firestore primeiro, WhatsApp depois)
       ============================================================ */
    function salvarLead(dadosLead, callback) {
        var utms     = coletarUTMs();
        var agora    = new Date().toISOString();
        var sessao   = utms.sessionId;

        var documento = {
            nome:         dadosLead.nome         || '',
            telefone:     dadosLead.telefone      || '',
            valorConta:   dadosLead.valorConta    || 'Não informado',
            origem:       dadosLead.origem        || 'hero_form',
            status:       'novo',
            createdAt:    agora,
            landingPage:  utms.landingPage        || window.location.href,
            referrer:     utms.referrer           || '',
            utm_source:   utms.utm_source         || '',
            utm_medium:   utms.utm_medium         || '',
            utm_campaign: utms.utm_campaign       || '',
            utm_content:  utms.utm_content        || '',
            utm_term:     utms.utm_term           || '',
            gclid:        utms.gclid              || '',
            fbclid:       utms.fbclid             || '',
            firstVisit:   utms.firstVisit         || '',
            sessionId:    sessao
        };

        if (dadosLead.recaptchaToken) documento.recaptchaToken = dadosLead.recaptchaToken;

        /* TAREFA 6 — evento lead_saved sempre (mesmo sem Firebase) */
        var gtagParams = { sessionId: sessao, utm_source: documento.utm_source, utm_campaign: documento.utm_campaign };
        if (typeof gtag !== 'undefined') gtag('event', 'lead_saved', gtagParams);

        var db = iniciarFirebase();

        if (!db) {
            console.warn('[mfLeads] Firebase não configurado. Lead apenas em localStorage.');
            if (typeof callback === 'function') callback(null);
            return;
        }

        db.collection('lp_leads').add(documento)
            .then(function (ref) {
                if (typeof gtag !== 'undefined') gtag('event', 'firebase_success', gtagParams);
                if (typeof callback === 'function') callback(ref.id);
            })
            .catch(function (err) {
                console.warn('[mfLeads] Firestore error:', err.message);
                if (typeof gtag !== 'undefined') gtag('event', 'firebase_error', Object.assign({}, gtagParams, { error: err.message }));
                if (typeof callback === 'function') callback(null); /* não bloqueia WhatsApp */
            });
    }

    /* ============================================================
       TAREFA 9 — PIXEL LAYER (preparado para Meta + Google Ads)
       ============================================================ */
    window.mfTracking = {
        trackLead: function (params) {
            // Descomentar ao configurar Meta Pixel / Google Ads Conversion:
            // if (typeof fbq !== 'undefined') fbq('track', 'Lead', params || {});
            // if (typeof gtag !== 'undefined') gtag('event', 'conversion', { send_to: 'AW-CONVERSION_ID/LABEL' });
        },
        trackWhatsapp: function (origem) {
            // if (typeof fbq !== 'undefined') fbq('trackCustom', 'WhatsAppClick', { origem: origem });
        },
        trackPageView: function () {
            // if (typeof fbq !== 'undefined') fbq('track', 'PageView');
        }
    };

    /* ============================================================
       INIT
       ============================================================ */
    capturarParametros();
    obterSessionId();

    /* API pública */
    window.mfLeads = {
        save:                salvarLead,
        getUTMs:             coletarUTMs,
        getRecaptchaToken:   obterTokenRecaptcha
    };

})();
