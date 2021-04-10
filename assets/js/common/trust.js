const glides = document.querySelectorAll('.is-trust .customers .glide');

glides.forEach((el) => {
  const glide = new Glide(el, {
    type: 'carousel',
    autoplay: 6000,
    dragThreshold: 80,
    perView: 5,
    breakpoints: {
      1280: {
        perView: 4,
      },
      700: {
        perView: 3,
      },
    },
  });

  const dots = Array.from(
    el.parentElement.querySelectorAll('.glide-dots .icon')
  );
  dots.forEach((d, idx) => {
    d.addEventListener('click', () => {
      glide.go('=' + idx);
    });
  });

  const updateDots = () => {
    dots.forEach((x) => x.classList.remove('is-active'));
    dots[glide.index].classList.add('is-active');
  };

  el.parentElement.querySelectorAll('.glide-nav').forEach((nav) => {
    nav.addEventListener('click', () => {
      if (nav.classList.contains('is-left')) {
        glide.go('<');
      } else if (nav.classList.contains('is-right')) {
        glide.go('>');
      }
    });
  });

  glide.on('run.after', updateDots);
  glide.on('mount.after', updateDots);
  glide.mount();
});