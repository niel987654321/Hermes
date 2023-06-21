//if(localStorage.getItem("key") === undefined) location.href = "/login";
let current_ID;
let differentcolors = 1;
const days = document.getElementById("days");
const table = document.createElement("table");
table.id = "table"
days.appendChild(table);
let tage
if(1000 < window.innerWidth) {tage = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];}
else{
    tage = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
}
let day = document.createElement("tr");
day.classList.add("tableRow");
table.appendChild(day);

// Add an empty cell at the beginning of the first row
const emptyCell = document.createElement("td");
day.appendChild(emptyCell);

for (let i = 0; i < tage.length; i++) {
    const tagBeschriftung = document.createElement("td");
    tagBeschriftung.id = tage[i];
    tagBeschriftung.classList.add("style3");
    tagBeschriftung.innerHTML = tage[i]
    day.appendChild(tagBeschriftung);
}
for (let s = 0; s < 24; s++) {
    let day = document.createElement("tr");
    day.classList.add("tableRow");
    table.appendChild(day);

    // Add the hour at the beginning of each row
    const hourCell = document.createElement("td");
    hourCell.innerHTML = s + "h";
    day.appendChild(hourCell);

    for (let i = 0; i < 7; i++) {
        const hour = document.createElement("td");
        hour.id = s+"&"+i;
        hour.classList.add("style"+differentcolors);
        day.appendChild(hour);
        differentcolors = differentcolors === 1 ? 0 : 1
    }
}

// for the loading of the data and display it in the table
function getWeekData(week, year){
    fetch("/getWeekData", { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `key=${localStorage.getItem("key")}&week=${week}&year=${year}`
      })
      .then(response => response.text())
      .then(data => {
        if(data != "error" && data != undefined && data){
            dataObject = JSON.parse(data);
            // Hole alle Elemente mit der Klasse "event"
            let elements = document.querySelectorAll(".event");
            // Lösche jedes Element
            elements.forEach(element => {
                element.parentNode.removeChild(element);
            });
            dataObject.forEach( bookings => {
                let startDate = new Date(bookings["Start"] * 1000);
                let day = startDate.getDay();
                day = day === 0 ? 1 : day;
                day -= 1;
                let hour = startDate.getHours();
                let div = document.createElement("div");
                document.getElementById("days").appendChild(div);
                div.classList.add("event");
                let cell = document.getElementById((startDate.getHours())+"&"+day);
                let rect = cell.getBoundingClientRect();
                div.style.left = rect.left + "px";
                div.style.top = rect.top + (26 * startDate.getMinutes()/ 60)  + "px";
                console.log( (bookings["End"] - bookings["Start"]) / 3600);
                div.style.height = (26 *( (bookings["End"] - bookings["Start"]) / 3600)) + "px";
                div.style.width = rect.width + "px";
                div.innerText = bookings["Typ"]
                div.addEventListener("click", () => {showDetail(bookings)})
            });
        }
        
    });
}

getWeekData(24, 2023);

function formatDateTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }
  
  function showDetail(data) {
    anzeige.style.display = "block";
    document.getElementById("Typ").value = data["Typ"];
    
    let startDate = new Date(data["Start"] * 1000);
    let endDate = new Date(data["End"] * 1000);
  
    let startDateTimeString = formatDateTime(startDate);
    let endDateTimeString = formatDateTime(endDate);
  
    document.getElementById("Start").value = startDateTimeString;
    document.getElementById("End").value = endDateTimeString;
    
    current_ID = data["ID"];
  }
  
document.getElementById("Fehlzeit").addEventListener("click", show_fehlzeit);
document.getElementById("safe").addEventListener("click", speicher);
document.getElementById("delete").addEventListener("click", loschen);

function show_fehlzeit() {
    anzeige.style.display = "block";
    document.getElementById("Typ").value = "";
    document.getElementById("Start").value = "";
    document.getElementById("End").value = "";
}

async function speicher(){
    let url;
    if (current_ID == null) url = "/createBooking";
    else url = "/updateBooking";
    const typ = document.getElementById('Typ').value;
    const start = new Date(document.getElementById('Start').value).getTime() / 1000;
    const end = new Date(document.getElementById('End').value).getTime() / 1000;
    anzeige.style.display = "none"
    const data = new URLSearchParams();
    data.append('Typ', typ);
    data.append('Start', start);
    data.append('End', end);
    data.append('ID', current_ID);
    current_ID = null
    data.append('key', localStorage.getItem("key"));
    const answer = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    });
console.log(answer);
}

function loschen(){
    anzeige.style.display = "none"
    if (current_ID == null) return;
    else{
        anzeige.style.display = "none"
        const data = new URLSearchParams();
        data.append('ID', current_ID);
        data.append('key', localStorage.getItem("key"));
        current_ID = null
        fetch('/deleteBooking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: data
        });
    }
}

function loadTimes(){
    const data = new URLSearchParams();
    data.append('key', localStorage.getItem("key"));
    fetch('/getTimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
      })
    .then(response => response.json())
    .then(data => {
        data[0];
    });
    
}

loadTimes();