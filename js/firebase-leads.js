/**
 * MF Soluções — Firebase Leads V2
 * Captura de leads + tracking comportamental → Firestore (lp_leads)
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

    var MF_RECAPTCHA_KEY = "6Lds8AotAAAAAF7kSl-q_GNGQllFTDR73av_tD7B";
    var FIREBASE_PRONTO  = MF_FIREBASE_CONFIG.apiKey !== "COLE_AQUI_apiKey";

    /* ============================================================
       TRACKING — estado comportamental
       ============================================================ */
    var _tracking = {
        inicioSegundos:        Math.floor(Date.now() / 1000),
        scrollMaximo:          0,
        cliquesWhatsapp:       0,
        digitouNome:           false,
        digitouTelefone:       false
    };

    /* ============================================================
       TAREFA 3 — UTM + GCLID + FBCLID
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
       TRACKING — listeners DOM
       ============================================================ */
    function iniciarTracking() {
        // Scroll máximo
        window.addEventListener('scroll', function () {
            var scrolled = window.scrollY + window.innerHeight;
            var total    = document.documentElement.scrollHeight;
            var pct      = total > 0 ? Math.round((scrolled / total) * 100) : 0;
            if (pct > _tracking.scrollMaximo) _tracking.scrollMaximo = pct;
        }, { passive: true });

        // Cliques WhatsApp
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a');
            if (link && link.href && (link.href.indexOf('wa.me') > -1 || link.href.indexOf('whatsapp.com') > -1)) {
                _tracking.cliquesWhatsapp++;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'whatsapp_click', {
                        origem: link.className || 'link_whatsapp',
                        href: link.href
                    });
                }
            }
        });

        // Digitou nome
        document.addEventListener('input', function (e) {
            if (e.target && e.target.id === 'lead-nome' && e.target.value.trim().length > 0) {
                _tracking.digitouNome = true;
            }
            if (e.target && e.target.id === 'lead-telefone' && e.target.value.trim().length > 0) {
                _tracking.digitouTelefone = true;
            }
        });
    }

    /* ============================================================
       SCORE — calculado no momento do envio
       ============================================================ */
    function calcularScore(tracking) {
        var score = 0;
        if (tracking.digitouNome)                   score += 10;
        if (tracking.digitouTelefone)               score += 20;
        if (tracking.scrollMaximo > 50)             score += 20;
        if (tracking.tempoTotalSegundos > 40)       score += 20;
        score += 30; // formulário enviado
        return Math.min(100, score);
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
       RECAPTCHA V3
       ============================================================ */
    function obterTokenRecaptcha(acao) {
        return new Promise(function (resolve) {
            try {
                if (typeof grecaptcha === 'undefined' || MF_RECAPTCHA_KEY === 'COLE_AQUI_siteKey_v3') {
                    resolve(''); return;
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
       SALVAR LEAD — Firestore com tracking
       ============================================================ */
    function salvarLead(dadosLead, callback) {
        var utms  = coletarUTMs();
        var agora = new Date().toISOString();
        var sessao = utms.sessionId;

        // Calcular tempo total na página
        var tempoTotalSegundos = Math.floor(Date.now() / 1000) - _tracking.inicioSegundos;
        _tracking.tempoTotalSegundos = tempoTotalSegundos;

        var score = calcularScore(_tracking);

        var documento = {
            // ── Dados do lead ──
            nome:         dadosLead.nome      || '',
            telefone:     dadosLead.telefone   || '',
            valorConta:   dadosLead.valorConta || 'Não informado',
            origem:       dadosLead.origem     || 'hero_form',
            status:       'novo',
            createdAt:    agora,
            lastActivity: agora,

            // ── UTMs e sessão ──
            landingPage:  utms.landingPage  || window.location.href,
            referrer:     utms.referrer     || '',
            utm_source:   utms.utm_source   || '',
            utm_medium:   utms.utm_medium   || '',
            utm_campaign: utms.utm_campaign || '',
            utm_content:  utms.utm_content  || '',
            utm_term:     utms.utm_term     || '',
            gclid:        utms.gclid        || '',
            fbclid:       utms.fbclid       || '',
            firstVisit:   utms.firstVisit   || agora,
            sessionId:    sessao,

            // ── Comportamento (tracking) ──
            tempoTotalSegundos:    tempoTotalSegundos,
            scrollMaximoPercentual: _tracking.scrollMaximo,
            cliquesWhatsapp:       _tracking.cliquesWhatsapp,
            digitouNome:           _tracking.digitouNome,
            digitouTelefone:       _tracking.digitouTelefone,

            // ── Score ──
            score: score
        };

        if (dadosLead.recaptchaToken) documento.recaptchaToken = dadosLead.recaptchaToken;

        var gtagParams = { sessionId: sessao, utm_source: documento.utm_source, utm_campaign: documento.utm_campaign, score: score };
        if (typeof gtag !== 'undefined') gtag('event', 'lead_saved', gtagParams);

        var db = iniciarFirebase();

        if (!db) {
            console.warn('[mfLeads] Firebase não configurado. Lead apenas em localStorage.');
            if (typeof callback === 'function') callback(null);
            return;
        }

        db.collection('lp_leads').add(documento)
            .then(function (ref) {
                console.log('[mfLeads] Lead salvo:', ref.id, '| score:', score);
                if (typeof gtag !== 'undefined') gtag('event', 'firebase_success', gtagParams);
                if (typeof callback === 'function') callback(ref.id);
            })
            .catch(function (err) {
                console.warn('[mfLeads] Firestore error:', err.message);
                if (typeof gtag !== 'undefined') gtag('event', 'firebase_error', Object.assign({}, gtagParams, { error: err.message }));
                if (typeof callback === 'function') callback(null);
            });
    }

    /* ============================================================
       PIXEL LAYER
       ============================================================ */
    window.mfTracking = {
        trackLead:     function (params) { /* fbq('track', 'Lead', params) */ },
        trackWhatsapp: function (origem)  { /* fbq('trackCustom', 'WhatsAppClick', {origem}) */ },
        trackPageView: function ()        { /* fbq('track', 'PageView') */ }
    };

    /* ============================================================
       INIT
       ============================================================ */
    capturarParametros();
    obterSessionId();
    iniciarTracking();

    window.mfLeads = {
        save:              salvarLead,
        getUTMs:           coletarUTMs,
        getRecaptchaToken: obterTokenRecaptcha
    };

})();
