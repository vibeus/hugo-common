/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/

import { bindScrollTo, bindEventWithTarget } from '{{ $src.RelPermalink }}';

bindEventWithTarget('.is-what-is-vibe .is-playlist-item', 'click', (el) => {
  const bodys = el.parentElement.querySelectorAll('.body');
  bodys.forEach(body => {
    body.style.height = body.closest('.is-playlist-item') == el ? body.scrollHeight + 'px' : '0px';
  });
});

window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector('.is-what-is-vibe .is-playlist-item').click();
});

const navbar = document.querySelector('.navbar');
const navbarHeight = navbar ? navbar.clientHeight : 0;
bindScrollTo(
  '.is-request-demo',
  -navbarHeight
);