
import * as THREE from "three";

// --------------------------------
// BASIC THREE.JS SETUP
// --------------------------------

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 55, 230);

const camera = new THREE.PerspectiveCamera(
  65,
  innerWidth / innerHeight,
  0.1,
  500
);

camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.getElementById("game").prepend(renderer.domElement);

// --------------------------------
// LIGHTING
// --------------------------------

scene.add(new THREE.HemisphereLight(
  0xffffff,
  0x52654a,
  2
));

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(-20, 35, 15);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

// --------------------------------
// MATERIALS
// --------------------------------

const mat = (color, roughness = 0.7, metalness = 0) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness
  });

const grassMat = mat(0x477d37);
const roadMat = mat(0x292c31);
const lineMat = mat(0xffffff);
const tireMat = mat(0x101014);
const glassMat = new THREE.MeshStandardMaterial({
  color: 0x142e43,
  metalness: 0.5,
  roughness: 0.2
});

// --------------------------------
// GROUND
// --------------------------------

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  grassMat
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
ground.position.z = -150;
ground.receiveShadow = true;
scene.add(ground);

// --------------------------------
// ROAD
// --------------------------------

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 500),
  roadMat
);

road.rotation.x = -Math.PI / 2;
road.position.y = -0.05;
road.position.z = -150;
road.receiveShadow = true;
scene.add(road);

// Road boundaries
for (const x of [-7, 7]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.18, 500),
    mat(0xffdd44)
  );

  edge.position.set(x, 0.04, -150);
  scene.add(edge);
}

// --------------------------------
// ROAD MARKINGS
// --------------------------------

const roadLines = [];

for (const x of [-2.33, 2.33]) {
  for (let i = 0; i < 35; i++) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.035, 4),
      lineMat
    );

    line.position.set(x, 0.025, -i * 9);
    scene.add(line);
    roadLines.push(line);
  }
}

// --------------------------------
// CAR CREATOR
// --------------------------------

function createCar(color) {
  const car = new THREE.Group();

  const bodyMat = mat(color, 0.28, 0.65);

  // Main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.55, 3.3),
    bodyMat
  );

  body.position.y = 0.65;
  body.castShadow = true;
  car.add(body);

  // Hood
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.2, 1.1),
    bodyMat
  );

  hood.position.set(0, 0.96, -1);
  car.add(hood);

  // Cabin
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.65, 1.55),
    glassMat
  );

  cabin.position.set(0, 1.12, 0.25);
  cabin.castShadow = true;
  car.add(cabin);

  // Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.09, 1.3),
    bodyMat
  );

  roof.position.set(0, 1.48, 0.25);
  car.add(roof);

  // Wheels
  const wheels = [];

  for (const x of [-0.86, 0.86]) {
    for (const z of [-1.05, 1.05]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.37, 0.37, 0.23, 20),
        tireMat
      );

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.38, z);
      wheel.castShadow = true;
      car.add(wheel);
      wheels.push(wheel);
    }
  }

  // Headlights
  for (const x of [-0.55, 0.55]) {
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.16, 0.08),
      mat(0xffffff, 0.2, 0.1)
    );

    light.position.set(x, 0.77, -1.67);
    car.add(light);
  }

  // Tail lights
  for (const x of [-0.55, 0.55]) {
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.13, 0.08),
      mat(0xff1111)
    );

    light.position.set(x, 0.75, 1.67);
    car.add(light);
  }

  car.userData.wheels = wheels;

  return car;
}

// --------------------------------
// PLAYER
// --------------------------------

const player = createCar(0x00aaff);
player.position.set(0, 0, 5);
scene.add(player);

// --------------------------------
// ENVIRONMENT
// --------------------------------

const scenery = [];

function createTree(x, z) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
    mat(0x68452a)
  );

  trunk.position.y = 1;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1.3, 3.5, 9),
    mat(0x17662b)
  );

  leaves.position.y = 3.2;
  tree.add(leaves);

  tree.position.set(x, 0, z);
  scene.add(tree);
  scenery.push(tree);
}

for (let i = 0; i < 35; i++) {
  createTree(-11 - Math.random() * 8, -i * 13);
  createTree(11 + Math.random() * 8, -i * 13);
}

// Buildings
function createBuilding(x, z) {
  const height = 5 + Math.random() * 13;

  const building = new THREE.Mesh(
    new THREE.BoxGeometry(4, height, 5),
    mat([0x9babb7, 0x687d91, 0xc1b5a2][
      Math.floor(Math.random() * 3)
    ])
  );

  building.position.set(x, height / 2, z);
  scene.add(building);
  scenery.push(building);
}

for (let i = 0; i < 20; i++) {
  createBuilding(-25, -i * 22);
  createBuilding(25, -i * 22);
}

// --------------------------------
// TRAFFIC
// --------------------------------

const traffic = [];
const lanes = [-4.6, 0, 4.6];
const colors = [
  0xff3333,
  0xffcc00,
  0xffffff,
  0x44cc66,
  0x9933ff
];

function spawnTraffic() {
  const car = createCar(
    colors[Math.floor(Math.random() * colors.length)]
  );

  const lane = lanes[Math.floor(Math.random() * 3)];

  car.position.set(lane, 0, -150 - Math.random() * 40);

  scene.add(car);
  traffic.push(car);
}

for (let i = 0; i < 5; i++) {
  spawnTraffic();
  traffic[i].position.z = -35 - i * 29;
}

// --------------------------------
// GAME VARIABLES
// --------------------------------

let running = false;
let speed = 0;
let distance = 0;
let score = 0;
let nitro = 100;
let steering = 0;
let gas = false;
let brake = false;
let nitroOn = false;
let lastTime = 0;

const keys = {};

const speedEl = document.getElementById("speed");
const distanceEl = document.getElementById("distance");
const scoreEl = document.getElementById("score");
const nitroFill = document.getElementById("nitroFill");

// --------------------------------
// INPUT
// --------------------------------

addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === "Space") {
    e.preventDefault();
    nitroOn = true;
  }
});

addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;

  if (e.code === "Space") {
    nitroOn = false;
  }
});

function bindButton(id, down, up) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    down();
  });

  button.addEventListener("pointerup", up);
  button.addEventListener("pointercancel", up);
  button.addEventListener("pointerleave", up);
}

bindButton("leftBtn", () => steering = -1, () => {
  if (steering === -1) steering = 0;
});

bindButton("rightBtn", () => steering = 1, () => {
  if (steering === 1) steering = 0;
});

bindButton("gasBtn", () => gas = true, () => gas = false);
bindButton("brakeBtn", () => brake = true, () => brake = false);
bindButton("nitroBtn", () => nitroOn = true, () => nitroOn = false);

// --------------------------------
// START AND RESTART
// --------------------------------

function startGame() {
  speed = 0;
  distance = 0;
  score = 0;
  nitro = 100;

  player.position.x = 0;

  traffic.forEach((car, i) => {
    car.position.set(
      lanes[Math.floor(Math.random() * 3)],
      0,
      -40 - i * 28
    );
  });

  running = true;

  document.getElementById("message").classList.add("hidden");
  document.getElementById("gameOver").classList.add("hidden");
}

document.getElementById("startBtn").onclick = startGame;
document.getElementById("restartBtn").onclick = startGame;

// --------------------------------
// COLLISION
// --------------------------------

function checkCollision() {
  for (const car of traffic) {
    const dx = Math.abs(car.position.x - player.position.x);
    const dz = Math.abs(car.position.z - player.position.z);

    if (dx < 1.45 && dz < 2.3) {
      gameOver();
      return;
    }
  }
}

function gameOver() {
  running = false;

  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalDistance").textContent =
    Math.floor(distance);

  document.getElementById("gameOver").classList.remove("hidden");
}

// --------------------------------
// GAME UPDATE
// --------------------------------

function update(dt) {
  if (!running) return;

  const forward = keys["w"] || keys["arrowup"] || gas;
  const backward = keys["s"] || keys["arrowdown"] || brake;
  const left = keys["a"] || keys["arrowleft"];
  const right = keys["d"] || keys["arrowright"];

  const turn = (right ? 1 : 0) - (left ? 1 : 0);
  const activeNitro = nitroOn && nitro > 0 && speed > 20;

  if (forward) speed += 30 * dt;
  else speed -= 8 * dt;

  if (backward) speed -= 45 * dt;

  if (activeNitro) {
    speed += 45 * dt;
    nitro -= 25 * dt;
  } else {
    nitro += 5 * dt;
  }

  nitro = THREE.MathUtils.clamp(nitro, 0, 100);
  speed = THREE.MathUtils.clamp(speed, 0, 180);

  const speedFactor = speed / 100;

  player.position.x += turn * (4 + speedFactor * 2) * dt;

  player.position.x = THREE.MathUtils.clamp(
    player.position.x, -5.2, 5.2
  );

  player.rotation.z = THREE.MathUtils.lerp(
    player.rotation.z,
    -turn * 0.13,
    5 * dt
  );

  player.rotation.y = THREE.MathUtils.lerp(
    player.rotation.y,
    -turn * 0.12,
    5 * dt
  );

  // Wheel rotation
  player.userData.wheels.forEach(wheel => {
    wheel.rotation.x += speedFactor * 0.2;
  });

  // Road animation
  const movement = speedFactor * 1.5;

  roadLines.forEach(line => {
    line.position.z += movement * 60 * dt;

    if (line.position.z > 12) {
      line.position.z -= 315;
    }
  });

  // Traffic movement
  traffic.forEach(car => {
    car.position.z += (speed / 3.6 + 25) * dt;

    car.userData.wheels.forEach(wheel => {
      wheel.rotation.x += speedFactor * 0.2;
    });

    if (car.position.z > 15) {
      car.position.z = -170 - Math.random() * 30;
      car.position.x =
        lanes[Math.floor(Math.random() * lanes.length)];
      score += 10;
    }
  });

  // Scenery movement
  scenery.forEach(object => {
    object.position.z += movement * 60 * dt;

    if (object.position.z > 15) {
      object.position.z -= 455;
    }
  });

  distance += speed * dt / 3.6;
  score += Math.floor(speed * dt / 12);

  checkCollision();

  speedEl.textContent = Math.round(speed);
  distanceEl.textContent = Math.floor(distance);
  scoreEl.textContent = score;
  nitroFill.style.width = nitro + "%";

  // Camera follows player
  camera.position.x = THREE.MathUtils.lerp(
    camera.position.x,
    player.position.x * 0.4,
    3 * dt
  );

  camera.position.y = 6 + speedFactor * 0.5;
  camera.lookAt(player.position.x * 0.25, 0.7, -8);
}

// --------------------------------
// ANIMATION
// --------------------------------

function animate(time) {
  requestAnimationFrame(animate);

  const dt = Math.min((time - lastTime) / 1000 || 0, 0.05);
  lastTime = time;

  update(dt);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

// --------------------------------
// RESIZE
// --------------------------------

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
});

// --------------------------------
// READY
// --------------------------------

document.getElementById("loading").style.display = "none";
