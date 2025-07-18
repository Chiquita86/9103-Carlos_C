// I added a color palette extracted from the painting ‘Wheel of Fortune’ instead of random RGB
let palette = ["#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];
// I added a slider to adjust the hue and brightness of the image
let hueSlider, brightnessSlider;
/**
 * I use the needRedrawBuffers flag and buffers to avoid redrawing everything on every frame, rebuilding caches only when necessary.
 * Reference: https://p5js.org/reference/p5/redraw/
 */
let needRedrawBuffers = true;

//I add the buffer for spin
const numCols = 8;
const numRows = 5;
let angles = [];   //store the current angle of each circle
let speeds = [];   //store the current spin speed of each circle
let buffers = [];  // add off-screen layer caching

function setup() {
    createCanvas(windowWidth, windowHeight);
    // noLoop(); // kept from original, but commented out so draw() loops for continuous rotation

     /**
    * This section of code creates sliders to allow interactive adjustment of hue and brightness.
    * References:
        *  https://p5js.org/reference/p5/createSlider/
        *  https://p5js.org/reference/p5/hue/
        *  https://p5js.org/reference/p5/brightness/
        *  https://p5js.org/reference/p5/lightness/
    */
    hueSlider = createSlider(-180, 180, 0);
    hueSlider.position(10, 10);
    hueSlider.style('width', '200px');
    hueSlider.input(()=> needRedrawBuffers = true);

    brightnessSlider = createSlider(50, 150, 100);
    brightnessSlider.position(10, 40);
    brightnessSlider.style ('width', '200px');
    brightnessSlider.input(()=> needRedrawBuffers = true);

    let gridSizeX = width / numCols; 
    let gridSizeY = height / numRows;
    // let numCols = 8;
    // let numRows = 5; //I change the line to make symmetry
    // let layers = 12; //I adjust a liitle bit to make it more colorful
    // let maxRadius = min(gridSizeX, gridSizeY) * 0.5; //I adjust a liitle bit

    // Initialize angles, speeds, and offscreen buffers
    for (let r = 0; r < numRows; r++) {
        angles[r]  = [];
        speeds[r]  = [];
        buffers[r] = [];
        let offset   = (r % 2 === 0) ? gridSizeX / 2 : 0;
        let startCol = (r % 2 === 0) ? -1 : 0;

        for (let c = startCol; c < numCols; c++) {
            // angle and speed
            angles[r][c] = random(TWO_PI);
            let arcPerSec = random(TWO_PI/90, TWO_PI/45);  // speed can be adjusted  
            speeds[r][c] = arcPerSec / 1000 * (random() < 0.5 ? 1 : -1);

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
        }
    }
     rebuildBuffers();
}

    function draw() {
    background('#007B88'); //background color can be adjust!!
    let gridSizeX = width / numCols; 
    let gridSizeY = height / numRows;
    
    if(needRedrawBuffers){
        rebuildBuffers();
        needRedrawBuffers = false;
    }

       for (let r = 0; r < numRows; r++) {
        let offset   = (r % 2 === 0) ? gridSizeX / 2 : 0;
        let startCol = (r % 2 === 0) ? -1 : 0;

        for (let c = startCol; c < numCols; c++) {
            let cx = c * gridSizeX + gridSizeX/2 + offset;
            let cy = r * gridSizeY + gridSizeY/2;

            // update angle
            angles[r][c] += speeds[r][c] * deltaTime;

            push();
            translate(cx, cy);
            rotate(angles[r][c]);
            imageMode(CENTER);
            image(buffers[r][c], 0, 0);
            pop();
        }
    }
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

function rebuildBuffers() {
    let gridSizeX = width / numCols;
    let gridSizeY = height / numRows;
    
    let layers = 12;
    let maxRadius = min(gridSizeX, gridSizeY) * 0.5;

    for (let r = 0; r < numRows; r++) {
        buffers[r] = [];
        let offset = (r % 2 === 0) ? gridSizeX / 2 : 0;
        let startCol = (r % 2 === 0) ? -1 : 0;

        for (let c = startCol; c < numCols; c++) {
            let pg = createGraphics(gridSizeX, gridSizeY);
            pg.colorMode(HSB, 360, 100, 100);
            pg.clear();
            pg.noStroke();
            let cx = gridSizeX / 2;
            let cy = gridSizeY / 2;

            if (random(1) < 0.2) {
                drawZigzagCircleOn(pg, cx, cy, layers, maxRadius);
            } else {
                drawHandDrawnCircleOn(pg, cx, cy, layers, maxRadius);
            }
            buffers[r][c] = pg;
        }
    }
}

//buffers can be rebuilt if necessary
function windowResized() {
    resizeCanvas(windowWidth, windowHeight); 
    //redraw();
    needRedrawBuffers = true;
}

