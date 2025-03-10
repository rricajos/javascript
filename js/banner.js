document.querySelector(".search-box-form").addEventListener("submit", function (event) {
  // Prevenir la recarga de la página al enviar el formulario
  event.preventDefault();

  // Obtener el valor de búsqueda desde el campo de entrada
  var query = document.getElementById("query").value;
  console.log(query)

  // Aquí podrías realizar una solicitud AJAX para buscar en tu servidor
  // y actualizar dinámicamente los resultados en el elemento con id "resultados"
  // (Ejemplo simplificado sin AJAX)
  // var resultadosElemento = document.getElementById("resultados");
  // resultadosElemento.innerHTML = "Realizando búsqueda para: " + query;
});

const banner = document.getElementById("banner");

function smoothScrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function search() {
  smoothScrollToTop()
  var query = document.getElementById("query").value;

  if (query != "") {
    banner.style.height = "0px";
    smoothScrollToTop()
  } else {
    banner.style.height = "222px";
    smoothScrollToTop()
  }
  smoothScrollToTop()
  console.log(query)
  // Puedes realizar acciones adicionales en tiempo real mientras el usuario escribe
  // Pero ten en cuenta que la búsqueda completa se realizará al enviar el formulario

}