/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
import { isFromEU, getCookieValue } from '{{ $src.RelPermalink }}';

const hsId = '{{ .hsId }}';
const gtmId = '{{ .gtmId }}';
const hsCookieBannerId = '{{ .hsCookieBannerId }}';
const hsScriptLoaderId = '{{ .hsScriptLoaderId }}';
const cookieConfirmationButtonId = '{{ .cookieConfirmationButtonId }}';
const cookieDeclineButtonId = '{{ .cookieDeclineButtonId }}';

function gtmHelper(w, d, s, l, i) {
  var e = d.createElement('noscript');
  e.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  d.body.insertBefore(e, d.body.firstChild);

  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
}

const initGtm = () => {
  // {{ if .GDPRdebug }}
  console.log('[D]: Load google tag manager.');
  // {{ end }}
  gtmHelper(window, document, 'script', 'dataLayer', `${gtmId}`);
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
  var _hsp = (window._hsp = window._hsp || []);
  _hsp.push([
    'addPrivacyConsentListener',
    consentCallback.bind(this, observer),
  ]);

  var el = document.createElement('script');
  el.type = 'text/javascript';
  el.src = `//js.hs-scripts.com/${hsId}.js`;
  el.async = true;
  el.defer = true;
  el.id = hsScriptLoaderId;
  document.body.appendChild(el);
};

const setupCloseIcon = () => {
  const cookieBanner = document.getElementById(hsCookieBannerId);
  var closeIcon = document.createElement('button');
  closeIcon.classList.add('modal-close', 'is-medium');
  closeIcon.setAttribute('aria-label', 'close');
  cookieBanner.appendChild(closeIcon);
  closeIcon.addEventListener('click', () => {
    document.getElementById(cookieDeclineButtonId).click();
  });
};

const onCookieBannerMounted = () => {
  // {{ if .GDPRdebug }}
  console.log('[D]: Cookie banner inserted.');
  // {{ end }}
  if (!isFromEU()) {
    document.getElementById(cookieConfirmationButtonId).click();
    document.body.removeChild(document.getElementById(hsCookieBannerId));
  } else {
    setupCloseIcon();
  }
};

const updateEU = () => {
  var orderPageUrl = '/order/eu-sales/';
  const countryCode = getCookieValue('country');
  // TODO: make this more general
  switch (countryCode) {
    case 'GB':
      orderPageUrl = '/order/uk-sales/';
      break;
    default:
      break;
  }
  document.documentElement.classList.add('gdpr-enabled');
  document
    .querySelectorAll('a[href="https://vibe.us/order/"], a[href="/order/"]')
    .forEach((el) => {
      el.href = orderPageUrl;
    });
};

const init = () => {
  if (isFromEU()) {
    updateEU();
  }
  // {{ if .GDPRdebug }}
  console.log('[D]: Observer initialized.');
  // {{ end }}
  var observer = new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.id == hsCookieBannerId) {
          onCookieBannerMounted();
          observer.disconnect();
          observer.disconnect();
          // {{ if .GDPRdebug }}
          console.log('[D]: Observer disconnected.');
          // {{ end }}
        }
      });
    });
  });
  observer.observe(document.body, {
    childList: true,
  });

  initHubspotTrackingCode(observer);
};

init();
