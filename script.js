/* ============================================
   byHAVA — Minimal JavaScript
   No frameworks, no dependencies
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile Navigation ──
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // ── Navbar scroll effect ──
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ── Portfolio filter ──
  const filterButtons = document.querySelectorAll('.portfolio__filter');
  const portfolioItems = document.querySelectorAll('.portfolio__item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      portfolioItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          item.style.opacity = '0';
          requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.4s ease';
            item.style.opacity = '1';
          });
        } else {
          item.style.opacity = '0';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });
    });
  });

  // ── Scroll reveal ──
  const revealElements = document.querySelectorAll('.section__title, .section__subtitle, .service-card, .about__content, .about__image, .contact__form, .contact__info');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // ── Formbridge spam timing ──
  const tsField = document.querySelector('input[name="_ts"]');
  if (tsField) tsField.value = Date.now().toString();

  // ── Formbridge AJAX submission (no redirect) ──
  const contactForm = document.querySelector('.contact__form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        const res = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new URLSearchParams(formData),
        });
        const data = await res.json();

        if (res.ok) {
          contactForm.innerHTML = `
            <div style="text-align:center;padding:48px 24px;">
              <h3 style="color:var(--color-accent);font-size:1.5rem;margin-bottom:12px;">Thank you!</h3>
              <p style="color:var(--color-text-muted);">Your inquiry has been sent. I'll get back to you within 24 hours.</p>
            </div>`;
        } else {
          btn.textContent = 'Error — try again';
          btn.disabled = false;
          setTimeout(() => { btn.textContent = originalText; }, 3000);
        }
      } catch {
        btn.textContent = 'Error — try again';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Lightbox / Slideshow ──
  (() => {
    // Create lightbox DOM
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox__close" aria-label="Close">&times;</button>
      <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous">&#8249;</button>
      <button class="lightbox__nav lightbox__nav--next" aria-label="Next">&#8250;</button>
      <img class="lightbox__img" src="" alt="">
      <div class="lightbox__counter"></div>
    `;
    document.body.appendChild(lightbox);

    const img = lightbox.querySelector('.lightbox__img');
    const counter = lightbox.querySelector('.lightbox__counter');
    let images = [];
    let currentIndex = 0;

    function getVisibleImages() {
      return Array.from(document.querySelectorAll('.portfolio__item'))
        .filter(item => item.style.display !== 'none')
        .map(item => item.querySelector('img').src);
    }

    function show(index) {
      currentIndex = (index + images.length) % images.length;
      img.style.opacity = '0';
      setTimeout(() => {
        img.src = images[currentIndex];
        img.style.opacity = '1';
      }, 150);
      counter.textContent = `${currentIndex + 1} / ${images.length}`;
    }

    function open(index) {
      images = getVisibleImages();
      show(index);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Click portfolio images to open
    document.querySelectorAll('.portfolio__item').forEach(item => {
      item.style.cursor = 'zoom-in';
      item.addEventListener('click', () => {
        const visibleItems = Array.from(document.querySelectorAll('.portfolio__item'))
          .filter(i => i.style.display !== 'none');
        const index = visibleItems.indexOf(item);
        if (index !== -1) open(index);
      });
    });

    // Close handlers
    lightbox.querySelector('.lightbox__close').addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    // Arrow button navigation
    lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', (e) => {
      e.stopPropagation();
      show(currentIndex - 1);
    });
    lightbox.querySelector('.lightbox__nav--next').addEventListener('click', (e) => {
      e.stopPropagation();
      show(currentIndex + 1);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(currentIndex - 1);
      if (e.key === 'ArrowRight') show(currentIndex + 1);
    });

    // Touch swipe navigation
    let touchStartX = 0;
    let touchStartY = 0;

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      // Only trigger on horizontal swipes (> 50px, more horizontal than vertical)
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) show(currentIndex + 1);  // swipe left = next
        else show(currentIndex - 1);          // swipe right = prev
      }
    }, { passive: true });
  })();

});
