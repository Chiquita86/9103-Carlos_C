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
        if(random(1) < 0.2){
            drawWavyCircle(x, y, layers, maxRadius); 
        } else{
            drawHandDrawnCircle(x, y, layers, maxRadius);
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
function drawWavyCircle(cx, cy, numLayers, maxRadius){
    let radius = maxRadius;
    let r = random(120, 255);
    let g = random(120, 255);
    let b = random(120, 255);
    noFill();
    stroke(r, g, b, 170);
    strokeWeight(random(1,2));

    beginShape();
    let totalPoints = 100;
    for (let i = 0; i < TWO_PI; i += TWO_PI / totalPoints){
    let offset = map(sin(i * 10 + frameCount * 0.01), -1, 1, -5, 5);
    let x = cx + cos(i) * (radius + offset);
    let y = cy + sin(i) * (radius + offset);
    vertex(x, y);
    }
    endShape(CLOSE);

    for(let i = 4; i > 0; i--){
        let innerRadius = (i / 4) * radius * 0.8;

        fill(random(130,255), random(130,255), random(130,255), 230);
        noStroke();
        ellipse(cx + random(-1, 1), cy + random(-1, 1), innerRadius *2, innerRadius*2);
    }

}