const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const siteHeader = document.querySelector('.site-header'); // Grabbed header node for mobile css targeting
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

  const openNav = () => {
    siteNav.classList.add('active');
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

// Create fullscreen modal HTML
const fullscreenModal = document.createElement('div');
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

// Gallery Navigation
document.querySelectorAll('.project-card').forEach((card) => {
  const track = card.querySelector('.gallery-track');
  const images = card.querySelectorAll('.gallery-track img');
  const dots = card.querySelectorAll('.dot');
  const prevBtn = card.querySelector('.gallery-prev');
  const nextBtn = card.querySelector('.gallery-next');
  const controls = card.querySelector('.gallery-controls');
  const fullscreenBtn = card.querySelector('.gallery-fullscreen');
  
  if (!track || images.length === 0) return;

  let currentIndex = 0;
  const totalImages = images.length;

  // Hide navigation if only one image
  if (totalImages === 1) {
    controls.classList.add('hidden');
  }

  const updateGallery = (index) => {
    currentIndex = (index + totalImages) % totalImages;
    const offset = currentIndex * (-100);
    
    track.style.transform = `translateX(${offset}%)`;
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  };

  const goToPrevious = () => {
    updateGallery(currentIndex - 1);
  };

  const goToNext = () => {
    updateGallery(currentIndex + 1);
  };

  const goToImage = (index) => {
    updateGallery(index);
  };

  const openFullscreen = () => {
    const img = images[currentIndex];
    const fullscreenImage = fullscreenModal.querySelector('.fullscreen-image');
    const counter = fullscreenModal.querySelector('.fullscreen-counter');
    
    fullscreenImage.src = img.src;
    fullscreenImage.alt = img.alt;
    
    if (totalImages > 1) {
      counter.textContent = `${currentIndex + 1} / ${totalImages}`;
    } else {
      counter.style.display = 'none';
    }
    
    fullscreenModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    syncFullscreenNav();
  };

  const closeFullscreen = () => {
    fullscreenModal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  const syncFullscreenNav = () => {
    const fullscreenPrevBtn = fullscreenModal.querySelector('.fullscreen-prev');
    const fullscreenNextBtn = fullscreenModal.querySelector('.fullscreen-next');
    const counter = fullscreenModal.querySelector('.fullscreen-counter');
    const fullscreenImage = fullscreenModal.querySelector('.fullscreen-image');

    if (totalImages === 1) {
      fullscreenPrevBtn.style.display = 'none';
      fullscreenNextBtn.style.display = 'none';
    } else {
      fullscreenPrevBtn.style.display = 'flex';
      fullscreenNextBtn.style.display = 'flex';
    }

    const handleFullscreenPrev = () => {
      goToPrevious();
      const img = images[currentIndex];
      fullscreenImage.src = img.src;
      fullscreenImage.alt = img.alt;
      counter.textContent = `${currentIndex + 1} / ${totalImages}`;
    };

    const handleFullscreenNext = () => {
      goToNext();
      const img = images[currentIndex];
      fullscreenImage.src = img.src;
      fullscreenImage.alt = img.alt;
      counter.textContent = `${currentIndex + 1} / ${totalImages}`;
    };

    // Remove old listeners and add new ones
    fullscreenPrevBtn.onclick = handleFullscreenPrev;
    fullscreenNextBtn.onclick = handleFullscreenNext;
  };

  prevBtn?.addEventListener('click', goToPrevious);
  nextBtn?.addEventListener('click', goToNext);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToImage(index));
  });

  // Fullscreen functionality
  fullscreenBtn?.addEventListener('click', openFullscreen);
  
  // Click on image to open fullscreen
  images.forEach((img) => {
    img.addEventListener('click', openFullscreen);
  });

  // Keyboard navigation in gallery
  card.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  });

  // Optional: Auto-rotate gallery every 8 seconds
  let autoRotateTimer;
  const startAutoRotate = () => {
    autoRotateTimer = setInterval(goToNext, 8000);
  };

  const stopAutoRotate = () => {
    clearInterval(autoRotateTimer);
  };

  // Start auto-rotate on load
  startAutoRotate();

  // Pause on hover
  const gallery = card.querySelector('.project-gallery');
  gallery?.addEventListener('mouseenter', stopAutoRotate);
  gallery?.addEventListener('mouseleave', startAutoRotate);

  // Pause on touch
  gallery?.addEventListener('touchstart', stopAutoRotate, { passive: true });
  gallery?.addEventListener('touchend', startAutoRotate, { passive: true });

  // Pause when fullscreen is open
  const observer = new MutationObserver(() => {
    if (!fullscreenModal.classList.contains('hidden')) {
      stopAutoRotate();
    } else {
      startAutoRotate();
    }
  });

  observer.observe(fullscreenModal, { attributes: true, attributeFilter: ['class'] });
});

// Global fullscreen modal handlers
const fullscreenClose = fullscreenModal.querySelector('.fullscreen-close');
fullscreenClose?.addEventListener('click', () => {
  fullscreenModal.classList.add('hidden');
  document.body.style.overflow = '';
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !fullscreenModal.classList.contains('hidden')) {
    fullscreenModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

// Close when clicking outside the image
fullscreenModal?.addEventListener('click', (e) => {
  if (e.target === fullscreenModal) {
    fullscreenModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
});
