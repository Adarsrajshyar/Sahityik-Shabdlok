// ARS - Sahityik Shabd Lok
// Main website navigation and common functions

document.addEventListener("DOMContentLoaded", function () {

  // Footer year
  const year = document.getElementById("currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Mobile navigation
  const menuButton = document.getElementById("menuButton");
  const navigation = document.getElementById("navigation");

  if (menuButton && navigation) {

    menuButton.addEventListener("click", function () {
      navigation.classList.toggle("show");
    });

    navigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navigation.classList.remove("show");
      });
    });
  }

  // Smooth scrolling for same-page links
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

      const targetId = this.getAttribute("href");

      if (targetId && targetId.length > 1) {

        const target = document.querySelector(targetId);

        if (target) {
          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    });
  });

  // Highlight current navigation page
  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll("#navigation a").forEach(function (link) {

    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("current-page");
    }

  });

  console.log("ARS साहित्यिक शब्द लोक वेबसाइट तैयार है।");

});
