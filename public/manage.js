document.getElementById("logout").addEventListener("click", () => { logout();});

function isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
  }

function logout() {
    console.log("1");
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

    function createSandbox(){
        layer.removeChildren();
        layer.draw();
        for (const [key, value] of Object.entries(persones_data)) {
            createField(key, value.type, value.x, value.y);
        };
        updateConnections();
    }

    function formatData(data) {
        if(data === 401 || data === "logout"){
            logout();
        }
        const dataArray = data;
        console.log(dataArray);
        if(isEmpty(persones_data)){
            persones_data = dataArray[1];
            connentions = dataArray[0];
        }
        console.log(persones_data);
        createSandbox();
    }

    function loadSandbox() {
        if(localStorage.getItem("key") != undefined){
          fetch('/getSandbox', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `key=${localStorage.getItem("key")}`
          })
          .then(response => response.json())
          .then(data => formatData(data))
        }
        else{
          logout();
        }
    }

    function safeSandbox() {
        console.log(JSON.stringify(persones_data));
        fetch('/save_management', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `key=${localStorage.getItem("key")}&PerConConnection=${JSON.stringify(connentions)}&PersonAndConfig=${JSON.stringify(persones_data)}`
        })
        .then(response => response.text())
        .then(data => alert(data))
    }


    document.addEventListener("load", loadSandbox()); 

    makePasswort = () => {
        return [...Array(10)]
        .map((e) => ((Math.random() * 36) | 0).toString(36))
        .join("");
    }

    function create(type){
        if(type === "person"){
            let createUser = true
            while(createUser){
                let name = prompt("Username:");
                if ((name != "" && name != null)) {
                        let Password = prompt("Passwort: Wird Autogeneriert wenn nichts angegeben");
                        if (Password == null || Password == ""){
                            Password = makePasswort();
                        }
                        try{
                            document.getElementById(name).remove();
                        }
                        catch{}
                    createPerson(name, Password);
                }
                else{
                    createUser = false;
                }
            }
        }
        if(type === "config"){
            document.getElementById('configForm').classList.add('active');
            document.getElementById('deleteConfig').style.display = "none";
        }
    }
    
    function showConfigEdit(Config){
        document.getElementById('configName').value = Config;
        document.getElementById('configFerien').value = persones_data[Config]["ferien"];
        document.getElementById('configArbeit').value = persones_data[Config]["stunden"];
        document.getElementById("defaultName").value = Config;
        document.getElementById('configForm').classList.add('active');
        document.getElementById('deleteConfig').style.display = "inline-block";
    }

    function hideConfigEdit(Config){
        document.getElementById('configForm').classList.remove('active');
        document.getElementById('deleteConfig').style.display = "none";
    }

    document.getElementById("newPerson").addEventListener('click', () => create("person"));
    document.getElementById("newConfig").addEventListener('click', () => create("config"));
    document.getElementById("safe").addEventListener('click', () => safeSandbox());

    document.getElementById("abbruchConfig").addEventListener('click', () => {
        document.getElementById('configForm').classList.remove('active');
    });
    document.getElementById("abbruchUser").addEventListener('click', () => {
        document.getElementById('UserForm').classList.remove('active');
    });
    
    document.getElementById("safeConfig").addEventListener('click', () => createConfigfromForm("config"));
    document.getElementById("safeUser").addEventListener('click', () => createPersonFromForm());

    document.getElementById("deleteConfig").addEventListener('click', () => {
        deleteField(document.getElementById('configName').value);
        hideConfigEdit();
    });

    document.getElementById("deleteUser").addEventListener('click', () => {
        deleteField(document.getElementById('UserName').value);
        document.getElementById('UserForm').classList.remove('active');
    });


    var width = window.innerWidth;
    var height = window.innerHeight - 50;
    var stage = new Konva.Stage({
    container: 'sandbox',
    width: width,
    height: height,
    });

    var layer = new Konva.Layer();
    stage.add(layer);
    persones_data = {};

    function createPersonFromForm() {
        var name = document.getElementById('UserName').value;
        var password = document.getElementById('UserPassword').value;
        delete persones_data[document.getElementById("defaultName").value];
        createPerson(name, password);
        createSandbox();
    }

    function createPerson(name, Password) {
        if(persones_data[name] != undefined) return;
        else{
            persones_data[name] = {};
            persones_data[name]["Password"] = Password;
            persones_data[name]["type"] = "person";
            persones_data[name].x = 50;
            persones_data[name].y = 80;
            createField(name, "person", 50, 80);
        }
    }

    function createConfigfromForm() {
        document.getElementById('configForm').classList.remove('active');
        const name = document.getElementById('configName').value;
        const ferien = document.getElementById('configFerien').value;
        const arbeit = document.getElementById('configArbeit').value;
        delete persones_data[document.getElementById("defaultName").value];
        createConfig(name, arbeit, ferien);
    }

    function createConfig(name, stunden, ferien, ) {
        if(persones_data[name] != undefined) return;
        else{
            persones_data[name] = {};
            persones_data[name]["stunden"] = parseInt(stunden);
            persones_data[name]["ferien"] = parseInt(ferien);
            persones_data[name]["type"] = "config";
            persones_data[name].x = 50;
            persones_data[name].y = 80;
            createSandbox();
        }
    }

    function deleteField(name){
        delete persones_data[name];
        connentions.forEach((connection, index) => {
            if(connection.includes(name)){
                connentions[index] = null;   
            }
        });
        createSandbox();
    }

    var line;
    let lineBeginType
    let beginn;
    let connentions = [];
    function createField(name, createType, defaultx, defaulty) {
        let color = "black"
        if(createType === "config"){ color = "green"}
        var textNode = new Konva.Text({
            text: name,
            x: defaultx, 
            y: defaulty,
            fontSize: 20,
            draggable: true,
            fill: color
        });
        persones_data[textNode.text()].x = defaultx
        persones_data[textNode.text()].y = defaulty
        layer.add(textNode);
        var bottomPoint = new Konva.Circle({
            x: textNode.x() + textNode.width() / 2,
            y: textNode.y() + textNode.height() - 50,
            radius: 5,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1
        });
        persones_data[textNode.text()].bottom = {}
        persones_data[textNode.text()].top = {}
        persones_data[textNode.text()].bottom.x = bottomPoint.x()
        persones_data[textNode.text()].bottom.y = bottomPoint.y()
        
        // Add points above and below the text
        var topPoint = new Konva.Circle({
            x: textNode.x() + textNode.width() / 2,
            y: textNode.y() + 50,
            radius: 5,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1
        });
        persones_data[textNode.text()].top.x = topPoint.x()
        persones_data[textNode.text()].top.y = topPoint.y()

        
        layer.add(topPoint);
        layer.add(bottomPoint);

        textNode.on('click', (event) => {
           if(createType === "config"){
                showConfigEdit(name);
           }
           if(createType === "person"){
            document.getElementById('UserForm').classList.add('active');
            document.getElementById('UserPassword').value = persones_data[name].Password;
            document.getElementById('UserName').value = name;
            document.getElementById('defaultName').value = name;
            
           }
        });

        // Update the position of the points when the text is dragged
        textNode.on('dragmove', () => {
            topPoint.x(textNode.x() + textNode.width() / 2);
            topPoint.y(textNode.y() + 50);
            bottomPoint.x(textNode.x() + textNode.width() / 2);
            bottomPoint.y(textNode.y() + textNode.height() -50);
            persones_data[textNode.text()].x = textNode.x();
            persones_data[textNode.text()].y = textNode.y();
            persones_data[textNode.text()].top.x = topPoint.x()
            persones_data[textNode.text()].top.y = topPoint.y()
            persones_data[textNode.text()].bottom.x = bottomPoint.x()
            persones_data[textNode.text()].bottom.y = bottomPoint.y()
            updateConnections();
        });
        topPoint.on('mousedown', () => {
            lineBeginType = "top";
            beginn = textNode.text();
            line = new Konva.Line({
                points: [topPoint.x(), topPoint.y(), topPoint.x(), topPoint.y()],
                stroke: 'black'
            });
            layer.add(line);

            // Add event listener to delete the line when clicked while holding the Shift key
            let line_local = line
            line.on('click', (event) => {

                if (event.evt.shiftKey) {
                    line_local.destroy();
                    layer.batchDraw();
                }
            });
        }); 
        bottomPoint.on('mousedown', () => {
            lineBeginType = "bottom";
            beginn = textNode.text();
            line = new Konva.Line({
                points: [bottomPoint.x(), bottomPoint.y(), bottomPoint.x(), bottomPoint.y()],
                stroke: 'black'
            });
            layer.add(line);

            // Add event listener to delete the line when clicked while holding the Shift key
            let line_local = line
            line.on('click', (event) => {

                if (event.evt.shiftKey) {
                    line_local.destroy();
                    layer.batchDraw();            
                }
            });
        });

        stage.on('mousemove', (event) => {
            if (line) {
                var points = line.points();
                points[2] = stage.getPointerPosition().x;
                points[3] = stage.getPointerPosition().y;
                line.points(points);
                layer.batchDraw();
            }
        });
    }

    stage.on('mouseup', () => {
        let found = false;
        for (const [key, value] of Object.entries(persones_data)) {
            if (line) {
                
                if(key === beginn) continue;
                var points = line.points();
                var x = points[2];
                var y = points[3];
                if (Math.sqrt((x - value.top.x) ** 2 + (y - value.top.y) ** 2) < 50 && lineBeginType === "bottom") {
                    connentions.push([beginn, "bottom", key, "top"]);
                    found = true;
                    updateConnections()
                }
                if (Math.sqrt((x - value.bottom.x) ** 2 + (y - value.bottom.y) ** 2) < 50 && lineBeginType === "top") {
                    connentions.push([key, "bottom",beginn, "top"]);
                    found = true;
                    updateConnections()
                }
            }
        }
        if(!found && line){
            line.destroy();
            layer.batchDraw();
        }
        line = null;
    });

    function updateConnections() {
        let lines = layer.find('Line');
        lines.forEach((line) => {
            line.destroy();
            layer.batchDraw();
        })
        for (let i = 0; i < connentions.length; i++) {
            if(connentions[i] === null) continue;
            line = new Konva.Line({
                points: [persones_data[connentions[i][0]][connentions[i][1]].x, persones_data[connentions[i][0]][connentions[i][1]].y, persones_data[connentions[i][2]][connentions[i][3]].x, persones_data[connentions[i][2]][connentions[i][3]].y],
                stroke: 'black'
            });
            line.on('click', (event) => {

                if (event.evt.shiftKey) {
                    connentions[i] = null;
                    updateConnections();
                }
            });
            layer.add(line);
        }
        line = null;
    }

    function replaceValue(arr, oldValue, newValue) {
        for (let i = 0; i < arr.length; i++) {
          if (Array.isArray(arr[i])) {
            replaceValue(arr[i], oldValue, newValue);
          } else if (arr[i] === oldValue) {
            arr[i] = newValue;
          }
        }
      }