// I added a color palette extracted from the painting ‘Wheel of Fortune’ instead of random RGB
let palette = ["#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];
let needRedrawBuffers = true;
// I added a slider to adjust the hue and brightness of the image
let hueSlider, brightnessSlider;
let randomCirclePosition = [];//replace grid array
let firstSelected = null;// save the circle the first time selected for merge
let birdImage;
let initialState = [];

function preload(){
    birdImage = loadImage("assets/IMG_2978.png");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    // noLoop(); // kept from original, but commented out so draw() loops for continuous rotation
    colorMode(HSB, 360, 100, 100);

    hueSlider = createSlider(-180, 180, 0);
    hueSlider.position(10, 10);
    hueSlider.style('width', '200px');
    hueSlider.input(()=> needRedrawBuffers = true);

    brightnessSlider = createSlider(50, 150, 100);
    brightnessSlider.position(10, 40);
    brightnessSlider.style ('width', '200px');
    brightnessSlider.input(()=> needRedrawBuffers = true);


    let circleNumber = 50;//circle number
    let tries = 0; // Used to avoid dead loops, can be the maximum number of attempts

    while(randomCirclePosition.length < circleNumber && tries < 10000){//non-overlapping circles with random radius
        let r = random(30, 80);
        let x = random(r, width - r); //confirm the center of the circle does not extend beyond the canvas boundary
        let y = random(r, height - r);

        let overlapping = false;//Detect whether circles overlap
        for(let cp of randomCirclePosition){
            let d = dist(x, y, cp.x, cp.y);
            if(d < r +cp.r +2){//confirm the circles distance
                overlapping = true;
                break;
            }
        }

        if (!overlapping){
            let pg = createGraphics(r * 2, r * 2);
            pg.colorMode(HSB, 360, 100, 100);
            pg.clear();// clear the circle

            if(random(1) <  0.2){
                drawZigzagCircleOn(pg, r, r, 10, r * 0.9);//circle style
            }else{
                drawHandDrawnCircleOn(pg, r, r, 10, r * 0.9);//circle style
            }

            let angle = random(TWO_PI);//inital  rotation angle
            let speed = random([-1, 1]) * random(PI / 6000, PI / 3000);

            //save the circle information to the array
            randomCirclePosition.push({
                x, y, r, pg, angle, speed,
                floatPhaseX: random(TWO_PI),
                floatPhaseY: random(TWO_PI),
                floatSpeedX: random(0.001, 0.005),
                floatSpeedY: random(0.001, 0.005),
                floatAmplitude: random(1, 8)
            });
        }
        tries++;// add try times
      }

      initialState = randomCirclePosition.map(cp => ({//All current circles save their initial state to the initialState array.
        x: cp.x,
        y: cp.y,
        r: cp.r,
        originalR: cp.r,//Save an extra copy of the original radius for subsequent recovery of the initial size
        pg: cp.pg,
        angle: cp.angle,
        speed: cp.speed,
        floatPhaseX: cp.floatPhaseX,
        floatPhaseY: cp.floatPhaseY,
        floatSpeedX: cp.floatSpeedX,
        floatSpeedY: cp.floatSpeedY,
        floatAmplitude: cp.floatAmplitude
      }));
    }


function draw() {
        background('#000000'); //background color can be adjust!!

    //birdimage position and scale
    let birdOffsetX = 180;
    let birdOffsetY = -180;
    let scaleRatio = 0.15;
    let birdX = mouseX + birdOffsetX;
    let birdY = mouseY + birdOffsetY;

        for(let cp of randomCirclePosition){
            cp.angle += cp.speed * deltaTime; // according to the speed to upload the angle

            //caculate the floating offset, made circle look float
            let offsetX = sin(millis() * cp.floatSpeedX + cp.floatPhaseX) * cp.floatAmplitude;
            let offsetY = cos(millis() * cp.floatSpeedY + cp.floatPhaseY) * cp.floatAmplitude;

            let dx = cp.x - birdX;
            let dy = cp.y - birdY;
            let distance = dist(cp.x, cp.y, birdX, birdY);

            //control the distance of circle push away
            if (distance < 150){
                let force = (150 - distance) * 0.25;
                cp.x += dx / distance * force;
                cp.y += dy / distance * force;
            }

            push();//Save the current coordinate system state
            //translate(cp.x, cp.y);
            translate(cp.x + offsetX, cp.y + offsetY);
            rotate(cp.angle);
            imageMode(CENTER);
            image(cp.pg, 0, 0);
            pop();
        
        }

        push();
        translate(birdX, birdY);
        scale(scaleRatio);
        imageMode(CENTER);
        image(birdImage, 0, 0);
        pop();
    


    if(needRedrawBuffers){
        for(let cp of randomCirclePosition){
            cp.pg.clear();
            cp.pg.colorMode(HSB, 360, 100, 100);

            if(random(1) < 0.2){
                drawZigzagCircleOn(cp.pg, cp.r, cp.r, 10, cp.r * 0.9);
            }else{
             drawHandDrawnCircleOn(cp.pg, cp.r, cp.r, 10, cp.r * 0.9);
            }
        }
        needRedrawBuffers = false;
        }

        let instructions = [
            "Try clicking on the two circles with the mouse",
            "Try pressing 1 on the keyboard",
            "Try pressing 2 on the keyboard",
            "Try pressing 3 to restore original layout"
        ];

        push();
        textAlign(RIGHT, BOTTOM);
        textSize(14);
        fill(255);
        noStroke();

        for (let i = 0; i < instructions.length; i++){
            text(instructions[i], width - 20, height - 20 - (instructions.length - 1 - i) * 20);
        }
        pop();

    }

// PG: drawHandDrawnCircle
function drawHandDrawnCircleOn(g, cx, cy, numLayers, maxRadius){
    let outerMostRadius = maxRadius;
    for (let i = numLayers; i > 0; i--) {
        let radius = (i / numLayers) * maxRadius;
        // I changed the fill to randomly pick from the palette instead of random RGB
        let baseCol = color(random(palette));
        let newHue = (hue(baseCol)+hueSlider.value()+360) % 360;
        let newBrightness = brightness(baseCol) * (brightnessSlider.value()/100);
        g.fill(newHue, saturation(baseCol), newBrightness, 80);
        //g.fill(color(random(palette) + 'ee'));
        g.noStroke();
        g.ellipse(cx + random(-1, 1), cy + random(-1, 1), radius * 2, radius * 2);
    }
    let dot = 20;
    let outDotRadius = outerMostRadius + 10;
    for (let i = 0; i < dot; i++){
        let angle = TWO_PI * i / dot;
        let x = cx + outDotRadius * cos(angle);
        let y = cy + outDotRadius * sin(angle);
        // Also updated the dot colors to be picked from the palette
        //g.fill(color(random(palette)));
        let baseDotCol = (random(palette));
        let newHue = (hue(baseDotCol)+hueSlider.value()+360) % 360;
        let newBrightness = brightness(baseDotCol) * (brightnessSlider.value()/100);
        g.fill(newHue, saturation(baseDotCol), newBrightness, 80);
        g.noStroke();
        g.ellipse(x, y, 5, 5);
    }
}

//PG:drawZigzagCircle
function drawZigzagCircleOn(g, cx, cy, numLayers, maxRadius) {
    // Used palette color with some transparency
    let baseFillCol = color(random(palette));
    let newHue = (hue(baseFillCol)+hueSlider.value()+360) % 360;
    let newBrightness = brightness(baseFillCol) * (brightnessSlider.value()/100);
        g.fill(newHue, saturation(baseFillCol), newBrightness, 80);
    //g.fill(color(random(palette) + 'e0'));
    g.noStroke();
    g.circle(cx, cy, maxRadius * 2);

    let outerRadius = maxRadius * 0.9;
    let innerRadius = outerRadius * (2 / 3);
    // Also switched stroke color to use palette
     let baseStrokeCol = color(random(palette));
    let newHue1 = (hue(baseStrokeCol)+hueSlider.value()+360) % 360;
    let newBrightness1 = brightness(baseStrokeCol) * (brightnessSlider.value()/100);
        g.stroke(newHue1, saturation(baseStrokeCol), newBrightness1, 80);
    //g.stroke(color(random(palette) + 'cc'));
    g.strokeWeight(random(3, 6));

    g.beginShape();
    let ang = 0, step = TWO_PI / 60;
    for (let i = 0; i < 60; i++) {
        g.vertex(cx + innerRadius * cos(ang), cy + innerRadius * sin(ang));
        ang += step;
        g.vertex(cx + outerRadius * cos(ang), cy + outerRadius * sin(ang));
        ang += step;
    }
    g.endShape(CLOSE);

    drawHandDrawnCircleOn(g, cx, cy, numLayers, outerRadius * 0.6);

    let dots = 20;
    let outR = outerRadius + 10;
    for (let i = 0; i < dots; i++){
        let a2 = TWO_PI * i / dots;
        let x2 = cx + outR * cos(a2);
        let y2 = cy + outR * sin(a2);
        // Dot color also from the palette now
        let baseDotCol = (random(palette));
        let newHue = (hue(baseDotCol)+hueSlider.value()+360) % 360;
        let newBrightness = brightness(baseDotCol) * (brightnessSlider.value()/100);
        g.fill(newHue, saturation(baseDotCol), newBrightness, 80);
        //g.fill(color(random(palette)));
        g.noStroke();
        g.ellipse(x2, y2, 5, 5);
    }
}


// //buffers can be rebuilt if necessary
function windowResized() {
    let angle = random(TWO_PI);
    let speed = random([-1, 1]) * random(PI / 6000, PI / 3000);
    resizeCanvas(windowWidth, windowHeight); 
//     //redraw();
//     needRedrawBuffers = true;

    randomCirclePosition = [];
    let count = 50;
    let attempts = 0;
    let margin = 0.5; // expand buffer by 30% to avoid cutoff

  while (randomCirclePosition.length < count && attempts < 10000) {
    let r = random(30, 80); // random radius
    let x = random(r, width - r);
    let y = random(r, height - r);

    let overlap = randomCirclePosition.some(cp => dist(x, y, cp.x, cp.y) < cp.r + r + 2);
    if (!overlap) {
      // use expanded buffer size
      let bufferSize = r * 2 * (1 + margin);
      let pg = createGraphics(bufferSize, bufferSize);
      pg.colorMode(HSB, 360, 100, 100);
      pg.clear();

      // draw at center of expanded buffer
      let cx = pg.width / 2;
      let cy = pg.height / 2;

      if (random(1) < 0.2) {
        drawZigzagCircleOn(pg, cx, cy, 10, r * 0.9);
      } else {
        drawHandDrawnCircleOn(pg, cx, cy, 10, r * 0.9);
      }

      randomCirclePosition.push({
        x, y, r, 
        originalR: r,
        pg,
        angle: angle,
        speed: speed,
        floatPhaseX: random(TWO_PI),
        floatPhaseY: random(TWO_PI),
        floatSpeedX: random(0.001, 0.005),
        floatSpeedY: random(0.001, 0.005),
        floatAmplitude: random(1, 8)
      });
    }
    attempts++;
  }

  needRedrawBuffers = false;
}

function mousePressed(){
    let clicked = [];//record selected circle

    for (let i = 0; i < randomCirclePosition.length; i++){
        let cp = randomCirclePosition[i];

        //caculate current center coordinate of the circle 
        let offsetX = sin(millis() * cp.floatSpeedX + cp.floatPhaseX) * cp.floatAmplitude;
        let offsetY = cos(millis() * cp.floatSpeedY + cp.floatPhaseY) * cp.floatAmplitude;
        let centerX = cp.x + offsetX;
        let centerY = cp.y + offsetY;

        let d = dist(mouseX, mouseY, centerX, centerY);//Determine if the click is within the current circle
        if (d < cp.r){
            if (firstSelected === null){
                //first select
                firstSelected = { index: i, data: cp};
                console.log("select");
            }else if (i !== firstSelected.index){
                //the second select, and not the same cicle
                let a = firstSelected.data;
                let b = cp;

                //delete two selected circles
                let indices = [firstSelected.index, i].sort((a, b) => b-a);
                for(let idx of indices){
                    randomCirclePosition.splice(idx, 1);
                }

        //merge new circle
        let newX = (a.x + b.x) / 2;
        let newY = (a.y + b.y) / 2;
        let newR = sqrt(a.r * a.r + b.r * b.r);

        //Creating a new buffered image
        let pg = createGraphics(newR * 2, newR * 2);
        pg.colorMode(HSB, 360, 100, 100);
        pg.clear();

        //create the random circle
        if(random(1) < 0.5) {
            drawHandDrawnCircleOn(pg, newR, newR, 10, newR * 0.9);
        } else{
            drawZigzagCircleOn(pg, newR, newR, 10, newR * 0.9);
        }

        //Adding new circles to the array restores float, rotation, and other information
        randomCirclePosition.push({
            x: newX,
            y: newY,
            r: newR,
            pg: pg,
            angle: random(TWO_PI),
            speed: random([-1, 1]) * random(PI / 6000, PI / 3000),
            floatPhaseX: random(TWO_PI),
            floatPhaseY: random(TWO_PI),
            floatSpeedX: random(0.001, 0.005),
            floatSpeedY: random(0.001, 0.005),
            floatAmplitude: random(1, 8)
        });

        firstSelected = null;//clear status
        console.log("merge");
    }
    break;
    }
    }
}

function keyPressed(){
    if(key === '1'){
        for(let cp of randomCirclePosition){
            // random new radius
            cp.r = random(10, 150);

            let pg = createGraphics(cp.r * 2, cp.r * 2);
            pg.colorMode(HSB, 360, 100, 100);
            pg.clear();

            if(random(1) < 0.5){
                drawHandDrawnCircleOn(pg, cp.r, cp.r, 10, cp.r * 0.9);
            } else {
                drawZigzagCircleOn(pg, cp.r, cp.r, 10, cp.r * 0.9);
            }

            cp.pg = pg;//replace new graphics
        }
    }

    if(key === '2'){
        needRedrawBuffers = true;//update the color in the draw()
    }

    if(key ==='3'){
        randomCirclePosition = initialState.map(cp => {
            let r = cp.originalR;
            let pg = createGraphics(cp.r * 2, cp.r * 2);
            pg.colorMode(HSB, 360, 100, 100);
            pg.clear();

            if(random(1) < 0.5){
                drawHandDrawnCircleOn(pg, cp.r, cp.r, 10, cp.r * 0.9);
            } else {
                drawZigzagCircleOn(pg, cp.r, cp.r, 10, cp.r * 0.9);
            }

            return{
                ...cp,//Batch copy all attributes of the old object
                pg: pg,
                x: cp.x,
                y: cp.y,
            };
        });
    }
}