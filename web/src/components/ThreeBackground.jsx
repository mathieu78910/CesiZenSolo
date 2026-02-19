import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import styles from "../styles/ThreeBackground.module.css";

export default function ThreeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer WebGL attaché au canvas (alpha pour garder le fond visible).
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Scène + caméra.
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    // Objet principal (forme stylée) + matériau.
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 220, 24);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 1,
      roughness: 0,
      exposure: 1.2,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Environnement HDRI "virtuel" pour des reflets métalliques.
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    // Lumières pour donner du volume et des reflets.
    const rimLight = new THREE.DirectionalLight(0xffe3c7, 1.2);
    rimLight.position.set(4, 2, 3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-4, -2, 1);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(0xfff4e6, 0.35);
    scene.add(ambient);

    // Resize canvas + recalcul de la projection.
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    let frameId;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      // Animation douce (rotation + légère oscillation verticale).
      mesh.rotation.x = elapsed * 0.35;
      mesh.rotation.y = elapsed * 0.5;
      mesh.position.y = Math.sin(elapsed * 0.6) * 0.25;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Nettoyage pour éviter les fuites mémoire.
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      pmremGenerator.dispose();
      envTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
