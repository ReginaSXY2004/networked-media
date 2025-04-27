// function setup() {
//   createCanvas(window.innerWidth, window.innerHeight);
// }

// function draw() {
//   background('lightblue');
// }

const mySketch = (p5Instance) => {
    p5Instance.setup = () => {
      p5Instance.createCanvas(400, 400)
    }
  
    p5Instance.draw = () => {
      p5Instance.background('lightgreen')
    }
  }
  
  let myNewP5Sketch = new p5(mySketch, 'canvas1')
  
  // needs to have new and separate variables for each canvas you are putting on the screen
  const mySketch2 = (p5Instance) => {
    p5Instance.setup = () => {
      p5Instance.createCanvas(400, 400)
    }
  
    p5Instance.draw = () => {
      p5Instance.background('lightpink')
    }
  }
  
  let myNewP5Sketch2 = new p5(mySketch2, 'canvas2')