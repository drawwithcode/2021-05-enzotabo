let myTreno;
let colorPicker;
let colorS;

let poppasong;
let sprays = [];
let spraySound;

//variabili brush
let brushSize = 1;
let f = 0.5;
let spring = 0.4;
let friction = 0.45;
let v = 0.5;
let splitNum = 100;
let diff = 2;

let r = 0;
let vx = 0;
let vy = 0;

let clientSocket = io();
clientSocket.on("connect", newConnection);
clientSocket.on("mouseBroadcast", newBroadcast);

function newConnection() {
  console.log(clientSocket.id);
}

//DATA di ricevimento da altri computer
function newBroadcast(data) {
  // console.log(data);
  // let newColor = data.coloreSpray;
  // var distance = dist(data.x, data.y, data.px, data.py);
  // var scaled = map(distance, 0, width, 10, 100);
  // strokeWeight(scaled);
  // stroke(newColor);
  // line(data.x, data.y, data.px, data.py);

  stroke(data.coloreSpray);

  data.oldRR = data.rr;
  data.rr = brushSize - data.vv;
  //var num = random(0.1, 1);

  for (let i = 0; i < splitNum; ++i) {
    oldX = data.x;
    oldY = data.y;
    data.x += data.vX / splitNum;
    data.y += data.vY / splitNum;
    data.oldRR += (data.rr - data.oldRR) / splitNum;
    if (data.oldRR < 1) {
      data.oldRR = 1;
    }
    strokeWeight(data.oldRR + diff); // AMEND: oldR -> oldR+diff
    line(
      data.x + random(0, 2),
      data.y + random(0, 2),
      oldX + random(0, 2),
      oldY + random(0, 2)
    );
    strokeWeight(data.oldRR); // ADD
    line(
      data.x + diff * random(0.1, 2),
      data.y + diff * random(0.1, 2),
      oldX + diff * random(0.1, 2),
      oldY + diff * random(0.1, 2)
    ); // ADD
    line(
      data.x - diff * random(0.1, 2),
      data.y - diff * random(0.1, 2),
      oldX - diff * random(0.1, 2),
      oldY - diff * random(0.1, 2)
    ); // ADD
  }
}

function preload() {
  myTreno = loadImage("/assets/treno.png");
  myTreno2 = loadImage("/assets/treno_2.png");
  spray = loadImage("/assets/spray.png");

  poppasong = loadSound("./assets/bigpoppa.mp3", loaded);
  for (var i = 0; i < 7; i++) {
    sprays[i] = loadSound("./assets/spray_" + i + ".mp3");
  }
  //spraySound = loadSound("./assets/spray_2.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  imageMode(CENTER);
  image(myTreno, windowWidth / 2, windowHeight / 2, width, height - 100);

  colorPicker = createColorPicker("#ff0000");
  colorPicker.position(windowWidth / 2, height - 50);
  console.log(colorPicker.color());

  for (var i = 0; i < 7; i++) {
    sprays[i].setVolume(0.1);
  }
}

function loaded() {
  //poppasong.loop();
  poppasong.setVolume(0.1);
}

function draw() {
  coloreS = colorPicker.color().levels;
  stroke(coloreS);

  cursor(CROSS);
  //Background images
  imageMode(CENTER);
  image(myTreno2, windowWidth / 2, windowHeight / 2, width, height - 100);
  //Spray locale
  if (mouseIsPressed) {
    if (!f) {
      f = true;
      x = mouseX;
      y = mouseY;
    }
    console.log("PRESSING");
    //sound part

    sprays[int(random(0, 6))].play();

    vx += (mouseX - x) * spring;
    vy += (mouseY - y) * spring;
    vx *= friction;
    vy *= friction;

    v += sqrt(vx * vx + vy * vy) - v;
    v *= 0.55;

    oldR = r;
    r = brushSize - v;
    var num = random(0.1, 1);
    for (let i = 0; i < splitNum; ++i) {
      oldX = x;
      oldY = y;
      x += vx / splitNum;
      y += vy / splitNum;
      oldR += (r - oldR) / splitNum;
      if (oldR < 1) {
        oldR = 1;
      }
      strokeWeight(oldR + diff); // AMEND: oldR -> oldR+diff
      line(
        x + random(0, 2),
        y + random(0, 2),
        oldX + random(0, 2),
        oldY + random(0, 2)
      );
      strokeWeight(oldR); // ADD
      line(
        x + diff * random(0.1, 2),
        y + diff * random(0.1, 2),
        oldX + diff * random(0.1, 2),
        oldY + diff * random(0.1, 2)
      ); // ADD
      line(
        x - diff * random(0.1, 2),
        y - diff * random(0.1, 2),
        oldX - diff * random(0.1, 2),
        oldY - diff * random(0.1, 2)
      ); // ADD
    }
    sendMessage();
  } else if (f) {
    vx = vy = 0;
    f = false;
  }
  if (!mouseIsPressed) {
    for (var i = 0; i < 7; i++) {
      sprays[i].stop();
    }
  }

  // var distance = dist(mouseX, mouseY, pmouseX, pmouseY);
  // var scaled = map(distance, 0, width, 10, 100);
  // strokeWeight(scaled);
  // stroke(colorPicker.color());
  // line(mouseX, mouseY, pmouseX, pmouseY);
  // sendMessage();

  // image(spray, mouseX, mouseY);
}

function sendMessage() {
  let message = {
    // x: mouseX,
    // y: mouseY,
    // px: pmouseX,
    // py: pmouseY,
    // coloreSpray: colorPicker.color(),
    x: mouseX,
    y: mouseY,
    rr: r,
    oldRR: oldR,
    vX: vx,
    vY: vy,
    vv: v,
    coloreSpray: coloreS,
  };

  clientSocket.emit("mouse", message);
}
