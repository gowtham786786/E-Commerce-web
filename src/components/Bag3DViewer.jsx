import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RotateCcw, Play, Pause } from 'lucide-react';

const COLOR_OPTIONS = [
  { name: 'Navy Blue', hex: '#1e3a5f', bg: 'bg-[#1e3a5f]' },
  { name: 'Olive Green', hex: '#5C6B4A', bg: 'bg-[#5C6B4A]' },
  { name: 'Stealth Black', hex: '#1f242d', bg: 'bg-[#1f242d]' },
  { name: 'Desert Tan', hex: '#c28b5b', bg: 'bg-[#c28b5b]' },
];

export default function Bag3DViewer() {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // References to keep across renders
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const bagMeshRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Update color dynamically on active Three.js mesh
  useEffect(() => {
    if (bagMeshRef.current && bagMeshRef.current.material) {
      bagMeshRef.current.material.color.set(selectedColor.hex);
    }
  }, [selectedColor]);

  // Update auto-rotate on controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

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

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.08, 0.92);

    // 3. Renderer setup
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

    // Clear previous children and attach canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls (Full 360-degree rotation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.6;
    controls.enableZoom = true;
    controls.minDistance = 0.6;
    controls.maxDistance = 1.4;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't look under floor
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Mark interaction
    const onStart = () => setUserInteracted(true);
    controls.addEventListener('start', onStart);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    keyLight.position.set(2.5, 3.5, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.0);
    fillLight.position.set(-2.5, 1.5, -1.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // 6. Contact Ground Shadow (Custom soft canvas shadow texture)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d');
    const grad = shadowCtx.createRadialGradient(128, 128, 10, 128, 128, 110);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.35)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.12)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.7),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.245;
    scene.add(shadowPlane);

    // 7. Load GLTF 3D Backpack Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/backpack.glb',
      (gltf) => {
        const root = gltf.scene;

        // Metallic material for hardware (zippers, buckles, hooks)
        const metalMaterial = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          metalness: 0.88,
          roughness: 0.22
        });

        // PBR Fabric material for backpack body
        const fabricMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(selectedColor.hex),
          roughness: 0.75,
          metalness: 0.05
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
              bagMeshRef.current = child;
            }
          }
        });

        // Center model pivot at (0, 0, 0)
        // Center offset from model bounds: Y center is ~0.238
        root.position.set(0, -0.238, 0);

        scene.add(root);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error loading 3D backpack model:', err);
        setWebGlSupported(false);
        setLoading(false);
      }
    );

    // 8. Animation Render Loop
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize observer for smooth responsive scaling
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onStart);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Fallback if WebGL isn't supported
  if (!webGlSupported) {
    return (
      <div className="relative aspect-square flex items-center justify-center bg-white/50 rounded-full shadow-soft backdrop-blur-sm border border-white/60 p-8">
        <img
          src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
          alt="Featured Backpack"
          className="w-full h-full object-contain rounded-2xl drop-shadow-2xl"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square max-w-[520px] mx-auto select-none">
      {/* Ambient background glow ring */}
      <div className="absolute inset-0 bg-primary/10 rounded-full filter blur-3xl transform scale-95 pointer-events-none" />
      <div className="absolute inset-4 rounded-full bg-gradient-to-b from-white/70 to-accent/40 backdrop-blur-md border border-white/60 shadow-xl pointer-events-none" />

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-full rounded-full cursor-grab active:cursor-grabbing overflow-hidden"
        title="Click and drag to rotate 360°"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-full">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-neutral-dark tracking-wide uppercase">
            Loading 3D Model...
          </p>
        </div>
      )}

      {/* Initial drag hint tooltip (fades once user interacts) */}
      {!userInteracted && !loading && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-dark/85 text-white text-[11px] font-medium rounded-full shadow-lg backdrop-blur-sm">
            <span>Drag to rotate</span>
            <span className="text-primary-light">↻</span>
          </div>
        </div>
      )}

      {/* Interactive Controls Overlay Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[90%] flex items-center justify-between px-3 py-2 bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/80">
        {/* Color Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-neutral-dark hidden sm:inline mr-1">Color:</span>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedColor(c)}
              className={`w-6 h-6 rounded-full ${c.bg} transition-all duration-200 relative ${
                selectedColor.name === c.name
                  ? 'ring-2 ring-primary ring-offset-2 scale-110'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              title={c.name}
            />
          ))}
        </div>

        {/* View / Auto-Spin Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              autoRotate
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-neutral-100 text-neutral hover:bg-neutral-200'
            }`}
            title={autoRotate ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg bg-neutral-100 text-neutral hover:text-neutral-dark hover:bg-neutral-200 transition-all text-xs"
            title="Reset View Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
