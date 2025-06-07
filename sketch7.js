// I added a color palette extracted from the painting ‘Wheel of Fortune’ instead of random RGB
let palette = ["#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
}

function draw() {
    background(255);
    let numCols = 8;
    let numRows = 5;

    let gridSizeX = width / numCols; 
    let gridSizeY = height / numRows;
    let layers = 12;
    let maxRadius = min(gridSizeX, gridSizeY) * 0.5; 

    for (let row = 0; row < numRows; row++) {

        // translation: Offset the 1st, 3rd, 5th, 7th rows by half a grid to the right and draw an additional semi-circle
        // zero-based: rows 0,2,4,6 => row % 2 === 0
        let offset   = (row % 2 === 0) ? gridSizeX / 2 : 0;
        let startCol = (row % 2 === 0) ? -1 : 0;

        // col from startCol to numCols，and add offset
            for (let col = startCol; col < numCols; col++) {
                let cx = col * gridSizeX + gridSizeX / 2 + offset;
                let cy = row * gridSizeY + gridSizeY / 2;

            if (random(1) < 0.2) {
                drawZigzagCircle(cx, cy, layers, maxRadius);
            } else {
                drawHandDrawnCircle(cx, cy, layers, maxRadius);
            }
        }
    }
}

function drawHandDrawnCircle(cx, cy, numLayers, maxRadius){
    let outerMostRadius = maxRadius;

    for(let i = numLayers; i > 0; i--) {
        let radius = (i / numLayers) * maxRadius;

        // I changed the fill to randomly pick from the palette instead of random RGB
        fill(color(random(palette) + 'ee'));
        noStroke();
        ellipse(cx + random(-1, 1), cy + random(-1, 1), radius*2, radius*2);
    }

    let dot = 20;
    let outDotRadius = outerMostRadius + 10;
    for (let i = 0; i < dot; i++){
        let angle = TWO_PI * i/dot;
        let x = cx + outDotRadius * cos(angle);
        let y = cy + outDotRadius * sin(angle);

        // Also updated the dot colors to be picked from the palette
        fill(color(random(palette)));
        noStroke();
        ellipse(x , y, 5, 5);
    }
}

function drawZigzagCircle(cx, cy, numLayers, maxRadius) {
    // Used palette color with some transparency
    fill(color(random(palette) + 'e0'));
    noStroke();
    circle(cx, cy, maxRadius * 2);

    let outerRadius = maxRadius * 0.9;
    let innerRadius = outerRadius * (2 / 3);

    // Also switched stroke color to use palette
    stroke(color(random(palette) + 'cc'));
    strokeWeight(random(3, 6));

    beginShape();
    let angle = 0;
    let angleStep = TWO_PI / 60;

    for (let i = 0; i < 60; i++) {
        let innerX = cx + innerRadius * cos(angle);
        let innerY = cy + innerRadius * sin(angle);
        vertex(innerX, innerY);
        angle += angleStep;
        let outerX = cx + outerRadius * cos(angle);
        let outerY = cy + outerRadius * sin(angle);
        vertex(outerX, outerY);
        angle += angleStep;
    }
    endShape(CLOSE);

    drawHandDrawnCircle(cx, cy, numLayers, outerRadius * 0.6);

    let dots = 20;
    let outDotRadius = outerRadius + 10;
    for(let i = 0; i < dots; i++){
        let angle = TWO_PI * i/dots;
        let x = cx + outDotRadius * cos(angle);
        let y = cy + outDotRadius * sin(angle);

        // Dot color also from the palette now
        fill(color(random(palette)));
        noStroke();
        ellipse(x, y, 5, 5);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight); 
    redraw(); 
}