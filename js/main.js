(function () {
  var root = document.documentElement;
  var unhide = function () { root.classList.remove('js-anim'); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header: solid on scroll, hide on scroll down ---------- */
  var hdr = document.querySelector('.hdr');
  var mbar = document.querySelector('.mbar');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (hdr) {
      hdr.classList.toggle('is-solid', y > 20);
      if (!document.body.classList.contains('menu-open')) hdr.classList.toggle('is-hidden', y > 400 && y > lastY + 4);
      if (y < lastY - 4) hdr.classList.remove('is-hidden');
    }
    if (mbar) mbar.classList.toggle('is-on', y > window.innerHeight * 0.6);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hdr.classList.remove('is-hidden');
    });
    document.querySelectorAll('.mnav a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) burger.click(); });
  }

  /* ---------- scroll reveal (level 1) ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  document.querySelectorAll('.rv,.rv-img').forEach(function (el) { io.observe(el); });

  /* ---------- draggable strip (mouse drag; touch scrolls natively) ---------- */
  document.querySelectorAll('.strip').forEach(function (s) {
    var down = false, startX = 0, startL = 0, moved = 0, v = 0, lastX = 0, raf;
    s.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = lastX = e.clientX; startL = s.scrollLeft; cancelAnimationFrame(raf);
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      if (moved > 4) s.classList.add('is-drag');
      v = e.clientX - lastX; lastX = e.clientX;
      s.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      setTimeout(function () { s.classList.remove('is-drag'); }, 30);
      (function glide() { v *= 0.93; s.scrollLeft -= v; if (Math.abs(v) > 0.4) raf = requestAnimationFrame(glide); })();
    });
  });

  /* ---------- lightbox (work page) ---------- */
  var lb = document.querySelector('.lb');
  if (lb) {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
    var img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), cur = 0, lastFocus;
    var show = function (i) { cur = (i + tiles.length) % tiles.length; var t = tiles[cur]; img.src = t.dataset.full; img.alt = t.querySelector('img').alt; cap.textContent = t.querySelector('span').textContent; };
    var close = function () { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); if (lastFocus) lastFocus.focus(); };
    tiles.forEach(function (t, i) { t.addEventListener('click', function () { lastFocus = t; show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lb.querySelector('.lb__x').focus(); }); });
    lb.querySelector('.lb__x').addEventListener('click', close);
    lb.querySelector('.lb__p').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.lb__n').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---------- first screen + GSAP moments (level 2) ---------- */
  if (!window.gsap || reduce) { unhide(); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* first screen: runs once, outside matchMedia so resizes never replay it */
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var hero = document.querySelector('.hero');
  if (hero) {
    var lines = hero.querySelectorAll('h1 .ln > span');
    var win = hero.querySelector('.gem__win');
    var frame = hero.querySelector('.gem__frame');
    var full = 'polygon(0% 17%,50% 0%,100% 17%,100% 83%,50% 100%,0% 83%)';
    gsap.set(lines, { y: 0, yPercent: 125 });
    gsap.set('.hero__sub,.hero__cta', { opacity: 0, y: 18 });
    gsap.set(win, { clipPath: 'polygon(50% 50%,50% 50%,50% 50%,50% 50%,50% 50%,50% 50%)' });
    gsap.set(frame, { clipPath: 'inset(0% 50% 0% 50%)' });
    unhide();
    tl.to(lines, { yPercent: 0, duration: 1.15, stagger: 0.1 })
      .to(win, { clipPath: full, duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.15)
      .to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power2.inOut', clearProps: 'clipPath' }, 0.55)
      .to('.hero__sub,.hero__cta', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, clearProps: 'transform' }, 0.9);
  }
  var ph = document.querySelector('.phead');
  if (ph) {
    var pl = ph.querySelectorAll('.ln > span');
    gsap.set(pl, { y: 0, yPercent: 125 });
    gsap.set(ph.querySelectorAll('p,.chev'), { opacity: 0, y: 16 });
    unhide();
    tl.to(pl, { yPercent: 0, duration: 1.1, stagger: 0.1 })
      .to(ph.querySelectorAll('.chev,p'), { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.35);
  }
  unhide();

  /* scroll moments */
  gsap.utils.toArray('.chev').forEach(function (svg) {
    if (svg.closest('.phead')) return;
    gsap.fromTo(svg, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 88%' } });
  });
  gsap.utils.toArray('.steps li').forEach(function (li, i) {
    gsap.fromTo(li, { '--p': 0 }, { '--p': 1, duration: 1.2, delay: i * 0.15, ease: 'power2.out', scrollTrigger: { trigger: li, start: 'top 88%' } });
  });
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    if (hero) gsap.to(hero.querySelector('.gem__win img'), { yPercent: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    var band = document.querySelector('.band__bg img');
    if (band) gsap.fromTo(band, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  setTimeout(unhide, 3000);
})();
