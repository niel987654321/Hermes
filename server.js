// all imports and requires
const express = require("express");
const cors = require('cors');
const app = express();
const port = 3000; // App running on Port 3004
const database = require("./database.js");
const db = new database("./db.db");
var bodyParser = require("body-parser");
const e = require("express");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// sends html to the frontend
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/view", function (req, res) {
  res.sendFile(__dirname + "/public/view.html");
});

app.get("/manage", function (req, res) {
  res.sendFile(__dirname + "/public/manage.html");
});

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// the endpoint for the frontend
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/loginUser", async function (req, res) {
  const result = await handle_login(req, "Person");
  res.send(result);
});

app.post("/loginAdmin", async function (req, res) {
  const result = await handle_login(req, "User");
  res.send(result);
});

app.post("/logout", async function (req, res) {
  let {key} = req.body;
  const result = await db.logout(key);
  res.send("Success");
});

app.post("/register_team", async function (req, res) {
  let result = await handle_register_team(req);
  if(result === "success"){
    await handle_register_teams_user(req);
    result = await handle_login(req, "Admin");
  }
  res.send(result);
});

app.post("/save_management", async function (req, res) {
  let result = await handle_save_management(req);
  res.send(result);
});

app.post("/getSandbox", async function (req, res) {
  let result = await handle_getSandbox(req);
  res.send(JSON.stringify(result));

})

app.post("/getWeekData", async function (req, res) {
  let result = await handle_getWeekData(req);
  res.send(result);
})

app.post("/updateBooking", async function (req, res) {
  let result = await handle_updateBooking(req);
  res.send(result);
})

app.post("/createBooking", async function (req, res) {
  let result = await handle_createBooking(req);
  res.send(result);
})

app.post("/deleteBooking", async function (req, res) {
  let result = await handle_deleteBooking(req);
  res.send(result);
})

app.post("/getTimes", async function (req, res) {
  let result = await handle_getTimes(req);
  res.send(result);
})

app.post("/BookingRequest", async function (req, res) {
  let result = await handle_BookingRequest(req);
  res.send(result);
})

app.post("/acceptRequest", async function (req, res) {
  let result = await handle_acceptRequest(req);
  res.send(result);
})

app.post("/declineRequest", async function (req, res) {
  let result = await handle_declineRequest(req);
  res.send(result);
})

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// the function to handle the endponts for the frontend
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function handle_login(request, type){
  try {
    let { name, password, team } = request.body;

    // check if user is in database
    if(db.checkLoginData(name, password, team, type) === true){
      return await db.generate_key(name, team, type);
    }
    else{
      return("Invalid wrong user or password or team");
    }
  } catch (error) {
    // if error happens
    console.log(error);
    return("Invalid wrong user or password or team");
  }
}

async function handle_register_team(request){
  try {
    let {team, name, password} = request.body;
    // check if user is in database
    if(db.team_exist(team) === false){ 
      await db.create_team(team);
      return("success");
    }
    else{
      return("team already exist");
    }
  } catch (error) {
    // if error happens
    console.log(error);
    return("team already exist");
  }
}

async function handle_register_teams_user(request){
  try {
    let {team, name, password} = request.body;
    const teamID = await db.getTeamfromName(team)["ID"];
    await db.create_user(name, password, teamID);
  }
  catch(error){
    console.log(error);
    return("team already exist");
  }
}

async function handle_save_management(request){
  try {
    let {key, PersonAndConfig, PerConConnection} = request.body;
    if(!checkKey(key, "User")) return("logout");
    else{
      updateKey(key, "User"); 
      let team = db.getTeamfromKey(key)["ID"];
      PerConConnection = JSON.parse(PerConConnection);
      PersonAndConfig = JSON.parse(PersonAndConfig);
      if(!checkPerConData(PersonAndConfig, PerConConnection)) return("Ungültige Daten. Überprüfen sie die Verbindungen");
      else{
        safeManagement(PersonAndConfig, PerConConnection, team);
        return("Erfolgreich gespeichert.");
      }
    }
  }
  catch(error){
    console.log(error);
    return("error");
  }  
}

async function handle_getSandbox(request) {
  try{
    let {key} = request.body;
    if(!checkKey(key, "User")) return("logout");
    else{
      updateKey(key, "User");
      let team = db.getTeamfromKey(key)["ID"];
      return [db.getAllConnection(team), db.getAllPerConfig(team)]
    }
  }
  catch(error){
    console.log(error);
    return("error");
  }  
}

async function handle_getWeekData(request){
  try{
    let {key, week, year} = request.body;
    if(!checkKey(key, "person")) return("logout");
    else{
      updateKey(key, "person");
      let unixTime = getSecondsSinceEpochForWeek(week, year);
      const name = infofromkey(key, "person")["Name"]
      const team = infofromkey(key, "person")["fk_team"]
      return getAllEntries(unixTime, name, team);
    }
  }
  catch(error){
    console.log(error);
    return("error");
  }  
}

async function handle_updateBooking(request){
  try{
    
    let {key, Typ, Start, End, ID} = request.body;
    if(!checkKey(key, "person")) return("logout");
    else{
      updateKey(key, "person");
      Start = parseInt(Start);
      End = parseInt(End);
      if(checkIfisononeDay(Start, End) && Typ != "automatic"){
        let fk_user = infofromkey(key, "Person")["ID"];
        if(Typ === "Ferien") {
          if(db.getHolidayEntered(fk_user) < 1){
            console.log("Ferien verfügbar: ",db.getHolidayEntered(fk_user));
            return "Keine Ferien mehr";
          }
          else {
            newTime = newHolidayTime(Start, fk_user);
            Start = newTime.achtUhr;
            End = newTime.entfernterTimestamp;
          }
        }
        db.updateBooking(ID, Start, End, Typ, fk_user);
        db.updateCurrentStatus(fk_user);
        return "success";
      }
      else{
        return "Falsche Zeitangaben";
      }
    }
  }
  catch(error){
    console.log(error);
    return("error");    
  }
}

async function handle_createBooking(request){
  try{
    let {key, Typ, Start, End} = request.body;
    if(!checkKey(key, "person")) return("logout");
    else{
      updateKey(key, "person");
      Start = parseInt(Start);
      End = parseInt(End);
      if(checkIfisononeDay(Start, End) && Typ != "automatic"){
        let fk_user = infofromkey(key, "Person")["ID"];
        if(Typ === "Ferien") {
          if(db.getHolidayEntered(fk_user) < 1){
            console.log("Ferien verfügbar: ",db.getHolidayEntered(fk_user));
            return "Keine Ferien mehr";
          }
          newTime = newHolidayTime(Start, fk_user);
          Start = newTime.achtUhr;
          End = newTime.entfernterTimestamp;
        }
        db.createBooking(Start, End, Typ, fk_user);
        db.updateCurrentStatus(fk_user);
        return "success";
      }
      else{
        return "Falsche Zeitangaben oder ungültiger Name";
      }
    }
  }
  catch(error){
    console.log(error);
    return("error");    
  }
}

async function handle_deleteBooking(request){
  try{
    let {ID, key} = request.body;
    if(!checkKey(key, "person")) return("logout");
    else{
      updateKey(key, "person");
      let fk_user = infofromkey(key, "Person")["ID"];
      db.deleteBooking(ID, fk_user);
    }
  }
  catch(error){
    console.log(error);
    return("error");    
  }
}

async function handle_getTimes(request){
  try{
    let {key} = request.body;
    if(!checkKey(key, "person")) return("logout");
    else{
      updateKey(key, "person");
      let fk_user = infofromkey(key, "Person")["ID"];
      let answer = [db.getHolidayAvailable(fk_user), db.getHolidayEntered(fk_user), db.getTime(fk_user)];
      return answer;
    }
  }
  catch(error){
    console.log(error);
    return("error");    
  }
}

async function handle_BookingRequest(request) {
  try{
    let {key} = request.body;
    if(!checkKey(key, "person")) return("logout");
    else{
      updateKey(key, "person");
      let fk_user = infofromkey(key, "Person")["ID"];
      const answer = db.getBookingRequest(fk_user);
      return answer;
    }
  }
  catch(error){
    console.log(error);
    return("error");    
  }
}

async function handle_acceptRequest(request) {
  try{
    let {key, ID} = request.body;
    if(!checkKey(key, "person")) return("logout");
    else{
      updateKey(key, "person");
      if(checkIfRequestcanEdit(key, ID)){
        updateRequest(ID, true);
      }    
      db.updateCurrentStatus( infofromkey(key, "Person")["ID"])
      return "";
    }
  }
  catch(error){
    console.log(error);
    return("error");    
  }
}

async function handle_declineRequest(request) {
  try{
    let {key, ID} = request.body;
    if(!checkKey(key, "person")) return("logout");
    else{
      updateKey(key, "person");
      if(checkIfRequestcanEdit(key, ID)){
        updateRequest(ID, false);
      }
      db.updateCurrentStatus( infofromkey(key, "Person")["ID"])
      return "";
    }
  }
  catch(error){
    console.log(error);
    return("error");    
  }
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// generall functions
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function infofromkey(key, type){
  return db.infofromkey(key, type);
}

function checkKey(key, type){
  let keysfromDB = db.infofromkey(key, type);
  console.log("Key überprüft. Ergebnis: "+keysfromDB, key, type);
  return !(keysfromDB === "{}" || keysfromDB === undefined);
}

function updateKey(key, type){
  db.updateKey(key, type);
}

function checkConfig(name, data, PerConConnection, PersonAndConfig){
  let feedback = true;
  PerConConnection.forEach( connection => {
    if(connection === null) return;
    if(connection[0] === name && PersonAndConfig[connection[2]]["type"] != "person"){ 
      feedback = false; 
    }
  });
  return feedback;
}

function checkValueofConfig() {
  if(
    config["type"] === "config" &&
    typeof config["stunden"] === "number" &&
    typeof config["ferien"] === "number"
  ){return true}
  else return false;  
}

function checkUser(name, data, PerConConnection, PersonAndConfig){
  let feedback = false;
  PerConConnection.forEach( connection => {
    if(connection === null) return;
    if(connection[0] === name && PersonAndConfig[connection[2]]["type"] === "config"){
      feedback = true;
    }

    if(connection[0] === name && PersonAndConfig[connection[2]]["type"] === "person"){
      feedback = false;
      return feedback; 
    }
  });
  return feedback;
}

function checkValueofConfig(config) {
  if(
    config["type"] === "config" &&
    typeof config["stunden"] === "number" &&
    typeof config["ferien"] === "number"
  ){return true}
  else return false;  
}

function checkValueofUser(config) {
  if(
    config["type"] === "person" &&
    typeof config["Password"] === "string" &&
    typeof config["x"] === "number" &&
    typeof config["y"] === "number"
  ){return true}
  else return false;  
}

function checkPerConData(PersonAndConfig, PerConConnection){
  let checksuccess = true;
  for (const [key, value] of Object.entries(PersonAndConfig)) {
    if(value["type"] === "config")
    {
      if(!checkValueofConfig(value) || !checkConfig(key, value, PerConConnection, PersonAndConfig)){
        checksuccess = false;
      }
    } 
    if(value["type"] === "person")
    {
      if(!checkValueofUser(value) || !checkUser(key, value, PerConConnection, PersonAndConfig)){
        checksuccess = false;
      }
    }
  }
  return checksuccess;
}


function safeManagement( PersonAndConfig, PerConConnection, team){

  db.deleteAllReference(team);
  db.deleteAllField(team);
  for (const [key, value] of Object.entries(PersonAndConfig)) {
    if(value === null) continue;
    db.insertField(key, value, team)
  }

  db.deleteAllConnection(team);
  PerConConnection.forEach(
    element => {
      if(element != null){ db.insertConnection(element, team)}
    }
  );


  db.deleteAllGroups(team);
  for (const [key, value] of Object.entries(PersonAndConfig)) {
    if(value["type"] === "config"){
      db.insertGroup(key, value, team);
    }
  }


  db.deleteAllPerson(team);
  for (const [key, value] of Object.entries(PersonAndConfig)) {
    if(value["type"] === "person"){
    db.InsertPerson(key, value, team);
    }
  }

  PerConConnection.forEach(
    element => {
      if(element != null) {db.InsertReference(element, PersonAndConfig, team)}}
  );
}

function getSecondsSinceEpochForWeek(week, year) {
  // Set the date to the first day of the year
  let date = new Date(year, 0, 1);
  // Calculate the number of days to add to reach the desired week
  let daysToAdd = (week - 1) * 7;
  // Add the number of days to the date
  console.log(week, year, date);
  date.setDate(date.getDate() + daysToAdd);
  // Set the date to Monday of that week
    
  while (date.getDay() !== 1) {

    date.setDate(date.getDate() + 1);
  }
  // Return the number of seconds since January 1st, 1970
  return Math.floor(date.getTime() / 1000);
}

function getAllEntries(unixTime, name, team){
  const weekEnd = unixTime + 604800;
  return db.getAllEntries(unixTime, weekEnd, name, team);
}

function checkIfisononeDay(start, end) {
  if (typeof start !== 'number' || typeof end !== 'number') {
    return false;
  }

  const startDate = new Date(start * 1000);
  const endDate = new Date(end * 1000);

  return startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate() && start < end;
}

function newHolidayTime(unixTimestamp, user) {
  let stundenEntfernung =  parseInt(db.getWorkTimefromUser(user))/5;
  let datum = new Date(unixTimestamp * 1000);
  let achtUhr = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate(), 8);
  let entfernterTimestamp = new Date(achtUhr.getTime() + stundenEntfernung * 60 * 60 * 1000);
  return {
    achtUhr: Math.floor(achtUhr.getTime() / 1000),
    entfernterTimestamp: Math.floor(entfernterTimestamp.getTime() / 1000)
  };
}

function insertDailyWorkTime(){
  console.log("check automaitc time")
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  currentDate.setHours(0, 0, 0, 0);
  const timestamp = Math.floor(currentDate.getTime() / 1000);
  if(!db.checkIfalreadyInsert(timestamp)){
    db.insertAllAutomaticWorkTime(timestamp);
  }
}

setInterval(insertDailyWorkTime, 700000);

function checkIfRequestcanEdit(key, id) {
idUser = infofromkey(key, "Person")["ID"]
if(db.checkRequestcanEdit(idUser, id) != "[]" && db.checkRequestcanEdit(idUser, id) != undefined && db.checkRequestcanEdit(idUser, id)) return true;
else return false;
}

function updateRequest(ID, updateValue) {
  if(updateValue) db.acceptRequest(ID)
  else db.deleteRequest(ID);
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// the sql to create triggers in database
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


/*
CREATE TRIGGER update_profit AFTER INSERT ON Bookings
BEGIN
  UPDATE Bookings SET profit = NEW.End - NEW.Start WHERE ID = NEW.ID;
END;

CREATE TRIGGER update_profit_onupdate AFTER UPDATE ON Bookings
BEGIN
  UPDATE Bookings SET profit = NEW.End - NEW.Start WHERE ID = NEW.ID;
END;
*/