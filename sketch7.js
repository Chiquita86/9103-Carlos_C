// In sketch7, I added offscreen buffers (p5.Graphics) for each grid cell. These buffers store pre-rendered images
// of zigzag circles or hand-drawn circles. Instead of redrawing the complex shapes every frame in draw(), I only draw
// them once during setup() and reuse them in the draw() loop. This creates a spinning grid of shapes with much better
// performance and a more dynamic, fluid visual effect. Without this offscreen buffer technique, the page would constantly
// flicker or redraw the shapes, making it look jittery and not smooth. By using p5.Graphics buffers, I avoided this flicker
// problem and achieved a continuous, seamless spinning animation for all shapes in the grid.
//
// This technique was not covered in the basic coding lessons. It was inspired by:
// - "Drawing to Graphics Buffer" by Fabian Winkler (OpenProcessing.org, https://openprocessing.org/sketch/381081)
// - ChatGPT also helped me to understand how to implement this buffer system and why it fixes the flicker issue.
// I also added dynamic rotation angles and rotation speeds to each cell for more interesting, animated motion.

// I added a color palette extracted from the painting ‘Wheel of Fortune’ instead of random RGB
let palette = ["#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];

//I add the buffer for spin
const numCols = 8;
const numRows = 5;
let angles = [];   //store the current angle of each circle
let speeds = [];   //store the current spin speed of each circle
let buffers = [];  // add off-screen layer caching

/**
 * The following lines were taken from ChatGPT and examples like
 * "Drawing to Graphics Buffer" by Fabian Winkler (OpenProcessing.org, https://openprocessing.org/sketch/381081).
 * We want to create offscreen buffers (p5.Graphics) that store complex static graphics (zigzag circles or hand-drawn circles)
 * only once during setup(), and then reuse them in draw() to animate them. This boosts performance and creates a dynamic visual effect.
 * The process has multiple Steps. Each are commented below.
 */

function setup() {
    /**
     * Step 1: Create an offscreen buffer (p5.Graphics) for each grid cell.
     * We only draw the complex shapes (zigzag circles or hand-drawn circles) once to these buffers.
     * These buffers will be reused in draw() to animate them without redrawing each frame.
     */
    createCanvas(windowWidth, windowHeight);
    // noLoop(); // kept from original, but commented out so draw() loops for continuous rotation

    let gridSizeX = width / numCols; 
    let gridSizeY = height / numRows;
    // let numCols = 8;
    // let numRows = 5; //I change the line to make symmetry
    let layers = 12; //I adjust a liitle bit to make it more colorful
    let maxRadius = min(gridSizeX, gridSizeY) * 0.5; //I adjust a liitle bit

    // Initialize angles, speeds, and offscreen buffers
    for (let r = 0; r < numRows; r++) {
        angles[r]  = [];
        speeds[r]  = [];
        buffers[r] = [];
        let offset   = (r % 2 === 0) ? gridSizeX / 2 : 0;
        let startCol = (r % 2 === 0) ? -1 : 0;

        for (let c = startCol; c < numCols; c++) {
            /**
             * Step 2: Initialize each cell's rotation angle and spin speed.
             */
            
            // angle and speed
            angles[r][c] = random(TWO_PI);
            let arcPerSec = random(TWO_PI/90, TWO_PI/45);  // speed can be adjusted  
            speeds[r][c] = arcPerSec / 1000 * (random() < 0.5 ? 1 : -1);

          /**
           * Step 3: Create the p5.Graphics buffer for this cell and draw its static graphic only once.
           */
            // Offscreen layer caching: draw each static circle once onto a p5.Graphics (PG)
            let pg = createGraphics(gridSizeX, gridSizeY);
            pg.clear();
            pg.noStroke();
            let cx = gridSizeX/2, cy = gridSizeY/2;
            if (random(1) < 0.2) {
                drawZigzagCircleOn(pg, cx, cy, layers, maxRadius);
            } else {
                drawHandDrawnCircleOn(pg, cx, cy, layers, maxRadius);
            }
            buffers[r][c] = pg; // store PG for this cell
        }
    }
}

    function draw() {
    /**
     * Step 4: Clear background and animate the spinning shapes using the pre-rendered buffers.
     */
    background('#007B88'); //background color can be adjust!!
    let gridSizeX = width / numCols; 
    let gridSizeY = height / numRows;

       for (let r = 0; r < numRows; r++) {
        let offset   = (r % 2 === 0) ? gridSizeX / 2 : 0;
        let startCol = (r % 2 === 0) ? -1 : 0;

        for (let c = startCol; c < numCols; c++) {
            let cx = c * gridSizeX + gridSizeX/2 + offset;
            let cy = r * gridSizeY + gridSizeY/2;

            // update angle
            angles[r][c] += speeds[r][c] * deltaTime;
            /**
             * Step 5: Draw the offscreen buffer at this grid position with rotation.
             */
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
        g.fill(color(random(palette) + 'ee'));
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
        g.fill(color(random(palette)));
        g.noStroke();
        g.ellipse(x, y, 5, 5);
    }
}

//PG:drawZigzagCircle
function drawZigzagCircleOn(g, cx, cy, numLayers, maxRadius) {
    // Used palette color with some transparency
    g.fill(color(random(palette) + 'e0'));
    g.noStroke();
    g.circle(cx, cy, maxRadius * 2);

    let outerRadius = maxRadius * 0.9;
    let innerRadius = outerRadius * (2 / 3);
    // Also switched stroke color to use palette
    g.stroke(color(random(palette) + 'cc'));
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
        g.fill(color(random(palette)));
        g.noStroke();
        g.ellipse(x2, y2, 5, 5);
    }
}

//buffers can be rebuilt if necessary
function windowResized() {
    resizeCanvas(windowWidth, windowHeight); 
    redraw();
}
