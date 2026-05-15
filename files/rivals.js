
var roundNum = sessionStorage.getItem("roundNum");
if (roundNum === null) {
    roundNum = 1;
    sessionStorage.setItem("roundNum", roundNum);
}
var finalScore = sessionStorage.getItem("finalScore");
if (finalScore === null) {
    finalScore = 0;
    sessionStorage.setItem("finalScore", finalScore);
}

if (document.getElementById("round")) { document.getElementById("round").textContent = "Round " + sessionStorage.getItem("roundNum"); }
if (document.getElementById("finalScore")) { document.getElementById("finalScore").textContent = "Your score: " + sessionStorage.getItem("finalScore"); }
if (document.getElementById("sendScore")) { document.getElementById("sendScore").value = sessionStorage.getItem("finalScore"); }


var scores = sessionStorage.getItem("scores");
if (scores === null) {
    scores = [];
    sessionStorage.setItem("scores", JSON.stringify(scores));
}

function reset(){
    sessionStorage.clear();
}

if (document.getElementById("map")) {
    let map = document.getElementById("map");
    map.addEventListener("mousemove", test);
    map.addEventListener("mousedown", play);
}


function test(e) {
    var valX = e.offsetX;
    var valY = e.offsetY;
    if (valX < 0) { valX = 0 }
    if (valY < 0) { valY = 0 }

    var x = valX / map.clientWidth;
    var y = valY / map.clientHeight;
    if (x > 1) { x = 1 }
    if (y > 1) { y = 1 }

    document.getElementById("cords").textContent = `x: ${x.toFixed(3)} | y: ${y.toFixed(3)}`;
}

function play(e) {
    var playerCords = document.getElementById("cords").textContent;
    var correctCords = document.getElementById("cCords").textContent;
    var num = sessionStorage.getItem("roundNum");

    var temp = playerCords.split(" ");
    var px = parseFloat(temp[1]);
    var py = parseFloat(temp[4]);

    var temp = correctCords.split(" ");
    var cx = parseFloat(temp[3]);
    var cy = parseFloat(temp[6]);

    var score = 5000 - Math.round(5000 * distance(px, py, cx, cy));
    if (score < 0) { score = 0; }

    let tempArray;
    let text = sessionStorage.getItem("scores");
    if (text) { tempArray = JSON.parse(text); } 
    else { tempArray = []; }
    
    tempArray[num-1] = score;
    sessionStorage.setItem("scores", JSON.stringify(tempArray));

    document.getElementById("score").textContent = `You scored: ${score}`;
    map.removeEventListener("mousemove", test);
    map.removeEventListener("mousedown", play);
    document.getElementById("scoreboard").style.visibility = 'visible';
    console.log(tempArray);
}

function next(e) {
    let temp = sessionStorage.getItem("roundNum");
    temp++;
    if (temp >= 6) {
        document.location.href = document.location.href.substring(0, structuredClone.length - 4) + "leader";
        var final = 0;
        let tempArray;
        let text = sessionStorage.getItem("scores");
        if (text) { tempArray = JSON.parse(text); } 
        else { tempArray = []; }
        tempArray.forEach(element => {
            final += element;
        });
        

        sessionStorage.clear();
        sessionStorage.setItem("finalScore", final);
    }
    else {
        sessionStorage.setItem("roundNum", temp);
        
        map.addEventListener("mousemove", test);
        map.addEventListener("mousedown", play);
        document.getElementById("scoreboard").style.visibility = 'hidden';

        window.location.reload();
    }
}

function distance(x1, y1, x2, y2) {
    var distanceX = (Math.abs(x2) - Math.abs(x1)) ** 2;
    var distanceY = (Math.abs(y2) - Math.abs(y1)) ** 2;
    var finalDistance = Math.sqrt(distanceX + distanceY);
    return finalDistance;
}

async function getPalette() {
    const url = "http://colormind.io/api/";
    const data = { model: "default" };

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });

    const result = await response.json();
    const colorString = `rgb(${result.result[0].join(', ')})`;
    if (document.getElementById("clue")) { document.getElementById("clue").style.borderColor = colorString; }
    if (document.getElementById("map")) { document.getElementById("map").style.borderColor = colorString; }
}
getPalette();
