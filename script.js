(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const themeButton = document.getElementById("theme");
  const menuButton = document.getElementById("menu");
  const navList = document.getElementById("nav-list");
  const header = document.querySelector(".header");
  const themeColor = document.getElementById("theme-color");
  const year = document.getElementById("year");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const navLinks = [...document.querySelectorAll('.nav-list a[href^="#"]')];

  function isDarkTheme() {
    return root.dataset.theme === "dark";
  }

  function updateThemeInterface() {
    const dark = isDarkTheme();
    themeButton.setAttribute(
      "aria-label",
      dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
    );
    themeButton.setAttribute(
      "title",
      dark ? "Gunakan mode terang" : "Gunakan mode gelap"
    );
    themeColor.setAttribute("content", dark ? "#050915" : "#f5f8ff");
  }

  function setTheme(theme, save = true) {
    const validTheme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = validTheme;
    updateThemeInterface();

    if (save) {
      try {
        localStorage.setItem("arjuna-theme", validTheme);
      } catch (error) {
        // Website tetap berfungsi ketika penyimpanan browser tidak tersedia.
      }
    }
  }

  updateThemeInterface();

  themeButton.addEventListener("click", () => {
    setTheme(isDarkTheme() ? "light" : "dark");
  });

  const followSystemTheme = (event) => {
    try {
      if (!localStorage.getItem("arjuna-theme")) {
        setTheme(event.matches ? "dark" : "light", false);
      }
    } catch (error) {
      setTheme(event.matches ? "dark" : "light", false);
    }
  };

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", followSystemTheme);
  } else if (typeof systemTheme.addListener === "function") {
    systemTheme.addListener(followSystemTheme);
  }

  function closeMenu({ restoreFocus = false } = {}) {
    navList.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Buka menu");
    body.classList.remove("menu-open");
    if (restoreFocus) menuButton.focus();
  }

  function openMenu() {
    navList.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Tutup menu");
    body.classList.add("menu-open");
  }

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    open ? closeMenu() : openMenu();
  });

  navLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));

  document.addEventListener("click", (event) => {
    if (
      navList.classList.contains("open") &&
      !navList.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navList.classList.contains("open")) {
      closeMenu({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 950) closeMenu();
  });

  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealElements = document.querySelectorAll(".reveal");
  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px" }
    );
    revealElements.forEach((element) => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!current) return;

        navLinks.forEach((link) => {
          const active = link.hash === `#${current.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -55%" }
    );
    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  year.textContent = String(new Date().getFullYear());
})();
