let flock;

function setup() {
  createCanvas(800, 600);
  flock = new Flock();
  for (let i = 0; i < 120; i++) {
    let boid = new Boid(width / 2, height / 2);
    flock.addBoid(boid);
  }
}

function draw() {
  background(173, 216, 230, 160);
  flock.run();
}
function mouseDragged() {
  if(mouseButton==RIGHT){
      f
  }
  else{
    flock.addBoid(new Boid(mouseX, mouseY));
  }
}
