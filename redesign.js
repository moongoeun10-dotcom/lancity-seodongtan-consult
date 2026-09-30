const planData = {
  59: {
    title: '필요한 공간을<br>알차게 구성한 타입',
    description: '가족의 생활 방식과 수납, 동선을 상담 시 함께 확인하세요.',
    src: 'plan59.webp'
  },
  84: {
    title: '가족의 시간을<br>여유롭게 담는 타입',
    description: '생활 공간의 크기와 방 구성을 실제 계획안과 함께 살펴보세요.',
    src: 'plan84.webp'
  }
};

let activeType = '59';
const tabs = [...document.querySelectorAll('[role="tab"]')];

function track(name, params = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

function selectType(type) {
  activeType = type;
  tabs.forEach(tab => {
    const selected = tab.dataset.type === type;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#type-number').textContent = type;
  document.querySelector('#plan-title').innerHTML = planData[type].title;
  document.querySelector('#plan-description').textContent = planData[type].description;
  const image = document.querySelector('#plan-image');
  image.src = planData[type].src;
  image.alt = `${type}㎡ 타입 공간 계획 이미지`;
  document.querySelector('#zoom-plan').setAttribute('aria-label', `${type}㎡ 평면 크게 보기`);
  document.querySelector('#plan-panel').setAttribute('aria-labelledby', `tab${type}`);
  document.querySelectorAll('.gallery-set').forEach(gallery => {
    gallery.hidden = gallery.dataset.galleryType !== type;
  });
  track('plan_type_view', {plan_type: type});
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectType(tab.dataset.type));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : index === 0 ? 1 : 0;
    selectType(tabs[nextIndex].dataset.type);
    tabs[nextIndex].focus();
  });
});

document.querySelector('.type-consult').addEventListener('click', () => {
  track('type_consult_click', {plan_type: activeType});
  document.querySelector('#consult').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
});

const dialog = document.querySelector('#plan-dialog');
document.querySelector('#zoom-plan').addEventListener('click', () => {
  const image = document.querySelector('#dialog-image');
  image.src = planData[activeType].src;
  image.alt = `${activeType}㎡ 평면 확대`;
  track('plan_zoom', {plan_type: activeType});
  dialog.showModal();
});
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

const galleryDialog = document.querySelector('#gallery-dialog');
const galleryDialogImage = document.querySelector('#gallery-dialog-image');
const galleryDialogCaption = document.querySelector('#gallery-dialog-caption');
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const trackElement = carousel.querySelector('.type-gallery-grid');
  const slides = [...trackElement.querySelectorAll('figure')];
  const counter = carousel.querySelector('.gallery-counter');
  let current = 0;

  const update = index => {
    current = (index + slides.length) % slides.length;
    counter.textContent = `${current + 1} / ${slides.length}`;
  };
  const move = index => {
    const next = (index + slides.length) % slides.length;
    trackElement.scrollTo({left: slides[next].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    update(next);
    track('gallery_slide_view', {photo: slides[next].querySelector('img').alt});
  };

  carousel.querySelector('.gallery-prev').addEventListener('click', () => move(current - 1));
  carousel.querySelector('.gallery-next').addEventListener('click', () => move(current + 1));
  trackElement.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let scrollFrame;
  trackElement.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const nearest = slides.reduce((best, slide, index) => Math.abs(slide.offsetLeft - trackElement.scrollLeft) < Math.abs(slides[best].offsetLeft - trackElement.scrollLeft) ? index : best, 0);
      update(nearest);
    });
  }, {passive: true});
  update(0);
});
document.querySelectorAll('.type-gallery-grid img').forEach(image => {
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `${image.alt} 크게 보기`);
  const openGalleryImage = () => {
    galleryDialogImage.src = image.src;
    galleryDialogImage.alt = image.alt;
    galleryDialogCaption.textContent = image.alt;
    track('gallery_photo_zoom', {photo: image.alt});
    galleryDialog.showModal();
  };
  image.addEventListener('click', openGalleryImage);
  image.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openGalleryImage();
  });
});
document.querySelector('#close-gallery-dialog').addEventListener('click', () => galleryDialog.close());
galleryDialog.addEventListener('click', event => {
  if (event.target !== galleryDialog) return;
  const rect = galleryDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) galleryDialog.close();
});

document.querySelectorAll('.track-apply').forEach(link => link.addEventListener('click', () => track('online_consult_section_click')));
document.querySelectorAll('.track-form').forEach(link => link.addEventListener('click', () => track('consult_form_open')));
document.querySelector('.consult-embed')?.addEventListener('load', () => track('consult_form_embed_view'));
document.querySelectorAll('.track-map').forEach(link => link.addEventListener('click', () => track('map_open')));
document.querySelectorAll('.track-video-external').forEach(link => link.addEventListener('click', () => track('youtube_shorts_external')));

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate(
        [{opacity: .2, transform: 'translateY(18px)'}, {opacity: 1, transform: 'translateY(0)'}],
        {duration: 520, easing: 'ease-out'}
      );
      observer.unobserve(entry.target);
    });
  }, {threshold: .1});
  document.querySelectorAll('.section-heading,.project-highlights,.location-grid,.rental-grid,.plan-panel,.form-card').forEach(element => observer.observe(element));
}
