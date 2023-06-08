document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new URLSearchParams(new FormData(event.target));
    fetch('/register_team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      // Verarbeite die Antwort des Servers hier
      if(data === "team already exist"){
        document.getElementById("error").innerText= "Team existiert bereits. Bitte nehmen sie einen anderen Namen"
      }
      else{
        localStorage.setItem("key", data);
        location.href = "/manage";
        console.log("move");
      }
    });
  });