/* =====================================
   SAHITYIK SHABDLOK - ARS
   Main Website JavaScript
===================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // 1. MOBILE MENU
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");

  if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "मेन्यू बंद करें" : "मेन्यू खोलें"
      );
    });

    // Menu close after selecting a link
    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "मेन्यू खोलें");
      });
    });

  }

  // 2. CURRENT YEAR IN FOOTER
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 3. SHARE FEATURED WRITING
  const shareButtons = document.querySelectorAll("[data-share]");

  shareButtons.forEach(button => {

    button.addEventListener("click", async () => {

      const shareData = {
        title: "साहित्यिक शब्द लोक - ARS",
        text:
          "रास्ते कठिन हों तो क्या हुआ,\n" +
          "कदमों में अभी उड़ान बाकी है।\n" +
          "मंज़िल भले ही दूर हो,\n" +
          "हौसलों में पूरा आसमान बाकी है।\n\n" +
          "साहित्यिक शब्द लोक - ARS",
        url: window.location.href
      };

      try {

        if (navigator.share) {

          await navigator.share(shareData);

        } else if (navigator.clipboard) {

          await navigator.clipboard.writeText(
            shareData.text + "\n" + shareData.url
          );

          showNotice("रचना साझा करने के लिए कॉपी हो गई है।");

        } else {

          showNotice("इस ब्राउज़र में शेयर सुविधा उपलब्ध नहीं है।");

        }

      } catch (error) {

        if (error.name !== "AbortError") {
          console.error("Share error:", error);
          showNotice("अभी साझा नहीं किया जा सका।");
        }

      }

    });

  });

  // 4. SIMPLE NOTICE MESSAGE
  function showNotice(message) {

    let notice = document.getElementById("ars-notice");

    if (!notice) {

      notice = document.createElement("div");
      notice.id = "ars-notice";
      notice.setAttribute("role", "status");

      Object.assign(notice.style, {
        position: "fixed",
        bottom: "22px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "2000",
        background: "#174b35",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "6px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
        fontSize: "14px",
        maxWidth: "90%",
        textAlign: "center"
      });

      document.body.appendChild(notice);

    }

    notice.textContent = message;
    notice.style.display = "block";

    window.clearTimeout(notice.hideTimer);

    notice.hideTimer = window.setTimeout(() => {
      notice.style.display = "none";
    }, 3000);

  }

  // 5. CONSOLE BRAND MESSAGE
  console.info(
    "%c साहित्यिक शब्द लोक - ARS ",
    "background:#174b35;color:#e5ce9d;padding:8px;font-size:15px;"
  );

  console.info("शब्दों से संवेदना तक…");

});
