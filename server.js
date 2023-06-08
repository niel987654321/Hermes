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
app.post("/login", async function (req, res) {
  console.log(req.body);
  const result = await handle_login(req);
  res.send(result);
});

app.post("/logout", async function (req, res) {
  console.log("%%%%%%%%%%%%");
  console.log(req.body);
  let {key} = req.body;
  console.log(key);
  const result = await db.logout(key);
  res.send("Success");
});

app.post("/register_team", async function (req, res) {
  let result = await handle_register_team(req);
  if(result === "success"){
    await handle_register_teams_user(req);
    result = await handle_login(req);
  }
  res.send(result);
});

//-------------------------------------------
// the function to handle the endponts for the frontend
//-------------------------------------------

async function handle_login(request){
  try {
    let { name, password, team } = request.body;
    // check if user is in database
    if(db.checkLoginData(name, password, team) === true){
      return await db.generate_key(name, team);
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
    console.log(name, password, team);
    // check if user is in database
    console.log(db.team_exist(team));
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

//-------------------------------------------
// generall functions
//-------------------------------------------
function infofromkey(key){
  return db.infofromkey(key);
}
