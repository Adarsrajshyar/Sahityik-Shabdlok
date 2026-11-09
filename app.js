
const SITE = {
  name: "साहित्यिक शब्द लोक",
  brand: "Adarsh Raj Shayar",
  shortName: "ARS",
  tagline: "शब्दों से संवेदना तक…",
  youtube: "https://www.youtube.com/@Adarshshyari"
};

const navigation = [
  { label: "होम", href: "index.html" },
  { label: "शायरी", href: "shayari.html" },
  { label: "कविता", href: "poetry.html" },
  { label: "कहानियाँ", href: "stories.html" },
  { label: "ARS Book", href: "ars-book.html" },
  { label: "लेखक समुदाय", href: "community.html" },
  { label: "हमारे बारे में", href: "about.html" }
];

function getCurrentPage() {
  const path = window.location.pathname;
  return path.split("/").pop() || "index.html";
}

function createHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const currentPage = getCurrentPage();

  const navLinks = navigation.map(item => {
    const active = currentPage === item.href ? "active" : "";

    return `
      <a class="${active}" href="${item.href}">
        ${item.label}
      </a>
    `;
  }).join("");

  header.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">

        <a href="index.html" class="brand" aria-label="${SITE.name}">
          <span class="brand-mark">ARS</span>
          <span class="brand-text">
            <strong>${SITE.name}</strong>
            <small>${SITE.brand}</small>
          </span>
        </a>

        <button
          class="menu-toggle"
          id="menu-toggle"
          type="button"
          aria-label="मेन्यू खोलें"
          aria-expanded="false"
          aria-controls="main-navigation">
          ☰
        </button>

        <nav class="main-nav" id="main-navigation">
          ${navLinks}
        </nav>

        <div class="header-actions">
          <a href="login.html" class="header-login">लॉगिन</a>
          <a href="register.html" class="header-register">लेखक बनें</a>
        </div>

      </div>
    </header>
  `;

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-navigation");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");

      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute(
        "aria-label",
        isOpen ? "मेन्यू बंद करें" : "मेन्यू खोलें"
      );

      toggle.textContent = isOpen ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      });
    });
  }
}

function createFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container">

        <div class="footer-grid">

          <div>
            <div class="footer-brand">${SITE.name}</div>

            <p class="footer-description">
              ${SITE.tagline}
              हिंदी साहित्य, शायरी, कविता और कहानियों
              को समर्पित एक साहित्यिक मंच।
            </p>

            <p class="footer-description">
              Founder: ${SITE.brand}
            </p>
          </div>

          <div class="footer-column">
            <h3>महत्त्वपूर्ण लिंक</h3>
            <a href="about.html">हमारे बारे में</a>
            <a href="community.html">लेखक समुदाय</a>
            <a href="ars-book.html">ARS Book</a>
            <a href="contact.html">संपर्क करें</a>
          </div>

          <div class="footer-column">
            <h3>अन्य जानकारी</h3>
            <a href="privacy.html">Privacy Policy</a>
            <a href="terms.html">Terms & Conditions</a>
            <a href="login.html">लेखक लॉगिन</a>
            <a href="${SITE.youtube}" target="_blank"
               rel="noopener noreferrer">YouTube Channel ↗</a>
          </div>

        </div>

        <div class="footer-bottom">
          <span>
            © ${new Date().getFullYear()} ${SITE.name}
            • ${SITE.shortName}
          </span>

          <span>सभी मौलिक रचनाओं का सम्मान करें।</span>
        </div>

      </div>
    </footer>
  `;
}

function initializeWebsite() {
  createHeader();
  createFooter();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeWebsite);
} else {
  initializeWebsite();
}
