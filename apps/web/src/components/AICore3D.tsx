import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { AGENT_REGISTRY, type AgentId } from "@yashuverse/contracts";

interface AICore3DProps {
  reducedMotion?: boolean;
  activeAgentId?: AgentId | null;
}

export const AICore3D: React.FC<AICore3DProps> = ({ reducedMotion = false, activeAgentId }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Central Core Sphere (Apple-minimal frosted glass & metallic mesh)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeometry = new THREE.IcosahedronGeometry(1.4, 3);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.15,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      opacity: 0.85,
      transparent: true,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(coreMesh);

    // Subtle Outer Wireframe Cage
    const wireGeometry = new THREE.IcosahedronGeometry(1.42, 2);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    coreGroup.add(wireMesh);

    // Orbiting Satellite Nodes for the 8 Agents
    const agentKeys = Object.keys(AGENT_REGISTRY) as AgentId[];
    const satellites: Array<{ mesh: THREE.Mesh; angle: number; speed: number; radius: number; yOffset: number; agentId: AgentId }> = [];

    agentKeys.forEach((agentId, index) => {
      const def = AGENT_REGISTRY[agentId];
      const satGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const satMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(def.color),
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);

      // Orbital parameters
      const radius = 2.4 + (index % 3) * 0.45;
      const angle = (index / agentKeys.length) * Math.PI * 2;
      const speed = 0.006 + (index % 4) * 0.002;
      const yOffset = Math.sin(index) * 0.8;

      satMesh.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius);
      scene.add(satMesh);

      satellites.push({ mesh: satMesh, angle, speed, radius, yOffset, agentId });
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0066ff, 3.5, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const softFillLight = new THREE.PointLight(0x06b6d4, 1.5, 50);
    softFillLight.position.set(-5, -3, 3);
    scene.add(softFillLight);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!reducedMotion) {
        coreGroup.rotation.y += 0.004;
        coreGroup.rotation.x += 0.0015;

        satellites.forEach((sat) => {
          sat.angle += sat.speed;
          sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
          sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
          sat.mesh.position.y = sat.yOffset + Math.sin(sat.angle * 2) * 0.2;

          // Pulse if active agent
          if (activeAgentId && sat.agentId === activeAgentId) {
            sat.mesh.scale.set(1.8, 1.8, 1.8);
          } else {
            sat.mesh.scale.set(1, 1, 1);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion, activeAgentId]);

  return (
    <div className="relative w-full h-[360px] md:h-[460px] flex items-center justify-center overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-electric-600/5 via-transparent to-cyan-500/5" />
    </div>
  );
};
