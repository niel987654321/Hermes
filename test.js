let i = 8000;
const axios = require('axios');
function sendRequest() {
  let url = 'http://10.80.4.127:' + i + '/home'; // Hier die URL der API-Endpunkt einfügen
  console.log("aaaaaaaa")
  // Hier die Daten einfügen, die du senden möchtest
  console.log(i)
  axios.get(url)
    .then(response => {
      console.log('Response:', response.data);
    })
    .catch(error => {
      const errorLength = error.message.length;
      console.log(errorLength)
      if (errorLength > 33) {
        console.log("WWWWWWWWW")
        url = 'http://10.80.4.127:' + i + '/home';
        i++;
      }
      console.error('Error:', error);
    });
}
// Rufe sendRequest alle 5 Sekunden auf
setInterval(sendRequest, 22000);