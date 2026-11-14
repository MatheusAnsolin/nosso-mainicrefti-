
import * as THREE from
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ========================================
// 1. CONFIGURAÇÃO E CENA
// ========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 35, 105);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 200
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.querySelector('#game').prepend(renderer.domElement);

const clock = new THREE.Clock();

scene.add(new THREE.HemisphereLight(0xffffff, 0x718b55, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(-30, 60, 30);
scene.add(sunlight);

// ========================================
// 2. MATERIAIS E OBJETOS
// ========================================

function material(color) {
  return new THREE.MeshLambertMaterial({ color });
}

const materials = {
  grass: material(0x69ae45),
  dirt: material(0x986438),
  trunk: material(0x80502b),
  leaves: material(0x39883a),
  stone: material(0x858b91),
  road: material(0x50545a),
  line: material(0xf5e7a1),
  blue: material(0x2378df),
  darkBlue: material(0x174d99),
  black: material(0x25282c),
  glass: new THREE.MeshLambertMaterial({
    color: 0x9bd8ed,
    transparent: true,
    opacity: 0.7
  }),
  skin: material(0xf0bd8b),
  shirt: material(0xe4a32f),
  pants: material(0x315a9d)
};

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

function cube(x, y, z, sx, sy, sz, mat, parent = scene) {
  const mesh = new THREE.Mesh(
    cubeGeometry,
    mat
  );

  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  parent.add(mesh);
  return mesh;
}

// ========================================
// 3. TERRENO E ESTRADA
// ========================================

cube(0, -0.55, 0, 110, 1, 110, materials.grass);

// Estrada principal
cube(0, -0.015, 0, 9, 0.08, 105, materials.road);

// Marcas da estrada
for (let z = -48; z < 50; z += 7) {
  cube(0, 0.04, z, 0.22, 0.04, 3, materials.line);
}

// Pequenas áreas de terra
for (let i = 0; i < 18; i++) {
  const x = (i % 6) * 4 - 10;
  const z = Math.floor(i / 6) * 9 - 10;
  cube(x, 0.01, z, 3, 0.04, 3, materials.dirt);
}

// ========================================
// 4. ÁRVORES E RECURSOS
// ========================================

const trees = [];

function createTree(x, z, size = 1) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(size);

  const trunk = cube(
    0, 1.1, 0, 0.65, 2.2, 0.65,
    materials.trunk, group
  );

  const leaves = cube(
    0, 3.0, 0, 2.6, 2.5, 2.6,
    materials.leaves, group
  );

  cube(
    0, 4.2, 0, 1.7, 1.6, 1.7,
    materials.leaves, group
  );

  group.userData.resource = true;
  group.userData.trunk = trunk;
  group.userData.leaves = leaves;

  scene.add(group);
  trees.push(group);
  return group;
}

// Distribuição organizada, mantendo a estrada livre.
for (let z = -42; z <= 42; z += 10) {
  createTree(-10, z, 0.9 + Math.random() * 0.3);
  createTree(10, z + 4, 0.9 + Math.random() * 0.3);
}

for (let i = 0; i < 35; i++) {
  const side = Math.random() > 0.5 ? 1 : -1;
  const x = side * (15 + Math.random() * 25);
  const z = -45 + Math.random() * 90;
  createTree(x, z, 0.7 + Math.random() * 0.6);
}

// Pedras decorativas
for (let i = 0; i < 24; i++) {
  const x = (Math.random() > 0.5 ? 1 : -1) *
    (7 + Math.random() * 35);
  const z = -45 + Math.random() * 90;

  const rock = cube(
    x, 0.4, z,
    1 + Math.random(),
    0.8 + Math.random(),
    1 + Math.random(),
    materials.stone
  );
  rock.rotation.y = Math.random();
}

// ========================================
// 5. PERSONAGEM
// ========================================

const player = new THREE.Group();

const body = cube(0, 1.2, 0, 0.8, 1.1, 0.45, materials.shirt, player);
const head = cube(0, 2.05, 0, 0.7, 0.7, 0.7, materials.skin, player);
const legs = cube(0, 0.48, 0, 0.7, 0.9, 0.4, materials.pants, player);

// Olhos
cube(-0.17, 2.1, 0.36, 0.09, 0.1, 0.04, materials.black, player);
cube(0.17, 2.1, 0.36, 0.09, 0.1, 0.04, materials.black, player);

player.position.set(-3, 0, 12);
scene.add(player);

let playerAngle = Math.PI;
let playerVerticalVelocity = 0;
let onGround = true;

// ========================================
// 6. CARRO
// ========================================

const car = new THREE.Group();

cube(0, 0.7, 0, 2.4, 0.8, 4, materials.blue, car);
cube(0, 1.4, -0.3, 1.9, 0.8, 2.0, materials.darkBlue, car);
cube(0, 1.45, 0.72, 1.65, 0.55, 0.08, materials.glass, car);

// Rodas
const wheels = [];

for (const x of [-1.2, 1.2]) {
  for (const z of [-1.3, 1.3]) {
    const wheel = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.85, 0.75),
      materials.black
    );
    wheel.position.set(x, 0.48, z);
    car.add(wheel);
    wheels.push(wheel);
  }
}

cube(-0.7, 0.65, 2.02, 0.35, 0.25, 0.08, material(0xffe6a0), car);
cube(0.7, 0.65, 2.02, 0.35, 0.25, 0.08, material(0xffe6a0), car);

car.position.set(3, 0, 7);
scene.add(car);

let driving = false;
let carSpeed = 0;

// ========================================
// 7. INVENTÁRIO E INTERAÇÃO
// ========================================

let wood = 0;

function updateInventory() {
  document.querySelector('#wood-count').textContent = wood;
}

function showMessage(message) {
  const element = document.querySelector('#message');
  element.textContent = message;
}

function distance(a, b) {
  return a.position.distanceTo(b.position);
}

function interact() {
  if (driving) {
    exitCar();
    return;
  }

  if (distance(player, car) < 4.5) {
    enterCar();
    return;
  }

  let nearest = null;
  let nearestDistance = 4.5;

  for (const tree of trees) {
    if (!tree.userData.resource) continue;

    const d = distance(player, tree);
    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = tree;
    }
  }

  if (nearest) {
    nearest.userData.resource = false;
    scene.remove(nearest);
    wood += 3;
    updateInventory();
    showMessage('🪵 Você coletou 3 madeiras!');
  } else {
    showMessage('Chegue perto de uma árvore ou do carro!');
  }
}

function enterCar() {
  driving = true;
  carSpeed = 0;
  document.body.classList.add('driving');
  document.querySelector('#vehicle-panel').classList.add('active');
  document.querySelector('.bottom-ui').style.display = 'none';
  showMessage('🚗 Vamos passear!');
}

function exitCar() {
  driving = false;
  carSpeed = 0;
  document.body.classList.remove('driving');
  document.querySelector('#vehicle-panel').classList.remove('active');
  document.querySelector('.bottom-ui').style.display = 'flex';

  player.position.set(
    car.position.x + 2.5,
    0,
    car.position.z
  );

  playerAngle = car.rotation.y;
  showMessage('Você saiu do carro!');
}

// ========================================
// 8. CONTROLES
// ========================================

const keys = {
  forward: false,
  back: false,
  left: false,
  right: false
};

const keyMap = {
  w: 'forward',
  ArrowUp: 'forward',
  s: 'back',
  ArrowDown: 'back',
  a: 'left',
  ArrowLeft: 'left',
  d: 'right',
  ArrowRight: 'right'
};

window.addEventListener('keydown', (event) => {
  const key = event.key;

  if (keyMap[key]) {
    keys[keyMap[key]] = true;
    event.preventDefault();
  }

  if (key.toLowerCase() === 'e' && !event.repeat) {
    interact();
  }

  if (key === ' ' && !event.repeat && !driving) {
    jump();
  }
});

window.addEventListener('keyup', (event) => {
  if (keyMap[event.key]) {
    keys[keyMap[event.key]] = false;
  }
});

document.querySelectorAll('[data-control]').forEach(button => {
  const control = button.dataset.control;

  const press = (event) => {
    event.preventDefault();
    keys[control] = true;
    button.classList.add('pressed');
  };

  const release = (event) => {
    event.preventDefault();
    keys[control] = false;
    button.classList.remove('pressed');
  };

  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
});

document.querySelector('#action-button').addEventListener('click', interact);
document.querySelector('#exit-car').addEventListener('click', exitCar);
document.querySelector('#jump-button').addEventListener('click', jump);

function jump() {
  if (onGround && !driving) {
    playerVerticalVelocity = 7;
    onGround = false;
  }
}

// ========================================
// 9. MOVIMENTAÇÃO
// ========================================

const playerSpeed = 7;
const carAcceleration = 13;
const carMaxSpeed = 19;

function updatePlayer(delta) {
  const forward = Number(keys.forward) - Number(keys.back);
  const turn = Number(keys.left) - Number(keys.right);

  if (forward !== 0) {
    playerAngle += turn * delta * 2.2;

    const direction = new THREE.Vector3(
      Math.sin(playerAngle),
      0,
      Math.cos(playerAngle)
    );

    player.position.addScaledVector(
      direction,
      forward * playerSpeed * delta
    );
  } else {
    playerAngle += turn * delta * 2.2;
  }

  player.rotation.y = playerAngle;

  // Gravidade e salto
  playerVerticalVelocity -= 19 * delta;
  player.position.y += playerVerticalVelocity * delta;

  if (player.position.y <= 0) {
    player.position.y = 0;
    playerVerticalVelocity = 0;
    onGround = true;
  }

  player.position.x = THREE.MathUtils.clamp(player.position.x, -51, 51);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -51, 51);
}

function updateCar(delta) {
  const forward = Number(keys.forward) - Number(keys.back);
  const turn = Number(keys.left) - Number(keys.right);

  carSpeed += forward * carAcceleration * delta;
  carSpeed *= Math.pow(0.94, delta * 60);

  carSpeed = THREE.MathUtils.clamp(
    carSpeed, -carMaxSpeed * 0.45, carMaxSpeed
  );

  if (Math.abs(carSpeed) > 0.2) {
    car.rotation.y += turn * delta *
      1.6 * Math.sign(carSpeed);
  }

  const direction = new THREE.Vector3(
    Math.sin(car.rotation.y),
    0,
    Math.cos(car.rotation.y)
  );

  car.position.addScaledVector(direction, carSpeed * delta);

  car.position.x = THREE.MathUtils.clamp(car.position.x, -51, 51);
  car.position.z = THREE.MathUtils.clamp(car.position.z, -51, 51);

  for (const wheel of wheels) {
    wheel.rotation.x += carSpeed * delta;
  }

  player.position.copy(car.position);
}

// ========================================
// 10. CÂMERA
// ========================================

const cameraTarget = new THREE.Vector3();

function updateCamera(delta) {
  const target = driving ? car : player;

  const angle = driving ? car.rotation.y : playerAngle;
  const distanceBehind = driving ? 10 : 7;
  const height = driving ? 6 : 5;

  const desired = new THREE.Vector3(
    target.position.x - Math.sin(angle) * distanceBehind,
    target.position.y + height,
    target.position.z - Math.cos(angle) * distanceBehind
  );

  camera.position.lerp(
    desired,
    1 - Math.exp(-5 * delta)
  );

  cameraTarget.set(
    target.position.x,
    target.position.y + 1.2,
    target.position.z
  );

  camera.lookAt(cameraTarget);
}

// ========================================
// 11. CICLO PRINCIPAL
// ========================================

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (driving) {
    updateCar(delta);
  } else {
    updatePlayer(delta);
  }

  updateCamera(delta);

  renderer.render(scene, camera);
}

camera.position.set(0, 7, 20);
camera.lookAt(0, 0, 0);

animate();

// ========================================
// 12. RESIZE E INICIALIZAÇÃO
// ========================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
});

window.addEventListener('blur', () => {
  Object.keys(keys).forEach(key => keys[key] = false);
});

updateInventory();

window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelector('#loading').classList.add('hidden');
  }, 700);
});

showMessage('Encontre o carro azul e explore!');

