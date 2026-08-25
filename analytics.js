/* ============================================================
   PIXELPLUGINS — consent-gated analytics
   ============================================================ */
(function (window, document) {
    'use strict';

    var GA_ID = 'G-LD08GQX17E';
    var CLARITY_ID = 'xq1eetta6q';
    var STORAGE_KEY = 'pixelplugins_analytics_consent_v1';
    var state = {
        choice: null,
        googleLoaded: false,
        clarityLoaded: false
    };

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    // Consent Mode v2 defaults must be set synchronously before any Google tag.
    window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted'
    });
    window['ga-disable-' + GA_ID] = true;

    function readChoice() {
        try {
            var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
            return saved && (saved.choice === 'granted' || saved.choice === 'denied') ? saved.choice : null;
        } catch (error) {
            return null;
        }
    }

    function saveChoice(choice) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                choice: choice,
                version: 1,
                updatedAt: new Date().toISOString()
            }));
        } catch (error) {
            // The choice still applies for this page when storage is unavailable.
        }
    }

    function loadGoogleAnalytics() {
        if (state.googleLoaded) return;
        state.googleLoaded = true;
        window['ga-disable-' + GA_ID] = false;
        window.gtag('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted',
            personalization_storage: 'denied'
        });
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, {
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });

        var tag = document.createElement('script');
        tag.async = true;
        tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
        tag.dataset.pixelAnalytics = 'google';
        document.head.appendChild(tag);
    }

    function loadClarity() {
        if (state.clarityLoaded) return;
        state.clarityLoaded = true;
        window.clarity = window.clarity || function () {
            (window.clarity.q = window.clarity.q || []).push(arguments);
        };
        window.clarity('consentv2', {
            ad_Storage: 'denied',
            analytics_Storage: 'granted'
        });

        var tag = document.createElement('script');
        tag.async = true;
        tag.src = 'https://www.clarity.ms/tag/' + CLARITY_ID;
        tag.dataset.pixelAnalytics = 'clarity';
        document.head.appendChild(tag);
    }

    function clearAnalyticsCookies() {
        document.cookie.split(';').forEach(function (entry) {
            var name = entry.split('=')[0].trim();
            if (!/^(_ga|_gid|_gat|_clck|_clsk)/.test(name)) return;
            var expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
            document.cookie = name + '=; ' + expires;
            document.cookie = name + '=; ' + expires + '; domain=' + window.location.hostname;
            if (window.location.hostname.split('.').length > 2) {
                document.cookie = name + '=; ' + expires + '; domain=.' + window.location.hostname.split('.').slice(-2).join('.');
            }
        });
    }

    function disableAnalytics() {
        window['ga-disable-' + GA_ID] = true;
        window.gtag('consent', 'update', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            personalization_storage: 'denied'
        });
        if (state.clarityLoaded && typeof window.clarity === 'function') {
            window.clarity('consentv2', {
                ad_Storage: 'denied',
                analytics_Storage: 'denied'
            });
            window.clarity('consent', false);
        }
        clearAnalyticsCookies();
    }

    function setConsent(choice) {
        if (choice !== 'granted' && choice !== 'denied') return;
        state.choice = choice;
        saveChoice(choice);
        if (choice === 'granted') {
            loadGoogleAnalytics();
            loadClarity();
        } else {
            disableAnalytics();
        }
        document.dispatchEvent(new CustomEvent('pixelplugins:consent-changed', {
            detail: { choice: choice }
        }));
    }

    function track(eventName, parameters) {
        if (state.choice !== 'granted') return false;
        window.gtag('event', eventName, parameters || {});
        return true;
    }

    state.choice = readChoice();
    window.PixelAnalytics = {
        getConsent: function () { return state.choice; },
        setConsent: setConsent,
        track: track
    };

    if (state.choice === 'granted') {
        loadGoogleAnalytics();
        loadClarity();
    }
})(window, document);
