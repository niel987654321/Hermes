document.getElementById("logout").addEventListener("click", () => {
        fetch('/logout', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `key=${localStorage.getItem("key")}`
        })
        .then(response => () => {
            localStorage.removeItem('key')
            location.href = "./login"
            }
        )
    });

    function buildSandbox(data){

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
            .then(response => buildSandbox(response)) 
        }
        else{
            localStorage.removeItem('key')
            location.href = "./login"
        }
    }


    //document.addEventListener("load", loadSandbox()); 

    let size = 100;
    function changeSize(change) {
        if(change + size > 50 && change + size < 150){
            size = change + size;
            var r = document.querySelector(':root');
            r.style.setProperty('--size', size + "px");    
        }
    }

    document.getElementById("plus").addEventListener("click", () => {changeSize(10)})

    document.getElementById("minus").addEventListener("click", () => {changeSize(-10)})

    let selectedElement = null;
    let x = 0;
    let y = 0;
    let draggable = false;

    const draggableElements = document.querySelectorAll(".draggable");
    draggableElements.forEach((element) => {addMoveListener(element)});

    function addMoveListener(element) {
        element.style.top = 100+"px";
        element.style.left = 100+"px";
        element.addEventListener("mousedown", (event) => {
            selectedElement = event.target;
            x = event.clientX;
            y = event.clientY;
        });
    }

    document.addEventListener("mousemove", (event) => {
        dragging = true
        if (selectedElement) {
            selectedElement.style.left = `${selectedElement.offsetLeft + event.clientX - x}px`;
            selectedElement.style.top = `${selectedElement.offsetTop + event.clientY - y}px`;
            x = event.clientX;
            y = event.clientY;
            if(event.clientY < 60){ 
                y = 60
                selectedElement.style.top = `${y}px`;
            }
            // Check if the element has reached the right or bottom edge of the page
            if (selectedElement.offsetLeft + selectedElement.offsetWidth + 500 >= document.documentElement.clientWidth) {
                console.log("breit");
                document.documentElement.style.width = `${document.documentElement.clientWidth + 200}px`;
            }
            if (selectedElement.offsetTop +100 >= document.documentElement.clientHeight) {
                console.log("lang");
                console.log(selectedElement.offsetTop , selectedElement.offsetHeight ,  document.documentElement.clientHeight, document.documentElement.style.height );

                document.documentElement.style.height = `${selectedElement.offsetHeight + selectedElement.offsetTop}px`;
                window.scrollTo( 0, document.documentElement.scrollHeight);
                document.documentElement.style.height = `${selectedElement.offsetHeight * 2 + selectedElement.offsetTop}px`;
                console.log(selectedElement.offsetTop , selectedElement.offsetHeight ,  document.documentElement.clientHeight, document.documentElement.style.height );
    
            }
        }
    });

    function edit() {

    }

    document.addEventListener("mouseup", () => {
    // if(dragging) selectedElement = null;
        //else edit(selectedElement);
        //dragging = false;
    });

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
        console.log("config");
        if(type === "config"){
            document.getElementById('configForm').classList.add('active');
        }
    }

    document.getElementById("newPerson").addEventListener('click', () => create("person"));
    document.getElementById("newConfig").addEventListener('click', () => create("config"));
    document.getElementById("abbruchConfig").addEventListener('click', () => {
        document.getElementById('configForm').classList.remove('active');
    });
    document.getElementById("safeConfig").addEventListener('click', () => createConfigfromForm("config"));

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

    function createPerson(name, Password) {
        if(persones_data[name] != undefined) return;
        persones_data[name] = {};
        persones_data[name]["Password"] = Password;
        persones_data[name]["type"] = "person";
        createField(name, "person", 50, 80);
    }

    function createConfigfromForm() {
        document.getElementById('configForm').classList.remove('active');
        const name = document.getElementById('configName').value;
        const ferien = document.getElementById('configFerien').value;
        const arbeit = document.getElementById('configArbeit').value;
        createConfig(name, arbeit, ferien);
    }

    function createConfig(name, stunden, ferien, ) {
        if(persones_data[name] != undefined) return;
        persones_data[name] = {};
        persones_data[name]["stunden"] = stunden;
        persones_data[name]["ferien"] = ferien;
        persones_data[name]["type"] = "config";
        createField(name, "config", 50, 80);
    }

    var line;
    let lineBeginType
    let beginn;
    let persones = {}
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
        console.log(beginn);
        let found = false;
        for (const [key, value] of Object.entries(persones_data)) {
            if (line) {
                debugger;
                if(key === beginn) continue;
                var points = line.points();
                var x = points[2];
                var y = points[3];
                if (Math.sqrt((x - value.top.x) ** 2 + (y - value.top.y) ** 2) < 50 && lineBeginType === "bottom") {
                    connentions.push([key, "top",beginn, "bottom"]);
                    found = true;
                    updateConnections()
                }
                if (Math.sqrt((x - value.bottom.x) ** 2 + (y - value.bottom.y) ** 2) < 50 && lineBeginType === "top") {
                    connentions.push([key, "top",beginn, "bottom"]);
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
            console.log(persones_data,connentions );
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



    