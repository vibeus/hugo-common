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
  const targetsById = triggers.map(el => document.getElementById(el.dataset.target));
  const targetsByClass = triggers.map(el => {
    if (el.dataset.targetClass) {
      let classes = el.dataset.targetClass.match(/[^ ]+/g) || [];
      return classes.reduce((result, className) => {
        return result.concat(Array.from(document.querySelectorAll(`.${className}`)));
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
      triggers.forEach(el => {
        el.classList.remove('is-active');
      });
      el.classList.add('is-active');
    }

    const curIdx = triggers.indexOf(el);
    if (idx === curIdx) {
      return;
    }
    idx = curIdx;

    targetsById.forEach(target => {
      if (target) {
        target.classList.remove('is-active');
      }
    })
    if (target) {
      target.classList.add('is-active');
    }

    targetsByClass.forEach(elArr => {
      elArr.forEach(el => {
        el.classList.remove('is-active');
      });
    });
    const targetClassSelectors = el.dataset.targetClass ? el.dataset.targetClass.match(/[^ ]+/g).map(className => `.${className}`) : [];
    targetClassSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.add('is-active');
      });
    });
    
    if (onChanged) {
      onChanged(el);
    }
  });
};

// scroll to data-target element (by id) when triggerClass is clicked, with optional extra offset.
export function bindScrollTo(triggerClass, extraOffset) {
  bindEventWithTarget(triggerClass, 'click', (el, target) => {
    if (!target) {
      return;
    }

    const y = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: y + (extraOffset || 0),
      behavior: 'smooth',
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

function submitForm(form) {
  const fields = [];
  for (const pair of new FormData(form).entries()) {
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

export function setupForm(form, callbacks) {
  if (!form) {
    return;
  }

  callbacks = callbacks || {};
  const before = callbacks['click.before'];
  const after = callbacks['click.after'];
  const submitted = callbacks['submit.after'];
  const final = callbacks['submit.final'];

  form.querySelectorAll('button').forEach((el) => {
    const type = el.type;
    const name = el.dataset.name;
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

        submitForm(form)
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

    for (const pair of new FormData(form).entries()) {
      params.append(pair[0], pair[1]);
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
