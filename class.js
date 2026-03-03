class Flock {

  constructor() {
    this.boids = []; 
    this.grid = new Map();
  }

  buildGrid() {
    this.grid.clear();
    for (let b of this.boids) {
      let gx = floor(b.position.x / gridSize);
      let gy = floor(b.position.y / gridSize);
      let key = gx + "," + gy;
      if (!this.grid.has(key)) this.grid.set(key, []);
      this.grid.get(key).push(b);
    }
  }

  getNeighbors(boid) {
    let neighbors = [];
    let gx = floor(boid.position.x / gridSize);
    let gy = floor(boid.position.y / gridSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        let key = (gx + dx) + "," + (gy + dy);
        if (this.grid.has(key)) {
          neighbors.push(...this.grid.get(key));
        }
      }
    }
    return neighbors;
  }

  run() {
    this.buildGrid();

    for (let boid of this.boids) {
      let nearby = this.getNeighbors(boid);
      boid.run(nearby);

      if(keyIsPressed&&key=="w"){
        this.attracting = true;
      }
      else{
        this.attracting = false;
      }
    }
  }

  addBoid(b) {
    this.boids.push(b);
  }
}


class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.r = 5.0;
    this.maxspeed = 3;
    this.maxforce = 0.05; 
  }

  run(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.show();

  }

  applyForce(force) {
    this.acceleration.add(force);
  }
  flock(boids) {
    if(keyIsPressed && key == "w"){
      let mouse = createVector(mouseX-this.position.x,mouseY-this.position.y);
      mouse.setMag(0.3);
      this.applyForce(mouse);
    }
    let sep = this.separate(boids); 
    let ali = this.align(boids); 
    let coh = this.cohere(boids); 
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  }
  show() {
    let angle = this.velocity.heading();
    fill(127);
    stroke(0);
    push();
    translate(this.position.x, this.position.y);
    circle(0,0,this.r);
    /*
    rotate(angle);
    beginShape();
    vertex(this.r * 2, 0);
    vertex(-this.r * 2, -this.r);
    vertex(-this.r * 2, this.r);
    endShape(CLOSE);
    */
    pop();
  }
  borders() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }

  separate(boids) {
    let desiredSeparation = 25;
    let steer = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, boids[i].position);
        diff.normalize();
        diff.div(d); 
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  align(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }
  cohere(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0); 
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].position); 
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); 
    } else {
      return createVector(0, 0);
    }
  }
}
