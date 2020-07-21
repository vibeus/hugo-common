/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
import { toggleActive } from '{{ $src.RelPermalink }}';

toggleActive('.navbar-burger', true, (isActive) => {
  const navbar = document.querySelector('.navbar');
  if (navbar.classList.contains('is-fixed-top')) {
    return;
  }

  // For navbar that use position: sticky, we need to calculate menu size manually.
  const menu = document.getElementById('nav-menu');
  const navbarTop = navbar.getBoundingClientRect().top;
  if (isActive) {
    menu.style.maxHeight = `calc(100vh - ${navbarTop}px - 4.125rem)`;
  } else {
    menu.style.maxHeight = '';
  }
});
