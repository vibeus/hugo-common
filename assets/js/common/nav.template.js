/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
import { toggleActive } from '{{ $src.RelPermalink }}';

const navbar = document.querySelector('.navbar');
const menu = document.getElementById('nav-menu');

function setNavMenuHeight() {
  const navbarTop = navbar.getBoundingClientRect().top;
  menu.style.maxHeight = `calc(${window.innerHeight - navbarTop}px - 4.125rem)`;
}

function clearNavMenuHeight() {
  menu.style.maxHeight = '';
}

toggleActive('.navbar-burger', true, (isActive) => {
  if (isActive) {
    setNavMenuHeight();
  } else {
    clearNavMenuHeight();
  }
});

window.addEventListener('resize', () => {
  if (menu.classList.contains('is-active')) {
    setNavMenuHeight();
  }
});
