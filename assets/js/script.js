/*
 * A³H Portfolio - Main Script File
 * Version: 2.3 (Visitor Counter via GoatCounter)
 * Author: Abdelrahman Haroun
 * Description: Handles all frontend interactions, animations, API calls, and visitor count via GoatCounter.
 */

(function () {
  'use strict';

  // ===== Configuration Constants =====
  const CONFIG = {
    FORMSPREE_ID: 'f/xjkeqpek',
    FORMSPREE_URL: 'https://formspree.io/',
    FORM_SUBMIT_DEBOUNCE: 10000,
    SCROLL_DEBOUNCE: 150,
    TOAST_DURATION_SUCCESS: 4000,
    TOAST_DURATION_ERROR: 6000,
    INTERSECTION_ROOT_MARGIN: '-80px 0px -80px 0px',
    PARTICLES_COUNT: 50,
    PARTICLES_DISTANCE: 140,
    NAVBAR_SCROLL_OFFSET: 50
  };

  // ===== State Management =====
  const State = {
    currentPage: 1,
    currentFilter: 'all',
    isSubmitting: false,
    lastSubmitTime: 0,
    scrollTimeout: null,
    scrollDebounceTimeout: null
  };

  // ===== Utility Functions =====
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  async function fetchWithTimeout(url, options = {}, timeout = 7000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
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

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#00eeff'
    };

    toast.textContent = message;
    toast.style.borderLeftColor = colors[type] || colors.info;
    toast.classList.add('show');

    const duration = type === 'error' ? CONFIG.TOAST_DURATION_ERROR : CONFIG.TOAST_DURATION_SUCCESS;
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ===== AOS Animation =====
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        once: true,
        offset: 100
      });
    }
  }

  // ===== Typed.js Animation =====
  function initTypedJS() {
    const typedElement = document.getElementById('typed');
    if (!typedElement || typeof Typed === 'undefined') return;

    new Typed(typedElement, {
      strings: ['Data Analyst', 'Software Engineer', 'Problem Solver', 'BI Specialist'],
      typeSpeed: 70,
      backSpeed: 50,
      backDelay: 1800,
      loop: true
    });
  }

  // ===== Particles.js Animation =====
  function initParticles() {
    if (typeof particlesJS === 'undefined') return;
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;

    particlesJS('particles-js', {
      particles: {
        number: { value: CONFIG.PARTICLES_COUNT, density: { enable: true, value_area: 800 } },
        color: { value: '#00eeff' },
        shape: { type: 'circle' },
        opacity: { value: 0.45, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: CONFIG.PARTICLES_DISTANCE,
          color: '#00eeff',
          opacity: 0.35,
          width: 1
        },
        move: {
          enable: true,
          speed: 1.8,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          repulse: { distance: 90, duration: 0.4 },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  }

  // ===== Mobile Menu Management =====
  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeMenuBtn = document.getElementById('close-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (!mobileMenuBtn || !mobileMenu || !mobileMenuOverlay) return;

    function openMobileMenu() {
      mobileMenu.classList.add('active');
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      mobileMenu.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }

    mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
  }

  // ===== Active Navigation Link on Scroll =====
  function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav a[href^="#"], .mobile-nav-link');
    if (sections.length === 0 || navLinks.length === 0) return;

    function setActiveLink(id) {
      navLinks.forEach(link => link.classList.remove('active'));
      document.querySelectorAll(`.nav a[href="#${id}"], .mobile-nav-link[href="#${id}"]`)
        .forEach(link => link.classList.add('active'));
    }

    function onScroll() {
      const scrollY = window.scrollY + window.innerHeight / 3;
      let currentId = sections[0].getAttribute('id');

      sections.forEach(section => {
        if (section.offsetTop <= scrollY) {
          currentId = section.getAttribute('id');
        }
      });

      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        currentId = sections[sections.length - 1].getAttribute('id');
      }

      setActiveLink(currentId);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ===== Smart Navbar =====
  function initNavbarScroll() {
    const navbar = document.querySelector('.nav');
    if (!navbar) return;

    const handleScroll = debounce(() => {
      if (window.scrollY > CONFIG.NAVBAR_SCROLL_OFFSET) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, CONFIG.SCROLL_DEBOUNCE);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ===== Smooth Scroll Navigation =====
  function initSmoothScroll() {
    const mobileMenu = document.getElementById('mobile-menu');
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          if (mobileMenu?.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            const overlay = document.getElementById('mobile-menu-overlay');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
          }
        }
      });
    });
  }

  // ===== Projects Pagination & Filtering =====
  function initPagination() {
    const pages = document.querySelectorAll('.project-page');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbersContainer = document.getElementById('page-numbers');

    if (pages.length === 0) return;

    const totalPages = pages.length;

    function createPageNumbers() {
      if (!pageNumbersContainer) return;
      pageNumbersContainer.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn';
        if (i === State.currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
          State.currentPage = i;
          showPage();
          filterProjects();
        });
        pageNumbersContainer.appendChild(btn);
      }
    }

    function showPage() {
      pages.forEach((page, index) => {
        const isCurrent = index + 1 === State.currentPage;
        page.classList.toggle('active', isCurrent);
        page.classList.toggle('hidden', !isCurrent);
      });

      if (prevBtn) prevBtn.disabled = State.currentPage === 1;
      if (nextBtn) nextBtn.disabled = State.currentPage === totalPages;

      document.querySelectorAll('.pagination-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i + 1 === State.currentPage);
      });
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => { if (State.currentPage > 1) { State.currentPage--; showPage(); filterProjects(); } });
      nextBtn.addEventListener('click', () => { if (State.currentPage < totalPages) { State.currentPage++; showPage(); filterProjects(); } });
    }

    createPageNumbers();
    showPage();
  }

  function initFilterTabs() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allCards = document.querySelectorAll('.card');
    const pages = document.querySelectorAll('.project-page');

    if (filterBtns.length === 0) return;

    function filterProjects() {
      allCards.forEach(card => {
        const category = card.getAttribute('data-category');
        card.style.display = (State.currentFilter === 'all' || category === State.currentFilter) ? '' : 'none';
      });
    }

    function goToFirstPageWithCategory(category) {
      if (category === 'all') {
        State.currentPage = 1;
        return;
      }
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].querySelector(`.card[data-category="${category}"]`)) {
          State.currentPage = i + 1;
          break;
        }
      }
    }

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

  // ===== Contact Form =====
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

    function validateForm() {
      if (!nameInput.value.trim()) return showToast('Please enter your name.', 'error'), false;
      if (!emailInput.value.trim()) return showToast('Please enter your email.', 'error'), false;
      if (!emailRegex.test(emailInput.value.trim())) return showToast('Please enter a valid email.', 'error'), false;
      if (!subjectInput.value.trim()) return showToast('Please enter a subject.', 'error'), false;
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) 
        return showToast('Message must be at least 10 characters.', 'error'), false;
      return true;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (Date.now() - State.lastSubmitTime < CONFIG.FORM_SUBMIT_DEBOUNCE) {
        return showToast('Please wait before sending another message.', 'warning');
      }
      if (State.isSubmitting || !validateForm()) return;

      State.isSubmitting = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      try {
        const response = await fetchWithTimeout(
          CONFIG.FORMSPREE_URL + CONFIG.FORMSPREE_ID,
          { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } }
        );

        if (response.ok) {
          showToast('✓ Message sent successfully!', 'success');
          form.reset();
          State.lastSubmitTime = Date.now();
          if (typeof confetti !== 'undefined') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
          showToast('Failed to send message. Please try again.', 'error');
        }
      } catch (err) {
        showToast('Failed to send message. Check your connection.', 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        State.isSubmitting = false;
      }
    });
  }

  // ===== Visitor Counter via GoatCounter (replaces old counter logic) =====
  function initVisitorCounter() {
    const countEl = document.getElementById('visitor-count');
    if (!countEl) return;

    // تعيين حالة تحميل
    countEl.textContent = '...';
    countEl.style.opacity = '0.7';

    // نستخدم setTimeout للتأكد من تحميل GoatCounter بالكامل
    setTimeout(() => {
      fetch('https://abdelrahmanharoun.goatcounter.com/counter/.json')
        .then(response => {
          if (!response.ok) throw new Error('HTTP error ' + response.status);
          return response.json();
        })
        .then(data => {
          let count = data && data.count ? data.count : (data && data.value ? data.value : null);
          if (count !== null && !isNaN(parseInt(count))) {
            countEl.textContent = count;
            countEl.style.opacity = '1';
          } else {
            // في حالة عدم وجود العدد نعرض قيمة افتراضية
            countEl.textContent = '15+';
            countEl.style.opacity = '0.85';
          }
        })
        .catch(err => {
          console.warn('GoatCounter fetch failed:', err);
          // عرض قيمة افتراضية عند فشل الجلب
          countEl.textContent = '15+';
          countEl.style.opacity = '0.85';
        });
    }, 1200); // تأخير 1.2 ثانية لضمان استقرار الصفحة
  }

  // ===== Lazy Loading =====
  function initLazyLoading() {
    // يمكن إضافة تحسينات لاحقاً
  }

  // ===== Main Initialization =====
  function init() {
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
    initVisitorCounter();   // الآن تستخدم GoatCounter بدلاً من الـ API القديم
    initLazyLoading();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();