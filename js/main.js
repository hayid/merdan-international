// Email address that receives contact form messages
const CONTACT_EMAIL = "info@example.com";

const CATEGORY_PAGES = ["pharmaceutical.html", "veterinary.html", "healthcare.html", "cosmetics.html", "homecare.html"];

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".menu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    burger.innerHTML = open ? "&#10005;" : "&#9776;";
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  // Close on link tap, outside tap or Escape
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("open") && !e.target.closest(".nav")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); burger.focus(); }
  });

  // Scroll progress bar, shrinking header, back-to-top button
  const header = document.querySelector("header");
  const progress = document.createElement("div");
  progress.className = "progress";
  document.body.prepend(progress);
  const toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = "&#8593;";
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(toTop);

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Ripple effect on button clicks
  document.querySelectorAll(".btn, .chip").forEach((el) => {
    el.addEventListener("click", (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.style.overflow = "hidden";
      el.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });

  // Highlight current page (category pages highlight "Pharmaceuticals")
  let page = location.pathname.split("/").pop() || "index.html";
  if (CATEGORY_PAGES.includes(page)) page = "pharmaceuticals.html";
  document.querySelectorAll(".menu a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // Contact form: prefill subject from ?product=... and open email app on submit
  const form = document.getElementById("contact-form");
  if (form) {
    const product = new URLSearchParams(location.search).get("product");
    if (product) {
      form.subject.value = "Request: " + product;
      form.message.focus();
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const subject = form.subject.value || "Website enquiry";
      const body = `Name: ${form.name.value}\nEmail: ${form.email.value}\n\n${form.message.value}`;
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      form.querySelector(".form-note").classList.add("show");
    });
  }

  // Scroll animations: elements appear one by one, in reading order, as they enter the screen
  const targets = document.querySelectorAll([
    "section h2", "section .lead", "section .split p", "section blockquote", "section .actions",
    "section .split > img", ".grid > *", ".cta", ".others-title", ".chips > *",
    ".info p", "form > *", ".footer-grid > *", "footer .copy",
  ].join(", "));
  if ("IntersectionObserver" in window) {
    const STEP = 0.15; // seconds between items
    const observer = new IntersectionObserver((entries) => {
      const appearing = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      // Elements entering together are revealed in page order, one after another
      appearing.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      appearing.forEach((el, i) => {
        el.style.transitionDelay = `${i * STEP}s`;
        el.classList.add("visible");
        observer.unobserve(el);
        // Remove the delay afterwards so hover effects stay instant
        setTimeout(() => { el.style.transitionDelay = ""; }, i * STEP * 1000 + 900);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    targets.forEach((el) => {
      el.classList.add("reveal");
      if (el.matches(".split > img")) el.classList.add("from-right");
      observer.observe(el);
    });
  }
});
