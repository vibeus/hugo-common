// toggle is-active css class when triggerClass element is clicked.
// onChanged(isActive): callback when is-active is changed.
export function toggleActive(triggerClass, toggleSelf, onChanged) {
  const triggers = document.querySelectorAll(triggerClass);
  triggers.forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();

      const target = document.getElementById(el.dataset.target);
      if (!target) {
        return;
      }

      if (toggleSelf) {
        el.classList.toggle('is-active');
      }

      target.classList.toggle('is-active');
      if (onChanged) {
        onChanged(target.classList.contains('is-active'));
      }
    });
  });
}
