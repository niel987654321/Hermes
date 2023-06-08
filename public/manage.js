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
}

document.addEventListener("load", loadSandbox()); 

let size = 100;
function changeSize(change) {
    if(change + size > 50 && change + size < 150){
        size = change + size;
        var r = document.querySelector(':root');
        r.style.setProperty('--size', size + "px");    
    }
}

document.getElementById("plus").addEventListener("click", () => {changeSize(10)})

document.getElementById("minus").addEventListener("click", () => {changeSize(-10)})
