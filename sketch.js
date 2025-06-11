/**
 * Draw concentric circles in a grid layout across the entire canvas
 * Each concentric circle consists of multiple rings with random colors
 * Rendered only once (noLoop())
 */
function setup() {
  // Create an 800×600 canvas
  createCanvas(800, 600);
  noLoop();
}


function draw() {
  // Set background to white
  background(255);
  // Grid cell size one cell per 100px
  let gridSize = 100
  // Number of layers per concentric circle
  let layers = 8;
  // Radius of the outermost circle
  let maxRadius = 40;

  for(let y = gridSize / 2; y < height; y+= gridSize){
    for(let x = gridSize / 2; x < width; x+= gridSize){
      drawConcentricCircle(x, y, layers, maxRadius);
    }
  }
}

function drawConcentricCircle(cx, cy, numLayers, maxRadius){
  for(let i = numLayers; i > 0; i--) {
    let radius = (i/numLayers) * maxRadius;

    fill((random(50, 255)), random(20, 255), random(20, 255));
    noStroke();
    ellipse(cx, cy, radius*2, radius*2);
  }
}