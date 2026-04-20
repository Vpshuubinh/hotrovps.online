document.addEventListener("DOMContentLoaded", () => {
  const yearNodes = document.querySelectorAll("[data-current-year]");
  const currentYear = new Date().getFullYear();

  yearNodes.forEach((node) => {
    node.textContent = currentYear;
  });

  const zoomableImages = Array.from(document.querySelectorAll(".article-wrap img, .step-image img"));
  if (!zoomableImages.length) return;

  const modal = document.createElement("div");
  modal.className = "blog-image-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="blog-image-modal-content">
      <div class="blog-image-modal-counter">1 / 1</div>
      <button class="blog-image-modal-close" type="button" aria-label="Đóng ảnh phóng to">×</button>
      <button class="blog-image-modal-nav blog-image-modal-prev" type="button" aria-label="Ảnh trước">‹</button>
      <img class="blog-image-modal-img" src="" alt="">
      <button class="blog-image-modal-nav blog-image-modal-next" type="button" aria-label="Ảnh sau">›</button>
      <div class="blog-image-modal-caption"></div>
      <div class="blog-image-modal-hint">Bấm ra ngoài hoặc nhấn ESC để đóng. Trên PC có thể lăn chuột để phóng to. Dùng ← → hoặc vuốt để chuyển ảnh.</div>
    </div>
  `;

  document.body.appendChild(modal);

  const modalImg = modal.querySelector(".blog-image-modal-img");
  const modalCaption = modal.querySelector(".blog-image-modal-caption");
  const modalClose = modal.querySelector(".blog-image-modal-close");
  const modalCounter = modal.querySelector(".blog-image-modal-counter");
  const modalPrev = modal.querySelector(".blog-image-modal-prev");
  const modalNext = modal.querySelector(".blog-image-modal-next");

  let currentIndex = 0;
  let currentScale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginX = 0;
  let dragOriginY = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMode = null;
  let touchOriginX = 0;
  let touchOriginY = 0;
  let pinchStartDistance = 0;
  let pinchStartScale = 1;

  function applyTransform() {
    modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    modalImg.style.cursor = currentScale > 1 ? "grab" : "default";
  }

  function resetView() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    touchMode = null;
    modalImg.classList.remove("is-dragging");
    applyTransform();
  }

  function updateCounter() {
    modalCounter.textContent = `${currentIndex + 1} / ${zoomableImages.length}`;
    const disableNav = zoomableImages.length <= 1;
    modalPrev.disabled = disableNav;
    modalNext.disabled = disableNav;
  }

  function showImage(index) {
    currentIndex = (index + zoomableImages.length) % zoomableImages.length;
    const img = zoomableImages[currentIndex];
    modalImg.src = img.src;
    modalImg.alt = img.alt || "Ảnh bài viết";
    modalCaption.textContent = img.alt || "Ảnh bài viết";
    updateCounter();
    resetView();
  }

  function openModal(index) {
    showImage(index);
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    modalImg.src = "";
    document.body.style.overflow = "";
    resetView();
  }

  function showPrev() {
    showImage(currentIndex - 1);
  }

  function showNext() {
    showImage(currentIndex + 1);
  }

  zoomableImages.forEach((img, index) => {
    img.setAttribute("title", "Bấm để phóng to ảnh");
    img.addEventListener("click", () => openModal(index));
  });

  modalClose.addEventListener("click", closeModal);
  modalPrev.addEventListener("click", showPrev);
  modalNext.addEventListener("click", showNext);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  modal.addEventListener("wheel", (event) => {
    if (!modal.classList.contains("active") || !modalImg.src) return;

    event.preventDefault();
    const zoomStep = 0.15;
    const minScale = 1;
    const maxScale = 4;

    if (event.deltaY < 0) {
      currentScale = Math.min(maxScale, currentScale + zoomStep);
    } else {
      currentScale = Math.max(minScale, currentScale - zoomStep);
    }

    if (currentScale <= 1) {
      translateX = 0;
      translateY = 0;
    }

    applyTransform();
  }, { passive: false });

  modalImg.addEventListener("dblclick", (event) => {
    event.preventDefault();

    if (currentScale > 1) {
      currentScale = 1;
      translateX = 0;
      translateY = 0;
    } else {
      currentScale = 2;
    }

    applyTransform();
  });

  modalImg.addEventListener("mousedown", (event) => {
    if (currentScale <= 1) return;

    event.preventDefault();
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragOriginX = translateX;
    dragOriginY = translateY;
    modalImg.classList.add("is-dragging");
  });

  document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    translateX = dragOriginX + (event.clientX - dragStartX);
    translateY = dragOriginY + (event.clientY - dragStartY);
    applyTransform();
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;

    isDragging = false;
    modalImg.classList.remove("is-dragging");
    applyTransform();
  });

  modalImg.addEventListener("touchstart", (event) => {
    if (!modal.classList.contains("active")) return;

    if (event.touches.length === 2) {
      touchMode = "pinch";
      pinchStartDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      pinchStartScale = currentScale;
      return;
    }

    if (event.touches.length === 1) {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchOriginX = translateX;
      touchOriginY = translateY;
      touchMode = currentScale > 1 ? "pan" : "swipe";
    }
  }, { passive: true });

  modalImg.addEventListener("touchmove", (event) => {
    if (!modal.classList.contains("active")) return;

    if (event.touches.length === 2) {
      event.preventDefault();
      touchMode = "pinch";
      const currentDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      currentScale = Math.min(4, Math.max(1, pinchStartScale * (currentDistance / Math.max(pinchStartDistance, 1))));
      if (currentScale <= 1) {
        translateX = 0;
        translateY = 0;
      }
      applyTransform();
      return;
    }

    if (event.touches.length !== 1) return;

    const deltaX = event.touches[0].clientX - touchStartX;
    const deltaY = event.touches[0].clientY - touchStartY;

    if (currentScale > 1) {
      event.preventDefault();
      touchMode = "pan";
      translateX = touchOriginX + deltaX;
      translateY = touchOriginY + deltaY;
      applyTransform();
    }
  }, { passive: false });

  modalImg.addEventListener("touchend", (event) => {
    if (!modal.classList.contains("active")) return;

    if (touchMode === "swipe" && event.changedTouches.length === 1 && currentScale <= 1) {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;
      const horizontalSwipe = Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

      if (horizontalSwipe) {
        if (deltaX < 0) {
          showNext();
        } else {
          showPrev();
        }
      }
    }

    if (event.touches.length === 0) {
      touchMode = null;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("active")) return;

    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key === "ArrowLeft") {
      showPrev();
      return;
    }

    if (event.key === "ArrowRight") {
      showNext();
    }
  });
});
