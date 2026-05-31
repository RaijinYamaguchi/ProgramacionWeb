  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));

  // ── Animated counter for stats
  function animateCount(el, target, suffix = '', decimals = 0) {
    let start = 0;
    const duration = 1600;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = eased * target;
      el.textContent = (decimals > 0 ? val.toFixed(decimals) : Math.floor(val)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.stat-num');
        nums.forEach(n => {
          const text = n.textContent;
          if (text === '40%') animateCount(n, 40, '%');
          else if (text === '<1s') { /* static */ }
          else if (text === '24/7') { /* static */ }
          else if (text === '99.9%') animateCount(n, 99.9, '%', 1);
        });
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelector('.stats-bar') && statObserver.observe(document.querySelector('.stats-bar'));

  // ── Nav active on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 80;
    sections.forEach(sec => {
      const top = sec.offsetTop, h = sec.offsetHeight;
      const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
      if (link) link.style.color = (y >= top && y < top + h) ? 'var(--accent)' : '';
    });
  });
  const iniciarsesionbtn = document.getElementById('iniciar-sesion-btn');
    iniciarsesionbtn.addEventListener('click', () => { 
        window.location.href = 'login.html';
    });
    const registrobtn = document.getElementById('registro-btn');
    registrobtn.addEventListener('click', () => { 
        window.location.href = 'registro.html';
    });
    const contactarbtn = document.getElementById('contactar-btn');
    contactarbtn.addEventListener('click', () => { 
        window.location.href = 'https://w.app/ewelgl';
    });