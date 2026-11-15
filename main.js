(() => {
  'use strict';
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  const toggle = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const currentTheme = () => root.dataset.theme || (preference.matches ? 'dark' : 'light');
  function updateThemeControl() {
    const dark = currentTheme() === 'dark';
    if (toggle) {
      toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
      toggle.title = `Switch to ${dark ? 'light' : 'dark'} theme`;
      const sym = toggle.querySelector('.theme-symbol');
      if (sym) sym.innerHTML = dark
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'
        : '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>';
    }
    if (themeColor) themeColor.content = dark ? '#0c1115' : '#f3f7f9';
  }
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const theme = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = theme;
      try { localStorage.setItem('theme', theme); } catch (error) { /* Storage is optional. */ }
      updateThemeControl();
    });
  }
  preference.addEventListener('change', updateThemeControl);
  updateThemeControl();

  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }), { threshold: .15 });
    items.forEach(el => observer.observe(el));
  } else items.forEach(el => el.classList.add('visible'));
})();

// 3D logo: replaces the flat hero image with two joined cubes that sway on their own,
// follow a mouse drag or a touch swipe, and ease back to the logo pose.
(() => {
  const img = document.querySelector('.hero-logo');
  if (!img) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const box = document.createElement('div');
  box.className = 'logo3d';
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', img.alt);
  const cube = name => '<div class="cube ' + name + '">' + ['front', 'back', 'left', 'right', 'top', 'bottom'].map(f => '<div class="face f-' + f + '"></div>').join('') + '</div>';
  box.innerHTML = '<div class="logo3d-scene">' + cube('a') + cube('b') + '</div>';
  img.replaceWith(box);
  const scene = box.firstChild;
  const BASE_YAW = 45, BASE_PITCH = -30;
  let ox = 0, oy = 0, vx = 0, vy = 0, drag = false, lastX = 0, lastY = 0, t0 = performance.now();
  const wrap = a => ((a + 180) % 360 + 360) % 360 - 180;
  function frame(now) {
    const t = (now - t0) / 1000;
    if (!drag) {
      ox += vx; oy += vy; vx *= .94; vy *= .94;
      const k = Math.abs(vx) + Math.abs(vy) < .05 ? .035 : 0;
      ox = wrap(ox); ox -= ox * k; oy -= oy * k;
    }
    const sway = calm.matches ? 0 : Math.sin(t * .7) * 28;
    const bob = calm.matches ? 0 : Math.sin(t * .9 + 1) * 4;
    const yaw = BASE_YAW + sway + ox;
    const pitch = Math.max(-85, Math.min(85, BASE_PITCH + bob + oy));
    scene.style.transform = 'rotateX(' + pitch + 'deg) rotateY(' + yaw + 'deg)';
    requestAnimationFrame(frame);
  }
  box.addEventListener('pointerdown', e => {
    drag = true; vx = vy = 0; lastX = e.clientX; lastY = e.clientY;
    box.classList.add('dragging');
    try { box.setPointerCapture(e.pointerId); } catch (error) { /* Optional. */ }
  });
  box.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    ox += dx * .6; oy -= dy * .6; vx = dx * .6; vy = -dy * .6;
  });
  const end = () => { drag = false; box.classList.remove('dragging'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  requestAnimationFrame(frame);
})();
