export function bindEventWithTarget(triggerClass, eventName, onEvent) {
  const triggers = document.querySelectorAll(triggerClass);
  triggers.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();

      const target = document.getElementById(el.dataset.target);
      onEvent(el, target, e);
    });
  });
}

// toggle is-active css class when triggerClass element is clicked.
// onChanged(isActive): callback when is-active is changed.
export function toggleActive(triggerClass, toggleSelf, onChanged) {
  bindEventWithTarget(triggerClass, 'click', (el, target) => {
    if (toggleSelf) {
      el.classList.toggle('is-active');
    }

    if (target) {
      target.classList.toggle('is-active');
      const isActive = target.classList.contains('is-active');
      // if modal or navbar menu is active, prevent scrolling on backdrop elements.
      if (
        target.classList.contains('modal') ||
        target.classList.contains('navbar-menu')
      ) {
        if (isActive) {
          document.documentElement.classList.add('is-clipped');
        } else {
          document.documentElement.classList.remove('is-clipped');
        }
      }

      if (onChanged) {
        onChanged(isActive, el);
      }
    }
  });
}

// set is-active css class when one of triggerClass is clicked.
// do nothing when one of triggerClass is clicked multiple times consecutively.
export function activateOneOf(triggerClass, activateSelf, onChanged) {
  const triggers = Array.from(document.querySelectorAll(triggerClass));
  const targetsById = triggers.map((el) =>
    document.getElementById(el.dataset.target)
  );
  const targetsByClass = triggers.map((el) => {
    if (el.dataset.targetClass) {
      let classes = el.dataset.targetClass.match(/[^ ]+/g) || [];
      return classes.reduce((result, className) => {
        return result.concat(
          Array.from(document.querySelectorAll(`.${className}`))
        );
      }, []);
    } else {
      return [];
    }
  });
  let idx = -1;
  bindEventWithTarget(triggerClass, 'click', (el, target) => {
    if (activateSelf) {
      if (el.classList.contains('is-active')) {
        return;
      }
      triggers.forEach((el) => {
        el.classList.remove('is-active');
      });
      el.classList.add('is-active');
    }

    const curIdx = triggers.indexOf(el);
    if (idx === curIdx) {
      return;
    }
    idx = curIdx;

    targetsById.forEach((target) => {
      if (target) {
        target.classList.remove('is-active');
      }
    });
    if (target) {
      target.classList.add('is-active');
    }

    targetsByClass.forEach((elArr) => {
      elArr.forEach((el) => {
        el.classList.remove('is-active');
      });
    });
    const targetClassSelectors = el.dataset.targetClass
      ? el.dataset.targetClass
          .match(/[^ ]+/g)
          .map((className) => `.${className}`)
      : [];
    targetClassSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add('is-active');
      });
    });

    if (onChanged) {
      onChanged(el);
    }
  });
}

// scroll to data-target element (by id) when triggerClass is clicked, with optional extra offset.
export function bindScrollTo(triggerClass, extraOffset, behavior='smooth') {
  bindEventWithTarget(triggerClass, 'click', (el, target) => {
    if (!target) {
      return;
    }

    const y = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: y + (extraOffset || 0),
      behavior,
    });
  });
}

export function debounce(func, wait, immediate) {
  var timeout;
  return function (...args) {
    var context = this;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export function getHubspotUtk() {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)hubspotutk\s*\=\s*([^;]*).*$)|^.*$/,
    '$1'
  );
}

function submitForm(form, action) {
  form.action = action; // gtm use form action to track which hubspot form is submitted
  const fields = [];
  for (const pair of new FormData(form).entries()) {
    if (pair[0] == 'consent-to-communicate-checkbox') continue;
    fields.push({
      name: pair[0],
      value: pair[1],
    });
  }

  const hutk = getHubspotUtk();
  const body = { fields };

  if (hutk) {
    body.context = { hutk };
  }

  // add legalConsentOptions for gdpr
  const consentToProcessElt = form.querySelector('.consent-to-process');
  const consentToCommunicateElt = form.querySelector('.consent-to-communicate');

  body.legalConsentOptions = {
    consent: {
      consentToProcess: true,
      text: consentToProcessElt.dataset.text,
      communications: [{
        value: true,
        subscriptionTypeId: parseInt(consentToCommunicateElt.dataset.subscriptionTypeId),
        text: consentToCommunicateElt.dataset.text,
      }]
    }
  };

  return fetch(form.action, {
    method: form.method,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((r) => {
      if (r.ok) {
        form.parentElement.classList.add('is-submitted');
      } else {
        form.parentElement.classList.add('is-failed');
      }

      return r;
    })
    .catch((ex) => {
      form.parentElement.classList.add('is-failed');
      throw ex;
    });
}

function formIndexFuncWrapper() {
  var index = 0;
  return () => (++index);
}

const formIndexFunc = formIndexFuncWrapper();

export function setupForm(form, callbacks) {
  if (!form) {
    return;
  }

  callbacks = callbacks || {};
  const before = callbacks['click.before'];
  const after = callbacks['click.after'];
  const submitted = callbacks['submit.after'];
  const final = callbacks['submit.final'];

  form.querySelectorAll('.non-eu-privacy').forEach((el) => {
    isFromEU() ? el.classList.add('is-hidden') : el.classList.remove('is-hidden');
  });
  form.querySelectorAll('.eu-privacy').forEach((el) => {
    isFromEU() ? el.classList.remove('is-hidden') : el.classList.add('is-hidden');
  })

  const formIndex = formIndexFunc();
  const checkbox = form.querySelector('.consent-to-communicate-checkbox');
  const label = form.querySelector('.consent-to-communicate-checkbox-label');
  if (checkbox) {
    checkbox.id = `consent-to-communicate-checkbox-${formIndex}`;
    label.htmlFor = `consent-to-communicate-checkbox-${formIndex}`;
    if (!isFromEU()) checkbox.checked = true;
  }

  form.querySelectorAll('select').forEach((el) => {
    el.addEventListener('change', (ev) => {
      if (ev.target.value) {
        ev.target.classList.remove('placeholder');
      } else {
        ev.target.classList.add('placeholder');
      }
    });
  });

  form.querySelectorAll('button').forEach((el) => {
    const type = el.type;
    const name = el.dataset.name;
    const defaultAction = form.action;

    el.addEventListener('click', (ev) => {
      ev.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      if (before && before(name, type, form)) {
        return;
      }

      if (type === 'submit') {
        el.classList.add('is-loading');
        el.setAttribute('disabled', true);
        const targetAction = el.dataset.targetAction;

        submitForm(form, targetAction ? targetAction : defaultAction)
          .then((r) => {
            if (r.ok) {
              if (window.dataLayer && form.action) {
                // GTM tracking
                const formUrl = new URL(form.action);
                const parts = formUrl.pathname.split('/');
                const formId = parts[parts.length - 1];
                window.dataLayer.push({
                  event: 'hubspot-form-submitted',
                  hubspot_form_id: formId,
                });
              }

              submitted && submitted(name, type, form);
            }
          })
          .finally(() => {
            el.classList.remove('is-loading');
            el.removeAttribute('disabled');
            final && final(name, type, form);
          });
      }

      after && after(name, type, form);
    });
  });
}

export function openDemoScheduler(form, modalId, meetingUrl) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('is-active');
  }

  const wrapper = document.getElementById(`${modalId}-iframe`);
  if (wrapper) {
    let iframe = wrapper.firstElementChild;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.scrolling = 'no';

      wrapper.appendChild(iframe);
    }

    const hutk = getHubspotUtk();
    const url = new URL(meetingUrl);
    const params = new URLSearchParams();
    params.append('embed', true);
    params.append('parentHubspotUtk', hutk);
    params.append('parentPageUrl', window.location);

    if (form) {
      for (const pair of new FormData(form).entries()) {
        params.append(pair[0], pair[1]);
      }
    }

    // Hubspot does not decode `+` to space, so we need to hack here.
    url.search = params.toString().replace(/\+/g, '%20');
    iframe.src = url.toString();
  }
}

export function isInBlacklist(form, blacklist) {
  if (!window.sha1) {
    return false;
  }

  const email = new FormData(form).get('email').toLowerCase().trim();
  const hash = window.sha1('vibe_blacklist:' + email);
  return blacklist.indexOf(hash) >= 0;
}

export function getCookieValue(name) {
  return document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';
}

const EUCountryCode = [
// European uninon
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Republic of Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  'GB', // United Kingdom
// other country in Europe
  'SY', // Switzerland
]

export function isFromEU() {
  if (window.location.host == 'vibe.toyond.de' || window.location.href.endsWith('toyond/')) return true;
  return EUCountryCode.indexOf(getCookieValue('country')) != -1;
};
