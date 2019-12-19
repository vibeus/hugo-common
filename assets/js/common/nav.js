const burger = document.querySelectorAll('.navbar-burger');

burger.forEach(el => {
  el.addEventListener('click', () => {
    const target = document.getElementById(el.dataset.target);
    el.classList.toggle('is-active');
    target.classList.toggle('is-active');
  });
});
