function fetchCode(src) {

  return new Promise(function (resolve, reject) {
    fetch(src)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load code. Status: ${response.status}`);
        }
        return response.text();
      })
      .then(code => resolve(code))
      .catch(error => reject(error));
  });
}

function run(id) {
  let src = document.getElementById(id).textContent.replace(/\s/g, '');

  // Updaate the sctipt title HTML container 
  let codeTitle = document.getElementById("output-box-title");
  codeTitle.textContent = src;

  




  // Get the HTML container
  let codeContainer = document.getElementById("output-box-code");

  // Clean previous HTML
  codeContainer.innerHTML = "";

  fetchCode("js/" + src)
    .then(function (code) {
      // Split the code into lines
      let codeLines = code.split('\n');





      // Display each line in a <p> element
      codeLines.forEach(function (line) {
        let paragraph = document.createElement("p");
        paragraph.textContent = line;
        codeContainer.appendChild(paragraph);
      });
    })
    .catch(function (error) {
      console.error(error);
    });
}

// run('btn-001')