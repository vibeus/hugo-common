function bindEventWithTarget(triggerClass, eventName, onEvent) {
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
      // if modal is active, clip html
      if (target.classList.contains('modal')) {
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
              submitted && submitted(name, type, form);
            }
          })
          .finally(() => {
            el.classList.remove('is-loading');
            el.removeAttribute('disabled');
          });
      }

      after && after(name, type, form);
    });
  });
}
