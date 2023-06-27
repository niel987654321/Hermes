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

let dateRow = document.createElement("tr");
dateRow.classList.add("tableRow");
table.appendChild(dateRow);

// Add an empty cell at the beginning of the first row
const emptyCell2 = document.createElement("td");
dateRow.appendChild(emptyCell2);


for (let i = 0; i < tage.length; i++) {
    const tagBeschriftung = document.createElement("td");
    tagBeschriftung.id = i;
    tagBeschriftung.classList.add("style3");
    tagBeschriftung.innerHTML = "loading ...";
    dateRow.appendChild(tagBeschriftung);
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
            for (let i = 0; i < 7; i++) {
                const elementDate = document.getElementById(i);
                elementDate.innerText = getDateFromWeek(weekNumber, year, i);
                const hour = document.createElement("td");
            }
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
                div.style.height = (26 *( (bookings["End"] - bookings["Start"]) / 3600)) + "px";
                div.style.width = rect.width + "px";
                div.innerText = bookings["Typ"]
                div.addEventListener("click", () => {showDetail(bookings)})
                if(bookings["Typ"] === "Ferien") div.classList.add("green");
                else if(bookings["Typ"] === "Arbeit" || bookings["Typ"] === "Arbeiten") div.classList.add("red");
                else div.classList.add("blue");
                if(bookings["genemigt"] === 0) div.style.opacity = 0.5;
            });
        }
        
    });
}

currentDate = new Date();
startDate = new Date(currentDate.getFullYear(), 0, 1);
var da = Math.floor((currentDate - startDate) /
    (24 * 60 * 60 * 1000));

var weekNumber = Math.ceil(da / 7);
let year = currentDate.getFullYear();
getWeekData(weekNumber, year);
document.getElementById("week").innerText = `Woche: ${ weekNumber}, Jahr: ${year}`;

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

  function neueWoche(jahr, woche, wochenVerschiebung) {
    let neueWoche = woche + wochenVerschiebung;
    let neuesJahr = jahr;
  
    if (neueWoche < 1) {
      neuesJahr--;
      neueWoche = 52 + neueWoche;
    } else if (neueWoche > 52) {
      neuesJahr++;
      neueWoche = neueWoche - 52;
    }
  
    return { neuesJahr, neueWoche };
  }

document.getElementById("logout").addEventListener("click", () => {logout()});
document.getElementById("plusWeek").addEventListener("click", () => {changeWeek(1)});
document.getElementById("minusWeek").addEventListener("click", () => {changeWeek(-1)});
document.getElementById("Fehlzeit").addEventListener("click", show_fehlzeit);
document.getElementById("safe").addEventListener("click", speicher);
document.getElementById("delete").addEventListener("click", loschen);

function getDateFromWeek(week, year, dayOfWeek) {
    const firstDayOfYear = new Date(year, 0, 1);
    const days = 2 + dayOfWeek + (week - 1) * 7 - firstDayOfYear.getDay();
    const date = new Date(year, 0, days);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const formattedDate = `${day}.${month}.${year}`;
    
    return formattedDate;
}

function changeWeek(verschiebung) {
    const newdate = neueWoche(year, weekNumber, verschiebung);
    weekNumber = newdate.neueWoche
    year = newdate.neuesJahr
    getWeekData(weekNumber, year);
    document.getElementById("week").innerText = `Woche: ${ weekNumber}, Jahr: ${year}`;
}

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
    getWeekData(weekNumber, year);
    loadTimes();
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
    getWeekData(weekNumber, year);
    loadTimes();
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
        if(data != "error" && data != "logout"){
            let minuten = Math.floor(data[2] / 60);
            let stunden = Math.floor(minuten / 60);
            minuten = minuten % 60;
            data[2] = data[2] % 60;
            document.getElementById("HolidayToday").innerText = "Ferien verfügbar: "+data[0] + " Tage";
            document.getElementById("HolidaySaldo").innerText = "Ferien die noch Eingetragen werden können: "+data[1] + " Tage";
            document.getElementById("CurrentTime").innerText = `Aktuelles Guthaben:  ${stunden} h ${minuten} Min`;
        }
        console.log(data);
    });
    
}

loadTimes();

function acceptAnfrage(id) {
  const data = new URLSearchParams();
  data.append('ID', id);
  data.append('key', localStorage.getItem("key"));
  fetch('/acceptRequest', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
})
.then(response => response.text())
.then(data => {
  loadAnfragen();
})
}

function declineAnfrage(id) {
  const data = new URLSearchParams();
  data.append('ID', id);
  data.append('key', localStorage.getItem("key"));
  fetch('/declineRequest', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
})
.then(response => response.text())
.then(data => {
  loadAnfragen();
})
}

function loadAnfragen() {
    fetch('/BookingRequest', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `key=${localStorage.getItem("key")}`
    })
    .then(response => response.text())
    .then(data => {
        if(data != "error" && data != "logout"){
            let requests = JSON.parse(data);
            document.getElementById("displayAnfragen").innerHTML = "";
            requests.forEach((request) => {
                const div = document.createElement("div")
                const name = document.createElement("h4")
                const typ = document.createElement("h2")
                const timeStart = document.createElement("p");
                const timeEnd = document.createElement("p");
                const accept = document.createElement("button");
                const decline = document.createElement("button");
                name.innerText = request["Name"]
                typ.innerText = request["Typ"]
                timeStart.innerText = formatTime(request["Start"]);
                timeEnd.innerText = formatTime(request["End"]);
                accept.onclick = () => acceptAnfrage(request["ID"]);
                decline.onclick = () => declineAnfrage(request["ID"]);
                accept.innerText = "Annehmen";
                decline.innerText = "Ablehnen";
                document.getElementById("displayAnfragen").appendChild(div);
                div.appendChild(name);
                div.appendChild(typ);
                div.appendChild(timeStart);
                div.appendChild(timeEnd);
                div.appendChild(accept);
                div.appendChild(decline);

              })
            if(document.getElementById("displayAnfragen").innerHTML === ""){
              document.getElementById("displayAnfragen").innerHTML = "Keine Anfragen";
            }
        }
        else{

            //location.href = "/login";
        }
        console.log(data);
    });
}

function logout() {
    fetch('/logout', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `key=${localStorage.getItem("key")}`
    })
    .then(response => {
        localStorage.removeItem('key')
        location.href = "./login"
        }
    )
}

const anfragen = document.querySelector('#divAnzeigen');
const buttonElement = document.querySelector('#anfragen');

document.addEventListener('click', (event) => {
  if (!anfragen.contains(event.target)  && event.target !== buttonElement) {
    anfragen.style.display = 'none';
  }
});

buttonElement.addEventListener('click', () => {
    anfragen.style.display = 'block';
    loadAnfragen();
  });

const divEintrag = document.querySelector('#anzeige');
const buttonElement2 = document.querySelector('#Fehlzeit');

document.addEventListener('click', (event) => {
  if (!divEintrag.contains(event.target) && event.target !== buttonElement2 && !event.target.classList.contains('event')) {
    divEintrag.style.display = 'none';
  }
});

buttonElement2.addEventListener('click', () => {
    divEintrag.style.display = 'block';
  });

function formatTime(timestamp) {
const date = new Date(timestamp * 1000);

const hours = date.getHours().toString().padStart(2, '0');
const minutes = date.getMinutes().toString().padStart(2, '0');
const day = date.getDate().toString().padStart(2, '0');
const month = (date.getMonth() + 1).toString().padStart(2, '0');
const year = date.getFullYear();

const formattedDate = `${hours}:${minutes} ${day}-${month}-${year}`;
return formattedDate
}