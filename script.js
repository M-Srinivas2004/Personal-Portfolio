/**
 * Malladi Srinivas - Personal Portfolio JavaScript
 * Handles Theme Toggling, Mobile Navigation, Scroll Interactivity,
 * Copy Email, and Interactive Contact Form Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Toggling (Dark / Light)
  const html = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggle');
  
  // Check for saved theme preference in localStorage or default to system/dark
  const savedTheme = localStorage.getItem('ms_theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('ms_theme', theme);
  }

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('open')) {
          icon.classList.remove('fa-bars-staggered');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars-staggered');
        }
      }
    });

    // Close mobile menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars-staggered');
        }
      });
    });
  }

  // 3. Highlight Active Navigation Link on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // 4. Set Dynamic Current Year
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 5. Copy Email To Clipboard
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailLink = document.getElementById('emailLink');
  const emailTooltip = document.getElementById('emailTooltip');

  if (copyEmailBtn && emailLink && emailTooltip) {
    copyEmailBtn.addEventListener('click', () => {
      const emailText = emailLink.textContent.trim();
      navigator.clipboard.writeText(emailText).then(() => {
        emailTooltip.textContent = 'Copied!';
        setTimeout(() => {
          emailTooltip.textContent = 'Copy';
        }, 2000);
      }).catch(() => {
        emailTooltip.textContent = 'Press Ctrl+C';
      });
    });
  }

  // 6. Interactive Contact Form Validation & Submission
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const subjectError = document.getElementById('subjectError');
    const messageError = document.getElementById('messageError');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Reset errors
      clearErrors();

      // Validate Name
      if (!nameInput.value.trim()) {
        showError(nameInput, nameError, 'Please enter your name.');
        isValid = false;
      } else if (nameInput.value.trim().length < 2) {
        showError(nameInput, nameError, 'Name must be at least 2 characters.');
        isValid = false;
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim()) {
        showError(emailInput, emailError, 'Please enter your email address.');
        isValid = false;
      } else if (!emailPattern.test(emailInput.value.trim())) {
        showError(emailInput, emailError, 'Please enter a valid email address.');
        isValid = false;
      }

      // Validate Subject
      if (!subjectInput.value) {
        showError(subjectInput, subjectError, 'Please select an inquiry topic.');
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        showError(messageInput, messageError, 'Please enter your message.');
        isValid = false;
      } else if (messageInput.value.trim().length < 10) {
        showError(messageInput, messageError, 'Message must be at least 10 characters.');
        isValid = false;
      }

      if (isValid) {
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending Message...</span>';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;

          const senderName = nameInput.value.trim();
          formStatus.style.display = 'block';
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; gap:0.5rem; font-weight:700; margin-bottom:0.35rem;">
              <i class="fa-solid fa-circle-check"></i> Thank you, ${senderName}!
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary);">
              Your message has been captured. Srinivas will respond as soon as possible.
            </p>
          `;

          // Reset form fields
          contactForm.reset();

          // Smoothly scroll down to notice the status if needed
          formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          // Auto-hide status after 8 seconds
          setTimeout(() => {
            formStatus.style.display = 'none';
          }, 8000);
        }, 800);
      }
    });

    function showError(inputElement, errorElement, message) {
      inputElement.classList.add('error');
      if (errorElement) {
        errorElement.textContent = message;
      }
    }

    function clearErrors() {
      [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
        if (input) input.classList.remove('error');
      });
      [nameError, emailError, subjectError, messageError].forEach(err => {
        if (err) err.textContent = '';
      });
      if (formStatus) {
        formStatus.style.display = 'none';
      }
    }

    // Clear error on input
    [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('error');
          const errSpan = document.getElementById(input.name + 'Error');
          if (errSpan) errSpan.textContent = '';
        });
      }
    });
  }
});
