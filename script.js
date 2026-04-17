// JS: Hiển thị nội dung theo thiết bị
function showGuide(device) {
    const devices = ['iphone', 'android', 'pc'];
    devices.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = id === device ? 'block' : 'none';
    });
  }
  
  // JS: Toggle liên hệ nổi
  const contactToggle = document.querySelector('.contact-toggle');
  const contactBox = document.querySelector('.contact-box');
  if (contactToggle && contactBox) {
    contactToggle.addEventListener('click', () => {
      contactBox.classList.toggle('active');
    });
  }
  
  // JS: Hiển thị ngày tự động cho footer
  const dateSpan = document.getElementById('today');
  if (dateSpan) {
    const today = new Date();
    const formatted = today.toLocaleDateString('vi-VN');
    dateSpan.textContent = formatted;
  }
  
  // JS: Chặn chuột phải & F12 (hiện cảnh báo + GIF)
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
  
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
      const warning = document.getElementById("block-warning");
      if (warning) warning.style.display = "block";
    }
  });
  