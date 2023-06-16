/* jshint esversion: 6 */

module.exports = function (file) {
    const Database = require('better-sqlite3')
  
    this.db = new Database(file, {
      //  verbose: console.log
    })
  
    this.connect = function (file) {
      this.db = new Database(file, {
        verbose: console.log
      })
    }

    this.checkLoginData = function (name, password, team, type) {
      const table = type === 'User' ? 'Person' : 'User';
      const team_id = this.getTeamfromName(team)["id"];
      const select = this.db.prepare(
        `SELECT * FROM ${table} WHERE name= @name AND Password = @password AND fk_team = @team_id`
      );
      const result = select.get({name, password, team_id});
      return result !== undefined;
    }

    this.generate_key = function (name, team, type) {
      const table = type === 'User' ? 'Person' : 'User';
      const keytable = type === 'User' ? 'PersonKey' : 'Key';
      const team_id = this.getTeamfromName(team)["id"];
      const select = this.db.prepare(
        `SELECT id FROM ${table} WHERE Name= @name AND fk_team = @team_id`
      );
      const result = select.get({name, team_id});
    
      let keyquery;
      let key;
      do {
        key = this.genAPIKey();
        const select_key = this.db.prepare(
          `SELECT key FROM ${keytable} WHERE key = @key`
        );
        keyquery = select_key.get({key});
      } while (keyquery != undefined);
      this.insertKey(key, result["id"], keytable);
      return key;
    }
    
    this.insertKey = (key, fk_user, keytable) => {
      const validity = Math.floor(new Date().getTime() / 1000) + 1000;
      const insert = this.db.prepare(
        `INSERT INTO ${keytable} (key, fk_user, validity) VALUES (@key ,@fk_user, @validity);`
      );
      insert.run({key, fk_user, validity});
    }

    // generate API Key
    this.genAPIKey = () => {
      //create a base-36 string that contains 30 chars in a-z,0-9
      return [...Array(300)]
        .map((e) => ((Math.random() * 36) | 0).toString(36))
        .join("");
    };

    this.getTeamfromName = function (team) {
      const select = this.db.prepare(
        "SELECT id FROM Team WHERE name = @team"
      );
      return result = select.get({ team });
    }

    this.team_exist = (team) => {
      return this.getTeamfromName(team) != undefined
    }
  
    this.create_team = (name) => {
      const insert = this.db.prepare(
        "INSERT INTO Team (name) VALUES (@name); "
      );
      insert.run({ name });
      return("success");
    }

    this.infofromkey = (key, type) => {
      const keytable = type === 'User' ? 'PersonKey' : 'Key';
      const select = this.db.prepare(
        `SELECT * FROM ${keytable} as k LEFT JOIN User u ON k.fk_user = u.id WHERE k.key = @key`
      );
      return select.get({key});
    }

    this.create_user = (name, password, team_id) => {
      try{
        const insert = this.db.prepare(
          "INSERT INTO User (Name, password, fk_team, ferien, arbeitspensum, arbeitstage) VALUES (@name, @password, @team_id, 0,0,0);"
        );
        insert.run({ name, password, team_id });
        return("success");
      }
      catch(error){
        console.log(error);
        return("Error");
      }
    }

    this.logout = (key) => {
      const insert = this.db.prepare(
        "DELETE FROM Key WHERE key = @key; "
      );
      insert.run({ key });
      return("success");
    }

    this.updateKey = (key) => {
      const validity = Math.floor(new Date().getTime() / 1000) + 1000
      const updateKey = this.db.prepare(
        "UPDATE Key SET validity = ? WHERE key = ?; "
      );
      updateKey.run(validity ,key);
    }

    this.getTeamfromKey = (key) => {
      const getTeam = this.db.prepare(
        "SELECT t.id FROM Key LEFT JOIN User as u on Key.fk_user = u.id LEFT JOIN Team as t on u.fk_team = t.id WHERE Key.key = ?"
      );
      return result = getTeam.get( key );  

    }

    this.deleteAllField = (team) => {
      const deleteAll = this.db.prepare(
        "DELETE FROM Field where fk_team = ?;"
      );
      deleteAll.run(team);
    }

    this.deleteAllConnection = (team) => {
      const deleteAll = this.db.prepare(
        "DELETE FROM Connection where fk_team = ?;"
      );
      deleteAll.run(team);
    }
    
    this.deleteAllGroups = (team) => {
      const deleteAll = this.db.prepare(
        "DELETE FROM `Group` where fk_team = ?;"
      );
      deleteAll.run(team);
    }
    
    this.deleteAllPerson = (team) => {
      const deleteAll = this.db.prepare(
        "DELETE FROM Person where fk_team = ?;"
      );
      deleteAll.run(team);
    }

    this.deleteAllReference = (team) => {
      const deleteAll = this.db.prepare(
        "DELETE FROM Person_Group where fk_team = ?;"
      );
      deleteAll.run(team);
    }

    
    this.insertField = (name, data, team) => {
      try{
        const insert = this.db.prepare(
          "INSERT INTO Field VALUES (NULL, ?, ?, ?,?,?,?,?, ?);"
        );
        insert.run(name, data["Password"],data["type"],data["x"],data["y"],data["ferien"],data["stunden"], team);
        return("success");
      }
      catch(error){
        console.log(error);
        return("Error");
      }
    }

    
    this.insertConnection = (data, team) => {
      try{
        const insert = this.db.prepare(
          "INSERT INTO Connection VALUES (NULL, ?, ?, ?,?, ?);"
        );
        insert.run(data[0], data[1],data[2],data[3], team);
        return("success");
      }
      catch(error){
        console.log(error);
        return("Error");
      }
    }
    
    this.insertGroup = (name ,data, team) => {
      try{
        const insert = this.db.prepare(
          "INSERT INTO `Group` VALUES (NULL,?, ?, ?, ?);"
        );
        insert.run(data["ferien"], data["stunden"], name, team);
        return("success");
      }
      catch(error){
        console.log(error);
        return("Error");
      }
    }

    this.InsertPerson = (name,data, team) => {
      try{
        const insert = this.db.prepare(
          "INSERT INTO Person VALUES (NULL, ?, ?, ?);"
        );
        insert.run(name, data["Password"], team);
        return("success");
      }
      catch(error){
        console.log(error);
        return("Error");
      }   
    }

    this.getIDfromNamePerson = (name, team) => {
      const getTeam = this.db.prepare(
        "SELECT ID FROM Person where Name = ? AND fk_team = ?"
      );
      return result = getTeam.get( name, team )["ID"];  
    }

    this.getIDfromNameGroup = (name, team) => {
      const getTeam = this.db.prepare(
        "SELECT ID FROM `Group` where Name = ? AND fk_team = ?"
      );
      return result = getTeam.get( name, team )["ID"];  
    }


    this.InsertReference = (dataConn, dataUser, team) => {
      try{
        let chef = 0;
        let ID_fist;
        let ID_secound;
        if(dataUser[dataConn[0]]["type"] === "config"){
          chef = 1;
          ID_fist = this.getIDfromNamePerson(dataConn[2], team);
          ID_secound = this.getIDfromNameGroup(dataConn[0], team);
        }
        else{
          ID_fist = this.getIDfromNamePerson(dataConn[0], team);
          ID_secound = this.getIDfromNameGroup(dataConn[2], team);
        }
        const insert = this.db.prepare(
          "INSERT INTO Person_Group VALUES (NULL, ?, ?, ?, ?);"
        );
        insert.run(ID_secound, ID_fist , chef, team);
        return("success");
      }
      catch(error){
        console.log(error);
        return("Error");
      }   
    }

    this.getAllConnection = (team) => {
      const getTeam = this.db.prepare(
        "SELECT Field1, PositionField1, Field2, PositionField2 FROM Connection WHERE fk_team = ?"
      );
      const result = getTeam.all(team);
      return result.map(row => [row.Field1, row.PositionField1, row.Field2, row.PositionField2]);
    }

    this.getAllPerConfig = (team) => {
      const getTeam = this.db.prepare(
        "SELECT name, password, type, x, y, ferien, stunden FROM Field WHERE fk_team = ?"
      );
      const result = getTeam.all(team);
      return result.reduce((acc, row) => {
        acc[row.name] = {
          stunden: row.stunden,
          ferien: row.ferien,
          type: row.type,
          x: row.x,
          y: row.y,
          Password: row.password
        };
        return acc;
      }, {});
    }
  
    this.close = function () {
      this.db.close((error) => {
        if (error) {
          return console.error(error.message)
        }
        console.log('Close the database connection.')
      })
    }
  }