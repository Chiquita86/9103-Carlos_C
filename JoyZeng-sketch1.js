// I added a color palette extracted from the painting ‘Wheel of Fortune’ instead of random RGB 
let palette = [
    "#b4518c", "#beadcc", "#53569d", "#dc8a4d", "#444a1f", "#d8c16f", 
    "#db4c5b", "#52b266", "#537bba", "#8e342d", "#6a81ca", "#cbb6b7"];
// I added a slider to adjust the hue and brightness of the image

//Remove Hue and Brightness Sliders and Revert to Static HSB Color Rendering
//delete: let hueSlider, brightnessSlider; 

/**
 * I use the needRedrawBuffers flag and buffers to avoid redrawing everything on every frame, rebuilding caches only when necessary.
 * Reference: https://p5js.org/reference/p5/redraw/
 */
let needRedrawBuffers = true; //Added flag for noise-driven redraw
let randomCirclePosition = [];//replace grid array

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
 * 3. “Blobby Wave” by takawo on OpenProcessing (sketch '857874')
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

function setup() {
    createCanvas(windowWidth, windowHeight);
    // noLoop(); // kept from original, but commented out so draw() loops for continuous rotation
    colorMode(HSB, 360, 100, 100);

    //The Blobby wave: shadow and gradient
      drawingContext.shadowOffsetX = 5;
      drawingContext.shadowOffsetY = 10;
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'black';

      // Create a horizontal linear gradient background for wave filling
      let c1 = '#87dfd6';
      let c2 = '#01a9b4';
      let c3 = '#01a9b4';
      let gradient = drawingContext.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0.0, c1);
      gradient.addColorStop(random(0.3,0.7), c2); //Switch colors at random in the middle section
      gradient.addColorStop(1.0, c3);
      drawingContext.fillStyle = gradient;

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

    //Randomly place non-overlapping circles on the canvas and cache in offscreen buffers
    let circleNumber = 100; //circle number //changed from 50 to 100
    let tries = 0;

    while(randomCirclePosition.length < circleNumber && tries < 10000){//non-overlapping circles with random radius
        let r = random(30, 80);
        let x = random(r, width - r);
        let y = random(r, height - r);

        // Collision Detection
        let overlapping = false;
        for(let cp of randomCirclePosition){
            let d = dist(x, y, cp.x, cp.y);
            if(d < r +cp.r +2){//confirm the circles distance
                overlapping = true;
                break;
            }
        }

        if (!overlapping){
            let padding = 20; // Added padding for offscreen buffer, prevent edge cutting
            let pg = createGraphics((r+padding)*2, (r+padding)*2);
            pg.colorMode(HSB, 360, 100, 100);
            pg.clear();

            //20% drawing in the zigzag style; otherwise, in the hand-drawn style
            if(random(1) <  0.2){
                drawZigzagCircleOn(pg, r+padding, r+padding, 10, r * 0.9);
            }else{
                drawHandDrawnCircleOn(pg, r+padding, r+padding, 10, r * 0.9);
            }

            let angle = random(TWO_PI);
            let speed = random([-1, 1]) * random(PI / 6000, PI / 3000);

            //Use noise() to drive
            randomCirclePosition.push({
                x, y, r, pg, angle, speed,
                floatPhaseX: random(TWO_PI), //Noise phase for jitter
                floatPhaseY: random(TWO_PI),
                floatSpeedX: random(0.001, 0.005),
                floatSpeedY: random(0.001, 0.005),
                floatAmplitude: random(5, 20), //change the value, expand the floating range
                noisePhase: random(1000), //add noise offset for radius/layers/hue
            });
        }
        tries++;
      }
    }

    // When the window size changes, adjust the canvas and reset the wave gradient and ring array
    function windowResized() {
        resizeCanvas(windowWidth, windowHeight);

    // Reset the gradient to fit the new width
    let c1 = '#87dfd6', c2 = '#01a9b4', c3 = '#01a9b4';
    let gradient = drawingContext.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0.0, c1);
    gradient.addColorStop(random(0.3,0.7), c2);
    gradient.addColorStop(1.0, c3);
    drawingContext.fillStyle = gradient;
    
    // Clear the old color circle data and regenerate it
    randomCirclePosition = [];
    let circleNumber = 100, tries = 0;
    while (randomCirclePosition.length < circleNumber && tries < 10000) {
    let r = random(30, 80);
    let x = random(r, width - r);
    let y = random(r, height - r);
    if (!randomCirclePosition.some(cp => dist(x, y, cp.x, cp.y) < cp.r + r + 2)) {
      let padding = 20;
      let pg = createGraphics((r + padding)*2, (r + padding)*2);
      pg.colorMode(HSB, 360, 100, 100);
      pg.clear();
      randomCirclePosition.push({
        x, y, r, pg,
        angle: random(TWO_PI),
        speed: random([-1,1]) * random(PI/6000, PI/3000),
        floatPhaseX: random(TWO_PI),
        floatPhaseY: random(TWO_PI),
        floatAmplitude: random(5,20),
        noisePhase: random(1000),
      });
    }
    tries++;
  }
  needRedrawBuffers = true;
}

    /**
     * For my Individual Task: Perlin noise and randomness
     * I trying to drive multiple parameters—position jitter, radius variation, layer count, hue/brightness shifts, and stroke weight—using Perlin Noise for smooth, natural motion.
    
    * I drew inspiration and references from:
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

    //Blobby Wave: Multiple wave shapes are generated using noise(), and the frequency of each wave increases
    function draw() {
        background('#87dfd6'); //background color change
        noStroke();
        drawingContext.fill();

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
    yoff += 0.01;  //add time dimension of noise to form animation

        //Colorcircle layer on the Blobby wave layer
        let t = millis()*0.001; //Add Time for noise()

        for(let cp of randomCirclePosition){
            cp.angle += cp.speed * deltaTime; //use spin

            //Position jitter via noise
            let offsetX = sin(t + cp.floatPhaseX) * cp.floatAmplitude;
            let offsetY = cos(t + cp.floatPhaseY) * cp.floatAmplitude;

            push();
            translate(cp.x + offsetX, cp.y + offsetY);
            rotate(cp.angle);
            imageMode(CENTER);
            image(cp.pg, 0, 0);
            pop();
        }

    //Redraw buffers only if necessary
    // Update the colorcircle details in offscreen buffers based on noise
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

        //let dot=20;
        //let outDotRadius=outerMostRadius+10;
        //for(let i=0;i<dot;i++){
            //let angle=TWO_PI*i/dot;
            //let x=cx+outDotRadius*cos(angle);
            //let y=cy+outDotRadius*sin(angle);
            // Also updated the dot colors to be picked from the palette
            //let baseDotCol=color(random(palette));
            //brightness tweak via noise
            //g.fill(hue(baseDotCol)-(noiseVal-0.5)*80, saturation(baseDotCol), brightness(baseDotCol)*(1+(noiseVal-0.5)*0.3),80);
            //g.noStroke();
            //g.ellipse(x,y,5,5);
        //}

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

    //Responsive design
    //function windowResized() {
        //resizeCanvas(windowWidth, windowHeight); 
        // Regenerate the circular array to adapt to the new window
        //randomCirclePosition = [];
        //let circleNumber = 100;
        //let tries = 0;

        //while (randomCirclePosition.length < circleNumber && tries < 10000) {
            //let r = random(30, 80); // random radius
            //let x = random(r, width - r);
            //let y = random(r, height - r);

            //let overlap = randomCirclePosition.some(cp => dist(x, y, cp.x, cp.y) < cp.r + r + 2);
            
            //if (!overlap) {
              // use expanded buffer size
              //let padding = 20;
              //let pg = createGraphics((r+padding)*2, (r+padding)*2);
              //pg.colorMode(HSB, 360, 100, 100);
              //pg.clear();

              //randomCirclePosition.push({
                //x, y, r, pg,
                //angle: random(TWO_PI),
                //speed: random([-1, 1]) * random(PI / 6000, PI / 3000),
                //floatPhaseX: random(TWO_PI),
                //floatPhaseY: random(TWO_PI),
                //floatSpeedX: random(0.001, 0.005),
                //floatSpeedY: random(0.001, 0.005),
                //floatAmplitude: random(5, 20),
                //noisePhase: random(1000),
              //});
            //}
            //tries++;
        //}

        //needRedrawBuffers = true; //rubuilt buffer
    //}
