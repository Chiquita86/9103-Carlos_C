//Streamline Sketch9 structure with cleaned layout and buffer logic

// Removed legacy code for static buffered circles.
// Replaced by the Ripple class for dynamic ripple animations with timing control.

// Removed buffer redraw logic.
// The animation now uses per-frame update & render inside the Ripple class.

// Removed per-object offscreen buffer setup.
// Ripple instances now handle their own drawing with createGraphics inside display().

// Removed drawZigzagCircleOn() since it's no longer used in the current ripple animation design.

// Removed local random baseCol.
// Ripple colors are now assigned once per ring for consistency using this.layerHue[i].

// // Color palette extracted from 'Wheel of Fortune'
let palette = ["#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];

// Global redraw control flag
let needRedrawBuffers = true;

// Array to store non-overlapping circle data
let randomCirclePosition = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  generateRipples();
}

function draw() {
  background(0);
  for (let rp of ripples) {
    rp.update();
    rp.display();
  }
}

function generateRipples() {
  ripples = [];
  let tries = 0;
  let count = 300;

  while (ripples.length < count && tries < 10000) {
    let r = random(30, 80);
    let x = random(r, width - r);
    let y = random(r, height - r);

    let overlapping = false;
    for (let rp of ripples) {
      if (dist(x, y, rp.x, rp.y) < rp.r + r + 2) {
        overlapping = true;
        break;
      }
    }

    if (!overlapping) {
      ripples.push(new Ripple(x, y, r));
    }
    tries++;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateRipples();
}

// Draw concentric rings with optional ripple progress (0 ~ 1)
function drawHandDrawnCircleOn(g, cx, cy, numLayers, maxRadius, progress = 1, baseCol) {
  let outerMostRadius = maxRadius;
  for (let i = numLayers; i > 0; i--) {
    let radius = (i / numLayers) * maxRadius * progress;
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


// Class-based ripple animation for each circle
class Ripple {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.angle = random(TWO_PI);
    this.layerStart = [];
    this.layerHue = [];
    this.maxLayers = 9;
    this.layerInterval = 1000; // ms between ripples
    this.expandDuration = 8000; // ms for a full expansion
    this.birth = millis();
    for (let i = 0; i < this.maxLayers; i++) {
      this.layerStart[i] = this.birth + i * this.layerInterval;
      this.layerHue[i] = color(random(palette));
    }
  }

  update() {
    let now = millis();
    for (let i = 0; i < this.maxLayers; i++) {
      if (now - this.layerStart[i] > this.expandDuration) {
        this.layerStart[i] = now;
        this.layerHue[i] = color(random(palette));
      }
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    let pg = createGraphics(this.r * 2, this.r * 2);
    pg.colorMode(HSB, 360, 100, 100);
    pg.clear();
    for (let i = 0; i < this.maxLayers; i++) {
      let now = millis();
      let elapsed = now - this.layerStart[i];
      if (elapsed >= 0 && elapsed <= this.expandDuration) {
        let progress = elapsed / this.expandDuration;
        drawHandDrawnCircleOn(pg, this.r, this.r, 10, this.r * 0.9, progress, this.layerHue[i]);
      }
    }
    imageMode(CENTER);
    image(pg, 0, 0);
    pop();
  }
}
