/**
 * ===================================================================
 * TURBO RUSH: 3D HIGHWAY RACER & DEMOLITION CRASH ENGINE
 * Pure WebGL / Three.js + Web Audio API Procedural Synthesizer
 * ===================================================================
 */

// --- SOUND ENGINE (Web Audio API - 100% Procedural, No External Assets Needed) ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.engineOsc = null;
    this.engineGain = null;
    this.sirenOsc = null;
    this.sirenGain = null;
    this.musicTimer = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.initialized = true;

      // Engine sound setup
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();

      this.startMusic();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  updateEngine(speedRatio, isNitro) {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const baseFreq = 50 + speedRatio * 180 + (isNitro ? 80 : 0);
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
    const vol = Math.min(0.12, 0.02 + speedRatio * 0.08);
    this.engineGain.gain.setTargetAtTime(vol, now, 0.05);
  }

  playCrash(intensity = 1.0) {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    // Noise buffer for metal impact explosion
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 * intensity, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playNitro() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playCoin() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playPowerup() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.16);
    });
  }

  playNearMiss() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playSiren(active) {
    if (!this.ctx || !this.enabled) return;
    if (active) {
      if (!this.sirenOsc) {
        this.sirenOsc = this.ctx.createOscillator();
        this.sirenGain = this.ctx.createGain();
        this.sirenOsc.type = 'sine';
        this.sirenGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        this.sirenOsc.connect(this.sirenGain);
        this.sirenGain.connect(this.ctx.destination);
        this.sirenOsc.start();
      }
      const t = this.ctx.currentTime;
      const freq = 650 + Math.sin(t * 8) * 250;
      this.sirenOsc.frequency.setTargetAtTime(freq, t, 0.05);
    } else if (this.sirenOsc) {
      this.sirenGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
      setTimeout(() => {
        if (this.sirenOsc) {
          try { this.sirenOsc.stop(); } catch(e){}
          this.sirenOsc = null;
        }
      }, 200);
    }
  }

  startMusic() {
    if (this.musicTimer || !this.ctx) return;
    let step = 0;
    const bassNotes = [65.41, 65.41, 77.78, 65.41, 87.31, 65.41, 98.00, 87.31]; // Synthwave bass
    this.musicTimer = setInterval(() => {
      if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const freq = bassNotes[step % bassNotes.length];
      osc.frequency.setValueAtTime(freq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.2);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
      step++;
    }, 220);
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.playSiren(false);
    }
    return this.enabled;
  }
}

// --- CAR VEHICLE DEFINITIONS & DATA ---
const CAR_DATABASE = [
  {
    id: 'phantom_gt',
    name: 'PHANTOM GT',
    type: 'SPORTS COUPE',
    desc: 'High-agility aerodynamic racer with exceptional handling & acceleration.',
    price: 0,
    baseSpeed: 240,
    baseAccel: 8.5,
    baseHandling: 8.5,
    baseArmor: 100,
    baseNitro: 100,
    defaultColor: 0xff0055,
    bodyType: 'supercar'
  },
  {
    id: 'titan_cyber',
    name: 'TITAN CYBERTRUCK',
    type: 'ARMORED EV TRUCK',
    desc: 'Indestructible stainless steel tank. Heaviest crash impact & maximum armor.',
    price: 3000,
    baseSpeed: 210,
    baseAccel: 7.0,
    baseHandling: 6.5,
    baseArmor: 220,
    baseNitro: 80,
    defaultColor: 0x999999,
    bodyType: 'truck'
  },
  {
    id: 'viper_muscle',
    name: 'VIPER V8 MUSCLE',
    type: 'CLASSIC MUSCLE',
    desc: 'Raw horsepower beast. Massive torque and blistering straight-line speed.',
    price: 5500,
    baseSpeed: 260,
    baseAccel: 9.0,
    baseHandling: 7.0,
    baseArmor: 130,
    baseNitro: 110,
    defaultColor: 0xffaa00,
    bodyType: 'muscle'
  },
  {
    id: 'apex_hypercar',
    name: 'APEX HYPERCAR',
    type: 'PROTOTYPE HYPERCAR',
    desc: 'Carbon fiber pinnacle of speed. Breaks the sound barrier with unlimited nitro boost.',
    price: 10000,
    baseSpeed: 300,
    baseAccel: 9.8,
    baseHandling: 9.5,
    baseArmor: 90,
    baseNitro: 140,
    defaultColor: 0x00f0ff,
    bodyType: 'hypercar'
  }
];

// --- MAIN GAME ENGINE CLASS ---
class TurboRushGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.canvas = document.getElementById('webgl-canvas');
    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas.getContext('2d');
    this.sound = new SoundEngine();

    // Game state
    this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
    this.mode = 'endless'; // endless, police, timeattack, demolition
    this.environment = 'morning'; // morning (Morning Rises), neon, sunset, rain, desert

    // Persistent player data
    this.cash = parseInt(localStorage.getItem('tr_cash')) || 500;
    this.highScore = parseInt(localStorage.getItem('tr_highscore')) || 0;
    this.selectedCarIndex = parseInt(localStorage.getItem('tr_selected_car')) || 0;
    this.selectedPaint = parseInt(localStorage.getItem('tr_paint')) || 0xff0055;
    this.selectedUnderglow = parseInt(localStorage.getItem('tr_underglow')) || 0x00f0ff;
    this.upgrades = JSON.parse(localStorage.getItem('tr_upgrades')) || {
      engine: 1,
      nitro: 1,
      armor: 1,
      tires: 1
    };

    // Race stats
    this.score = 0;
    this.distance = 0;
    this.runCash = 0;
    this.nearMisses = 0;
    this.carsWrecked = 0;
    this.topSpeedReached = 0;
    this.modeTimer = 60; // For time attack & pursuit

    // Player vehicle physics
    this.player = {
      x: 0,
      y: 0.5,
      z: 0,
      speed: 0, // km/h
      targetSpeed: 0,
      maxSpeed: 240,
      accel: 50,
      braking: 80,
      steerSpeed: 18,
      turnVelocity: 0,
      health: 100,
      maxHealth: 100,
      nitro: 100,
      maxNitro: 100,
      isNitro: false,
      mesh: null,
      wheels: [],
      underglowLight: null,
      shieldActive: false,
      shieldMesh: null,
      magnetActive: false,
      invulnerableTimer: 0
    };

    // Camera settings
    this.cameraMode = 0; // 0: Chase, 1: Cockpit/Hood, 2: Top-down/Cinematic
    this.cameraOffset = new THREE.Vector3(0, 4.5, 10);
    this.cameraLookOffset = new THREE.Vector3(0, 1.2, -15);

    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      nitro: false,
      drift: false
    };

    // World collections
    this.highwaySegments = [];
    this.trafficCars = [];
    this.copCars = [];
    this.collectibles = [];
    this.particles = [];
    this.sceneryProps = [];

    // Road configuration
    this.roadWidth = 24;
    this.laneCount = 4;
    this.lanes = [-9, -3, 3, 9];
    this.segmentLength = 80;
    this.segmentCount = 15;

    // Time & loop
    this.clock = new THREE.Clock();
    this.spawnTimer = 0;
    this.copSpawnTimer = 0;
    this.powerupTimer = 0;
    this.comboTimer = 0;
    this.comboMultiplier = 1;

    // Initialize systems
    this.initThree();
    this.initEnvironment();
    this.initRoad();
    this.initPlayerCar();
    this.initInput();
    this.initUI();
    this.updateGarageUI();

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // --- THREE.JS SCENE, CAMERA & RENDERER SETUP ---
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070913, 0.0035);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 12);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // --- ATMOSPHERIC LIGHTING & WEATHER ---
  // --- ATMOSPHERIC LIGHTING & WEATHER ---
  initEnvironment() {
    // Clear existing lights/sky
    while(this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    let skyColor, groundColor, dirLightColor, dirLightPos;

    switch(this.environment) {
      case 'morning':
        // 🌅 MORNING RISES VIBES: Golden hour dawn, sunrise sun disc, warm peach-amber haze
        skyColor = 0xffa05b;
        groundColor = 0x2e5339;
        dirLightColor = 0xfffae0;
        dirLightPos = new THREE.Vector3(25, 30, -50);
        this.scene.background = new THREE.Color(0xffbe94);
        this.scene.fog = new THREE.FogExp2(0xffc59e, 0.0022);
        this.createMorningSun();
        this.createMorningDewEffect();
        break;
      case 'sunset':
        skyColor = 0xff6622;
        groundColor = 0x221133;
        dirLightColor = 0xffaa44;
        dirLightPos = new THREE.Vector3(20, 35, -30);
        this.scene.background = new THREE.Color(0x3d1730);
        this.scene.fog = new THREE.FogExp2(0x3d1730, 0.003);
        break;
      case 'rain':
        skyColor = 0x223344;
        groundColor = 0x111122;
        dirLightColor = 0x6688aa;
        dirLightPos = new THREE.Vector3(10, 40, -20);
        this.scene.background = new THREE.Color(0x0f1724);
        this.scene.fog = new THREE.FogExp2(0x0f1724, 0.006);
        this.createRainEffect();
        break;
      case 'desert':
        skyColor = 0xffe6aa;
        groundColor = 0x553311;
        dirLightColor = 0xfff0cc;
        dirLightPos = new THREE.Vector3(20, 40, -30);
        this.scene.background = new THREE.Color(0xcc8844);
        this.scene.fog = new THREE.FogExp2(0xcc8844, 0.0025);
        break;
      case 'neon':
      default:
        skyColor = 0x00f0ff;
        groundColor = 0x9900ee;
        dirLightColor = 0xff00bb;
        dirLightPos = new THREE.Vector3(20, 40, -30);
        this.scene.background = new THREE.Color(0x070913);
        this.scene.fog = new THREE.FogExp2(0x070913, 0.0035);
        break;
    }

    this.hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(dirLightColor, 1.4);
    this.dirLight.position.copy(dirLightPos);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);
  }

  // --- MORNING SUNRISE DISC & SUN FLARE ---
  createMorningSun() {
    const sunGroup = new THREE.Group();

    // Core Glowing Sun Sphere
    const sunGeo = new THREE.SphereGeometry(26, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff4db });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Golden Sunrise Atmospheric Glow Aura
    const auraGeo = new THREE.RingGeometry(26, 68, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffa040,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.rotation.y = Math.PI;
    sunGroup.add(auraMesh);

    // Position sun in the horizon ahead
    sunGroup.position.set(15, 28, -380);
    this.scene.add(sunGroup);
    this.sunGroup = sunGroup;
  }

  createMorningDewEffect() {
    const sparkleCount = 600;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 70;
      positions[i + 1] = 0.5 + Math.random() * 8;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfff0aa,
      size: 0.18,
      transparent: true,
      opacity: 0.7
    });
    this.morningSparkles = new THREE.Points(geo, mat);
    this.scene.add(this.morningSparkles);
  }

  createRainEffect() {
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = Math.random() * 40;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x99ccff,
      size: 0.15,
      transparent: true,
      opacity: 0.6
    });
    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.scene.add(this.rainParticles);
  }

  // --- PROCEDURAL 3D HIGHWAY GENERATION ---
  initRoad() {
    this.highwaySegments = [];

    // Road material with morning / environment adaptation
    const isMorning = this.environment === 'morning';
    const roadMat = new THREE.MeshStandardMaterial({
      color: isMorning ? 0x272a33 : 0x181a20,
      roughness: isMorning ? 0.35 : 0.4,
      metalness: 0.2
    });

    const shoulderColor = isMorning ? 0x2d5a27 : (this.environment === 'desert' ? 0x9c6633 : 0x0a0c10);
    const shoulderMat = new THREE.MeshStandardMaterial({
      color: shoulderColor,
      roughness: 0.9
    });

    const lineColor = isMorning ? 0xffffff : (this.environment === 'desert' ? 0xffea00 : 0x00f0ff);
    const lineMat = new THREE.MeshBasicMaterial({ color: lineColor });
    
    const barrierColor = isMorning ? 0x8fa3b8 : 0x445566;
    const barrierMat = new THREE.MeshStandardMaterial({
      color: barrierColor,
      metalness: 0.85,
      roughness: 0.25
    });

    for (let i = 0; i < this.segmentCount; i++) {
      const segGroup = new THREE.Group();
      const zPos = -i * this.segmentLength;

      // Main asphalt highway
      const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.receiveShadow = true;
      segGroup.add(roadMesh);

      // Grass / Landscape Shoulders
      const shoulderGeo = new THREE.PlaneGeometry(120, this.segmentLength);
      const shoulderMeshLeft = new THREE.Mesh(shoulderGeo, shoulderMat);
      shoulderMeshLeft.rotation.x = -Math.PI / 2;
      shoulderMeshLeft.position.x = - (this.roadWidth / 2 + 60);
      shoulderMeshLeft.position.y = -0.05;
      shoulderMeshLeft.receiveShadow = true;
      segGroup.add(shoulderMeshLeft);

      const shoulderMeshRight = shoulderMeshLeft.clone();
      shoulderMeshRight.position.x = (this.roadWidth / 2 + 60);
      segGroup.add(shoulderMeshRight);

      // Yellow Center Median Line
      const centerLineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
      const centerDashGeo = new THREE.PlaneGeometry(0.35, this.segmentLength);
      const centerDash = new THREE.Mesh(centerDashGeo, centerLineMat);
      centerDash.rotation.x = -Math.PI / 2;
      centerDash.position.set(0, 0.02, 0);
      segGroup.add(centerDash);

      // Crisp Lane Dividers
      for (let l = 1; l < this.laneCount; l++) {
        if (l === 2) continue; // Middle line already placed
        const laneX = -this.roadWidth / 2 + l * (this.roadWidth / this.laneCount);
        for (let d = 0; d < this.segmentLength; d += 10) {
          const dashGeo = new THREE.PlaneGeometry(0.28, 4.5);
          const dashMesh = new THREE.Mesh(dashGeo, lineMat);
          dashMesh.rotation.x = -Math.PI / 2;
          dashMesh.position.set(laneX, 0.02, -this.segmentLength / 2 + d + 2.25);
          segGroup.add(dashMesh);
        }
      }

      // Highway Guardrails
      const railGeo = new THREE.BoxGeometry(0.5, 1.2, this.segmentLength);
      const railLeft = new THREE.Mesh(railGeo, barrierMat);
      railLeft.position.set(-this.roadWidth / 2 - 0.3, 0.6, 0);
      railLeft.castShadow = true;
      segGroup.add(railLeft);

      const railRight = new THREE.Mesh(railGeo, barrierMat);
      railRight.position.set(this.roadWidth / 2 + 0.3, 0.6, 0);
      railRight.castShadow = true;
      segGroup.add(railRight);

      // Scenery Props: Morning Trees, Mountains, Modern Streetlights
      this.addSegmentProps(segGroup);

      segGroup.position.z = zPos;
      this.scene.add(segGroup);
      this.highwaySegments.push(segGroup);
    }
  }

  addSegmentProps(segGroup) {
    const isMorning = this.environment === 'morning';

    // Morning Sunrise Roadside Trees & Pine Forests
    if (isMorning) {
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
      const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8 });
      const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x40916c, roughness: 0.8 });
      const foliageMat3 = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.8 });

      // Add 4-6 trees on left and right sides
      for (let side of [-1, 1]) {
        for (let t = 0; t < 3; t++) {
          const treeGroup = new THREE.Group();
          const treeX = side * (this.roadWidth / 2 + 5 + Math.random() * 25);
          const treeZ = (Math.random() - 0.5) * (this.segmentLength - 10);

          // Trunk
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3, 6), trunkMat);
          trunk.position.y = 1.5;
          trunk.castShadow = true;
          treeGroup.add(trunk);

          // Foliage Cone Layers
          const fol1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.5, 6), foliageMat1);
          fol1.position.y = 3.8;
          fol1.castShadow = true;
          treeGroup.add(fol1);

          const fol2 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.0, 6), foliageMat2);
          fol2.position.y = 5.2;
          fol2.castShadow = true;
          treeGroup.add(fol2);

          const fol3 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.2, 6), foliageMat3);
          fol3.position.y = 6.4;
          fol3.castShadow = true;
          treeGroup.add(fol3);

          treeGroup.position.set(treeX, 0, treeZ);
          const scale = 0.8 + Math.random() * 0.5;
          treeGroup.scale.set(scale, scale, scale);
          segGroup.add(treeGroup);
        }

        // Sunrise Mountain Silhouettes in the distance
        const mtnGeo = new THREE.ConeGeometry(25 + Math.random() * 15, 35 + Math.random() * 25, 5);
        const mtnMat = new THREE.MeshStandardMaterial({
          color: 0xb58268,
          roughness: 0.95
        });
        const mtn = new THREE.Mesh(mtnGeo, mtnMat);
        mtn.position.set(side * (75 + Math.random() * 40), 15, (Math.random() - 0.5) * 50);
        segGroup.add(mtn);
      }
    }

    // Streetlights
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.8 });
    const lampMat = new THREE.MeshBasicMaterial({ color: isMorning ? 0xfff0bb : (this.environment === 'neon' ? 0x00f0ff : 0xffe600) });

    [-this.roadWidth / 2 - 2.5, this.roadWidth / 2 + 2.5].forEach((xPos, idx) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(xPos, 4, 0);
      
      const armGeo = new THREE.BoxGeometry(2, 0.15, 0.15);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(idx === 0 ? 0.9 : -0.9, 3.9, 0);
      pole.add(arm);

      const lightBulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lampMat);
      lightBulb.position.set(idx === 0 ? 1.8 : -1.8, 3.8, 0);
      pole.add(lightBulb);

      segGroup.add(pole);
    });

    // Cyberpunk skyscrapers for Neon/Rain environments
    if (this.environment === 'neon' || this.environment === 'rain') {
      for (let side of [-1, 1]) {
        const bldgHeight = 30 + Math.random() * 80;
        const bldgGeo = new THREE.BoxGeometry(15 + Math.random() * 15, bldgHeight, 15 + Math.random() * 15);
        const bldgMat = new THREE.MeshStandardMaterial({
          color: 0x080c18,
          roughness: 0.2,
          metalness: 0.8
        });
        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        bldg.position.set(side * (45 + Math.random() * 30), bldgHeight / 2, (Math.random() - 0.5) * 50);
        segGroup.add(bldg);
      }
    }
  }

  // --- PROCEDURAL 3D CAR CREATION ENGINE ---
  createCarMesh(carConfig, customColor, underglowColor, isPlayer = false) {
    const carGroup = new THREE.Group();
    const primaryMat = new THREE.MeshStandardMaterial({
      color: customColor,
      roughness: 0.2,
      metalness: 0.8
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x112233,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const blackTrimMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.5 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 });
    const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });

    let body, cabin;

    if (carConfig.bodyType === 'truck') {
      // Cybertruck Angular Design
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.2, 5.0);
      body = new THREE.Mesh(bodyGeo, primaryMat);
      body.position.y = 0.8;
      body.castShadow = true;
      carGroup.add(body);

      const cabinGeo = new THREE.ConeGeometry(2.2, 1.2, 4);
      cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.rotation.y = Math.PI / 4;
      cabin.position.set(0, 1.7, 0);
      carGroup.add(cabin);
    } else if (carConfig.bodyType === 'muscle') {
      // Wide Body Muscle Car
      const bodyGeo = new THREE.BoxGeometry(2.3, 0.8, 4.8);
      body = new THREE.Mesh(bodyGeo, primaryMat);
      body.position.y = 0.6;
      body.castShadow = true;
      carGroup.add(body);

      const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2.6);
      cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 1.2, -0.2);
      carGroup.add(cabin);

      // Supercharger Hood Scoop
      const scoopGeo = new THREE.BoxGeometry(0.8, 0.3, 1.0);
      const scoop = new THREE.Mesh(scoopGeo, blackTrimMat);
      scoop.position.set(0, 1.05, 1.2);
      carGroup.add(scoop);
    } else {
      // Sleek Supercar / Hypercar
      const bodyGeo = new THREE.BoxGeometry(2.2, 0.65, 4.6);
      body = new THREE.Mesh(bodyGeo, primaryMat);
      body.position.y = 0.55;
      body.castShadow = true;
      carGroup.add(body);

      const cabinGeo = new THREE.BoxGeometry(1.7, 0.6, 2.3);
      cabin = new THREE.Mesh(cabinGeo, glassMat);
      cabin.position.set(0, 1.05, -0.3);
      carGroup.add(cabin);

      // GT Racing Rear Spoiler
      const wingGeo = new THREE.BoxGeometry(2.2, 0.08, 0.5);
      const wing = new THREE.Mesh(wingGeo, blackTrimMat);
      wing.position.set(0, 1.35, -2.1);
      carGroup.add(wing);

      const strutLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.1), blackTrimMat);
      strutLeft.position.set(-0.7, 1.1, -2.1);
      const strutRight = strutLeft.clone();
      strutRight.position.set(0.7, 1.1, -2.1);
      carGroup.add(strutLeft);
      carGroup.add(strutRight);
    }

    // Headlights & Taillights
    const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.1), headLightMat);
    hlLeft.position.set(-0.75, 0.6, 2.3);
    const hlRight = hlLeft.clone();
    hlRight.position.set(0.75, 0.6, 2.3);
    carGroup.add(hlLeft);
    carGroup.add(hlRight);

    const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.1), tailLightMat);
    tlLeft.position.set(-0.75, 0.65, -2.3);
    const tlRight = tlLeft.clone();
    tlRight.position.set(0.75, 0.65, -2.3);
    carGroup.add(tlLeft);
    carGroup.add(tlRight);

    // 4 Wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelPositions = [
      [-1.15, 0.42, 1.4],  // Front Left
      [1.15, 0.42, 1.4],   // Front Right
      [-1.15, 0.42, -1.4], // Rear Left
      [1.15, 0.42, -1.4]   // Rear Right
    ];

    wheelPositions.forEach(pos => {
      const wheelGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 8), rimMat);
      rim.rotateZ(Math.PI / 2);
      wheelGroup.add(rim);

      wheelGroup.position.set(...pos);
      carGroup.add(wheelGroup);
      wheels.push(wheelGroup);
    });

    // Neon Underglow Plane (if enabled)
    let underglowMesh = null;
    if (underglowColor && underglowColor !== 0) {
      const glowMat = new THREE.MeshBasicMaterial({
        color: underglowColor,
        transparent: true,
        opacity: 0.7
      });
      underglowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4.8), glowMat);
      underglowMesh.rotation.x = -Math.PI / 2;
      underglowMesh.position.y = 0.05;
      carGroup.add(underglowMesh);
    }

    // Shield Bubble (hidden by default)
    const shieldGeo = new THREE.SphereGeometry(3.2, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.y = 0.8;
    shieldMesh.visible = false;
    carGroup.add(shieldMesh);

    return {
      group: carGroup,
      wheels: wheels,
      bodyMat: primaryMat,
      underglow: underglowMesh,
      shieldMesh: shieldMesh
    };
  }

  // --- POLICE CAR MESH (Cruiser with Siren Lights) ---
  createCopCarMesh() {
    const carData = this.createCarMesh(
      { bodyType: 'muscle' },
      0x111111,
      0,
      false
    );
    // Police decals / White doors
    const doorGeo = new THREE.BoxGeometry(0.05, 0.6, 1.8);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const doorL = new THREE.Mesh(doorGeo, doorMat);
    doorL.position.set(-1.16, 0.6, 0);
    const doorR = doorL.clone();
    doorR.position.set(1.16, 0.6, 0);
    carData.group.add(doorL);
    carData.group.add(doorR);

    // Lightbar (Red and Blue Flashing)
    const barGeo = new THREE.BoxGeometry(1.2, 0.15, 0.3);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const lightBar = new THREE.Mesh(barGeo, barMat);
    lightBar.position.set(0, 1.6, -0.2);

    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.28), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    redLight.position.set(-0.32, 0.05, 0);
    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.28), new THREE.MeshBasicMaterial({ color: 0x0044ff }));
    blueLight.position.set(0.32, 0.05, 0);

    lightBar.add(redLight);
    lightBar.add(blueLight);
    carData.group.add(lightBar);

    carData.redLight = redLight;
    carData.blueLight = blueLight;

    return carData;
  }

  // --- INITIALIZE PLAYER VEHICLE ---
  initPlayerCar() {
    if (this.player.mesh) {
      this.scene.remove(this.player.mesh);
    }
    const carDef = CAR_DATABASE[this.selectedCarIndex];
    const carData = this.createCarMesh(carDef, this.selectedPaint, this.selectedUnderglow, true);
    this.player.mesh = carData.group;
    this.player.wheels = carData.wheels;
    this.player.bodyMat = carData.bodyMat;
    this.player.underglowLight = carData.underglow;
    this.player.shieldMesh = carData.shieldMesh;

    // Apply Tuning Upgrades
    this.player.maxSpeed = carDef.baseSpeed + (this.upgrades.engine - 1) * 20;
    this.player.accel = carDef.baseAccel * 6 + (this.upgrades.engine - 1) * 8;
    this.player.steerSpeed = carDef.baseHandling * 2.2 + (this.upgrades.tires - 1) * 2;
    this.player.maxHealth = carDef.baseArmor + (this.upgrades.armor - 1) * 35;
    this.player.health = this.player.maxHealth;
    this.player.maxNitro = carDef.baseNitro + (this.upgrades.nitro - 1) * 25;
    this.player.nitro = this.player.maxNitro;

    this.player.x = 0;
    this.player.z = 0;
    this.player.speed = 0;
    this.player.turnVelocity = 0;
    this.player.mesh.position.set(0, 0, 0);
    this.scene.add(this.player.mesh);
  }

  // --- CONTROLS & INPUT SYSTEM ---
  initInput() {
    window.addEventListener('keydown', (e) => {
      this.sound.init();
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyN':
          this.keys.nitro = true;
          break;
        case 'Space':
          this.keys.drift = true;
          break;
        case 'KeyC':
          this.toggleCamera();
          break;
        case 'KeyM':
          this.toggleSoundUI();
          break;
        case 'Escape':
        case 'KeyP':
          this.togglePause();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyN':
          this.keys.nitro = false;
          break;
        case 'Space':
          this.keys.drift = false;
          break;
      }
    });

    // Touch button handlers
    const bindTouch = (id, key) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const startHandler = (e) => { e.preventDefault(); this.sound.init(); this.keys[key] = true; };
      const endHandler = (e) => { e.preventDefault(); this.keys[key] = false; };
      btn.addEventListener('touchstart', startHandler, { passive: false });
      btn.addEventListener('touchend', endHandler, { passive: false });
      btn.addEventListener('mousedown', startHandler);
      btn.addEventListener('mouseup', endHandler);
    };

    bindTouch('touch-left', 'left');
    bindTouch('touch-right', 'right');
    bindTouch('touch-gas', 'forward');
    bindTouch('touch-brake', 'backward');
    bindTouch('touch-nitro', 'nitro');
  }

  // --- UI LISTENERS & NAVIGATION ---
  initUI() {
    // Mode selection clicks
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.mode = card.getAttribute('data-mode');
      });
    });

    // Environment selection clicks
    document.querySelectorAll('.env-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.env-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.environment = btn.getAttribute('data-env');
        this.initEnvironment();
        this.initRoad();
      });
    });

    // Main Menu Buttons
    document.getElementById('btn-start-game').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('btn-open-garage').addEventListener('click', () => {
      this.showScreen('screen-garage');
    });

    document.getElementById('btn-open-how-to-play').addEventListener('click', () => {
      this.showScreen('screen-how-to-play');
    });

    document.getElementById('btn-how-to-back').addEventListener('click', () => {
      this.showScreen('screen-menu');
    });

    document.getElementById('btn-garage-back').addEventListener('click', () => {
      this.showScreen('screen-menu');
    });

    document.getElementById('btn-select-car').addEventListener('click', () => {
      this.showScreen('screen-menu');
    });

    // In-game buttons
    document.getElementById('btn-camera').addEventListener('click', () => this.toggleCamera());
    document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-sound').addEventListener('click', () => this.toggleSoundUI());

    // Pause menu buttons
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-pause-restart').addEventListener('click', () => this.startGame());
    document.getElementById('btn-pause-menu').addEventListener('click', () => this.quitToMenu());

    // Game Over buttons
    document.getElementById('btn-restart-game').addEventListener('click', () => this.startGame());
    document.getElementById('btn-gameover-garage').addEventListener('click', () => this.showScreen('screen-garage'));
    document.getElementById('btn-gameover-menu').addEventListener('click', () => this.quitToMenu());

    // Garage Car Carousel Nav
    document.getElementById('car-prev').addEventListener('click', () => {
      this.selectedCarIndex = (this.selectedCarIndex - 1 + CAR_DATABASE.length) % CAR_DATABASE.length;
      this.savePlayerState();
      this.initPlayerCar();
      this.updateGarageUI();
    });

    document.getElementById('car-next').addEventListener('click', () => {
      this.selectedCarIndex = (this.selectedCarIndex + 1) % CAR_DATABASE.length;
      this.savePlayerState();
      this.initPlayerCar();
      this.updateGarageUI();
    });

    // Color Swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.selectedPaint = parseInt(swatch.getAttribute('data-color'));
        this.savePlayerState();
        this.initPlayerCar();
      });
    });

    // Underglow Swatches
    document.querySelectorAll('.underglow-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.underglow-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.selectedUnderglow = parseInt(swatch.getAttribute('data-glow'));
        this.savePlayerState();
        this.initPlayerCar();
      });
    });

    // Upgrades buying
    document.querySelectorAll('.btn-buy-upgrade').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        this.buyUpgrade(type);
      });
    });

    this.updateStatsDisplay();
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen-box').forEach(s => s.classList.add('hidden'));
    document.getElementById('ui-overlay').classList.remove('hidden');
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
    }
  }

  toggleCamera() {
    this.cameraMode = (this.cameraMode + 1) % 3;
    const toastText = ['CHASE CAM', 'HOOD COCKPIT', 'TOP ORBIT'][this.cameraMode];
    this.showComboToast('📷 CAMERA', toastText);
  }

  toggleSoundUI() {
    const isEnabled = this.sound.toggleSound();
    document.getElementById('btn-sound').innerText = isEnabled ? '🔊 SFX' : '🔇 MUTED';
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.showScreen('screen-pause');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      document.getElementById('ui-overlay').classList.add('hidden');
    }
  }

  quitToMenu() {
    this.state = 'MENU';
    document.getElementById('hud').classList.add('hidden');
    this.showScreen('screen-menu');
    this.updateStatsDisplay();
    this.sound.playSiren(false);
  }

  updateStatsDisplay() {
    document.getElementById('menu-total-cash').innerText = `$${this.cash.toLocaleString()}`;
    document.getElementById('menu-high-score').innerText = this.highScore.toLocaleString();
    document.getElementById('garage-cash-display').innerText = `$${this.cash.toLocaleString()}`;
  }

  // --- GARAGE & UPGRADES LOGIC ---
  updateGarageUI() {
    const car = CAR_DATABASE[this.selectedCarIndex];
    document.getElementById('car-current-name').innerText = car.name;
    document.getElementById('car-type-badge').innerText = car.type;
    document.getElementById('car-desc').innerText = car.desc;

    // Stat bars
    const currentSpeed = car.baseSpeed + (this.upgrades.engine - 1) * 20;
    document.getElementById('stat-speed-fill').style.width = `${(currentSpeed / 340) * 100}%`;
    document.getElementById('stat-speed-val').innerText = `${currentSpeed} km/h`;

    const currentAccel = (car.baseAccel + (this.upgrades.engine - 1) * 0.8).toFixed(1);
    document.getElementById('stat-accel-fill').style.width = `${(currentAccel / 12) * 100}%`;
    document.getElementById('stat-accel-val').innerText = `${currentAccel}/10`;

    const currentHandling = (car.baseHandling + (this.upgrades.tires - 1) * 0.6).toFixed(1);
    document.getElementById('stat-handling-fill').style.width = `${(currentHandling / 12) * 100}%`;
    document.getElementById('stat-handling-val').innerText = `${currentHandling}/10`;

    const currentArmor = car.baseArmor + (this.upgrades.armor - 1) * 35;
    document.getElementById('stat-armor-fill').style.width = `${(currentArmor / 300) * 100}%`;
    document.getElementById('stat-armor-val').innerText = `${currentArmor} HP`;

    const currentNitro = car.baseNitro + (this.upgrades.nitro - 1) * 25;
    document.getElementById('stat-nitro-fill').style.width = `${(currentNitro / 200) * 100}%`;
    document.getElementById('stat-nitro-val').innerText = `${currentNitro}%`;

    // Upgrade buttons cost & status
    const upgradeCosts = {
      engine: 500 * this.upgrades.engine,
      nitro: 400 * this.upgrades.nitro,
      armor: 450 * this.upgrades.armor,
      tires: 350 * this.upgrades.tires
    };

    ['engine', 'nitro', 'armor', 'tires'].forEach(type => {
      const lvlSpan = document.getElementById(`upg-${type}-lvl`);
      const costSpan = document.getElementById(`upg-${type}-cost`);
      const btn = document.querySelector(`.btn-buy-upgrade[data-type="${type}"]`);
      const lvl = this.upgrades[type];

      if (lvl >= 5) {
        lvlSpan.innerText = 'MAX LEVEL';
        costSpan.innerText = '';
        btn.innerText = 'MAXED';
        btn.classList.add('maxed');
      } else {
        lvlSpan.innerText = `Lvl ${lvl}/5`;
        costSpan.innerText = `$${upgradeCosts[type]}`;
        btn.innerText = `UPGRADE $${upgradeCosts[type]}`;
        btn.classList.remove('maxed');
      }
    });

    this.updateStatsDisplay();
  }

  buyUpgrade(type) {
    if (this.upgrades[type] >= 5) return;
    const cost = {
      engine: 500 * this.upgrades.engine,
      nitro: 400 * this.upgrades.nitro,
      armor: 450 * this.upgrades.armor,
      tires: 350 * this.upgrades.tires
    }[type];

    if (this.cash >= cost) {
      this.cash -= cost;
      this.upgrades[type]++;
      this.savePlayerState();
      this.initPlayerCar();
      this.updateGarageUI();
      this.sound.playPowerup();
    } else {
      alert("Not enough cash! Race more to earn bounties.");
    }
  }

  savePlayerState() {
    localStorage.setItem('tr_cash', this.cash);
    localStorage.setItem('tr_highscore', this.highScore);
    localStorage.setItem('tr_selected_car', this.selectedCarIndex);
    localStorage.setItem('tr_paint', this.selectedPaint);
    localStorage.setItem('tr_underglow', this.selectedUnderglow);
    localStorage.setItem('tr_upgrades', JSON.stringify(this.upgrades));
  }

  // --- START GAME LOOP ---
  startGame() {
    this.sound.init();
    this.state = 'PLAYING';
    document.getElementById('ui-overlay').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    // Reset race counters
    this.score = 0;
    this.distance = 0;
    this.runCash = 0;
    this.nearMisses = 0;
    this.carsWrecked = 0;
    this.topSpeedReached = 0;
    this.modeTimer = this.mode === 'timeattack' ? 45 : 75;

    // Reset Player
    this.initPlayerCar();
    this.player.shieldActive = false;
    this.player.magnetActive = false;

    // Clear world objects
    this.trafficCars.forEach(c => this.scene.remove(c.mesh));
    this.trafficCars = [];
    this.copCars.forEach(c => this.scene.remove(c.mesh));
    this.copCars = [];
    this.collectibles.forEach(col => this.scene.remove(col.mesh));
    this.collectibles = [];
    this.particles.forEach(p => this.scene.remove(p.mesh));
    this.particles = [];

    // Mode specific timer HUD toggle
    const timerCard = document.getElementById('mode-timer-card');
    if (this.mode === 'timeattack' || this.mode === 'police') {
      timerCard.style.display = 'flex';
      document.getElementById('mode-timer-label').innerText = this.mode === 'timeattack' ? 'TIME LEFT' : 'EVASION TIME';
    } else {
      timerCard.style.display = 'none';
    }

    this.showComboToast('⚡ RACE START', this.mode.toUpperCase());
  }

  // --- TRAFFIC SPAWNER & POLICE AI ---
  spawnTraffic() {
    const minZ = this.player.z - 280;
    const maxZ = this.player.z - 80;
    const laneIdx = Math.floor(Math.random() * this.lanes.length);
    const laneX = this.lanes[laneIdx];

    // Check lane clearance
    for (let c of this.trafficCars) {
      if (Math.abs(c.x - laneX) < 3 && Math.abs(c.z - minZ) < 25) {
        return; // Lane occupied
      }
    }

    const trafficTypes = ['supercar', 'truck', 'muscle'];
    const randomType = trafficTypes[Math.floor(Math.random() * trafficTypes.length)];
    const colors = [0x0088ff, 0xffaa00, 0x44ff44, 0xdddddd, 0xaa00aa, 0xff3333];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const carData = this.createCarMesh({ bodyType: randomType }, randomColor, 0, false);
    carData.group.position.set(laneX, 0, minZ);
    this.scene.add(carData.group);

    this.trafficCars.push({
      mesh: carData.group,
      wheels: carData.wheels,
      x: laneX,
      z: minZ,
      speed: 80 + Math.random() * 60, // 80 - 140 km/h
      targetLane: laneX,
      laneChangeTimer: 5 + Math.random() * 8,
      wrecked: false
    });
  }

  spawnPolice() {
    const laneIdx = Math.floor(Math.random() * this.lanes.length);
    const laneX = this.lanes[laneIdx];
    const spawnBehind = Math.random() > 0.4;
    const zPos = spawnBehind ? this.player.z + 50 : this.player.z - 200;

    const copData = this.createCopCarMesh();
    copData.group.position.set(laneX, 0, zPos);
    this.scene.add(copData.group);

    this.copCars.push({
      mesh: copData.group,
      wheels: copData.wheels,
      redLight: copData.redLight,
      blueLight: copData.blueLight,
      x: laneX,
      z: zPos,
      speed: spawnBehind ? this.player.speed + 40 : 120,
      sirenFlash: 0,
      wrecked: false,
      ramCooldown: 0
    });

    this.sound.playSiren(true);
    this.showComboToast('🚨 POLICE PURSUIT', 'INTERCEPTOR DETECTED!');
  }

  // --- POWERUPS & COLLECTIBLES SPAWNER ---
  spawnCollectible() {
    const types = ['coin', 'coin', 'coin', 'nitro', 'shield', 'magnet'];
    if (this.mode === 'timeattack') types.push('time');

    const type = types[Math.floor(Math.random() * types.length)];
    const laneX = this.lanes[Math.floor(Math.random() * this.lanes.length)];
    const zPos = this.player.z - 180 - Math.random() * 80;

    let colMesh;
    if (type === 'coin') {
      const geo = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 16);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xff9900,
        emissiveIntensity: 0.5
      });
      colMesh = new THREE.Mesh(geo, mat);
    } else if (type === 'nitro') {
      const geo = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x0077ff,
        emissiveIntensity: 0.8
      });
      colMesh = new THREE.Mesh(geo, mat);
    } else if (type === 'shield') {
      const geo = new THREE.OctahedronGeometry(0.8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff66,
        emissiveIntensity: 0.8,
        wireframe: true
      });
      colMesh = new THREE.Mesh(geo, mat);
    } else {
      const geo = new THREE.TorusGeometry(0.6, 0.2, 8, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff00bb,
        emissive: 0xff00bb,
        emissiveIntensity: 0.7
      });
      colMesh = new THREE.Mesh(geo, mat);
    }

    colMesh.position.set(laneX, 1.0, zPos);
    this.scene.add(colMesh);
    this.collectibles.push({ mesh: colMesh, type: type, x: laneX, z: zPos });
  }

  // --- PARTICLE EMITTERS (Crash Explosion, Sparks, Nitro Flames) ---
  createExplosion(x, y, z, color = 0xff4400, count = 35) {
    const geo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.3 ? color : 0xffcc00,
        transparent: true,
        opacity: 1
      });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(x, y, z);
      this.scene.add(p);
      this.particles.push({
        mesh: p,
        vx: (Math.random() - 0.5) * 25,
        vy: 4 + Math.random() * 20,
        vz: (Math.random() - 0.5) * 25,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.4
      });
    }
  }

  createNitroFlames() {
    const geo = new THREE.SphereGeometry(0.15, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8 });
    [-0.6, 0.6].forEach(xOffset => {
      const flame = new THREE.Mesh(geo, mat);
      flame.position.set(this.player.x + xOffset, 0.4, this.player.z + 2.3);
      this.scene.add(flame);
      this.particles.push({
        mesh: flame,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 1.5,
        vz: 10 + Math.random() * 10,
        life: 0.15,
        maxLife: 0.15
      });
    });
  }

  // --- COMBO & HUD NOTIFICATIONS ---
  showComboToast(title, sub = '') {
    const container = document.getElementById('combo-container');
    const textEl = document.getElementById('combo-text');
    const subEl = document.getElementById('combo-sub');

    textEl.innerText = title;
    subEl.innerText = sub;
    container.classList.add('show');

    clearTimeout(this.comboToastTimer);
    this.comboToastTimer = setTimeout(() => {
      container.classList.remove('show');
    }, 1400);
  }

  // --- GAME LOOP & FRAME UPDATE ---
  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.1);

    if (this.state === 'PLAYING') {
      this.updatePhysics(dt);
      this.updateRoadSegments();
      this.updateTraffic(dt);
      this.updatePolice(dt);
      this.updateCollectibles(dt);
      this.updateParticles(dt);
      this.updateCamera(dt);
      this.updateHUD(dt);
      this.drawRadar();

      // Keep morning sun disc ahead in horizon
      if (this.sunGroup) {
        this.sunGroup.position.z = this.player.z - 380;
      }
      if (this.morningSparkles) {
        this.morningSparkles.position.z = this.player.z;
      }
    } else if (this.state === 'MENU' || this.state === 'GAMEOVER') {
      // Rotate car slowly on showcase
      if (this.player.mesh) {
        this.player.mesh.rotation.y += 0.01;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  // --- VEHICLE DRIVING PHYSICS & INPUT SIMULATION ---
  updatePhysics(dt) {
    const p = this.player;

    // Nitro handling
    p.isNitro = this.keys.nitro && p.nitro > 0 && p.speed > 50;
    if (p.isNitro) {
      p.nitro = Math.max(0, p.nitro - dt * 25);
      this.createNitroFlames();
      this.sound.playNitro();
      document.getElementById('nitro-overlay').classList.add('active');
      document.getElementById('speed-lines').classList.add('active');
    } else {
      // Slow passive nitro recharge
      p.nitro = Math.min(p.maxNitro, p.nitro + dt * 4);
      document.getElementById('nitro-overlay').classList.remove('active');
      if (p.speed < 220) document.getElementById('speed-lines').classList.remove('active');
    }

    // Acceleration & Braking
    const effectiveMaxSpeed = p.isNitro ? p.maxSpeed * 1.3 : p.maxSpeed;
    if (this.keys.forward) {
      const accelRate = p.isNitro ? p.accel * 1.6 : p.accel;
      p.speed = Math.min(effectiveMaxSpeed, p.speed + accelRate * dt);
    } else if (this.keys.backward) {
      p.speed = Math.max(-30, p.speed - p.braking * dt);
    } else {
      // Natural rolling drag
      p.speed = Math.max(0, p.speed - 22 * dt);
    }

    // Top speed tracking
    if (p.speed > this.topSpeedReached) {
      this.topSpeedReached = Math.round(p.speed);
    }

    // High speed warp effect
    if (p.speed > 220) {
      document.getElementById('speed-lines').classList.add('active');
    }

    // Steering Physics & Drift
    const speedFactor = Math.min(1.0, p.speed / 70);
    let steerInput = 0;
    if (this.keys.left) steerInput -= 1;
    if (this.keys.right) steerInput += 1;

    const steerMult = this.keys.drift ? 1.4 : 1.0;
    p.turnVelocity = THREE.MathUtils.lerp(p.turnVelocity, steerInput * p.steerSpeed * speedFactor * steerMult, dt * 10);
    p.x += p.turnVelocity * dt;

    // Highway boundaries & Guardrail bouncing
    const maxRoadX = this.roadWidth / 2 - 1.5;
    if (p.x < -maxRoadX) {
      p.x = -maxRoadX;
      p.turnVelocity = Math.abs(p.turnVelocity) * 0.5;
      this.takeDamage(5);
      this.createExplosion(p.x, 0.5, p.z, 0xffaa00, 10);
    } else if (p.x > maxRoadX) {
      p.x = maxRoadX;
      p.turnVelocity = -Math.abs(p.turnVelocity) * 0.5;
      this.takeDamage(5);
      this.createExplosion(p.x, 0.5, p.z, 0xffaa00, 10);
    }

    // Forward displacement (z-axis negative is forward)
    const speedMps = (p.speed * 1000) / 3600;
    p.z -= speedMps * dt;
    this.distance += (speedMps * dt) / 1000;

    // Mesh transforms & visual body roll
    p.mesh.position.set(p.x, p.y, p.z);
    p.mesh.rotation.y = -p.turnVelocity * 0.02;
    p.mesh.rotation.z = -p.turnVelocity * 0.015;

    // Wheel rotation
    const wheelRotSpeed = (speedMps / 0.42) * dt;
    p.wheels.forEach((w, idx) => {
      w.rotation.x += wheelRotSpeed;
      if (idx < 2) { // Front wheels steer
        w.rotation.y = steerInput * 0.35;
      }
    });

    // Audio RPM update
    this.sound.updateEngine(p.speed / p.maxSpeed, p.isNitro);

    // Score accumulation based on speed
    if (p.speed > 50) {
      const speedBonus = Math.floor((p.speed / 100) * 10 * this.comboMultiplier);
      this.score += Math.floor(speedBonus * dt * 10);
    }

    // Shield visibility
    if (p.shieldMesh) {
      p.shieldMesh.visible = p.shieldActive;
      if (p.shieldActive) p.shieldMesh.rotation.y += dt * 3;
    }
  }

  // --- HIGHWAY INFINITE SCROLLING ---
  updateRoadSegments() {
    const pZ = this.player.z;
    this.highwaySegments.forEach(seg => {
      if (seg.position.z > pZ + this.segmentLength) {
        // Recycle segment forward
        const furthestZ = Math.min(...this.highwaySegments.map(s => s.position.z));
        seg.position.z = furthestZ - this.segmentLength;
      }
    });
  }

  // --- TRAFFIC AI & LANE LOGIC ---
  updateTraffic(dt) {
    this.spawnTimer += dt;
    if (this.spawnTimer > 1.2) {
      this.spawnTimer = 0;
      if (this.trafficCars.length < 16) {
        this.spawnTraffic();
      }
    }

    const p = this.player;
    const pBox = new THREE.Box3().setFromObject(p.mesh);

    for (let i = this.trafficCars.length - 1; i >= 0; i--) {
      const car = this.trafficCars[i];

      if (!car.wrecked) {
        // Forward motion
        const speedMps = (car.speed * 1000) / 3600;
        car.z -= speedMps * dt;

        // Lane change AI
        car.laneChangeTimer -= dt;
        if (car.laneChangeTimer <= 0) {
          car.laneChangeTimer = 6 + Math.random() * 8;
          const randomLane = this.lanes[Math.floor(Math.random() * this.lanes.length)];
          car.targetLane = randomLane;
        }
        car.x = THREE.MathUtils.lerp(car.x, car.targetLane, dt * 1.5);
        car.mesh.position.set(car.x, 0, car.z);

        // Wheel animation
        car.wheels.forEach(w => w.rotation.x += (speedMps / 0.42) * dt);

        // Check Near-Miss with Player
        const zDist = Math.abs(car.z - p.z);
        const xDist = Math.abs(car.x - p.x);
        if (zDist < 3.8 && xDist < 3.2 && xDist > 1.8 && p.speed > 140) {
          if (!car.nearMissTriggered) {
            car.nearMissTriggered = true;
            this.nearMisses++;
            this.score += 350 * this.comboMultiplier;
            p.nitro = Math.min(p.maxNitro, p.nitro + 25);
            this.sound.playNearMiss();
            this.showComboToast('⚡ NEAR MISS!', '+350 PTS | NITRO REFILL');
          }
        }

        // Collision Check with Player
        const carBox = new THREE.Box3().setFromObject(car.mesh);
        if (pBox.intersectsBox(carBox)) {
          this.handleCollisionWithTraffic(car);
        }
      } else {
        // Wrecked car spinning / sliding
        car.z -= 10 * dt;
        car.mesh.rotation.y += 4 * dt;
        car.mesh.rotation.x += 2 * dt;
        car.mesh.position.y += 2 * dt;
      }

      // Despawn if far behind or too far ahead
      if (car.z > p.z + 100 || car.z < p.z - 400) {
        this.scene.remove(car.mesh);
        this.trafficCars.splice(i, 1);
      }
    }
  }

  // --- POLICE INTERCEPTOR AI ---
  updatePolice(dt) {
    if (this.mode !== 'police' && this.mode !== 'demolition') return;

    this.copSpawnTimer += dt;
    if (this.copSpawnTimer > 12) {
      this.copSpawnTimer = 0;
      if (this.copCars.length < 3) {
        this.spawnPolice();
      }
    }

    const p = this.player;
    const pBox = new THREE.Box3().setFromObject(p.mesh);

    for (let i = this.copCars.length - 1; i >= 0; i--) {
      const cop = this.copCars[i];

      if (!cop.wrecked) {
        // Chase & Ramming AI
        const dx = p.x - cop.x;
        cop.x += Math.sign(dx) * Math.min(Math.abs(dx), dt * 14);

        // Speed adjustment to match and overtake player
        if (cop.z > p.z) {
          cop.speed = THREE.MathUtils.lerp(cop.speed, p.speed + 35, dt * 2);
        } else {
          cop.speed = THREE.MathUtils.lerp(cop.speed, p.speed - 15, dt * 2);
        }

        const speedMps = (cop.speed * 1000) / 3600;
        cop.z -= speedMps * dt;
        cop.mesh.position.set(cop.x, 0, cop.z);

        // Flashing Siren Lights
        cop.sirenFlash += dt * 10;
        const isRed = Math.sin(cop.sirenFlash) > 0;
        cop.redLight.material.color.setHex(isRed ? 0xff0000 : 0x220000);
        cop.blueLight.material.color.setHex(!isRed ? 0x0066ff : 0x000033);

        // Collision with player
        const copBox = new THREE.Box3().setFromObject(cop.mesh);
        if (pBox.intersectsBox(copBox)) {
          this.handleCollisionWithCop(cop);
        }
      }

      if (cop.z > p.z + 120 || cop.z < p.z - 450) {
        this.scene.remove(cop.mesh);
        this.copCars.splice(i, 1);
        if (this.copCars.length === 0) this.sound.playSiren(false);
      }
    }
  }

  // --- COLLECTIBLES & MAGNET UPDATE ---
  updateCollectibles(dt) {
    this.powerupTimer += dt;
    if (this.powerupTimer > 2.5) {
      this.powerupTimer = 0;
      if (this.collectibles.length < 8) {
        this.spawnCollectible();
      }
    }

    const p = this.player;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.mesh.rotation.y += 2.5 * dt;

      // Magnet pull logic
      if (p.magnetActive && col.type === 'coin') {
        const dx = p.x - col.x;
        const dz = p.z - col.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 30) {
          col.x += (dx / dist) * 45 * dt;
          col.z += (dz / dist) * 45 * dt;
          col.mesh.position.set(col.x, 1.0, col.z);
        }
      }

      // Collect pickup
      const distToPlayer = Math.hypot(col.x - p.x, col.z - p.z);
      if (distToPlayer < 2.5) {
        this.handleCollectItem(col.type);
        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
        continue;
      }

      if (col.z > p.z + 50) {
        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
      }
    }
  }

  handleCollectItem(type) {
    switch(type) {
      case 'coin':
        this.cash += 50;
        this.runCash += 50;
        this.score += 200 * this.comboMultiplier;
        this.sound.playCoin();
        this.showComboToast('💰 CASH +$50', 'BOUNTY COLLECTED');
        break;
      case 'nitro':
        this.player.nitro = this.player.maxNitro;
        this.sound.playPowerup();
        this.showComboToast('🔥 NITRO REFILLED!', '100% NOS TANK READY');
        break;
      case 'shield':
        this.player.shieldActive = true;
        this.sound.playPowerup();
        this.showComboToast('🛡️ ENERGY SHIELD', 'INVULNERABILITY ACTIVE');
        break;
      case 'magnet':
        this.player.magnetActive = true;
        this.sound.playPowerup();
        this.showComboToast('🧲 COIN MAGNET', 'ATTRACTING NEARBY CASH');
        setTimeout(() => { this.player.magnetActive = false; }, 10000);
        break;
      case 'time':
        this.modeTimer += 15;
        this.sound.playPowerup();
        this.showComboToast('⏱️ TIME BONUS', '+15 SECONDS EXTENSION');
        break;
    }
  }

  // --- COLLISION RESPONSE & DAMAGE ---
  handleCollisionWithTraffic(car) {
    const p = this.player;

    if (p.shieldActive || p.isNitro || this.mode === 'demolition') {
      // Ram & Wreck rival car
      car.wrecked = true;
      this.carsWrecked++;
      this.score += 1500 * this.comboMultiplier;
      this.runCash += 250;
      this.cash += 250;
      this.createExplosion(car.x, 1.2, car.z, 0xff0044, 45);
      this.sound.playCrash(1.5);
      this.showComboToast('💥 DEMOLITION SMASH!', '+$250 BOUNTY | RIVAL TOTALED');

      if (p.shieldActive && !p.isNitro) {
        p.shieldActive = false; // Consume shield
      }
    } else {
      // Standard crash
      const impactSpeed = Math.abs(p.speed - car.speed);
      const damage = Math.round(impactSpeed * 0.4 + 15);
      this.takeDamage(damage);
      p.speed *= 0.45;
      this.createExplosion(p.x, 1, p.z, 0xffcc00, 25);
      this.sound.playCrash(1.0);
      this.triggerDamageFX();
    }
  }

  handleCollisionWithCop(cop) {
    const p = this.player;

    if (p.shieldActive || p.isNitro) {
      cop.wrecked = true;
      this.carsWrecked++;
      this.score += 2500;
      this.runCash += 500;
      this.cash += 500;
      this.createExplosion(cop.x, 1.2, cop.z, 0x00ffff, 50);
      this.sound.playCrash(1.8);
      this.showComboToast('🚨 COP TOTALED!', '+$500 BOUNTY | PURSUIT EVADED');
    } else {
      const damage = 30;
      this.takeDamage(damage);
      p.speed *= 0.6;
      this.createExplosion(p.x, 1, p.z, 0xff0000, 30);
      this.sound.playCrash(1.2);
      this.triggerDamageFX();
    }
  }

  takeDamage(amount) {
    this.player.health = Math.max(0, this.player.health - amount);
    if (this.player.health <= 0) {
      this.gameOver("Catastrophic crash on Highway 101");
    }
  }

  triggerDamageFX() {
    const vig = document.getElementById('vignette-damage');
    vig.style.opacity = '1';
    setTimeout(() => { vig.style.opacity = '0'; }, 300);
  }

  // --- PARTICLE PHYSICS UPDATE ---
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.vy -= 25 * dt; // Gravity
      p.mesh.scale.multiplyScalar(0.95);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  // --- DYNAMIC CAMERA SYSTEM ---
  updateCamera(dt) {
    const p = this.player;

    if (this.cameraMode === 0) {
      // Third-Person Dynamic Chase Cam with speed zoom
      const fovSpeed = 65 + (p.speed / p.maxSpeed) * 18;
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, fovSpeed, dt * 5);
      this.camera.updateProjectionMatrix();

      const targetCamX = p.x * 0.7;
      const targetCamY = 3.8 + (p.speed / 100) * 0.5;
      const targetCamZ = p.z + 8.5;

      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, dt * 12);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, dt * 10);
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, dt * 15);

      this.camera.lookAt(p.x * 0.4, 1.2, p.z - 18);
    } else if (this.cameraMode === 1) {
      // First-person Hood / Cockpit View
      this.camera.fov = 75;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(p.x, 1.3, p.z - 0.5);
      this.camera.lookAt(p.x, 1.1, p.z - 25);
    } else {
      // Top-Down Cinematic View
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
      this.camera.position.set(p.x, 18, p.z + 12);
      this.camera.lookAt(p.x, 0, p.z - 15);
    }
  }

  // --- HUD & SPEEDOMETER UPDATE ---
  updateHUD(dt) {
    const p = this.player;

    // Speedometer & Gear
    const displaySpeed = Math.max(0, Math.round(p.speed));
    document.getElementById('hud-speed').innerText = displaySpeed;
    const gear = Math.min(6, Math.max(1, Math.floor(displaySpeed / 45) + 1));
    document.getElementById('hud-gear').innerText = displaySpeed === 0 ? 'N' : gear;

    // Scores & Distance
    document.getElementById('hud-score').innerText = this.score.toLocaleString();
    document.getElementById('hud-distance').innerText = `${this.distance.toFixed(1)} km`;
    document.getElementById('hud-coins').innerText = `💰 $${this.runCash}`;

    // Health Bar
    const healthPercent = Math.max(0, (p.health / p.maxHealth) * 100);
    const healthFill = document.getElementById('health-bar-fill');
    healthFill.style.width = `${healthPercent}%`;
    document.getElementById('health-percent').innerText = `${Math.round(healthPercent)}%`;

    if (healthPercent < 30) {
      healthFill.style.background = '#ff1e27';
    } else if (healthPercent < 60) {
      healthFill.style.background = '#ffaa00';
    } else {
      healthFill.style.background = 'linear-gradient(90deg, #00ff66, #00f0ff)';
    }

    // Nitro Bar
    const nitroPercent = (p.nitro / p.maxNitro) * 100;
    document.getElementById('nitro-bar-fill').style.width = `${nitroPercent}%`;

    // Timer (for Time Attack or Police Evasion)
    if (this.mode === 'timeattack' || this.mode === 'police') {
      this.modeTimer -= dt;
      const mins = Math.floor(Math.max(0, this.modeTimer) / 60);
      const secs = Math.floor(Math.max(0, this.modeTimer) % 60);
      document.getElementById('hud-timer').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      if (this.modeTimer <= 0) {
        if (this.mode === 'timeattack') {
          this.gameOver("Time Expired! Checkpoint missed.");
        } else if (this.mode === 'police') {
          this.gameOver("Arrested by Police Squad!");
        }
      }
    }
  }

  // --- 2D RADAR MINI-MAP SCANNER ---
  drawRadar() {
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Radar grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h * 0.75); ctx.lineTo(w, h * 0.75);
    ctx.stroke();

    const scaleX = w / (this.roadWidth * 1.5);
    const scaleZ = 0.55;
    const playerRadarY = h * 0.75;
    const pZ = this.player.z;

    // Draw Traffic Blips (White/Cyan)
    this.trafficCars.forEach(c => {
      const rx = w / 2 + c.x * scaleX;
      const ry = playerRadarY + (c.z - pZ) * scaleZ;
      if (ry >= 0 && ry <= h) {
        ctx.fillStyle = c.wrecked ? '#ff0000' : '#ffffff';
        ctx.fillRect(rx - 2, ry - 3, 4, 6);
      }
    });

    // Draw Police Blips (Red flashing)
    this.copCars.forEach(cop => {
      const rx = w / 2 + cop.x * scaleX;
      const ry = playerRadarY + (cop.z - pZ) * scaleZ;
      if (ry >= 0 && ry <= h) {
        ctx.fillStyle = '#ff0033';
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Coins / Pickups (Gold / Green)
    this.collectibles.forEach(col => {
      const rx = w / 2 + col.x * scaleX;
      const ry = playerRadarY + (col.z - pZ) * scaleZ;
      if (ry >= 0 && ry <= h) {
        ctx.fillStyle = col.type === 'coin' ? '#ffd700' : '#00ff88';
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Player Blip (Neon Cyan Arrow)
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(w / 2 + this.player.x * scaleX, playerRadarY - 5);
    ctx.lineTo(w / 2 + this.player.x * scaleX - 4, playerRadarY + 5);
    ctx.lineTo(w / 2 + this.player.x * scaleX + 4, playerRadarY + 5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // --- GAME OVER SUMMARY ---
  gameOver(reason) {
    this.state = 'GAMEOVER';
    this.sound.playCrash(2.0);
    this.sound.playSiren(false);

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    this.savePlayerState();

    document.getElementById('hud').classList.add('hidden');
    this.showScreen('screen-gameover');

    document.getElementById('gameover-reason').innerText = reason;
    document.getElementById('gov-score').innerText = this.score.toLocaleString();
    document.getElementById('gov-distance').innerText = `${this.distance.toFixed(1)} km`;
    document.getElementById('gov-top-speed').innerText = `${this.topSpeedReached} km/h`;
    document.getElementById('gov-near-misses').innerText = this.nearMisses;
    document.getElementById('gov-wrecks').innerText = this.carsWrecked;
    document.getElementById('gov-cash-earned').innerText = `+$${this.runCash.toLocaleString()}`;
  }
}

// Instantiate game engine when window loads
window.addEventListener('DOMContentLoaded', () => {
  window.turboGame = new TurboRushGame();
});
