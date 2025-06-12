//Streamline Sketch9 structure with cleaned layout and buffer logic

// // Color palette extracted from 'Wheel of Fortune'
let palette = ["#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];

// Global redraw control flag
let needRedrawBuffers = true;

// Array to store non-overlapping circle data
let randomCirclePosition = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  generateShapes();
}

function draw() {
  background(0);
  for (let cp of randomCirclePosition) {
    push();
    translate(cp.x, cp.y);
    rotate(cp.angle);
    imageMode(CENTER);
    image(cp.pg, 0, 0);
    pop();
  }

  if (needRedrawBuffers) {
    for (let cp of randomCirclePosition) {
      cp.pg.clear();
      cp.pg.colorMode(HSB, 360, 100, 100);
      if (random(1) < 0.2) {
        drawZigzagCircleOn(cp.pg, cp.r, cp.r, 10, cp.r * 0.9);
      } else {
        drawHandDrawnCircleOn(cp.pg, cp.r, cp.r, 10, cp.r * 0.9);
      }
    }
    needRedrawBuffers = false;
  }
}

function generateShapes() {
  randomCirclePosition = [];
  let tries = 0;
  let count = 50;

  while (randomCirclePosition.length < count && tries < 10000) {
    let r = random(30, 80);
    let x = random(r, width - r);
    let y = random(r, height - r);

    let overlapping = false;
    for (let cp of randomCirclePosition) {
      if (dist(x, y, cp.x, cp.y) < cp.r + r + 2) {
        overlapping = true;
        break;
      }
    }

    if (!overlapping) {
      let pg = createGraphics(r * 2, r * 2);
      pg.colorMode(HSB, 360, 100, 100);
      pg.clear();

      if (random(1) < 0.2) {
        drawZigzagCircleOn(pg, r, r, 10, r * 0.9);
      } else {
        drawHandDrawnCircleOn(pg, r, r, 10, r * 0.9);
      }

      let angle = random(TWO_PI);
      let speed = random([-1, 1]) * random(PI / 6000, PI / 3000);

      randomCirclePosition.push({ x, y, r, pg, angle, speed });
    }
    tries++;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateShapes();
  needRedrawBuffers = true;
}

function drawHandDrawnCircleOn(g, cx, cy, numLayers, maxRadius) {
  let outerMostRadius = maxRadius;
  for (let i = numLayers; i > 0; i--) {
    let radius = (i / numLayers) * maxRadius;
    let baseCol = color(random(palette));
    g.fill(hue(baseCol), saturation(baseCol), brightness(baseCol), 80);
    g.noStroke();
    g.ellipse(cx + random(-1, 1), cy + random(-1, 1), radius * 2);
  }
  let dot = 20;
  let outDotRadius = outerMostRadius + 10;
  for (let i = 0; i < dot; i++) {
    let angle = TWO_PI * i / dot;
    let x = cx + outDotRadius * cos(angle);
    let y = cy + outDotRadius * sin(angle);
    let baseDotCol = color(random(palette));
    g.fill(hue(baseDotCol), saturation(baseDotCol), brightness(baseDotCol), 80);
    g.noStroke();
    g.ellipse(x, y, 5);
  }
}

function drawZigzagCircleOn(g, cx, cy, numLayers, maxRadius) {
  let baseFillCol = color(random(palette));
  g.fill(hue(baseFillCol), saturation(baseFillCol), brightness(baseFillCol), 80);
  g.noStroke();
  g.circle(cx, cy, maxRadius * 2);

  let outerRadius = maxRadius * 0.9;
  let innerRadius = outerRadius * (2 / 3);

  let baseStrokeCol = color(random(palette));
  g.stroke(hue(baseStrokeCol), saturation(baseStrokeCol), brightness(baseStrokeCol), 80);
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
  for (let i = 0; i < dots; i++) {
    let a2 = TWO_PI * i / dots;
    let x2 = cx + outR * cos(a2);
    let y2 = cy + outR * sin(a2);
    let baseDotCol = color(random(palette));
    g.fill(hue(baseDotCol), saturation(baseDotCol), brightness(baseDotCol), 80);
    g.noStroke();
    g.ellipse(x2, y2, 5);
  }
}