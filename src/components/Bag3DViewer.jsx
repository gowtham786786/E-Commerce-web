import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RotateCcw, Play, Pause } from 'lucide-react';

const COLOR_OPTIONS = [
  { name: 'Navy Blue', hex: '#1B365D', bg: 'bg-[#1B365D]' },
  { name: 'Olive Green', hex: '#5C6B4A', bg: 'bg-[#5C6B4A]' },
  { name: 'Stealth Black', hex: '#2B303A', bg: 'bg-[#2B303A]' },
  { name: 'Desert Sand', hex: '#C8A27A', bg: 'bg-[#C8A27A]' },
];

export default function Bag3DViewer() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // References across render lifecycles
  const autoRotateRef = useRef(true);
  autoRotateRef.current = autoRotate;

  const targetColorRef = useRef(new THREE.Color(COLOR_OPTIONS[0].hex));
  const fabricMeshesRef = useRef([]);

  // Animation & state refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const pivotGroupRef = useRef(null);
  const floatGroupRef = useRef(null);
  const shadowMeshRef = useRef(null);

  const ringsRef = useRef([]);
  const spheresRef = useRef([]);
  const particlesRef = useRef(null);

  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const dragVelocityRef = useRef(0);

  const targetCursorRef = useRef({ x: 0, y: 0 });
  const smoothedCursorRef = useRef({ x: 0, y: 0 });
  const scrollOffsetRef = useRef(0);

  // Update target color on color change
  useEffect(() => {
    targetColorRef.current.set(selectedColor.hex);
  }, [selectedColor]);

  // Reset to original position
  const handleReset = useCallback(() => {
    if (pivotGroupRef.current) {
      pivotGroupRef.current.rotation.y = 0;
      pivotGroupRef.current.rotation.x = 0;
    }
    if (floatGroupRef.current) {
      floatGroupRef.current.position.set(0, 0, 0);
      floatGroupRef.current.rotation.set(0, 0, 0);
    }
    dragVelocityRef.current = 0;
    targetCursorRef.current = { x: 0, y: 0 };
    smoothedCursorRef.current = { x: 0, y: 0 };
    setAutoRotate(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        setLoading(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      setLoading(false);
      return;
    }

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 540;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup (Luxury product angle, slightly elevated)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.28, 2.15);
    camera.lookAt(0, 0.02, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup (Soft, luxury showroom lighting matching reference image)
    const ambientLight = new THREE.AmbientLight(0xfffdf7, 1.3);
    scene.add(ambientLight);

    // Key Light: Warm golden-ivory from top right
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    keyLight.position.set(3.0, 4.0, 2.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill Light: Soft cool-cream from front left
    const fillLight = new THREE.DirectionalLight(0xecf3fa, 1.0);
    fillLight.position.set(-2.8, 1.8, 2.0);
    scene.add(fillLight);

    // Rim Light: Crisp edge backlight for leather & strap silhouettes
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, 2.8, -2.6);
    scene.add(rimLight);

    // Pedestal Glow Light: Soft warm point light directly above circular platform
    const pedestalLight = new THREE.PointLight(0xddeec4, 1.8, 2.0);
    pedestalLight.position.set(0, -0.32, 0.1);
    scene.add(pedestalLight);

    // 5. Circular Platform (Pedestal) at Bottom
    const platformGroup = new THREE.Group();
    platformGroup.position.set(0, -0.42, 0);

    // Pedestal Base (Cylinder with gentle bevel)
    const pedestalGeom = new THREE.CylinderGeometry(0.74, 0.78, 0.05, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf5f1ea,
      roughness: 0.42,
      metalness: 0.05,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestalMesh.receiveShadow = true;
    platformGroup.add(pedestalMesh);

    // Pedestal Top Inner Bevel Ring
    const innerRingGeom = new THREE.CylinderGeometry(0.70, 0.72, 0.012, 64);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xfaf7f2,
      roughness: 0.35,
      metalness: 0.08,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerRingMesh.position.y = 0.026;
    innerRingMesh.receiveShadow = true;
    platformGroup.add(innerRingMesh);

    // Soft Floor Shadow underneath the entire pedestal
    const floorShadowCanvas = document.createElement('canvas');
    floorShadowCanvas.width = 256;
    floorShadowCanvas.height = 256;
    const floorShadowCtx = floorShadowCanvas.getContext('2d');
    const floorGrad = floorShadowCtx.createRadialGradient(128, 128, 20, 128, 128, 120);
    floorGrad.addColorStop(0, 'rgba(40, 35, 30, 0.28)');
    floorGrad.addColorStop(0.6, 'rgba(40, 35, 30, 0.08)');
    floorGrad.addColorStop(1, 'rgba(40, 35, 30, 0)');
    floorShadowCtx.fillStyle = floorGrad;
    floorShadowCtx.fillRect(0, 0, 256, 256);

    const floorShadowTex = new THREE.CanvasTexture(floorShadowCanvas);
    const floorShadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      new THREE.MeshBasicMaterial({ map: floorShadowTex, transparent: true, depthWrite: false })
    );
    floorShadowMesh.rotation.x = -Math.PI / 2;
    floorShadowMesh.position.y = -0.028;
    platformGroup.add(floorShadowMesh);

    // Glowing Halo on Platform Surface
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 256;
    haloCanvas.height = 256;
    const haloCtx = haloCanvas.getContext('2d');
    const haloGrad = haloCtx.createRadialGradient(128, 128, 5, 128, 128, 120);
    haloGrad.addColorStop(0, 'rgba(215, 238, 185, 0.55)');
    haloGrad.addColorStop(0.4, 'rgba(215, 238, 185, 0.22)');
    haloGrad.addColorStop(0.8, 'rgba(215, 238, 185, 0.05)');
    haloGrad.addColorStop(1, 'rgba(215, 238, 185, 0)');
    haloCtx.fillStyle = haloGrad;
    haloCtx.fillRect(0, 0, 256, 256);

    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const haloMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 1.3),
      new THREE.MeshBasicMaterial({
        map: haloTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.y = 0.034;
    platformGroup.add(haloMesh);

    // Dynamic Contact Occlusion Shadow directly under the floating backpack
    const contactShadowCanvas = document.createElement('canvas');
    contactShadowCanvas.width = 256;
    contactShadowCanvas.height = 256;
    const contactCtx = contactShadowCanvas.getContext('2d');
    const contactGrad = contactCtx.createRadialGradient(128, 128, 15, 128, 128, 115);
    contactGrad.addColorStop(0, 'rgba(25, 28, 35, 0.45)');
    contactGrad.addColorStop(0.5, 'rgba(25, 28, 35, 0.16)');
    contactGrad.addColorStop(1, 'rgba(25, 28, 35, 0)');
    contactCtx.fillStyle = contactGrad;
    contactCtx.fillRect(0, 0, 256, 256);

    const contactShadowTex = new THREE.CanvasTexture(contactShadowCanvas);
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.78),
      new THREE.MeshBasicMaterial({ map: contactShadowTex, transparent: true, depthWrite: false })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.036;
    shadowMeshRef.current = shadowMesh;
    platformGroup.add(shadowMesh);

    scene.add(platformGroup);

    // 6. Pivot Group & Floating Group Hierarchy
    // pivotGroup handles continuous 360° rotation & user drag
    const pivotGroup = new THREE.Group();
    pivotGroupRef.current = pivotGroup;
    scene.add(pivotGroup);

    // floatGroup handles zero-gravity vertical floating & subtle cursor parallax tilt
    const floatGroup = new THREE.Group();
    floatGroupRef.current = floatGroup;
    pivotGroup.add(floatGroup);

    // 7. Glowing Orbital Rings (Inspired directly by the reference image)
    const ringConfigs = [
      {
        radius: 0.60,
        tube: 0.0068,
        rotX: Math.PI * 0.16,
        rotZ: -Math.PI * 0.10,
        speed: 0.45,
        color: 0xd4fca4,
        emissive: 0x86b856,
        beadsCount: 3
      },
      {
        radius: 0.72,
        tube: 0.0058,
        rotX: -Math.PI * 0.14,
        rotZ: Math.PI * 0.22,
        speed: -0.32,
        color: 0xebffcc,
        emissive: 0x9cd96a,
        beadsCount: 2
      },
      {
        radius: 0.52,
        tube: 0.0048,
        rotX: Math.PI * 0.08,
        rotZ: Math.PI * 0.28,
        speed: 0.38,
        color: 0xbce388,
        emissive: 0x76b548,
        beadsCount: 2
      }
    ];

    const rings = [];
    ringConfigs.forEach((cfg) => {
      const ringHolder = new THREE.Group();
      ringHolder.rotation.x = cfg.rotX;
      ringHolder.rotation.z = cfg.rotZ;

      const ringGeom = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 120);
      const ringMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.emissive,
        emissiveIntensity: 2.4,
        roughness: 0.12,
        metalness: 0.25,
        transparent: true,
        opacity: 0.88,
      });

      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringHolder.add(ringMesh);

      // Glowing light beads traveling along the ring
      const beads = [];
      const beadGeom = new THREE.SphereGeometry(cfg.tube * 2.2, 16, 16);
      const beadMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
      });

      for (let b = 0; b < cfg.beadsCount; b++) {
        const bead = new THREE.Mesh(beadGeom, beadMat);
        const offset = (b / cfg.beadsCount) * Math.PI * 2;
        ringHolder.add(bead);
        beads.push({ mesh: bead, radius: cfg.radius, offset });
      }

      floatGroup.add(ringHolder);
      rings.push({ holder: ringHolder, speed: cfg.speed, beads });
    });
    ringsRef.current = rings;

    // 8. Floating 3D Spheres (Cream and Olive spheres orbiting around the backpack)
    const sphereConfigs = [
      // Deep Glossy Olive Green Spheres
      { radius: 0.046, color: 0x364e36, roughness: 0.14, metalness: 0.2, orbitR: 0.64, baseY: 0.14, speed: 0.45, phase: 0.6 },
      { radius: 0.034, color: 0x3d563d, roughness: 0.16, metalness: 0.18, orbitR: 0.56, baseY: 0.32, speed: 0.36, phase: 2.9 },
      { radius: 0.024, color: 0x476247, roughness: 0.18, metalness: 0.15, orbitR: 0.48, baseY: -0.06, speed: 0.55, phase: 4.8 },
      // Soft Pearlescent Cream / Ivory Spheres
      { radius: 0.050, color: 0xf6f3ec, roughness: 0.32, metalness: 0.06, orbitR: 0.60, baseY: -0.16, speed: 0.40, phase: 1.9 },
      { radius: 0.038, color: 0xf8f6f2, roughness: 0.30, metalness: 0.08, orbitR: 0.68, baseY: 0.38, speed: 0.34, phase: 4.1 },
      { radius: 0.022, color: 0xeeebe4, roughness: 0.35, metalness: 0.05, orbitR: 0.44, baseY: 0.10, speed: 0.50, phase: 5.6 },
    ];

    const spheres = [];
    sphereConfigs.forEach((sc) => {
      const geom = new THREE.SphereGeometry(sc.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: sc.color,
        roughness: sc.roughness,
        metalness: sc.metalness,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      floatGroup.add(mesh);

      spheres.push({
        mesh,
        orbitR: sc.orbitR,
        baseY: sc.baseY,
        speed: sc.speed,
        phase: sc.phase
      });
    });
    spheresRef.current = spheres;

    // 9. Subtle Ambient Background Particles
    const particleCount = 48;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const creamColor = new THREE.Color(0xf2ece1);
    const oliveColor = new THREE.Color(0xc0d8a4);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 1.8;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1.2 + 0.1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;

      const c = Math.random() > 0.5 ? creamColor : oliveColor;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.016,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 10. Load 3D Backpack GLTF Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/backpack.glb',
      (gltf) => {
        const root = gltf.scene;
        fabricMeshesRef.current = [];

        // Metallic material for hardware (zippers, buckles, hooks)
        const metalMaterial = new THREE.MeshStandardMaterial({
          color: 0xc8ced6,
          metalness: 0.92,
          roughness: 0.22
        });

        // PBR Fabric material for backpack body
        const fabricMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(selectedColor.hex),
          roughness: 0.72,
          metalness: 0.08
        });

        root.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const name = (child.name || '').toLowerCase();
            if (name.includes('hook') || name.includes('buckle') || name.includes('zip') || name.includes('pin')) {
              child.material = metalMaterial;
            } else {
              child.material = fabricMaterial;
              fabricMeshesRef.current.push(child);
            }
          }
        });

        // Align model center pivot accurately inside floatGroup
        root.position.set(0, -0.238, 0);
        floatGroup.add(root);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error loading 3D backpack model:', err);
        setWebGlSupported(false);
        setLoading(false);
      }
    );

    // 11. Mouse & Drag Interaction Handlers
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
      setUserInteracted(true);
    };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetCursorRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny))
      };

      if (isDraggingRef.current && pivotGroupRef.current) {
        const deltaX = e.clientX - previousPointerPosRef.current.x;
        dragVelocityRef.current = deltaX * 0.008;
        pivotGroupRef.current.rotation.y += dragVelocityRef.current;
        previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onPointerLeave = () => {
      isDraggingRef.current = false;
      targetCursorRef.current = { x: 0, y: 0 };
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);

    // Scroll Parallax Handler
    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      scrollOffsetRef.current = Math.max(-0.04, Math.min(0.04, scrollY * 0.00015));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 12. Main Animation Render Loop
    let clock = new THREE.Clock();
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Smooth cursor lerping
      smoothedCursorRef.current.x += (targetCursorRef.current.x - smoothedCursorRef.current.x) * 0.06;
      smoothedCursorRef.current.y += (targetCursorRef.current.y - smoothedCursorRef.current.y) * 0.06;

      // Color transition on backpack fabric
      if (fabricMeshesRef.current.length > 0) {
        fabricMeshesRef.current.forEach((mesh) => {
          if (mesh.material && mesh.material.color) {
            mesh.material.color.lerp(targetColorRef.current, 0.08);
          }
        });
      }

      // Continuous 360-degree rotation (Auto-rotate or Drag decay)
      if (pivotGroupRef.current) {
        if (autoRotateRef.current && !isDraggingRef.current) {
          // ~360° every 12 seconds
          pivotGroupRef.current.rotation.y += (Math.PI * 2 / 12) * delta;
        } else if (!isDraggingRef.current && Math.abs(dragVelocityRef.current) > 0.0001) {
          pivotGroupRef.current.rotation.y += dragVelocityRef.current;
          dragVelocityRef.current *= 0.94; // smooth damping
        }
      }

      // Zero-Gravity Floating & Bobbing Tilt Motion
      if (floatGroupRef.current) {
        const floatOffset = Math.sin(time * 1.5) * 0.024;
        floatGroupRef.current.position.y = floatOffset + scrollOffsetRef.current;

        // Subtle forward/backward & sideways tilt with mouse parallax
        floatGroupRef.current.rotation.x = Math.sin(time * 1.2) * 0.035 + (smoothedCursorRef.current.y * 0.08);
        floatGroupRef.current.rotation.z = Math.cos(time * 1.0) * 0.025 - (smoothedCursorRef.current.x * 0.06);

        // Update contact shadow underneath backpack
        if (shadowMeshRef.current) {
          const shadowScale = 1.0 + floatOffset * 3.5;
          shadowMeshRef.current.scale.set(shadowScale, shadowScale, 1.0);
          shadowMeshRef.current.material.opacity = 0.36 - floatOffset * 2.8;
        }
      }

      // Orbital Rings Rotation & Energy Beads Movement
      ringsRef.current.forEach((r, idx) => {
        if (autoRotateRef.current) {
          r.holder.rotation.y += r.speed * delta;
        }
        // Move glowing beads along ring circumference
        r.beads.forEach((b) => {
          const angle = time * r.speed * 1.2 + b.offset;
          b.mesh.position.set(
            Math.cos(angle) * b.radius,
            0,
            Math.sin(angle) * b.radius
          );
        });
      });

      // Floating Cream & Olive Spheres Orbit
      spheresRef.current.forEach((s) => {
        const angle = time * s.speed + s.phase;
        const currentY = s.baseY + Math.sin(time * 1.6 + s.phase) * 0.035;
        s.mesh.position.set(
          Math.cos(angle) * s.orbitR,
          currentY,
          Math.sin(angle) * s.orbitR
        );
      });

      // Ambient Particles Slow Drift
      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] += 0.0012; // slow upward drift
          arr[i * 3] += Math.sin(time * 0.5 + i) * 0.0004; // subtle wobble
          if (arr[i * 3 + 1] > 0.75) {
            arr[i * 3 + 1] = -0.45;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 13. Responsive Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);

      renderer.dispose();
      scene.clear();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Graceful fallback if WebGL is unavailable
  if (!webGlSupported) {
    return (
      <div className="relative aspect-square flex items-center justify-center bg-white/50 rounded-3xl shadow-soft backdrop-blur-sm border border-white/60 p-8">
        <img
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
          alt="Featured Backpack"
          className="w-full h-full object-contain rounded-2xl drop-shadow-2xl"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-square lg:aspect-[1.15/1] max-w-[620px] mx-auto select-none flex flex-col items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing outline-none"
        title="Interactive 3D Product: Hover to tilt, drag to rotate 360°"
      />

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xs rounded-3xl pointer-events-none">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-neutral-dark tracking-wider uppercase">
            Loading 3D Showcase...
          </p>
        </div>
      )}

      {/* Initial drag hint tooltip (fades once user interacts) */}
      {!userInteracted && !loading && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-500 animate-bounce">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900/80 text-white text-[11px] font-medium rounded-full shadow-lg backdrop-blur-sm">
            <span>Hover or drag to inspect</span>
            <span className="text-primary-light">↻</span>
          </div>
        </div>
      )}

      {/* Luxury Controls Pill (Matches reference image style) */}
      <div className="absolute bottom-2 right-2 sm:right-4 z-20 flex items-center justify-between gap-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-neutral-200/80">
        {/* Color Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-900 mr-1">Color:</span>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedColor(c)}
              className={`w-6 h-6 rounded-full ${c.bg} transition-all duration-300 relative ${selectedColor.name === c.name
                  ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-sm'
                  : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
              title={c.name}
              aria-label={`Select ${c.name}`}
            />
          ))}
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-neutral-200" />

        {/* Play/Pause & Reset Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-full transition-all text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 ${!autoRotate ? 'text-primary bg-primary/10' : ''
              }`}
            title={autoRotate ? 'Pause Animation' : 'Resume Animation'}
            aria-label={autoRotate ? 'Pause Animation' : 'Resume Animation'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-full text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
            title="Reset Position"
            aria-label="Reset Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
