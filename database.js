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

    this.checkLoginData = function (name, password, team) {
      const team_id = this.getTeamfromName(team)["id"];
      const select = this.db.prepare(
        "SELECT * FROM User WHERE name= @name AND Password = @password AND fk_team = @team_id"
      );
      const result = select.get({ name, password, team_id });
      return result !== undefined;
    }

    this.generate_key = function (name, team) {
      const team_id = this.getTeamfromName(team)["id"];
      const select = this.db.prepare(
        "SELECT id FROM User WHERE name= @name AND fk_team = @team_id"
      );
      const result = select.get({ name, team_id });
        
      let keyquery
      let key
      do{
        key = this.genAPIKey();
        const select_key = this.db.prepare(
          "SELECT key FROM Key WHERE key = @key"
        );
        const keyquery = select_key.get({ key });  
      }
      while(keyquery != undefined)
      this.insertKey(key, result["id"]);
      return key;
    }

    this.insertKey = (key, fk_user) => {
      const validity = Math.floor(new Date().getTime() / 1000) + 1000
      const insert = this.db.prepare(
        "INSERT INTO Key (key, fk_user, validity) VALUES (@key ,@fk_user, @validity); "
      );
      insert.run({ key, fk_user, validity});
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

    this.infofromkey = (key) => {
      const select = this.db.prepare(
        "SELECT * FROM Key as k LEFT JOIN User u ON k.fk_user = u.id  WHERE k.name = @key"
      );
      return result = select.get({ key });  
    }

    this.create_user = (name, password, team_id) => {
      try{
        console.log(name, password, team_id);
        const insert = this.db.prepare(
          "INSERT INTO User (name, password, fk_team, ferien, arbeitspensum, arbeitstage) VALUES (@name, @password, @team_id, 0,0,0);"
        );
        insert.run({ name, password, team_id });
        return("success");
      }
      catch(error){
        console.log(error);
        return("Error");
      }
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
  