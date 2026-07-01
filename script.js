const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const siteHeader = document.querySelector('.site-header'); 
const yearElement = document.getElementById('year');

if (navToggle && siteNav) {
  const updateToggleState = () => {
    const isOpen = siteNav.classList.contains('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    if (siteHeader) {
      siteHeader.classList.toggle('nav-active', isOpen);
    }
  };

  const closeNav = () => {
    siteNav.classList.remove('active');
    updateToggleState();
  };

  navToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    siteNav.classList.toggle('active');
    updateToggleState();
  });

  const navLinks = siteNav.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  const closeOnOutside = (event) => {
    if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) {
      closeNav();
    }
  };

  document.addEventListener('click', closeOnOutside);
  document.addEventListener('touchstart', closeOnOutside, { passive: true });

  updateToggleState();
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* ==========================================================================
   Bulletproof Fullscreen Lightbox Engine
   ========================================================================== */

// 1. Safe Modal Element Generation Check
let fullscreenModal = document.querySelector('.fullscreen-modal');
if (!fullscreenModal) {
  fullscreenModal = document.createElement('div');
  fullscreenModal.className = 'fullscreen-modal hidden';
  fullscreenModal.innerHTML = `
    <button class="fullscreen-close" aria-label="Close fullscreen">✕</button>
    <div class="fullscreen-content">
      <img class="fullscreen-image" src="" alt="" />
      <div class="fullscreen-nav">
        <button class="fullscreen-prev" aria-label="Previous image">❮</button>
        <button class="fullscreen-next" aria-label="Next image">❯</button>
      </div>
      <div class="fullscreen-counter"></div>
    </div>
  `;
  document.body.appendChild(fullscreenModal);
}

// Global Modal Element Reference Hooks
const modalImage = fullscreenModal.querySelector('.fullscreen-image');
const modalCounter = fullscreenModal.querySelector('.fullscreen-counter');
const modalPrevBtn = fullscreenModal.querySelector('.fullscreen-prev');
const modalNextBtn = fullscreenModal.querySelector('.fullscreen-next');
const modalCloseBtn = fullscreenModal.querySelector('.fullscreen-close');

// Global state controller mapping strings
let activeImagesArray = [];
let activeIndex = 0;

const updateModalView = () => {
  if (!modalImage || activeImagesArray.length === 0) return;
  
  const currentImg = activeImagesArray[activeIndex];
  modalImage.src = currentImg.src;
  modalImage.alt = currentImg.alt;
  
  if (modalCounter) {
    if (activeImagesArray.length > 1) {
      modalCounter.style.display = 'block';
      modalCounter.textContent = `${activeIndex + 1} / ${activeImagesArray.length}`;
    } else {
      modalCounter.style.display = 'none';
    }
  }
  
  if (modalPrevBtn && modalNextBtn) {
    const displayStyle = activeImagesArray.length > 1 ? 'flex' : 'none';
    modalPrevBtn.style.display = displayStyle;
    modalNextBtn.style.display = displayStyle;
  }
};

const openFullscreenModal = (images, index) => {
  activeImagesArray = Array.from(images);
  activeIndex = index;
  updateModalView();
  fullscreenModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

const closeFullscreenModal = () => {
  fullscreenModal.classList.add('hidden');
  document.body.style.overflow = '';
};

// Global Listeners for Lightbox Management
modalCloseBtn?.addEventListener('click', closeFullscreenModal);
fullscreenModal?.addEventListener('click', (e) => {
  if (e.target === fullscreenModal) closeFullscreenModal();
});

modalPrevBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  activeIndex = (activeIndex - 1 + activeImagesArray.length) % activeImagesArray.length;
  updateModalView();
});

modalNextBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  activeIndex = (activeIndex + 1) % activeImagesArray.length;
  updateModalView();
});

document.addEventListener('keydown', (e) => {
  if (fullscreenModal.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeFullscreenModal();
  if (e.key === 'ArrowLeft' && activeImagesArray.length > 1) {
    activeIndex = (activeIndex - 1 + activeImagesArray.length) % activeImagesArray.length;
    updateModalView();
  }
  if (e.key === 'ArrowRight' && activeImagesArray.length > 1) {
    activeIndex = (activeIndex + 1) % activeImagesArray.length;
    updateModalView();
  }
});

/* ==========================================================================
   Cards Component Initialization Loop
   ========================================================================== */
document.querySelectorAll('.project-card').forEach((card) => {
  const track = card.querySelector('.gallery-track');
  const images = card.querySelectorAll('.gallery-track img');
  const dots = card.querySelectorAll('.dot');
  const prevBtn = card.querySelector('.gallery-prev');
  const nextBtn = card.querySelector('.gallery-next');
  const controls = card.querySelector('.gallery-controls');
  
  if (!track || images.length === 0) return;

  let currentIndex = 0;
  const totalImages = images.length;

  if (totalImages === 1 && controls) {
    controls.classList.add('hidden');
  }

  const updateCardGallery = (index) => {
    currentIndex = (index + totalImages) % totalImages;
    track.style.transform = `translateX(${currentIndex * -100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  };

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    updateCardGallery(currentIndex - 1);
  });
  
  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    updateCardGallery(currentIndex + 1);
  });
  
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCardGallery(index);
    });
  });

  // Isolated Fullscreen Click Launcher
  const launchFullscreen = (index) => {
    openFullscreenModal(images, index);
  };

  card.querySelector('.gallery-fullscreen')?.addEventListener('click', (e) => {
    e.stopPropagation();
    launchFullscreen(currentIndex);
  });

  images.forEach((img, index) => {
    img.addEventListener('click', () => launchFullscreen(index));
  });

  // Autoplay Logic Core Loop
  let autoRotateTimer;
  const startRotation = () => {
    if (totalImages > 1) autoRotateTimer = setInterval(() => updateCardGallery(currentIndex + 1), 8000);
  };
  const stopRotation = () => clearInterval(autoRotateTimer);

  startRotation();
  const gallery = card.querySelector('.project-gallery');
  gallery?.addEventListener('mouseenter', stopRotation);
  gallery?.addEventListener('mouseleave', startRotation);
  gallery?.addEventListener('touchstart', stopRotation, { passive: true });
  gallery?.addEventListener('touchend', startRotation, { passive: true });
});
