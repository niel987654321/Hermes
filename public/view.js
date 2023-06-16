//if(localStorage.getItem("key") === undefined) location.href = "/login";

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
            dataObject.forEach( bookings => {
                
                console.log(bookings);
                let startDate = new Date(bookings["Start"] * 1000);
                let endDate = new Date(bookings["End"] * 1000);
                let day = startDate.getDay();
                let difference =  bookings["End"] - bookings["Start"]
                let differenceHours = difference / 60 / 60;
                day = day === 0 ? 1 : day
                day -= 1;
                let hour = startDate.getHours();
                let zusatz = endDate === 0 ? 0 : 1;
                
                for (let i = hour; i < endDate.getHours() + zusatz; i++) {
                    const field = document.getElementById(i+"&"+day);
                    field.style.backgroundColor = "green";
                    field.innerHTML = "Hello";
                    
                }
            });
        }
        
    });
}

getWeekData(24, 2023);
