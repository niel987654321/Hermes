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

// überprüft die automaitsche minuszeit und fügt sie ein falls nötig
function insertDailyWorkTime(){
  console.log("check automaitc time")
  // aktuelle Datum wird erstellt
  const currentDate = new Date();
  // das datum von gestern
  currentDate.setDate(currentDate.getDate() - 1);
  currentDate.setHours(0, 0, 0, 0);
  // in unix timestamp umgewandelt
  const timestamp = Math.floor(currentDate.getTime() / 1000);
  // überprüft ob heute schon automatische Werte eingefügt wurden
  if(!db.checkIfalreadyInsert(timestamp)){
    // fügt die automatischen Werte ein
    db.insertAllAutomaticWorkTime(timestamp);
  }
}
// setzt ein Interval um die automaische Minuszeit zu überprüfen
setInterval(insertDailyWorkTime, 700000);