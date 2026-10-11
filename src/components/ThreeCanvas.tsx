import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  className?: string;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = mediaQuery.matches;

    const currentMount = mountRef.current;
    if (!currentMount) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let mainMesh: THREE.Mesh;
    let innerMesh: THREE.Mesh;
    let particlesMesh: THREE.Points;
    let animationFrameId: number;

    try {
      scene = new THREE.Scene();

      const width = currentMount.clientWidth || 400;
      const height = currentMount.clientHeight || 400;

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 4.8;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      currentMount.appendChild(renderer.domElement);

      // Main Faceted Icosahedron (Ecosystem Node)
      const mainGeo = new THREE.IcosahedronGeometry(1.6, 1);
      const mainMat = new THREE.MeshStandardMaterial({
        color: 0x044541,
        roughness: 0.25,
        metalness: 0.85,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
      mainMesh = new THREE.Mesh(mainGeo, mainMat);
      scene.add(mainMesh);

      // Core Inner Emerald Crystal
      const innerGeo = new THREE.OctahedronGeometry(0.85, 0);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.15,
        metalness: 0.9,
        wireframe: false,
        transparent: true,
        opacity: 0.8
      });
      innerMesh = new THREE.Mesh(innerGeo, innerMat);
      scene.add(innerMesh);

      // Surrounding Constellation Particles
      const particleCount = 120;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.0 + Math.random() * 1.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i + 2] = radius * Math.cos(phi);
      }
      const particlesGeo = new THREE.BufferGeometry();
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particlesMat = new THREE.PointsMaterial({
        color: 0x34d399,
        size: 0.04,
        transparent: true,
        opacity: 0.75
      });
      particlesMesh = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particlesMesh);

      // Lighting (Three-Point Setup)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0x10b981, 2.5);
      keyLight.position.set(4, 5, 4);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x044541, 1.8);
      rimLight.position.set(-4, -3, -4);
      scene.add(rimLight);

      // Mouse parallax
      let mouseX = 0;
      let mouseY = 0;
      const handleMouseMove = (e: MouseEvent) => {
        const rect = currentMount.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Resize handler
      const handleResize = () => {
        if (!currentMount) return;
        const w = currentMount.clientWidth;
        const h = currentMount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Render loop
      const animate = () => {
        if (!prefersReducedMotion) {
          mainMesh.rotation.x += 0.003;
          mainMesh.rotation.y += 0.005;

          innerMesh.rotation.x -= 0.006;
          innerMesh.rotation.y -= 0.004;

          particlesMesh.rotation.y += 0.001;

          // Gentle mouse tilt
          mainMesh.rotation.y += (mouseX * 0.4 - mainMesh.rotation.y) * 0.05;
          mainMesh.rotation.x += (-mouseY * 0.3 - mainMesh.rotation.x) * 0.05;
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
        mainGeo.dispose();
        mainMat.dispose();
        innerGeo.dispose();
        innerMat.dispose();
        particlesGeo.dispose();
        particlesMat.dispose();
        renderer.dispose();
      };
    } catch (e) {
      console.warn('WebGL init failed, using fallback:', e);
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="w-56 h-56 rounded-full border border-emerald-500/20 bg-emerald-950/20 flex items-center justify-center animate-pulse">
          <div className="w-36 h-36 rounded-full border border-emerald-400/30 bg-[#044541]/40 flex items-center justify-center">
            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Ecosystem</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}
      aria-label="Interactive 3D Fleearn Ecosystem Graphic"
      role="img"
    />
  );
};
