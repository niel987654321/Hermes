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
      const table = type === 'User' ? 'User' : 'Person';
      const team_id = this.getTeamfromName(team)["ID"];
      console.log(table, name, password, team_id);
      const select = this.db.prepare(
        `SELECT * FROM ${table} WHERE name= @name AND Password = @password AND fk_team = @team_id`
      );
      const result = select.get({name, password, team_id});
      console.log("login result:"+result, table, name, password, team_id);
      return result !== undefined;
    }

    this.generate_key = function (name, team, type) {
      console.log(name, team, type)
      const table = type === 'User' ? 'User' : 'Person';
      const keytable = type === 'User' ? 'Key' : 'PersonKey';
      const team_id = this.getTeamfromName(team)["ID"];
      const select = this.db.prepare(
        `SELECT ID FROM ${table} WHERE Name= @name AND fk_team = @team_id`
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
      this.insertKey(key, result["ID"], keytable);
      return key;
    }
    
    this.insertKey = (key, fk_user, keytable) => {
      console.log(key, keytable, fk_user);
      const validity = Math.floor(new Date().getTime() / 1000) + 1000;
      const insert = this.db.prepare(
        `INSERT INTO ${keytable} (key, fk_user, validity) VALUES (@key ,@fk_user, @validity);`
      );
      console.log("Insert Key",key, fk_user, validity,"Table:", keytable);
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
        "SELECT ID FROM Team WHERE name = @team"
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
      const keytable = type === 'User' ? 'Key' : 'PersonKey';
      const usertable = type === 'User' ? 'User' : 'Person';
      const select = this.db.prepare(
        `SELECT * FROM ${keytable} as k LEFT JOIN ${usertable} u ON k.fk_user = u.ID WHERE k.key = @key`
      );
      return select.get({key});
    }

    this.create_user = (name, password, team_id) => {
      try{
        console.log("create user", name, password, team_id);
        const insert = this.db.prepare(
          "INSERT INTO User (Name, password, fk_team) VALUES (@name, @password, @team_id);"
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

    this.updateKey = (key, type) => {
      const keytable = type === 'User' ? 'Key' : 'PersonKey';
      const validity = Math.floor(new Date().getTime() / 1000) + 1000
      const updateKey = this.db.prepare(
        `UPDATE ${keytable} SET validity = ? WHERE key = ?;`
      );
      updateKey.run(validity ,key);
    }

    this.getTeamfromKey = (key) => {
      const getTeam = this.db.prepare(
        "SELECT t.ID FROM Key LEFT JOIN User as u on Key.fk_user = u.ID LEFT JOIN Team as t on u.fk_team = t.ID WHERE Key.key = ?"
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
      console.log( "getIDfromNamePerson:" ,name, team);
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

    this.getAllEntries = (begin, end, name, team) => {
      const fk_user = this.getIDfromNamePerson(name, team);
      const getTeam = this.db.prepare(
        "SELECT * FROM Bookings WHERE ( Start < ? AND End > ?) AND fk_user = ? AND Typ != 'automatic'"
      );
      return getTeam.all(end, begin, fk_user);   
    }

    this.updateBooking = (ID, Start, End, Typ, fk_user) => {
      const updateBooking = this.db.prepare(
        "UPDATE Bookings SET Start = ? , End = ? ,Typ = ? WHERE fk_user = ? AND ID = ?"
      );
      return updateBooking.run(Start, End, Typ ,fk_user, ID);
      }
    
    this.createBooking = (Start, End, Typ, fk_user) => {
      const updateBooking = this.db.prepare(
        "INSERT INTO Bookings (Start, End, Typ, fk_user, genemigt) VALUES (?,?,?,?,?)"
      );
      let genemigt
      if(Typ === "Arbeit" || Typ === "Arbeiten") genemigt = 1
      else genemigt = 0 
      console.log("Genemigung:", genemigt, Typ);
      return updateBooking.run(Start, End, Typ ,fk_user, genemigt);
    }

    this.updateCurrentStatus = (fkUser) => {
      // Hole alle Datensätze mit dem angegebenen fk_user-Wert
      let bookings = this.db
        .prepare('SELECT * FROM Bookings WHERE fk_user = ? AND genemigt = 1')
        .all(fkUser);
      
      // Sortiere die Datensätze nach Start-Wert
      bookings.sort((a, b) => a.Start - b.Start);
      // Berechne den Current_status-Wert für jeden Datensatz
      for (let i = 0; i < bookings.length; i++) {
        let currentStatus = 0;
        if (i > 0) {
          currentStatus = bookings[i - 1].Current_status + bookings[i].profit;
        }
        else{ currentStatus = bookings[i].profit;}
        bookings[i].Current_status = currentStatus;
      }
    
      // Aktualisiere die Datensätze in der Datenbank
      const updateBooking = this.db.prepare(
        'UPDATE Bookings SET Current_status = ? WHERE ID = ?'
      );
      for (let booking of bookings) {
        updateBooking.run(booking.Current_status, booking.ID);
      }
    }

    this.deleteBooking = (ID, fk_user) => {
      const insert = this.db.prepare(
        "DELETE FROM Bookings WHERE ID = ? AND fk_user = ? AND Typ != 'automatic'; "
      );
      insert.run(ID, fk_user);
      return("success");
    }

    this.getHolidayfromUser = (user) => {
      const select = this.db.prepare(
        "SELECT Ferien from Person LEFT JOIN Person_Group ON Person.ID = Person_Group.fk_person LEFT JOIN `Group` ON Person_Group.fk_group = `Group`.ID WHERE Person.ID = ?"
      )
      return select.get(user)["Ferien"];
    }

    this.getWorkTimefromUser = (user) => {
      const select = this.db.prepare(
        "SELECT Stunden from Person LEFT JOIN Person_Group ON Person.ID = Person_Group.fk_person LEFT JOIN `Group` ON Person_Group.fk_group = `Group`.ID WHERE Person.ID = ?;"
      )
      console.log(user, select.get(user))
      return select.get(user)["Stunden"];
      }

    this.getHolidayEntered = (user) => {
      const ferien = this.getHolidayfromUser(user);
      const select = this.db.prepare(
        "SELECT COUNT(*) FROM Bookings WHERE fk_user = ? AND Start > ? AND End < ? AND Typ = 'Ferien';"
      )

      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);


      const startOfYearTimestamp = Math.floor(startOfYear.getTime() / 1000);
      const endOfYearTimestamp = Math.floor(endOfYear.getTime() / 1000);
      const verbrauchteFerien = select.get(user, startOfYearTimestamp, endOfYearTimestamp)["COUNT(*)"];
      console.log("Ferien: ",startOfYearTimestamp, verbrauchteFerien ,user, ferien);
      return ferien-verbrauchteFerien;
    }

    this.getHolidayAvailable = (user) => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const ferien = this.getHolidayfromUser(user);
      const startOfYearTimestamp = Math.floor(startOfYear.getTime() / 1000);
      const nowTimestamp = Math.floor(now.getTime() / 1000);
      const select = this.db.prepare(
        "SELECT COUNT(*) FROM Bookings WHERE fk_user = ? AND Start > ? AND End < ? AND Typ = 'Ferien';"
      )

      const verbrauchteFerien = select.get(user, startOfYearTimestamp, nowTimestamp)["COUNT(*)"];
      return ferien-verbrauchteFerien;
    }
    
    this.getTime = (user) => {
      this.updateCurrentStatus(user);
      const now = new Date();
      const nowTimestamp = Math.floor(now.getTime() / 1000);
      const select = this.db.prepare(
        "SELECT Current_status FROM Bookings WHERE End < ? AND Fk_user = ? AND genemigt = 1 ORDER BY End DESC LIMIT 1;"
      )
      let ergebnis = select.get(nowTimestamp, user)
      if(ergebnis === undefined) ergebnis = 0;
      else ergebnis = ergebnis["Current_status"]
      return ergebnis
    }

    this.checkIfalreadyInsert = (timestamp) => {
      const select = this.db.prepare(
        "SELECT * FROM Bookings WHERE Start > ? AND Typ = 'automatic';"
      )
      console.log(select.get(timestamp))
      let ergebnis = select.get(timestamp)
      if(ergebnis === undefined) return false;
      else return true
    }

    this.insertAllAutomaticWorkTime = (timestamp) => {
      const select = this.db.prepare(
        "SELECT ID FROM Person;"
      )
      let users = select.all();
        for (let index = 0; index < users.length; index++) {
          const workTime = parseInt(this.getWorkTimefromUser(users[index]["ID"]))/5;
          const insert = this.db.prepare(
            "INSERT INTO Bookings VALUES (NULL, 'automatic', ?, ?, NULL, NULL, ?, 1);"
          );
          let entfernterTimestamp =  workTime * 60 * 60 + timestamp;
          insert.run(entfernterTimestamp, timestamp , users[index].ID);
          this.updateCurrentStatus(users[index]["ID"]);
        }
    }

    this.getBookingRequest = (User) => {
      console.log("getBookingRequest", User);
      const select = this.db.prepare(
        "WITH RECURSIVE unterstellteMitarbeiter AS ( SELECT Person.ID AS PerID FROM Person_group JOIN `Group` ON Person_group.fk_group = `Group`.ID JOIN Person_group AS Per2 ON Per2.fk_group = `Group`.ID JOIN Person ON Person.ID = Per2.fk_person LEFT JOIN Bookings ON Person.ID = Bookings.fk_user JOIN Person_group AS Per3 ON Per3.fk_person = Person.ID WHERE Person_group.chef = 1 AND Per2.chef = 0 AND Person_Group.fk_person = ? UNION ALL SELECT Person.ID AS PerID FROM Person_group JOIN unterstellteMitarbeiter ON Person_Group.fk_person = unterstellteMitarbeiter.PerID JOIN `Group` ON Person_group.fk_group = `Group`.ID JOIN Person_group AS Per2 ON Per2.fk_group = `Group`.ID JOIN Person ON Person.ID = Per2.fk_person LEFT JOIN Bookings ON Person.ID = Bookings.fk_user JOIN Person_group AS Per3 ON Per3.fk_person = Person.ID WHERE Person_group.chef = 1 AND Per2.chef = 0 ) SELECT Person.Name, Start, End, Bookings.ID, Bookings.Typ FROM unterstellteMitarbeiter AS uM LEFT JOIN Bookings ON Bookings.fk_user = PerID JOIN Person ON Bookings.fk_user = Person.ID GROUP BY Bookings.ID HAVING Bookings.genemigt = 0;"
      )
      return select.all(User);
    }
      
    this.checkRequestcanEdit = (UserID, RequestID) => {
      const select = this.db.prepare(
        "WITH RECURSIVE unterstellteMitarbeiter AS ( SELECT Person.ID AS PerID FROM Person_group JOIN `Group` ON Person_group.fk_group = `Group`.ID JOIN Person_group AS Per2 ON Per2.fk_group = `Group`.ID JOIN Person ON Person.ID = Per2.fk_person LEFT JOIN Bookings ON Person.ID = Bookings.fk_user JOIN Person_group AS Per3 ON Per3.fk_person = Person.ID WHERE Person_group.chef = 1 AND Per2.chef = 0 AND Person_Group.fk_person = ? UNION ALL SELECT Person.ID AS PerID FROM Person_group JOIN unterstellteMitarbeiter ON Person_Group.fk_person = unterstellteMitarbeiter.PerID JOIN `Group` ON Person_group.fk_group = `Group`.ID JOIN Person_group AS Per2 ON Per2.fk_group = `Group`.ID JOIN Person ON Person.ID = Per2.fk_person LEFT JOIN Bookings ON Person.ID = Bookings.fk_user JOIN Person_group AS Per3 ON Per3.fk_person = Person.ID WHERE Person_group.chef = 1 AND Per2.chef = 0 ) SELECT Person.Name, Start, End, Bookings.ID, Bookings.Typ FROM unterstellteMitarbeiter AS uM LEFT JOIN Bookings ON Bookings.fk_user = PerID JOIN Person ON Bookings.fk_user = Person.ID GROUP BY Bookings.ID HAVING Bookings.genemigt = 0 AND Bookings.ID = ?;"
      )
      return select.all(UserID, RequestID);  
    }

    this.acceptRequest = (ID) => {
      const update = this.db.prepare(
        "UPDATE Bookings SET genemigt = 1 WHERE ID = ?;"
      )
      return update.run(ID);
    }

    this.deleteRequest = (ID) => {
      const deleteSQL = this.db.prepare(
        "DELETE FROM Bookings WHERE ID = ?;"
      )
      return deleteSQL.run(ID);
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