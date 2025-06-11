/**
 * Hand-Drawn and Wavy Circles
 * 	Draws concentric circles in a grid layout across the canvas
 * 	80% chance to draw a “hand-drawn” concentric circle
 * 	20% chance to draw a wavy-outline concentric circle
 * 	Colors, stroke weights, and slight position jitters are randomized
 * 	Rendered only once (noLoop())
 */
function setup() {
  createCanvas(800, 600);
  noLoop();
}

function draw() {
  background(255);

  let gridSize = 100
  let layers = 8;
  let maxRadius = 40;
// Iterate over grid rows and columns
  for(let y = gridSize / 2; y < height; y+= gridSize){
    for(let x = gridSize / 2; x < width; x+= gridSize){
      // 20% chance to draw a wavy circle, otherwise hand-drawn style
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
    // Draw from outer layer to inner
    let radius = (i / numLayers) * maxRadius;

    let r = random(120, 255);
    let g = random(120, 255);
    let b = random(120, 255);

    //I added some transparency, but you can adjust the value
    fill(r, g, b, 230);
    noStroke();
    // Jitter position by ±1px for sketchy feel 
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

    // Draw wavy outer outline
    beginShape();
    // Number of vertices
    let totalPoints = 100;
    for (let i = 0; i < TWO_PI; i += TWO_PI / totalPoints){
      // Use sine wave for offset
    let offset = map(sin(i * 10 + frameCount * 0.01), -1, 1, -5, 5);
    let x = cx + cos(i) * (radius + offset);
    let y = cy + sin(i) * (radius + offset);
    vertex(x, y);
    }
    endShape(CLOSE);

    // Draw inner filled circles with jitter
    for(let i = 4; i > 0; i--){
        let innerRadius = (i / 4) * radius * 0.8;

        fill(random(130,255), random(130,255), random(130,255), 230);
        noStroke();
        ellipse(cx + random(-1, 1), cy + random(-1, 1), innerRadius *2, innerRadius*2);
    }

}