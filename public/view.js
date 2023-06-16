//if(localStorage.getItem("key") === undefined) location.href = "/login";

const days = document.querySelectorAll(".fenster");

days.forEach(day => {
    const table = document.createElement("table");
    const row = document.createElement("tr");
    day.appendChild(table);
    table.appendChild(row);
    for (let i = 0; i < 24; i++) {
        const hour = document.createElement("th");
        hour.id = day.id+"&"+i;
        row.appendChild(hour);
    }  
});