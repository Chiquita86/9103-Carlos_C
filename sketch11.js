// I added a color palette extracted from the painting ‘Wheel of Fortune’ instead of random RGB
let palette = ["#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];
// I added a slider to adjust the hue and brightness of the image
let hueSlider, brightnessSlider;
let needRedrawBuffers = true;
let randomCirclePosition = [];//replace grid array

//I add the buffer for spin
//const numCols = 8;
//const numRows = 5;
//let angles = [];   //store the current angle of each circle
//let speeds = [];   //store the current spin speed of each circle
//let buffers = [];  // add off-screen layer caching

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
    let tries = 0;

    while(randomCirclePosition.length < circleNumber && tries < 10000){//non-overlapping circles with random radius
        let r = random(30, 80);
        let x = random(r, width - r);
        let y = random(r, height - r);

        let overlapping = false;
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
            pg.clear();

            if(random(1) <  0.2){
                drawZigzagCircleOn(pg, r, r, 10, r * 0.9);
            }else{
                drawHandDrawnCircleOn(pg, r, r, 10, r * 0.9);
            }

            let angle = random(TWO_PI);
            let speed = random([-1, 1]) * random(PI / 6000, PI / 3000);

            randomCirclePosition.push({
                x, y, r, pg, angle, speed,
                floatPhaseX: random(TWO_PI),
                floatPhaseY: random(TWO_PI),
                floatSpeedX: random(0.001, 0.005),
                floatSpeedY: random(0.001, 0.005),
                floatAmplitude: random(1, 8)
            });
        }
        tries++;
      }
    }
    //let gridSizeX = width / numCols; 
    //let gridSizeY = height / numRows;
    // let numCols = 8;
    // let numRows = 5; //I change the line to make symmetry
    // let layers = 12; //I adjust a liitle bit to make it more colorful
    // let maxRadius = min(gridSizeX, gridSizeY) * 0.5; //I adjust a liitle bit

    // Initialize angles, speeds, and offscreen buffers
    //for (let r = 0; r < numRows; r++) {
      //  angles[r]  = [];
       //speeds[r]  = [];
       // buffers[r] = [];
        //let offset   = (r % 2 === 0) ? gridSizeX / 2 : 0;
        //let startCol = (r % 2 === 0) ? -1 : 0;

        //for (let c = startCol; c < numCols; c++) {
            // angle and speed
            //angles[r][c] = random(TWO_PI);
            //let arcPerSec = random(TWO_PI/90, TWO_PI/45);  // speed can be adjusted  
            //speeds[r][c] = arcPerSec / 1000 * (random() < 0.5 ? 1 : -1);

            // Offscreen layer caching: draw each static circle once onto a p5.Graphics (PG)
            // Offscreen layer strategy (osteele, 2022), see appendix.
            // let pg = createGraphics(gridSizeX, gridSizeY);
            // pg.clear();
            // pg.noStroke();
            // let cx = gridSizeX/2, cy = gridSizeY/2;
            // if (random(1) < 0.2) {
            //     drawZigzagCircleOn(pg, cx, cy, layers, maxRadius);
            // } else {
            //     drawHandDrawnCircleOn(pg, cx, cy, layers, maxRadius);
            // buffers[r][c] = pg; // store PG for this cell
        //}
    //}
     //rebuildBuffers();
//}

    function draw() {
        background('#000000'); //background color can be adjust!!
    //let gridSizeX = width / numCols; 
    //let gridSizeY = height / numRows;


        for(let cp of randomCirclePosition){
            cp.angle += cp.speed * deltaTime;

            let offsetX = sin(millis() * cp.floatSpeedX + cp.floatPhaseX) * cp.floatAmplitude;
            let offsetY = cos(millis() * cp.floatSpeedY + cp.floatPhaseY) * cp.floatAmplitude;

            push();
            //translate(cp.x, cp.y);
            translate(cp.x + offsetX, cp.y + offsetY);
            rotate(cp.angle);
            imageMode(CENTER);
            image(cp.pg, 0, 0);
            pop();
        }


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
    }
       // rebuildBuffers();
       // needRedrawBuffers = false;
    //}

      // for (let r = 0; r < numRows; r++) {
        //let offset   = (r % 2 === 0) ? gridSizeX / 2 : 0;
        //let startCol = (r % 2 === 0) ? -1 : 0;

       // for (let c = startCol; c < numCols; c++) {
            //let cx = c * gridSizeX + gridSizeX/2 + offset;
            //let cy = r * gridSizeY + gridSizeY/2;

            // update angle
            //angles[r][c] += speeds[r][c] * deltaTime;

            //push();
            //translate(cx, cy);
            //rotate(angles[r][c]);
            //imageMode(CENTER);
            //image(buffers[r][c], 0, 0);
           // pop();
        //}

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

//function rebuildBuffers() {
    //let gridSizeX = width / numCols;
    //let gridSizeY = height / numRows;
    
    //let layers = 12;
    //let maxRadius = min(gridSizeX, gridSizeY) * 0.5;

   // for (let r = 0; r < numRows; r++) {
        //buffers[r] = [];
        //let offset = (r % 2 === 0) ? gridSizeX / 2 : 0;
        //let startCol = (r % 2 === 0) ? -1 : 0;

        //for (let c = startCol; c < numCols; c++) {
            //let pg = createGraphics(gridSizeX, gridSizeY);
            //pg.colorMode(HSB, 360, 100, 100);
            //pg.clear();
            //pg.noStroke();
            //let cx = gridSizeX / 2;
            //let cy = gridSizeY / 2;

            //if (random(1) < 0.2) {
                //drawZigzagCircleOn(pg, cx, cy, layers, maxRadius);
            //} else {
                //drawHandDrawnCircleOn(pg, cx, cy, layers, maxRadius);
            //}
            //buffers[r][c] = pg;
        //}
    //}
//}

// //buffers can be rebuilt if necessary
function windowResized() {
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
        x, y, r, pg,
        angle: random(TWO_PI),
        speed: random([-1, 1]) * random(PI / 6000, PI / 3000),
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