function bindEventWithTarget(triggerClass, eventName, onEvent) {
  const triggers = document.querySelectorAll(triggerClass);
  triggers.forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();

      const target = document.getElementById(el.dataset.target);
      if (!target) {
        return;
      }

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

    target.classList.toggle('is-active');
    if (onChanged) {
      onChanged(target.classList.contains('is-active'));
    }
  });
}

// scroll to data-target element (by id) when triggerClass is clicked, with optional extra offset.
export function bindScrollTo(triggerClass, extraOffset) {
  bindEventWithTarget(triggerClass, 'click', (el, target) => {
    const y = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: y + (extraOffset || 0),
      behavior: 'smooth',
    });
  });
}

export function debounce(func, wait, immediate) {
  var timeout;
  return function(...args) {
    var context = this;
    var later = function() {
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
