(function () {
  'use strict';

  const CONFIG = {
    FORMSPREE_ID: 'f/xjkeqpek',
    FORMSPREE_URL: 'https://formspree.io/',
    // ✅ استخدام خدمة countapi.xyz الأكثر استقرارًا وتوافقًا مع CORS
    VISITOR_API: 'https://api.countapi.xyz/hit/abdelrahman-haroun-portfolio/visitors',
    FORM_SUBMIT_DEBOUNCE: 10000,
    SCROLL_DEBOUNCE: 150,
    TOAST_DURATION_SUCCESS: 4000,
    TOAST_DURATION_ERROR: 6000,
    PARTICLES_COUNT: 50,
    PARTICLES_DISTANCE: 140,
    NAVBAR_SCROLL_OFFSET: 50
  };

  const State = {
    currentPage: 1,
    currentFilter: 'all',
    isSubmitting: false,
    lastSubmitTime: 0,
    scrollTimeout: null,
    scrollDebounceTimeout: null
  };

  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#00eeff' };
    toast.textContent = message;
    toast.style.borderLeftColor = colors[type] || colors.info;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), type === 'error' ? 6000 : 4000);
  }

  function initAOS() {
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true, offset: 100 });
    else console.warn('AOS not loaded');
  }

  function initTypedJS() {
    const typedElement = document.getElementById('typed');
    if (typedElement && typeof Typed !== 'undefined') {
      new Typed(typedElement, {
        strings: ['Data Analyst', 'Software Engineer', 'Problem Solver', 'BI Specialist'],
        typeSpeed: 70, backSpeed: 50, backDelay: 1800, loop: true
      });
    }
  }

  function initParticles() {
    if (document.getElementById('particles-js') && typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: { value: CONFIG.PARTICLES_COUNT, density: { enable: true, value_area: 800 } },
          color: { value: '#00eeff' },
          shape: { type: 'circle' },
          opacity: { value: 0.45, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: CONFIG.PARTICLES_DISTANCE, color: '#00eeff', opacity: 0.35, width: 1 },
          move: { enable: true, speed: 1.8, direction: 'none', random: false, straight: false, out_mode: 'out' }
        },
        interactivity: {
          detect_on: 'canvas',
          events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
          modes: { repulse: { distance: 90, duration: 0.4 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
      });
    }
  }

  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = document.getElementById('close-menu');
    if (!mobileMenuBtn || !mobileMenu || !overlay) return;
    const open = () => { mobileMenu.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = () => { mobileMenu.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = 'auto'; };
    mobileMenuBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.querySelectorAll('.mobile-nav-link').forEach(link => link.addEventListener('click', close));
  }

  function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav a[href^="#"], .mobile-nav-link');
    if (!sections.length) return;
    const setActive = (id) => {
      navLinks.forEach(link => link.classList.remove('active'));
      document.querySelectorAll(`.nav a[href="#${id}"], .mobile-nav-link[href="#${id}"]`).forEach(link => link.classList.add('active'));
    };
    const onScroll = () => {
      let currentId = sections[0].id;
      const scrollY = window.scrollY + window.innerHeight / 3;
      sections.forEach(section => { if (section.offsetTop <= scrollY) currentId = section.id; });
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) currentId = sections[sections.length - 1].id;
      setActive(currentId);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initNavbarScroll() {
    const navbar = document.querySelector('.nav');
    if (!navbar) return;
    const handleScroll = debounce(() => navbar.classList.toggle('scrolled', window.scrollY > CONFIG.NAVBAR_SCROLL_OFFSET), CONFIG.SCROLL_DEBOUNCE);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function initSmoothScroll() {
    const mobileMenu = document.getElementById('mobile-menu');
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (mobileMenu?.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            document.getElementById('mobile-menu-overlay')?.classList.remove('active');
            document.body.style.overflow = 'auto';
          }
        }
      });
    });
  }

  function initPagination() {
    const pages = document.querySelectorAll('.project-page');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    if (!pages.length) return;
    const total = pages.length;
    const showPage = () => {
      pages.forEach((p, i) => p.classList.toggle('active', i + 1 === State.currentPage));
      if (prevBtn) prevBtn.disabled = State.currentPage === 1;
      if (nextBtn) nextBtn.disabled = State.currentPage === total;
      document.querySelectorAll('.pagination-btn').forEach((btn, i) => btn.classList.toggle('active', i + 1 === State.currentPage));
    };
    const createNumbers = () => {
      if (!pageNumbers) return;
      pageNumbers.innerHTML = '';
      for (let i = 1; i <= total; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn';
        if (i === State.currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => { State.currentPage = i; showPage(); filterProjects(); });
        pageNumbers.appendChild(btn);
      }
    };
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => { if (State.currentPage > 1) { State.currentPage--; showPage(); filterProjects(); } });
      nextBtn.addEventListener('click', () => { if (State.currentPage < total) { State.currentPage++; showPage(); filterProjects(); } });
    }
    createNumbers();
    showPage();
  }

  function initFilterTabs() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const container = document.getElementById('projects-container');
    const pages = document.querySelectorAll('.project-page');
    if (!filterBtns.length || !container) return;
    const allCards = container.querySelectorAll('.card');
    const filterProjects = () => {
      allCards.forEach(card => {
        const category = card.getAttribute('data-category');
        card.style.display = (State.currentFilter === 'all' || category === State.currentFilter) ? '' : 'none';
      });
    };
    const goToFirstPageWithCategory = (category) => {
      if (category === 'all') { State.currentPage = 1; showPage(); return; }
      for (let i = 0; i < pages.length; i++) {
        if (Array.from(pages[i].querySelectorAll('.card')).some(card => card.getAttribute('data-category') === category)) {
          State.currentPage = i + 1;
          showPage();
          break;
        }
      }
    };
    const showPage = () => {
      pages.forEach((p, i) => p.classList.toggle('active', i + 1 === State.currentPage));
      document.querySelectorAll('.pagination-btn').forEach((btn, i) => btn.classList.toggle('active', i + 1 === State.currentPage));
      const prev = document.getElementById('prev-page'), next = document.getElementById('next-page');
      if (prev) prev.disabled = State.currentPage === 1;
      if (next) next.disabled = State.currentPage === pages.length;
    };
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.currentFilter = btn.getAttribute('data-filter');
        goToFirstPageWithCategory(State.currentFilter);
        filterProjects();
      });
    });
    filterProjects();
  }

  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const subjectInput = form.querySelector('#subject');
    const messageInput = form.querySelector('#message');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!nameInput || !emailInput || !subjectInput || !messageInput || !submitBtn) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validate = () => {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();
      if (!name) { showToast('Please enter your name.', 'error'); return false; }
      if (!email) { showToast('Please enter your email address.', 'error'); return false; }
      if (!emailRegex.test(email)) { showToast('Please enter a valid email address.', 'error'); return false; }
      if (!subject) { showToast('Please enter a subject.', 'error'); return false; }
      if (!message) { showToast('Please enter your message.', 'error'); return false; }
      if (message.length < 10) { showToast('Message must be at least 10 characters.', 'error'); return false; }
      return true;
    };
    emailInput.addEventListener('blur', () => emailInput.style.borderColor = (emailInput.value.trim() && !emailRegex.test(emailInput.value.trim())) ? '#ff4444' : '');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - State.lastSubmitTime < CONFIG.FORM_SUBMIT_DEBOUNCE) { showToast('Please wait before sending another message.', 'warning'); return; }
      if (State.isSubmitting || !validate()) return;
      State.isSubmitting = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      try {
        const response = await fetchWithTimeout(CONFIG.FORMSPREE_URL + CONFIG.FORMSPREE_ID, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } }, 5000);
        if (response.ok) {
          showToast('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
          form.reset();
          State.lastSubmitTime = now;
          if (typeof confetti !== 'undefined') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
          const data = await response.json();
          throw new Error(data.errors ? data.errors.map(e => e.message).join(', ') : 'Failed to send');
        }
      } catch (err) {
        console.error(err);
        if (err.name === 'AbortError') showToast('Request timeout. Please check your connection.', 'error');
        else if (!navigator.onLine) showToast('No internet connection.', 'error');
        else showToast('Failed to send message. Please try again.', 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        State.isSubmitting = false;
      }
    });
  }

  // ✅ Visitor Counter - يعمل فوراً على جميع الأجهزة
  async function initVisitorCounter() {
    const countEl = document.getElementById('visitor-count');
    if (!countEl) {
      console.warn('Visitor count element not found');
      return;
    }
    countEl.textContent = '...';
    try {
      const response = await fetchWithTimeout(CONFIG.VISITOR_API, {}, 8000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      // countapi.xyz returns { value: number }
      const count = data.value;
      if (typeof count === 'number') {
        animateCounter(countEl, count);
        console.log(`✅ Visitor count: ${count}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Visitor counter failed:', err);
      countEl.textContent = '?';
      // إعادة المحاولة بعد 15 ثانية
      setTimeout(initVisitorCounter, 15000);
    }
  }

  function animateCounter(element, target) {
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        element.textContent = target;
        clearInterval(interval);
      } else {
        element.textContent = current;
      }
    }, 25);
  }

  function initLazyLoading() { console.log('Lazy loading enabled'); }

  function init() {
    console.log('🚀 Initializing portfolio...');
    initAOS();
    initTypedJS();
    initParticles();
    initMobileMenu();
    initActiveNavigation();
    initNavbarScroll();
    initSmoothScroll();
    initPagination();
    initFilterTabs();
    initContactForm();
    initVisitorCounter();
    initLazyLoading();
    console.log('✅ Portfolio initialized');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();