/** 
 * Color palette extracted from the painting 'Wheel of Fortune',
 *  used to replace random RGB color generation for visual consistency.
 */
let palette = [
    "#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", 
    "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];

// Hue/Brightness sliders were used in early prototypes but are now removed
// Perlin noise is now used to drive all color variations

/**
 * I use the needRedrawBuffers flag and buffers to avoid redrawing everything on every frame, rebuilding caches only when necessary.
 * Reference: https://p5js.org/reference/p5/redraw/
 */
let needRedrawBuffers = true; //Added flag for noise-driven redraw
let randomCirclePosition = []; //replace grid array

/**
 * The following lines were taken from ChatGPT and examples like
 * "Drawing to Graphics Buffer" by Fabian Winkler (OpenProcessing.org, https://openprocessing.org/sketch/381081).
 * We want to create offscreen buffers (p5.Graphics) that store complex static graphics (zigzag circles or hand-drawn circles)
 * only once during setup(), and then reuse them in draw() to animate them. This boosts performance and creates a dynamic visual effect.
 * The process has multiple Steps. Each are commented below. 
 * Also can see offscreen buffers details in sketch7
 */

/**
 * For Blobby Wave: Perlin noise driven waterlines
 * Inspired by the repeating wave aesthetic of Joy Division’s “Unknown Pleasures” cover,
 * and the following code examples and tutorials:
 * 1. "Tiny Sketch Unknown Pleasures" by Craig S. Kaplan on OpenProcessing (sketch '683686') 
 *    https://openprocessing.org/sketch/683686
 * 2. "noisy circles" by michelleinspace on OpenProcessing (sketch '2189726') 
 *    https://openprocessing.org/sketch/2189726
 * 2. “Blobby!” tutorial video by The Coding Train:
 *    https://www.youtube.com/watch?v=rX5p-QRP6R4
 * 3. “200520” by takawo on OpenProcessing (sketch '857874')
 *    https://openprocessing.org/sketch/857874
 * 4. “Storybook Waves” by VKS on OpenProcessing (sketch '2383330'), credit due to openprocessing user VKS
 *    https://openprocessing.org/sketch/2383330
 *    Key techniques used here:
 *    noise(xoff, yoff) to generate vertical displacements for multiple horizontal lines
 *    amplified offset range (e.g. ±100) for more dramatic wave peaks and troughs
 *    incremental yoff over frames to animate continuous flow
 *    shadow settings (shadowBlur, shadowOffsetX/Y) to add subtle depth
 */
//The Blobby wave parameter of the bottom layer
let yoff = 0; //Perlin noise offset used to drive waves

//Added Particle Trails
//Particle text-trail variables: char array, spawn index, offscreen layer, grid & particles
// Use RGB color mode for dot/letter particles to match [R,G,B] values
// (If using HSB, ensure colorMode is correctly set to HSB)
let chars, spawnIdx = 0;
let waveLayer;
let waveGrid = [], waveParticles = [];
const spacing = 24; //grid spacing
const noiseAmp = 40; //noise amplitude
const waveSpeed = 4.0; //wave expansion speed
let waveFrame = 0; //current frame count
let waveMaxR; // max radius
const fadeAlpha = 10; //fade alpha for trails

//Global gradient buffer updated on resize//Changed the local gradient variable to a global waveGradient to allow direct use in draw.
let waveGradient;
let midStop; // gradient midpoint stop value

// Dynamic gradient parameters
let gradPhase; // holds noise phase for gradient
let currentMid = 0.5;

//Add interactive Layer
let interactiveLayer;
let perlinBubbles = []; //Add perlin bubble array
let textParticles = []; //text particles
let isLongPress = false; //Long press sign
const PRESS_DURATION = 300; //Long press threshold (milliseconds)
let lastPressTime = 0; //The time of the last press

//Add an array for storing ripples
let ripples = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    // noLoop(); // kept from original, but commented out so draw() loops for continuous rotation
    colorMode(HSB, 360, 100, 100);
    noiseDetail(2, 0.5); //Perlin noise detail
    // Initialize dynamic gradient phase, random seed for noise-driven gradient
    gradPhase = random(1000);
    textFont('Indie Flower'); //font set
    textAlign(CENTER, CENTER); //center text alignment

    //Build gradients
    // midStop: initial gradient midpoint, used at setup and resize
    // currentMid: animated midpoint value, changes over time via noise
    midStop = random(0.3, 0.7);
    waveGradient = drawingContext.createLinearGradient(0, 0, width, 0);
    waveGradient.addColorStop(0, '#87dfd6');
    waveGradient.addColorStop(midStop, '#01a9b4');
    waveGradient.addColorStop(1, '#01a9b4');

    //Added the text-Particle Trails
    chars = [
        "Ocean","Footprints","Leaving","Staying","Echo","Life", "Love",
        "circle of life","Wheels of fortune","Journey","Color",
        "Destiny","Pacita Abad","Poem","Beating","Heart","Thinking",
    ].join(" ").split("");

      initCircles(); //init floating circles
      waveLayer = createGraphics(width, height); //create offscreen layer
      waveLayer.clear(); //clear offscreen
      initWave(); //init particle grid

      //Add initialize the interactive layer
      interactiveLayer = createGraphics(width, height);
      interactiveLayer.clear();
    }

    /**
    * This section of code creates sliders to allow interactive adjustment of hue and brightness.
    * References:
        *  https://p5js.org/reference/p5/createSlider/
        *  https://p5js.org/reference/p5/hue/
        *  https://p5js.org/reference/p5/brightness/
        *  https://p5js.org/reference/p5/lightness/
    */

    //Delete slider for focusing on my individuel part. Perlin noise and randomness
    //I want to use noise() drives the fine-tuning of radius, the number of layers, position jitter, and hue/brightness

/** 
 * Code adapted and refactored from Daniel Shiffman's "Random Circles with No Overlap"
 * References:https://github.com/CodingTrain/website-archive/tree/main/Tutorials/P5JS/p5.js/09/9.08_p5.js_Random_Circles_with_No_Overlap
 * This version retains the original logic of avoiding overlap,
 * but integrates our own buffer drawing and animation properties.
 */
// Handle window resizing: reset gradient, buffers, and circle positions
// (Move this function to below draw() to improve readability)
  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    // Rebuilt the gradient to fit the new width
     midStop = random(0.3, 0.7);
     waveGradient = drawingContext.createLinearGradient(0, 0, width, 0);
     waveGradient.addColorStop(0, '#87dfd6');
     waveGradient.addColorStop(midStop, '#01a9b4');
     waveGradient.addColorStop(1, '#01a9b4');

       initCircles(); //reset circles
       waveLayer.resizeCanvas(width, height); //resize offscreen
       initWave(); //reset particle grid
       
      //Reset the interactive layer
      interactiveLayer.resizeCanvas(windowWidth, windowHeight);
      interactiveLayer.clear();
      perlinBubbles = [];
      textParticles = [];
    }

// Initialize non-overlapping floating circles with offscreen buffers
function initCircles() {
    randomCirclePosition = [];
    let circleNumber = 80, tries = 0;

    function isOverlap(x, y, r) {
        return randomCirclePosition.some(cp => dist(x, y, cp.x, cp.y) < r + cp.r + 2);
    }

    function createCircleBuffer(r) {
        let padding = 20;
        let pg = createGraphics((r + padding) * 2, (r + padding) * 2);
        pg.colorMode(HSB, 360, 100, 100);
        pg.clear();
        //choose 20% chance be zigzag style, otherwise hand drawn
        if (random(1) < 0.2) drawZigzagCircleOn(pg, r + padding, r + padding, 10, r * 0.9);
        else  drawHandDrawnCircleOn(pg, r + padding, r + padding, 10, r * 0.9);
        return pg;
    }

    while (randomCirclePosition.length < circleNumber && tries < 10000) {
      let r = random(30, 80);
      let x = random(r, width - r);
      let y = random(r, height - r);
    //collision detection
if (!isOverlap(x, y, r)) {
      let pg = createCircleBuffer(r);
      randomCirclePosition.push({
          x, y, r, pg,
          angle: random(TWO_PI), speed: random([-1,1]) * random(PI/6000, PI/3000),
          floatPhaseX: random(TWO_PI), 
          floatPhaseY: random(TWO_PI), 
          floatAmplitude: random(5,20), 
          noisePhase: random(1000)
        });
      }
    tries++;
  }
  needRedrawBuffers = true; // mark buffers for redraw
}

/**
 * For my Individual Task: Perlin noise and randomness
 * I trying to drive multiple parameters—position jitter, radius variation, layer count, hue/brightness shifts, and stroke weight—using Perlin Noise for smooth, natural motion.
    
 *I drew inspiration and references from:
 * 1. Daniel Shiffman’s “Intro to Perlin Noise,” Part I.2, which shows how p5.js’s noise() can generate continuously varying random values to animate parameters.  
 * https://thecodingtrain.com/tracks/the-nature-of-code-2/noc/perlin/intro-to-perlin-noise/
 * 2. “Flow Fields and Noise Algorithms with p5.js” by Tom Holloway , 
 * demonstrating the use of 3D Perlin Noise to control particle flow fields and color variation—analogous to my multi-layer noise-driven graphics approach.  
 * Sample noise(x * scale, y * scale, z) to get an angle at each point.
 * Convert that to a vector (cos(angle), sin(angle)) to drive particle motion.
 * Use the third dimension z (often means time) to animate over frames.
 * https://dev.to/nyxtom/flow-fields-and-noise-algorithms-with-p5-js-5g67
 * 3. The Coding Train’s “Perlin Noise Flow Field” example, which applies noise() to generate smooth directional offsets for position and rotation in a flow field.  
 * Maintain an array of “particles” each with a position and velocity.
 * At each update, sample angle = TAU * noise(px * inc, py * inc, t).
 * vx = cos(angle) * speed; vy = sin(angle) * speed. Using (vx, vy) to particle position for natural, flowing movement.
 * https://editor.p5js.org/codingtrain/sketches/vDcIAbfg7
     
 * 4. Using Chatgpt to help me understand the reference code.
 * I sample noise(t + phase) each frame to get a smoothly changing value for natural-looking jitter.
 * That same noise value drives dynamicR = baseR * (1 + (noiseVal - 0.5) * amplitude), so circles gently pulse in size.
 * I compute layers = baseLayers + floor((noiseVal - 0.5) * layerRange) to add or remove detail over time.
 * Color shifts come from (noiseVal - 0.5) * shiftAmount` applied to hue and brightness for subtle, continuous modulation.
 * Finally, I map noiseVal into strokeWeight, letting outlines ebb and flow in thickness just like in nature.
 */

    //Main draw loop
    function draw() {
        //Dynamic gradient via Perlin noise, recalc gradient mid-point each frame
        let tGrad = millis() * 0.002; // time-based noise input
        let rawNoise = noise(tGrad + gradPhase);
        let midTarget= 0.5 + (rawNoise - 0.5) * 0.8;
        currentMid   = lerp(currentMid, midTarget, 0.1);
        waveGradient = drawingContext.createLinearGradient(0,0,width,0);
        waveGradient.addColorStop(0, '#87dfd6');
        waveGradient.addColorStop(currentMid, '#01a9b4');
        waveGradient.addColorStop(1, '#01a9b4');
        drawingContext.fillStyle = waveGradient;

        background('#87dfd6'); //background color change

        //Bottom layer: Blobby Wave
        //Blobby Wave: Multiple wave shapes generated using Perlin noise, with increasing vertical spacing and dynamic amplitude
        noStroke();
        drawingContext.shadowOffsetX = 5;
        drawingContext.shadowOffsetY = 10;
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = 'black';
        drawingContext.fillStyle = waveGradient;
        for (let i = height * 0.3; i < height; i += height * 0.1) {
            beginShape();
            let xoff = i / 10;  //The row offset, starting point of noise sampling
            vertex(0, height);
            vertex(0, i);
        for (let x = 0; x < width; x += 0.1) {
            let offset = map(noise(xoff, yoff), 0, 1, -60, 60);
            let yval = i + offset;
            vertex(x, yval);
            xoff += 0.0005; //Smooth transition
        }
        vertex(width, i);
        vertex(width, height);
        endShape(CLOSE);
    }
    yoff += 0.01;  //advance noise to over time

    //Midder Layer: Colorcircle layer
        drawingContext.save();
        drawingContext.shadowOffsetX = 5;
        drawingContext.shadowOffsetY = 10;
        drawingContext.shadowBlur    = 15;
        drawingContext.shadowColor   = 'black';
        let t = millis()*0.001; //Add Time for noise()

        for(let cp of randomCirclePosition){
            cp.angle += cp.speed * deltaTime; //use spin

            //Position jitter via noise
            let ox = sin(t + cp.floatPhaseX) * cp.floatAmplitude;
            let oy = cos(t + cp.floatPhaseY) * cp.floatAmplitude;

            push();
            translate(cp.x + ox, cp.y + oy);
            rotate(cp.angle);
            imageMode(CENTER);
            image(cp.pg, 0, 0);
            pop();
        }
        drawingContext.restore();
    
    //Redraw buffers only if necessary
    //Update the colorcircle details in offscreen buffers based on noise
    if(needRedrawBuffers){
        for(let cp of randomCirclePosition){
            cp.pg.clear();
            cp.pg.colorMode(HSB, 360, 100, 100);

            let n = noise(t + cp.noisePhase); //Noise-driven value
                let dynamicR = cp.r * (1 + (n-0.5)*0.4); //Radius variation
                let layers = 10 + floor((n-0.5)*4); //Layers variation

            if(random(1) < 0.2){
                drawZigzagCircleOn(cp.pg, cp.pg.width/2, cp.pg.height/2, layers, dynamicR, n);
            }else{
                drawHandDrawnCircleOn(cp.pg, cp.pg.width/2, cp.pg.height/2, layers, dynamicR, n);
            }
        }
        needRedrawBuffers = false; //Reset flag
    }

/**
 * For Particle Trails + Fading Residuals:
 *  * The following annotation was drafted with assistance from ChatGPT:
 *    ChatGPT helped outline the offscreen buffer setup and frame-by-frame fade logic.
 * 
 * References
 * Inspired by multiple implementations of offscreen buffering and alpha‐masked background overlays:
 * 1. Inspired by "Blow up the seawater" by Sihua post on xiaohongshu
 *    https://www.xiaohongshu.com/explore/682237ab000000002202fe5e?xsec_token=ABv224DgIC6Rt_NdFakhH5PIlXnh3omjqhokkjiBsXNcw=&xsec_source=pc_user
 * 2. Fading trailing stroke in p5.js” (StackOverflow Q&A)
 *    https://stackoverflow.com/questions/49545643/fading-trailing-stroke-in-p5-js
 *    Demonstrates drawing a translucent background (or rect) each frame to gradually erase older strokes.
 * 3. "Flow_Fields" by Aditi on openprocessing (sketch 2306239)
 *    https://openprocessing.org/sketch/2306239
 *    Interactive particle system using Perlin noise, with a semi‐transparent background for smooth fading trails.
 * 4. Smoke Particle System (p5.js official example)
 *    https://p5js.org/examples/math-and-physics-smoke-particle-system/
 *    Class‐based particles emitted over time, with each draw cycle overlaying a low‐alpha background to fade previous frames.
 */
    //Top Layer: Particle Trails
    // Close the shadow of the main canvas and draw the top layer particles
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur    = 0;
    drawingContext.shadowColor = 'transparent';
    //Step 1: Fade out previous frame’s trails by drawing a low-alph rectangle over the entire buffer with 'destination-out' mode.
    let ctx = waveLayer.drawingContext;
    ctx.save(); ctx.globalCompositeOperation = 'destination-out';
    waveLayer.noStroke(); waveLayer.fill(0, fadeAlpha);
    waveLayer.rect(0,0,width,height);
    ctx.restore(); ctx.globalCompositeOperation = 'source-over';
    
    let baseR = (waveFrame*waveSpeed)%waveMaxR;
    let tt = waveFrame*0.005;
    for (let cell of waveGrid) { 
    if (!cell.dead) {
      let d = dist(cell.x,cell.y,0,0);
      let ang01 = (atan2(cell.y,cell.x)/TWO_PI + 1)%1;
      let off = (noise(ang01*3, tt)-0.5)*noiseAmp;
      if (d < baseR + off) {
        cell.dead = true;
        let n = floor(random(6,12));
        for (let i = 0; i < n; i++) waveParticles.push(new DotParticle(cell.x, cell.y));
        let ch = chars[spawnIdx++ % chars.length];
        waveParticles.push(new LetterParticle(cell.x, cell.y, ch));
      }
    }
  }

  //Step 2: Draw/update all new particles into the offscreen buffer.
  for (let i = waveParticles.length-1; i>=0; i--) {
    let p = waveParticles[i]; p.update(); p.show(waveLayer);
    if (p.dead) waveParticles.splice(i,1);
  }
  waveFrame++;
  //Step 3: Composite the offscreen buffer onto the main canvas.
  image(waveLayer,0,0);
  if (waveGrid.every(c=>c.dead)&&waveParticles.length===0) initWave();

  // Draw the interactive layer (make sure it is on top of all layers)
  drawInteractiveLayer();
  //Add interactive layer, draw ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
        let ripple = ripples[i];
        ripple.update();
        ripple.show();
        if (ripple.isDead()) {
            ripples.splice(i, 1);
        }
    }
}

//initialize grid for particle emission
function initWave() {
  waveGrid=[]; waveParticles=[]; waveFrame=0;
  waveMaxR = sqrt(sq(width)+sq(height));
  for (let y = spacing/2; y < height; y += spacing) {
    for (let x = spacing/2; x < width; x += spacing) {
      waveGrid.push({x,y,dead:false});
    }
  }
}

//Dot particle class for small dots
class DotParticle {
  constructor(x,y){
    this.pos=createVector(x,y);
    this.life=random(150,255);
    this.size=random(6,14);
    this.col = random()<0.2? [60,255,255] : [255,255,255];
    this.dead=false;
  }
  update(){
    let a = noise(this.pos.x*0.005,this.pos.y*0.005,waveFrame*0.004)*TWO_PI*4;
    this.pos.add(p5.Vector.fromAngle(a).mult(random(1,3)));
    this.life-=5; this.size*=0.96;
    if(this.life<=0||this.size<0.5) this.dead=true;
  }
  show(pg){
    pg.colorMode(RGB,255); pg.noStroke();
    pg.fill(this.col[0],this.col[1],this.col[2],this.life);
    pg.ellipse(this.pos.x,this.pos.y,this.size);
  }
}

//Letter particle class for text chars
class LetterParticle {
  constructor(x,y,ch){
    this.pos=createVector(x,y);
    this.life=255;
    this.size=random(16,32);
    this.ch=ch;
    this.noff=random(1000);
    this.dead=false;
  }
  update(){
    let a = noise(this.pos.x*0.005,this.pos.y*0.005,waveFrame*0.004+1000)*TWO_PI*2;
    this.pos.x+=cos(a)*1.5; this.pos.y+=sin(a)*1.5;
    this.life-=4; this.size*=0.98;
    if(this.life<=0||this.size<4) this.dead=true;
  }
  show(pg){
    pg.push(); pg.translate(this.pos.x,this.pos.y);
    pg.rotate(noise(this.noff,waveFrame*0.004)*0.6-0.3);
    pg.noStroke(); pg.fill(60,255,255,this.life*0.7);
    pg.textSize(this.size);
    pg.text(this.ch,0,0);
    pg.pop();
  }
}

// PG: drawHandDrawnCircle //added noiseVal
    function drawHandDrawnCircleOn(g, cx, cy, numLayers, maxRadius, noiseVal = 0.5){
        //Draw semi-transparent handdraw circle layer by layer and add dot on the outermost layer
        for(let i=numLayers;i>0;i--){
            let radius=(i/numLayers)*maxRadius;
            // I changed the fill to randomly pick from the palette instead of random RGB
            let baseCol=color(random(palette));
            //Hue/Brightness tweak via noise
            g.fill(
                hue(baseCol)+(noiseVal-0.5)*80, 
                saturation(baseCol), brightness(baseCol)*(1+(noiseVal-0.5)*0.3),
                80);
            g.noStroke();
            g.ellipse(cx+random(-1,1), cy+random(-1,1), radius*2, radius*2);
        }
        let outerR = maxRadius + 10;
        for (let i = 0; i < 20; i++) {
            let a = TWO_PI * i / 20;
            let dotCol = color(random(palette));
            g.fill(
                hue(dotCol) - (noiseVal - 0.5) * 80,
                saturation(dotCol),
                brightness(dotCol) * (1 + (noiseVal - 0.5) * 0.3),
                80);
                g.noStroke();
                g.ellipse(cx + cos(a)*outerR, cy + sin(a)*outerR, 5, 5);
            }
      }

    /**
     * The following function was adapted from the original `drawZigzagPattern()`
     * in the reference code by Jera0420 (2024). 
     * Source: https://github.com/jera0420/jera0420_MajorProject
     * This function uses trigonometric functions and vertex-based shape creation
     * (not covered in basic coding lessons). It creates a zigzag circle by alternating
     * between inner and outer radius vertex points in a polar coordinate system.
     * I adjusted the strokeWeight to random values for more dynamic visuals.
     * See Zigzagcircle details in sketch4
     */
  //PG:drawZigzagCircle //Add noiseVal
    function drawZigzagCircleOn(g, cx, cy, numLayers, maxRadius, noiseVal = 0.5){ 
        // Used palette color with some transparency
        let baseFillCol = color(random(palette));
        //Hue tweak via noise
        g.fill(
            hue(baseFillCol)+(noiseVal-0.5)*80, 
            saturation(baseFillCol), 
            brightness(baseFillCol)*(1+(noiseVal-0.5)*0.3),
            80);
        g.noStroke();
        g.circle(cx, cy, maxRadius * 2);
        let outerRadius = maxRadius * 0.9;
        let innerRadius = outerRadius * (2 / 3);
        // Also switched stroke color to use palette
        let strokeCol = color(random(palette));
        g.stroke(
            hue(strokeCol) - (noiseVal - 0.5) * 80,
            saturation(strokeCol),
            brightness(strokeCol) * (1 + (noiseVal - 0.5) * 0.3),
            80);
        g.strokeWeight(map(noiseVal,0,1,2,6)); //Stroke weight via noise

        g.beginShape();
        let ang = 0, step = TWO_PI / 60;
        for (let i = 0; i < 60; i++) {
            g.vertex(cx + innerRadius * cos(ang), cy + innerRadius * sin(ang));
            ang += step;
            g.vertex(cx + outerRadius * cos(ang), cy + outerRadius * sin(ang));
            ang += step;
        }
        g.endShape(CLOSE);
        drawHandDrawnCircleOn(g, cx, cy, numLayers, outerRadius * 0.6,noiseVal); //Add noiseVal
    }  


/**
 * This interactive layer was inspired by the following projects:
 * 1. Inspired by the "When the rainy day came" by Sihua post on xiaohongshu and yokoego's photographic works
 *    https://www.xiaohongshu.com/explore/67f88d7c000000001d000250?xsec_token=AB2DwK41iQ8UYLbduODAfTuf3TRNpyZQYICbunKYPiy6U=&xsec_source=
 *    https://www.instagram.com/yokoego/p/C0WLaX5LgCJ/
 * 2. "FlowFields" by Aditys018 on Github
 *     https://github.com/Aditys018/FlowFields
 *    Demonstrates how to use Perlin noise to drive particle movement across a canvas, creating organic, flowing trails with a fading background.
 * 2. "Perlin Noise Flow Field" by Abar23 on Github
 *    https://github.com/Abar23/Perlin-Noise-Flow-Field
 *    Implements a vector field generated from Perlin noise where each particle follows a flow direction based on noise-influenced angles.
 * 3. "Perlin Noise Demonstration" by Tim Murray-Browne on openprocessing (sketch 103588)
 *    https://openprocessing.org/sketch/103588
 *    Visualizes how small input changes to noise() can generate smooth shape deformations.
 *
 * My implementation builds upon these concepts by combining:
 * Offscreen graphics layers for isolated rendering
 * Perlin-driven shape deformation for bubble, simulate trail persistence
 * Interaction mapping via mouse press
 * Use Chatgpt to help me understand and test all thses ideas.
 */

//Add ripple class
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.alpha = 255;
        this.speed = 3;
        this.noiseSeed = random(1000); //Each ripple with independent noise seed
    }

    update() {
        this.radius += this.speed;
        this.alpha -= 5;
    }

    show() {
        stroke(0, 0, 100, this.alpha);
        strokeWeight(2);
        noFill();

        // Generate fluctuation edges using Perlin noise
        beginShape();
        let detail = 60; // edge detail
        for (let i = 0; i < detail; i++) {
            let angle = TWO_PI * i / detail;
            // Noise affects radius offset and generates natural fluctuations
            let noiseOffset = map(noise(angle * 5 + this.noiseSeed, frameCount * 0.02), 0, 1, -10, 10);
            let xPos = this.x + (this.radius + noiseOffset) * cos(angle);
            let yPos = this.y + (this.radius + noiseOffset) * sin(angle);
            vertex(xPos, yPos);
        }
        endShape(CLOSE);
    }

    isDead() {
        return this.alpha <= 0;
    }
}
function drawInteractiveLayer() {
    //Clear the interaction layer (keep the transparency)
    interactiveLayer.drawingContext.globalCompositeOperation = 'destination-out';
    //Change high transparency to accelerate the clearance speed
    interactiveLayer.fill(0, 0, 0, 15);
    interactiveLayer.rect(0, 0, width, height);
    interactiveLayer.drawingContext.globalCompositeOperation = 'source-over';
    
    // Update and draw the Perlin bubble
    for (let i = perlinBubbles.length - 1; i >= 0; i--) {
        perlinBubbles[i].update();
        perlinBubbles[i].show(interactiveLayer);
        if (perlinBubbles[i].isDead()) {
            perlinBubbles.splice(i, 1);
        }
    }
    
    // Update and draw the text particles
    for (let i = textParticles.length - 1; i >= 0; i--) {
        textParticles[i].update();
        textParticles[i].show(interactiveLayer);
        if (textParticles[i].isDead()) {
            textParticles.splice(i, 1);
        }
    }
    
    // Draw the interactive layer onto the main canvas
    image(interactiveLayer, 0, 0);
}

// Add mouse click: short press generates ripple + Perlin bubble
function mouseClicked() {
    if (millis() - lastPressTime < PRESS_DURATION) {
        isLongPress = true;
        lastPressTime = millis();
        setTimeout(() => {
            isLongPress = false;
        }, PRESS_DURATION);
    } else {
        lastPressTime = millis();
        perlinBubbles.push(new PerlinBubble(mouseX, mouseY));
    }
}

function mouseReleased() {
    isLongPress = false;
}


// Perlin Bubble type (with noise fluctuation effect)
class PerlinBubble {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = random(80, 150);
        this.alpha = 255;
        this.speed = random(1.5, 3);
        this.noiseSeed = random(1000); // Each bubble has an independent noise seed
    }
    
    update() {
        this.radius += this.speed;
        this.alpha -= 3;
        if (this.radius > this.maxRadius) {
            this.alpha -= 5;
        }
    }
    
    show(pg) {
        pg.push();
        pg.noFill();
        pg.stroke(50, 150, 255, this.alpha); // Blue strokes
        pg.strokeWeight(2);
        
        // Generate fluctuation edges using Perlin noise
        pg.beginShape();
        let detail = 60; // Edge detail points
        for (let i = 0; i < detail; i++) {
            let angle = TWO_PI * i / detail;
            // Noise affects radius offset and generates natural fluctuations
            let noiseOffset = map(noise(angle * 5 + this.noiseSeed, frameCount * 0.02), 0, 1, -10, 10);
            let xPos = this.x + (this.radius + noiseOffset) * cos(angle);
            let yPos = this.y + (this.radius + noiseOffset) * sin(angle);
            pg.vertex(xPos, yPos);
        }
        pg.endShape(CLOSE);
        
        pg.pop();
    }
    
    isDead() {
        return this.alpha <= 0;
    }
}