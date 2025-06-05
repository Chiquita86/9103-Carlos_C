// This version, I change the wavycircle to zigzagcircle, but you can choose the version

//I changed the canvas value for responsive design
function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
  background(255);
  
  //Fixed column and row number can be modified!
  let numCols = 8;
  let numRows = 6;

  let gridSizeX = width / numCols; 
  let gridSizeY = height / numRows;
  let layers = 8;
  let maxRadius = min(gridSizeX, gridSizeY) * 0.4; 

  //Change to loop based on row and column indexes
   for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      let cx = col * gridSizeX + gridSizeX / 2;
      let cy = row * gridSizeY + gridSizeY / 2;

      //change the wavycircle to zigzagcircle
      if (random(1) < 0.2) {
        drawZigzagCircle(cx, cy, layers, maxRadius);
      } else {
        drawHandDrawnCircle(cx, cy, layers, maxRadius);
      }
    }
  }
}

function drawHandDrawnCircle(cx, cy, numLayers, maxRadius){
  for(let i = numLayers; i > 0; i--) {
    let radius = (i / numLayers) * maxRadius;

    let r = random(120, 255);
    let g = random(120, 255);
    let b = random(120, 255);

    //I added some transparency, but you can adjust the value
    fill(r, g, b, 230);
    noStroke();
    ellipse(cx + random(-1, 1), cy + random(-1, 1), radius*2, radius*2);
  }
}

//Adding zigzagcircle shape
//Refering zigzagcircle code (Jera0420,2024), see appendix.
    // I change the wavycircle to zigzagcircle, but you can choose the version
    function drawZigzagCircle(cx, cy, numLayers, maxRadius) {
        let baseR = random(120, 255);
        let baseG = random(120, 255);
        let baseB = random(120, 255);
        fill(baseR, baseG, baseB, 230);
        noStroke();
        circle(cx, cy, maxRadius * 2);   // draw the outer circle

    //make sure that the zigzag does not exceed the circular boundary
    let outerRadius = maxRadius * 0.9;
    let innerRadius = outerRadius * (2 / 3);

    // The color and thickness of the zigzag are based on the original artwork, but with slight random variations and could adjust
    // Used ChatGPT, see appendix.
    let zigR = random(120, 255); 
    let zigG = random(120, 100);
    let zigB = random(120, 255);
    stroke(zigR, zigG, zigB, 180); 
    strokeWeight(random(3, 6)); //random stroke
    
    beginShape(); //customizing the zigzagcircle shape
    let angle = 0; // set up angle
    let angleStep = TWO_PI / 60; // One circle is divided into 60 pairs of vertices
    
    for (let i = 0; i < 60; i++) {
    // Inner circle vertex (innerRadius from the center)
    let innerX = cx + innerRadius * cos(angle); // x of the inner circle vertices
    let innerY = cy + innerRadius * sin(angle); // y of the inner circle vertices
    vertex(innerX, innerY); //inner circle vertices

    angle += angleStep; //angle +1

    // Outer circle vertex (outerRadius from the center)
    let outerX = cx + outerRadius * cos(angle); // x of the outer circle vertices
    let outerY = cy + outerRadius * sin(angle); // y of the outer circle vertices
    vertex(outerX, outerY);                     // outer circle vertices

    angle += angleStep;                          //angle +1, for next zigzag
  }

  endShape(CLOSE); // end the zigzagcircle shape

  //reduce the geometric proportion to avoid covering the tooth edges
  //Use GPT, see appendix. reuse the original drawHandDrawnCircle and reduce its size
  drawHandDrawnCircle(cx, cy, numLayers, outerRadius * 0.6); 
}
//Zigzagcircle Shape ends

//Add windowResized for responsive design
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); 
  redraw(); 
}