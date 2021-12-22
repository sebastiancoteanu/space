let container;
let camera;
let renderer;
let scene;
let figurine;
let controls;
let starGeo;
let stars;

const STARS_NUMBER = 10000;

function init() {
  container = document.getElementById('container');

  scene = new THREE.Scene();

  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 500;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(30, 5, 0);

  const ambient = new THREE.AmbientLight(0x626262, 1);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(10, 0, 80);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minDistance = 10;
  container.appendChild(renderer.domElement);

  configureStars();

  const loader = new THREE.GLTFLoader();
  loader.load('./3d/scene.gltf', function(gltf) {
    scene.add(gltf.scene);
    figurine = gltf.scene.children[0];
    animate();
  });

  window.addEventListener('resize', onWindowResize);
}

function configureStars() {
  let sprite = new THREE.TextureLoader().load('star.png');
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.7,
    map: sprite
  });

  configurateStarsGeometry();

  stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);
}

function configurateStarsGeometry() {
  const vertices = [];
  const accelerations = Array.from({ length: STARS_NUMBER }, () => 0.02);
  const velocities = Array.from({ length: STARS_NUMBER }, () => 0);

  for (let i = 0; i < STARS_NUMBER; i++) {
    const x = THREE.MathUtils.randFloatSpread( 1000 );
  	const y = THREE.MathUtils.randFloatSpread( 1000 );
  	const z = THREE.MathUtils.randFloatSpread( 1000 );

  	vertices.push(x, y, z);
  }
  starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  starGeo.setAttribute('accelerations',new THREE.Float32BufferAttribute(accelerations, 1));
  starGeo.setAttribute('velocities',new THREE.Float32BufferAttribute(velocities, 1));
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}

function updatePoints() {
  const positions = starGeo.getAttribute('position');
  const velocities = starGeo.getAttribute('velocities');
  const accelerations = starGeo.getAttribute('accelerations');

  for (let i = 0; i < positions.count; i++) {
    let velocity = velocities.getX(i);
    let acceleration = accelerations.getX(i);
    let positionX = positions.getX(i);

    // console.log(acceleration, velocity, positionZ);

    velocity += acceleration;
    positionX += velocity;

    if (positionX >= 500) {
      positionX = -500;
      velocity = 0;
    }

    positions.setX(i, positionX);
    velocities.setX(i, velocity);

    velocities[i] = velocity;
    // console.log(acceleration, velocity, positionZ);
  }

  positions.needsUpdate = true;
  // stars.rotation.y += 0.002;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updatePoints();
  renderer.render(scene, camera);
}

function main() {
  init();
}

main();
