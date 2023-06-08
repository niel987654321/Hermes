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

function buildSandbox(data){

}

function loadSandbox() {
    if(localStorage.getItem("key") != undefined){
        fetch('/getSandbox', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `key=${localStorage.getItem("key")}`
          })
          .then(response => buildSandbox(response)) 
    }
    else{
        localStorage.removeItem('key')
        location.href = "./login"
    }
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

let selectedElement = null;
let x = 0;
let y = 0;

document.getElementById("hello").addEventListener("mousedown", (event) => {
    selectedElement = event.target;
    x = event.clientX;
    y = event.clientY;
});

document.addEventListener("mousemove", (event) => {
    if (selectedElement) {
        selectedElement.style.left = `${selectedElement.offsetLeft + event.clientX - x}px`;
        selectedElement.style.top = `${selectedElement.offsetTop + event.clientY - y}px`;
        x = event.clientX;
        y = event.clientY;
        if(event.clientY < 60){ 
            y = 60
            selectedElement.style.top = `${y}px`;
        }
        // Check if the element has reached the right or bottom edge of the page
        if (selectedElement.offsetLeft + selectedElement.offsetWidth >= document.documentElement.clientWidth) {
            document.documentElement.style.width = `${document.documentElement.clientWidth + 100}px`;
        }
        if (selectedElement.offsetTop + selectedElement.offsetHeight >= document.documentElement.clientHeight) {
            document.documentElement.style.height = `${document.documentElement.clientHeight + 100}px`;
        }
    }
});

document.addEventListener("mouseup", () => {
    selectedElement = null;
});