document.getElementById("logout").addEventListener("click", () => {
    fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `key=${localStorage.getItem("key")}`
      })
      .then(response => () => {
        localStorage.removeItem('key')
        location.href = "./login"
        }
      )
});

function loadSandbox() {
    var r = document.querySelector(':root');
    r.style.setProperty('--blue', 100);
}

document.addEventListener("load", loadSandbox()); 