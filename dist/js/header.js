document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const currentPage = window.location.pathname.split("/").pop(); // поточна сторінка

  navLinks.forEach(link => {
    // Отримуємо href і прибираємо хеш, якщо він є
    const linkHref = link.getAttribute("href").split("/").pop().split("#")[0];

    if (linkHref === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
