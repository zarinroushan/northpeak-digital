/* ==========================================================================
   NorthPeak Digital — script.js
   Minimal, dependency-free JS: sticky nav state, mobile menu, scroll reveals,
   animated stat counters, dashboard parallax, and contact/newsletter form
   validation. No frameworks.
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------- Sticky nav state --------------------------- */
  const navWrap = document.getElementById('navWrap');
  const onScroll = () => {
    navWrap.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------ Mobile menu ------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navMenu.classList.toggle('is-open', !isOpen);
  });

  // Close mobile menu after selecting a link
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close mobile menu on Escape for keyboard users
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ------------------------------ Scroll reveals ---------------------------- */
  const revealTargets = document.querySelectorAll('[data-animate]');
  // Auto-tag section headers, cards etc. with .reveal for scroll-in animation
  const autoReveal = document.querySelectorAll(
    '.section-head, .service-card, .work-card, .testimonial-card, .price-card, .stat, .contact-form, .contact-copy'
  );
  autoReveal.forEach((el) => el.classList.add('reveal'));

  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
    autoReveal.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
    autoReveal.forEach((el) => io.observe(el));
  }

  /* --------------------------- Animated stat counters ------------------------ */
  const counters = document.querySelectorAll('.stat-number');
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
    } else {
      requestAnimationFrame(tick);
    }
  };

  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterIO.observe(el));

  /* ------------------------ Hero dashboard parallax tilt --------------------- */
  const dash = document.getElementById('dash');
  if (dash && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    const heroVisual = document.querySelector('.hero-visual');
    let rafId = null;

    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        dash.style.transform = `rotateY(${relX * 6}deg) rotateX(${relY * -6}deg)`;
      });
    });

    heroVisual.addEventListener('mouseleave', () => {
      dash.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });

    dash.style.transition = 'transform 300ms ease-out';
    dash.style.transformStyle = 'preserve-3d';
  }

  /* --------------------------- Service card glow follow ---------------------- */
  document.querySelectorAll('.service-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  /* -------------------------------- Scroll-top ------------------------------- */
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener(
    'scroll',
    () => {
      scrollTopBtn.classList.toggle('is-visible', window.scrollY > 640);
    },
    { passive: true }
  );
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ------------------------------ Form validation ----------------------------- */
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showFieldError = (input, message) => {
    const field = input.closest('.form-field');
    const errorEl = field.querySelector('.form-error');
    field.classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  };

  const validateField = (input) => {
    if (input.hasAttribute('required') && !input.value.trim()) {
      showFieldError(input, 'This field is required.');
      return false;
    }
    if (input.type === 'email' && input.value && !emailPattern.test(input.value)) {
      showFieldError(input, 'Enter a valid email address.');
      return false;
    }
    showFieldError(input, '');
    return true;
  };

  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      formStatus.textContent = 'Please fix the highlighted fields and try again.';
      formStatus.classList.add('is-error');
      return;
    }

    // No backend wired up in this static build — simulate a successful send.
    formStatus.classList.remove('is-error');
    formStatus.textContent = 'Thanks — your message has been sent. We\u2019ll reply within one business day.';
    contactForm.reset();
  });

  // Validate on blur for immediate, helpful feedback
  contactForm.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
  });

  /* ------------------------------ Newsletter form ------------------------------ */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterStatus = document.getElementById('newsletterStatus');

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newsletterEmail');

    if (!emailPattern.test(input.value)) {
      newsletterStatus.textContent = 'Enter a valid email address.';
      newsletterStatus.classList.add('is-error');
      return;
    }

    newsletterStatus.classList.remove('is-error');
    newsletterStatus.textContent = 'You\u2019re subscribed. Welcome aboard!';
    newsletterForm.reset();
  });
})();


/*---------------------------
Page Intro
---------------------------*/

/*document.body.classList.add("loading");

window.addEventListener("load",()=>{

setTimeout(()=>{

document
.getElementById("pageLoader")
.classList.add("hide");

const loader = document.getElementById("pageLoader");

if (loader) {
    loader.classList.add("hide");
}

document.body.classList.remove("loading");

},800);

}); */



window.addEventListener("load", () => {

    requestAnimationFrame(() => {

        setTimeout(() => {

            const loader = document.getElementById("pageLoader");

            if (loader) {
                loader.classList.add("hide");
            }

            document.body.classList.remove("loading");

        }, 800);

    });

});