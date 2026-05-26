document.querySelector(".search-box-form").addEventListener("submit", function (event) {
  event.preventDefault();
  search();
});

function smoothScrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
