(function () {
  'use strict';

  // ===== Configuration Constants =====
  const CONFIG = {
    FORMSPREE_ID: 'f/xjkeqpek',
    FORMSPREE_URL: 'https://formspree.io/',
    VISITOR_API: 'https://api.countapi.xyz/hit/abdelrahman-haroun-portfolio/visitors',
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

  async function fetchWithTimeout(url, options = {}, timeout = 5000) {
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
    if (!toast) {
      console.warn('Toast element not found');
      return;
    }

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
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // ===== AOS Animation =====
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        once: true,
        offset: 100
      });
    } else {
      console.warn('AOS library not loaded');
    }
  }

  // ===== Typed.js Animation =====
  function initTypedJS() {
    const typedElement = document.getElementById('typed');
    if (!typedElement) return;

    if (typeof Typed !== 'undefined') {
      new Typed(typedElement, {
        strings: ['Data Analyst', 'Software Engineer', 'Problem Solver', 'BI Specialist'],
        typeSpeed: 70,
        backSpeed: 50,
        backDelay: 1800,
        loop: true
      });
    } else {
      console.warn('Typed.js library not loaded');
    }
  }

  // ===== Particles.js Animation =====
  function initParticles() {
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;

    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: { 
            value: CONFIG.PARTICLES_COUNT, 
            density: { enable: true, value_area: 800 } 
          },
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
    } else {
      console.warn('Particles.js library not loaded');
    }
  }

  // ===== Mobile Menu Management=====
  function initMobileMenu() {
    console.log('🔧 initMobileMenu called');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeMenuBtn = document.getElementById('close-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (!mobileMenuBtn || !mobileMenu || !mobileMenuOverlay) {
      console.warn('❌ Mobile menu elements not found');
      return;
    }
    console.log('✅ Mobile menu elements found');

    function openMobileMenu() {
      console.log('🍔 openMobileMenu triggered');
      mobileMenu.classList.add('active');
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      console.log('❌ closeMobileMenu triggered');
      mobileMenu.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }

    mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
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
        const lastSection = sections[sections.length - 1];
        currentId = lastSection.getAttribute('id');
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

  // ===== Projects Pagination =====
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
        const isCurrentPage = index + 1 === State.currentPage;
        page.classList.toggle('active', isCurrentPage);
        page.classList.toggle('hidden', !isCurrentPage);
      });

      if (prevBtn) prevBtn.disabled = State.currentPage === 1;
      if (nextBtn) nextBtn.disabled = State.currentPage === totalPages;

      document.querySelectorAll('.pagination-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i + 1 === State.currentPage);
      });
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        if (State.currentPage > 1) {
          State.currentPage--;
          showPage();
          filterProjects();
        }
      });

      nextBtn.addEventListener('click', () => {
        if (State.currentPage < totalPages) {
          State.currentPage++;
          showPage();
          filterProjects();
        }
      });
    }

    createPageNumbers();
    showPage();
  }

  // ===== Project Filtering =====
  function initFilterTabs() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectsContainer = document.getElementById('projects-container');
    const pages = document.querySelectorAll('.project-page');

    if (filterBtns.length === 0 || !projectsContainer) return;

    const allCards = projectsContainer.querySelectorAll('.card');

    function goToFirstPageWithCategory(category) {
      if (category === 'all') {
        State.currentPage = 1;
        showPage();
        return;
      }

      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        const cardsInPage = page.querySelectorAll('.card');
        let found = false;

        cardsInPage.forEach(card => {
          if (card.getAttribute('data-category') === category) {
            found = true;
          }
        });

        if (found) {
          State.currentPage = pageIndex + 1;
          showPage();
          break;
        }
      }
    }

    function filterProjects() {
      allCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const shouldShow = State.currentFilter === 'all' || category === State.currentFilter;
        card.style.display = shouldShow ? '' : 'none';
      });
    }

    function showPage() {
      const allPages = document.querySelectorAll('.project-page');
      allPages.forEach((page, index) => {
        const isCurrentPage = index + 1 === State.currentPage;
        page.classList.toggle('active', isCurrentPage);
        page.classList.toggle('hidden', !isCurrentPage);
      });

      const prevBtn = document.getElementById('prev-page');
      const nextBtn = document.getElementById('next-page');
      if (prevBtn) prevBtn.disabled = State.currentPage === 1;
      if (nextBtn) nextBtn.disabled = State.currentPage === allPages.length;

      document.querySelectorAll('.pagination-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i + 1 === State.currentPage);
      });
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

  // ===== Contact Form with Enhanced Validation =====
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const subjectInput = form.querySelector('#subject');
    const messageInput = form.querySelector('#message');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!nameInput || !emailInput || !subjectInput || !messageInput || !submitBtn) {
      console.warn('Contact form fields not found');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateForm() {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();

      if (!name) {
        showToast('Please enter your name.', 'error');
        return false;
      }

      if (!email) {
        showToast('Please enter your email address.', 'error');
        return false;
      }

      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return false;
      }

      if (!subject) {
        showToast('Please enter a subject.', 'error');
        return false;
      }

      if (!message) {
        showToast('Please enter your message.', 'error');
        return false;
      }

      if (message.length < 10) {
        showToast('Message must be at least 10 characters long.', 'error');
        return false;
      }

      return true;
    }

    emailInput.addEventListener('blur', function() {
      const email = this.value.trim();
      if (email && !emailRegex.test(email)) {
        this.style.borderColor = '#ff4444';
      } else {
        this.style.borderColor = '';
      }
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const now = Date.now();
      if (now - State.lastSubmitTime < CONFIG.FORM_SUBMIT_DEBOUNCE) {
        showToast('Please wait before sending another message.', 'warning');
        return;
      }

      if (State.isSubmitting) return;

      if (!validateForm()) {
        return;
      }

      State.isSubmitting = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      try {
        const response = await fetchWithTimeout(
          CONFIG.FORMSPREE_URL + CONFIG.FORMSPREE_ID,
          {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
          },
          5000
        );

        const data = await response.json();

        if (response.ok) {
          showToast('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
          form.reset();
          State.lastSubmitTime = now;

          if (typeof confetti !== 'undefined') {
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch (err) {
              console.warn('Confetti animation failed:', err);
            }
          }
        } else {
          if (data.errors) {
            const errorMsg = data.errors.map(err => err.message).join(', ');
            showToast(`Error: ${errorMsg}`, 'error');
          } else {
            throw new Error('Failed to send message');
          }
        }
      } catch (err) {
        console.error('Form submission error:', err);

        if (err.name === 'AbortError') {
          showToast('Request timeout. Please check your connection and try again.', 'error');
        } else if (!navigator.onLine) {
          showToast('No internet connection. Please check your network.', 'error');
        } else {
          showToast('Failed to send message. Please try again or contact me directly.', 'error');
        }
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        State.isSubmitting = false;
      }
    });
  }

  function initVisitorCounter() {
    const countEl = document.getElementById('visitor-count');
    if (!countEl) return;

    countEl.textContent = '...';

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fetchRealCount();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(countEl);
  }

  async function fetchRealCount() {
    const countEl = document.getElementById('visitor-count');
    if (!countEl) return;

    try {
      const response = await fetchWithTimeout(CONFIG.VISITOR_API, {}, 5000);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const data = await response.json();
      const count = data.value; // CountAPI

      if (count !== undefined) {
        animateCounter(countEl, count);
      } else {
        throw new Error('Invalid API response: missing value');
      }
    } catch (err) {
      console.error('Visitor counter failed:', err);
      countEl.textContent = '?';
      
      setTimeout(() => {
        if (countEl.textContent === '?') {
          fetchRealCount();
        }
      }, 10000);
    }
  }

  function animateCounter(element, target) {
    let start = 0;
    const duration = 1500;
    const increment = target / (duration / 16);

    function update() {
      start += increment;
      if (start < target) {
        element.textContent = Math.floor(start);
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }

    update();
  }

  // ===== Lazy Loading Images =====
  function initLazyLoading() {
    console.log('Lazy loading enabled for images');
  }

  // ===== Initialization =====
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

    console.log('✅ Portfolio initialized successfully');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();