/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
import { isFromEU } from '{{ $src.RelPermalink }}';

const hsId = '{{ .hsId }}';
const gtmId = '{{ .gtmId }}';
const hsCookieBannerId = '{{ .hsCookieBannerId }}';
const hsScriptLoaderId = '{{ .hsScriptLoaderId }}';
const cookieConfirmationButtonId = '{{ .cookieConfirmationButtonId }}';

const initGtm = () => {
// {{ if .GDPRdebug }}
  console.log("[D]: Load google tag manager.");
// {{ end }}
  var e = document.createElement('noscript');
  e.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.insertBefore(document.body, document.body.firstChild);

  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({
      'gtm.start':
        new Date().getTime(), event: 'gtm.js'
    });
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', `${gtmId}`);
};

const consentCallback = (observer, consent) => {
// {{ if .GDPRdebug }}
  console.log(`[D]: Consent ${consent.allowed ? 'granted' : 'not granted'}.`);
// {{ end }}
  if (consent.allowed) {
    initGtm();
  }
  observer.disconnect();
// {{ if .GDPRdebug }}
  console.log(`[D]: Observer disconnected.`);
// {{ end }}
};

const initHubspotTrackingCode = (observer) => {
  var _hsp = window._hsp = window._hsp || [];
  _hsp.push(['addPrivacyConsentListener', consentCallback.bind(this, observer)]);

  var el = document.createElement('script');
  el.type = 'text/javascript';
  el.src = `//js.hs-scripts.com/${hsId}.js`;
  el.async = true;
  el.defer = true;
  el.id = hsScriptLoaderId;
  document.body.appendChild(el);
};

const onCookieBannerMounted = () => {
// {{ if .GDPRdebug }}
  console.log('[D]: Cookie banner inserted.')
// {{ end }}
  if (!isFromEU()) {
    document.getElementById(cookieConfirmationButtonId).click();
    document.body.removeChild(document.getElementById(hsCookieBannerId));
  }
};

const init = () => {
  console.log(isFromEU())
  if (isFromEU()) {
    document.documentElement.classList.add('gdpr-enabled');
  }
// {{ if .GDPRdebug }}
  console.log('[D]: Observer initialized.')
// {{ end }}
  var observer = new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.id == hsCookieBannerId) {
          onCookieBannerMounted();
          observer.disconnect();
          observer.disconnect();
// {{ if .GDPRdebug }}
          console.log('[D]: Observer disconnected.')
// {{ end }}
        }
      });
    });
  });
  observer.observe(document.body, {
    childList: true
  });

  initHubspotTrackingCode(observer);
};

init();