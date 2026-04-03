const layers = document.querySelectorAll("[data-parallax]");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  layers.forEach((layer) => {
    const speed = Number(layer.dataset.parallax || 0);
    layer.style.transform = `translateY(${y * speed}px)`;
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const popup = document.getElementById("lead-popup");
if (popup && !sessionStorage.getItem("a13_popup_seen")) {
  setTimeout(() => {
    popup.classList.add("open");
    sessionStorage.setItem("a13_popup_seen", "1");
  }, 2400);
}

document.querySelectorAll("[data-popup-close]").forEach((btn) => {
  btn.addEventListener("click", () => popup?.classList.remove("open"));
});

const calcForm = document.getElementById("calc-form");
if (calcForm) {
  calcForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(calcForm);
    const type = fd.get("type");
    const area = Number(fd.get("area") || 0);
    const material = fd.get("material");
    const complexity = fd.get("complexity");

    const typeCoef = { windows: 38000, facade: 54000, vitrage: 62000, portal: 71000 }[type] || 0;
    const matCoef = { alu: 1, steel: 1.2, combined: 1.35, premium: 1.65 }[material] || 1;
    const complexityCoef = { low: 1, medium: 1.25, high: 1.55 }[complexity] || 1;

    const estimate = Math.round(area * typeCoef * matCoef * complexityCoef);
    const total = new Intl.NumberFormat("ru-RU").format(estimate);
    const out = document.getElementById("calc-result");
    out.textContent = `Ориентировочная стоимость: ${total} ₽`;
    out.style.color = "#e5b35d";
  });
}
