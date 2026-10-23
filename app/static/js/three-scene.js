/**
 * EcoPulse 3D WebGL Holographic Cyber-Grid & Eco-Globe Canvas
 * Built with Three.js for immersive real-time visualization of multi-agent food rescue logistics.
 */

class EcoPulse3DScene {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    // 3D Scene Objects
    this.globeGroup = null;
    this.cityGridGroup = null;
    this.pinsGroup = null;
    this.routesGroup = null;
    this.particles = null;

    // Animation & Drone transit
    this.activeTransitCurve = null;
    this.droneMesh = null;
    this.droneProgress = 0.0;
    this.isTransitActive = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050807, 0.015);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 32, 50);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
      this.controls.minDistance = 15;
      this.controls.maxDistance = 120;
    }

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x10b981, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight.position.set(20, 40, 20);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x10b981, 2, 80);
    pointLight.position.set(0, 15, 0);
    this.scene.add(pointLight);

    // 6. Build Scene Hierarchy
    this.buildCityTerrain();
    this.buildHolographicGlobe();
    this.buildAtmosphericParticles();

    this.pinsGroup = new THREE.Group();
    this.scene.add(this.pinsGroup);

    this.routesGroup = new THREE.Group();
    this.scene.add(this.routesGroup);

    this.createDroneMesh();
    this.populateInitialNodes();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());

    // 8. Render Loop
    this.animate();
  }

  buildCityTerrain() {
    this.cityGridGroup = new THREE.Group();

    // Holographic Cyber-Grid Plane
    const gridHelper = new THREE.GridHelper(90, 45, 0x10b981, 0x0f291e);
    gridHelper.position.y = 0;
    this.cityGridGroup.add(gridHelper);

    // Procedural Glowing City Buildings
    const buildingGeom = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0b1713,
      emissive: 0x064e3b,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 });

    // Seed 40 futuristic city buildings around perimeter
    const rngSeed = [
      [-25, -20, 4, 12], [-18, -24, 5, 8], [-12, -22, 4, 15],
      [20, -18, 5, 14], [28, -12, 6, 9], [15, -28, 4, 11],
      [-28, 15, 5, 10], [-22, 24, 6, 16], [-15, 20, 4, 8],
      [22, 18, 5, 13], [26, 25, 4, 17], [18, 28, 5, 7],
      [-32, -5, 6, 12], [32, 5, 5, 14], [-5, -32, 6, 10], [5, 32, 5, 15]
    ];

    rngSeed.forEach(([x, z, w, h]) => {
      const bMesh = new THREE.Mesh(buildingGeom, buildingMat);
      bMesh.scale.set(w, h, w);
      bMesh.position.set(x, h / 2, z);
      this.cityGridGroup.add(bMesh);

      // Neon Wireframe Edges
      const edges = new THREE.EdgesGeometry(buildingGeom);
      const line = new THREE.LineSegments(edges, edgeMat);
      line.scale.set(w, h, w);
      line.position.set(x, h / 2, z);
      this.cityGridGroup.add(line);
    });

    this.scene.add(this.cityGridGroup);
  }

  buildHolographicGlobe() {
    this.globeGroup = new THREE.Group();
    this.globeGroup.position.set(0, 6, 0);

    // Wireframe Sphere
    const sphereGeom = new THREE.SphereGeometry(10, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
    this.globeGroup.add(sphereMesh);

    // Glowing Inner Core
    const innerGeom = new THREE.SphereGeometry(8.5, 24, 24);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x052e25,
      emissive: 0x10b981,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      transparent: true,
      opacity: 0.6
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    this.globeGroup.add(innerMesh);

    // Holographic Orbital Rings
    const ringGeom = new THREE.RingGeometry(13, 13.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    this.globeGroup.add(ringMesh);

    this.scene.add(this.globeGroup);
  }

  buildAtmosphericParticles() {
    const particleCount = 250;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = Math.random() * 45;
      positions[i + 2] = (Math.random() - 0.5) * 120;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.6,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geom, mat);
    this.scene.add(this.particles);
  }

  createDroneMesh() {
    this.droneMesh = new THREE.Group();

    // Central cargo capsule
    const bodyGeom = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.z = Math.PI / 2;
    this.droneMesh.add(body);

    // Glowing propulsion ring
    const ringGeom = new THREE.TorusGeometry(0.8, 0.1, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    this.droneMesh.add(ring);

    this.droneMesh.visible = false;
    this.scene.add(this.droneMesh);
  }

  populateInitialNodes() {
    // Clear pins
    while (this.pinsGroup.children.length > 0) {
      this.pinsGroup.remove(this.pinsGroup.children[0]);
    }

    // Donor Pin (Metro Culinary Center)
    this.add3DPin(-14, 8, 'DONOR', 'Metro Catering Hub', 0xf59e0b);

    // 4 Metropolitan NGO Pins
    this.add3DPin(12, -10, 'NGO', 'Hope Kitchen Shelter', 0x10b981);
    this.add3DPin(-10, -18, 'NGO', 'Bread For All Food Bank', 0x06b6d4);
    this.add3DPin(18, 12, 'NGO', 'Sunrise Family Haven', 0x84cc16);
    this.add3DPin(4, 18, 'NGO', 'City Nourish Center', 0x10b981);
  }

  add3DPin(x, z, type, label, colorHex) {
    const pinGroup = new THREE.Group();
    pinGroup.position.set(x, 0, z);

    // Vertical Laser Beacon
    const beaconGeom = new THREE.CylinderGeometry(0.08, 0.08, 7, 8);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.75
    });
    const beacon = new THREE.Mesh(beaconGeom, beaconMat);
    beacon.position.y = 3.5;
    pinGroup.add(beacon);

    // Floating Holographic Diamond / Icon
    const diamondGeom = new THREE.OctahedronGeometry(type === 'DONOR' ? 0.9 : 0.75);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.9,
      metalness: 0.7,
      roughness: 0.2
    });
    const diamond = new THREE.Mesh(diamondGeom, diamondMat);
    diamond.position.y = 7.5;
    diamond.name = 'floating_head';
    pinGroup.add(diamond);

    // Ground Pulsing Ring
    const pulseRingGeom = new THREE.RingGeometry(0.8, 1.2, 32);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const pulseRing = new THREE.Mesh(pulseRingGeom, pulseRingMat);
    pulseRing.rotation.x = -Math.PI / 2;
    pulseRing.position.y = 0.05;
    pinGroup.add(pulseRing);

    this.pinsGroup.add(pinGroup);
  }

  animateRescueDispatch(originX, originZ, destX, destZ) {
    // Clear old route lines
    while (this.routesGroup.children.length > 0) {
      this.routesGroup.remove(this.routesGroup.children[0]);
    }

    // Construct 3D Quadratic Bezier Curve elevated above city
    const p0 = new THREE.Vector3(originX, 1.5, originZ);
    const midX = (originX + destX) / 2;
    const midZ = (originZ + destZ) / 2;
    const p1 = new THREE.Vector3(midX, 16.0, midZ); // Arch height
    const p2 = new THREE.Vector3(destX, 1.5, destZ);

    this.activeTransitCurve = new THREE.QuadraticBezierCurve3(p0, p1, p2);

    // Render Glowing Spline Tube
    const curvePoints = this.activeTransitCurve.getPoints(50);
    const curveGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      linewidth: 3,
      transparent: true,
      opacity: 0.85
    });
    const splineLine = new THREE.Line(curveGeom, curveMat);
    this.routesGroup.add(splineLine);

    // Activate Autonomous Logistics Drone
    this.droneProgress = 0.0;
    this.isTransitActive = true;
    this.droneMesh.visible = true;
  }

  setCameraPreset(presetName) {
    if (!this.controls) return;

    if (presetName === 'OVERVIEW') {
      this.camera.position.set(0, 42, 60);
      this.controls.target.set(0, 4, 0);
    } else if (presetName === 'GRID') {
      this.camera.position.set(-20, 20, 30);
      this.controls.target.set(0, 2, 0);
    } else if (presetName === 'TRANSIT' && this.droneMesh) {
      this.camera.position.set(this.droneMesh.position.x + 8, this.droneMesh.position.y + 10, this.droneMesh.position.z + 14);
      this.controls.target.copy(this.droneMesh.position);
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Rotate Holographic Globe
    if (this.globeGroup) {
      this.globeGroup.rotation.y += 0.003;
    }

    // Animate pin floating heads
    if (this.pinsGroup) {
      const time = Date.now() * 0.0025;
      this.pinsGroup.children.forEach((pin, i) => {
        const head = pin.getObjectByName('floating_head');
        if (head) {
          head.rotation.y += 0.02;
          head.position.y = 7.5 + Math.sin(time + i) * 0.4;
        }
      });
    }

    // Animate Drone Transit along 3D Bezier Curve
    if (this.isTransitActive && this.activeTransitCurve && this.droneMesh) {
      this.droneProgress += 0.004;
      if (this.droneProgress > 1.0) {
        this.droneProgress = 0.0; // Loop or complete
      }
      const pt = this.activeTransitCurve.getPoint(this.droneProgress);
      this.droneMesh.position.copy(pt);

      const tangent = this.activeTransitCurve.getTangent(this.droneProgress);
      this.droneMesh.lookAt(pt.clone().add(tangent));
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.EcoPulse3DScene = EcoPulse3DScene;
