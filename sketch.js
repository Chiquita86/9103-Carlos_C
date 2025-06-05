function setup() {
  createCanvas(800, 600);
  noLoop();
}

function draw() {
  background(255);

  let gridSize = 100
  let layers = 8;
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