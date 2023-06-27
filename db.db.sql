BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Field" (
	"ID"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"password"	TEXT,
	"type"	TEXT NOT NULL,
	"x"	INTEGER NOT NULL,
	"y"	INTEGER NOT NULL,
	"ferien"	INTEGER,
	"stunden"	INTEGER,
	"fk_team"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Group" (
	"ID"	INTEGER NOT NULL,
	"Ferien"	TEXT NOT NULL,
	"Stunden"	INTEGER NOT NULL,
	"Name"	TEXT NOT NULL,
	"fk_team"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "test" (
	"Anzahl"	INTEGER,
	"ID"	INTEGER
);
CREATE TABLE IF NOT EXISTS "PersonKey" (
	"ID"	INTEGER NOT NULL,
	"key"	TEXT NOT NULL,
	"fk_user"	INTEGER,
	"validity"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Key" (
	"ID"	INTEGER,
	"key"	TEXT NOT NULL,
	"fk_user"	INTEGER NOT NULL,
	"validity"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT),
	FOREIGN KEY("fk_user") REFERENCES "User"("ID") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Team" (
	"name"	TEXT NOT NULL UNIQUE,
	"ID"	INTEGER,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Connection" (
	"ID"	INTEGER NOT NULL,
	"Field1"	INTEGER NOT NULL,
	"PositionField1"	TEXT NOT NULL,
	"Field2"	TEXT NOT NULL,
	"PositionField2"	TEXT NOT NULL,
	"fk_team"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT),
	FOREIGN KEY("fk_team") REFERENCES "Team"("ID")
);
CREATE TABLE IF NOT EXISTS "Person" (
	"ID"	INTEGER NOT NULL,
	"Name"	TEXT NOT NULL,
	"Password"	TEXT NOT NULL,
	"fk_team"	INTEGER NOT NULL,
	PRIMARY KEY("ID"),
	FOREIGN KEY("fk_team") REFERENCES "Team"("ID")
);
CREATE TABLE IF NOT EXISTS "Person_Group" (
	"ID"	INTEGER,
	"fk_group"	INTEGER NOT NULL,
	"fk_person"	INTEGER NOT NULL,
	"chef"	INTEGER NOT NULL,
	"fk_team"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT),
	FOREIGN KEY("fk_team") REFERENCES "Team"("ID")
);
CREATE TABLE IF NOT EXISTS "User" (
	"ID"	INTEGER NOT NULL,
	"Name"	TEXT NOT NULL,
	"password"	NUMERIC NOT NULL,
	"ferien"	REAL NOT NULL,
	"arbeitspensum"	NUMERIC NOT NULL,
	"arbeitstage"	TEXT NOT NULL,
	"fk_team"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT),
	FOREIGN KEY("fk_team") REFERENCES "Team"("ID") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "Bookings" (
	"ID"	INTEGER NOT NULL,
	"Typ"	TEXT NOT NULL,
	"Start"	INTEGER NOT NULL,
	"End"	INTEGER NOT NULL,
	"profit"	REAL,
	"Current_status"	NUMERIC DEFAULT 0.0,
	"fk_user"	INTEGER NOT NULL,
	"genemigt"	INTEGER,
	PRIMARY KEY("ID" AUTOINCREMENT),
	FOREIGN KEY("fk_user") REFERENCES "Person"("ID")
);
CREATE TRIGGER update_profit AFTER INSERT ON Bookings
BEGIN
  UPDATE Bookings SET profit = NEW.End - NEW.Start WHERE ID = NEW.ID;
END;
CREATE TRIGGER update_profit_onupdate AFTER UPDATE ON Bookings
BEGIN
  UPDATE Bookings SET profit = NEW.End - NEW.Start WHERE ID = NEW.ID;
END;
COMMIT;



  
  
  SELECT *
  FROM Person_group
  JOIN unterstellteMitarbeiter ON Person_group.fk_person = unterstellteMitarbeiter.ID
  JOIN `Group` ON Person_group.fk_group = `Group`.ID
  JOIN Person_group AS Per2 ON Per2.fk_group = `Group`.ID
  JOIN Person ON Person.ID = Per2.fk_person
  JOIN Bookings ON Person.ID = Bookings.fk_user
  JOIN Person_group AS Per3 ON Person.ID = Per3.fk_person
  WHERE Person_group.chef = 1 AND Per2.chef = 0
)
SELECT *
FROM unterstellteMitarbeiter;

JOIN Person_group AS Per3 ON Per3.fk_person = Person.ID
  WHERE Person_group.chef = 1 AND Per2.chef = 0
  ;