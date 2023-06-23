const axios = require('axios');
const url = 'http://10.80.4.127:8080/'; // Hier die URL der API-Endpunkt einfügen
let i = 0;
function sendRequest() {
  console.log("aaaaaaaa")
  i++;
 // Hier die Daten einfügen, die du senden möchtest
  console.log(i)
  axios.get(url)
    .then(response => {
      console.log('Response:', response.data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
// Rufe sendRequest alle 5 Sekunden auf
setInterval(sendRequest, 0);    