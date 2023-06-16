const form = document.querySelector('.register form');

form.addEventListener('submit', event => {
  event.preventDefault();

  const endpoint = event.submitter.id === 'user' ? '/loginUser' : '/loginAdmin';

  const data = new URLSearchParams(new FormData(form));
  
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
  })
  .then(response => response.text())
  .then(data => {
    localStorage.setItem("key", data);
    if(endpoint === "/loginUser") location.href = "/view";
    else location.href = "/manage"; 
    console.log("move");
    alert(data);
    
  });
});