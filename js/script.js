document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('main > section[id]'));
  const menuLinks = Array.from(document.querySelectorAll('.menu-list a'));
  const sideLinks = Array.from(document.querySelectorAll('.side-nav a'));
  const navActiveLine = document.querySelector('.nav-line-active');
  const progressLine = document.querySelector('.long-line-active');
  const infoLineContainer = document.querySelector('.long-line-container');
  const infoColumns = Array.from(document.querySelectorAll('.info-columns .col'));
  const playButton = document.querySelector('.play-container');
  const teaserButtons = Array.from(document.querySelectorAll('.thumb'));
  let toastTimer;
  let activeInfoIndex = 0;

  const sideMap = new Map(sideLinks.map((link) => [link.getAttribute('href'), link]));
  const menuMap = new Map(menuLinks.map((link) => [link.getAttribute('href'), link]));

  function updateNavLine(activeLink) {
    if (!navActiveLine || !activeLink || !activeLink.parentElement) {
      return;
    }

    const container = activeLink.closest('nav');
    const list = activeLink.parentElement.parentElement;
    if (!container || !list) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - containerRect.left;
    navActiveLine.style.left = `${left}px`;
    navActiveLine.style.width = `${linkRect.width}px`;
  }

  function updateProgressLine(activeIndex) {
    if (!progressLine || !sections.length) {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(activeIndex, sections.length - 1));
    const step = 100 / sections.length;
    progressLine.style.left = `${clampedIndex * step}%`;
  }

  function updateInfoSlider(index = 0) {
    if (!progressLine || !infoLineContainer || !infoColumns.length) {
      return;
    }

    if (window.matchMedia('(max-width: 1024px)').matches) {
      progressLine.style.left = '0px';
      progressLine.style.width = '100%';
      infoColumns.forEach((col) => col.classList.remove('is-active'));
      return;
    }

    const clampedIndex = Math.max(0, Math.min(index, infoColumns.length - 1));
    const lineRect = infoLineContainer.getBoundingClientRect();
    const colRect = infoColumns[clampedIndex].getBoundingClientRect();

    progressLine.style.left = `${colRect.left - lineRect.left}px`;
    progressLine.style.width = `${colRect.width}px`;

    infoColumns.forEach((col, colIndex) => {
      col.classList.toggle('is-active', colIndex === clampedIndex);
    });
  }

  function setActive(targetId) {
    menuLinks.forEach((link) => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${targetId}`);
    });

    sideLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
    });

    const activeMenuLink = menuMap.get(`#${targetId}`);
    updateNavLine(activeMenuLink || menuLinks[0]);

    const activeIndex = sections.findIndex((section) => section.id === targetId);
    updateProgressLine(activeIndex >= 0 ? activeIndex : 0);
  }

  function detectActiveSection() {
    const viewportPoint = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];

    for (const section of sections) {
      if (section.offsetTop <= viewportPoint) {
        current = section;
      }
    }

    if (current) {
      setActive(current.id);
    }
  }

  const allInternalLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  allInternalLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.length <= 1) {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (sideMap.has(href)) {
        sideMap.get(href).focus();
      }
    });
  });

  infoColumns.forEach((col, index) => {
    col.addEventListener('mouseenter', () => {
      activeInfoIndex = index;
      updateInfoSlider(index);
    });

    col.addEventListener('focusin', () => {
      activeInfoIndex = index;
      updateInfoSlider(index);
    });
  });

  const infoWrapper = document.querySelector('.info-wrapper');
  if (infoWrapper) {
    infoWrapper.addEventListener('mouseleave', () => {
      activeInfoIndex = 0;
      updateInfoSlider(activeInfoIndex);
    });
  }

  function showToast(message) {
    let toast = document.querySelector('.ui-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'ui-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');

    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }

    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  if (playButton) {
    playButton.addEventListener('click', () => {
      showToast('Video indisponivel no momento. Em breve teremos conteudo aqui.');
    });
  }

  teaserButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      showToast(`Teaser ${index + 1} indisponivel no momento.`);
    });
  });

  window.addEventListener('resize', () => {
    const activeMenuLink = menuLinks.find((link) => link.classList.contains('active-link'));
    updateNavLine(activeMenuLink || menuLinks[0]);
    updateInfoSlider(activeInfoIndex);
  });

  window.addEventListener('scroll', detectActiveSection, { passive: true });
  detectActiveSection();
  updateInfoSlider(activeInfoIndex);
});
