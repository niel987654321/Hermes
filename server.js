// all imports and requires
const express = require("express");
const cors = require('cors');
const app = express();
const port = 3000; // App running on Port 3004
const database = require("./database.js");
const db = new database("./db.db");
var bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//-------------------------------------------
// sends html to the frontend
//-------------------------------------------
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

//-------------------------------------------
// the endpoint for the frontend
//-------------------------------------------
app.post("/loginUser", async function (req, res) {
  const result = await handle_login(req, "User");
  res.send(result);
});

app.post("/loginAdmin", async function (req, res) {
  const result = await handle_login(req, "Admin");
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

//-------------------------------------------
// the function to handle the endponts for the frontend
//-------------------------------------------

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
    const teamID = await db.getTeamfromName(team)["id"];
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
    if(!checkKey(key, "admin")) return("logout");
    else{
      updateKey(key); 
      let team = db.getTeamfromKey(key)["id"];
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
    if(!checkKey(key, "user")) return("logout");
    else{
      updateKey(key);
      let team = db.getTeamfromKey(key)["id"];
      return [db.getAllConnection(team), db.getAllPerConfig(team)]
    }
  }
  catch(error){
    console.log(error);
    return("error");
  }  
}

//-------------------------------------------
// generall functions
//-------------------------------------------
function infofromkey(key){
  return db.infofromkey(key);
}

function checkKey(key, type){
  let keysfromDB = db.infofromkey(key, type);
  return !(keysfromDB === "{}" || keysfromDB === undefined);
}

function updateKey(key){
  db.updateKey(key);
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
