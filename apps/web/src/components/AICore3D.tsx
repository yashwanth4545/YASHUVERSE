import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AGENT_REGISTRY, type AgentId } from "@yashuverse/contracts";
import { Zap } from "lucide-react";

interface AICore3DProps {
  reducedMotion?: boolean;
  activeAgentId?: AgentId | null;
  onSelectAgent?: (agentId: AgentId) => void;
}

export const AICore3D: React.FC<AICore3DProps> = ({
  reducedMotion = false,
  activeAgentId,
  onSelectAgent,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredAgent, setHoveredAgent] = useState<AgentId | null>(null);

  // Keep ref to activeAgentId so animation loop accesses latest state without re-mounting Three.js
  const activeAgentRef = useRef<AgentId | null>(activeAgentId || null);
  useEffect(() => {
    activeAgentRef.current = activeAgentId || null;
  }, [activeAgentId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.8);

    // 2. WebGL Renderer with High-DPI Support & Alpha Channel
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Master Group for smooth mouse parallax tilt
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // =========================================================================
    // 3. CENTRAL QUANTUM FUSION CORE (Multi-Layered Futuristic Core)
    // =========================================================================

    // Layer A: Inner Glowing Energy Sphere
    const innerEnergyGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const innerEnergyMat = new THREE.MeshBasicMaterial({
      color: 0x00d8ff,
      transparent: true,
      opacity: 0.9,
    });
    const innerEnergyMesh = new THREE.Mesh(innerEnergyGeo, innerEnergyMat);
    masterGroup.add(innerEnergyMesh);

    // Layer B: Faceted Geometric Crystalline Shell
    const crystalGeo = new THREE.IcosahedronGeometry(1.28, 1);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x002244,
      emissive: 0x0066ff,
      emissiveIntensity: 0.5,
      roughness: 0.12,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.7,
      thickness: 1.2,
      transparent: true,
      opacity: 0.82,
      wireframe: false,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    masterGroup.add(crystalMesh);

    // Layer C: Delicate Neon Grid Cage
    const cageGeo = new THREE.IcosahedronGeometry(1.31, 2);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    masterGroup.add(cageMesh);

    // =========================================================================
    // 4. PRECISION KINETIC GYROSCOPE RINGS (Brushed Titanium / Chrome)
    // =========================================================================
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      metalness: 0.95,
      roughness: 0.18,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
    });

    // Ring 1 (Outer)
    const ring1Geo = new THREE.TorusGeometry(2.35, 0.018, 16, 120);
    const ring1 = new THREE.Mesh(ring1Geo, ringMaterial);
    ring1.rotation.x = Math.PI * 0.25;
    ring1.rotation.y = Math.PI * 0.15;
    masterGroup.add(ring1);

    // Ring 2 (Mid - Inverted Tilt)
    const ring2Geo = new THREE.TorusGeometry(1.95, 0.016, 16, 120);
    const ring2 = new THREE.Mesh(ring2Geo, ringMaterial);
    ring2.rotation.x = -Math.PI * 0.35;
    ring2.rotation.z = Math.PI * 0.2;
    masterGroup.add(ring2);

    // Ring 3 (Inner Fast Ring)
    const ring3Geo = new THREE.TorusGeometry(1.62, 0.014, 16, 100);
    const ring3 = new THREE.Mesh(ring3Geo, ringMaterial);
    ring3.rotation.y = Math.PI * 0.45;
    masterGroup.add(ring3);

    // =========================================================================
    // 5. QUANTUM PARTICLE CONSTELLATION (Drifting Micro-Stars)
    // =========================================================================
    const particleCount = 450;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor1 = new THREE.Color(0x00e5ff); // Cyan
    const baseColor2 = new THREE.Color(0x3b82f6); // Electric Blue
    const baseColor3 = new THREE.Color(0xffffff); // Silver spark

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const mixChoice = Math.random();
      const col = mixChoice < 0.45 ? baseColor1 : mixChoice < 0.8 ? baseColor2 : baseColor3;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particleSystem);

    // =========================================================================
    // 6. THE 8 AUTONOMOUS AGENT NODES (Precision Crystalline Satellites)
    // =========================================================================
    const agentKeys = Object.keys(AGENT_REGISTRY) as AgentId[];
    const satellites: Array<{
      group: THREE.Group;
      crystalMesh: THREE.Mesh;
      haloMesh: THREE.Mesh;
      beam: THREE.Line;
      angle: number;
      speed: number;
      orbitRadius: number;
      inclination: number;
      yOffset: number;
      agentId: AgentId;
    }> = [];

    agentKeys.forEach((agentId, index) => {
      const def = AGENT_REGISTRY[agentId];
      const agentGroup = new THREE.Group();
      masterGroup.add(agentGroup);

      const nodeColor = new THREE.Color(def.color);

      // Node Geometry: Refined Octahedron Diamond Crystal
      const nodeGeo = new THREE.OctahedronGeometry(0.14, 0);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      agentGroup.add(nodeMesh);

      // Node Halo Ring
      const haloGeo = new THREE.TorusGeometry(0.22, 0.012, 8, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.6,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI * 0.5;
      agentGroup.add(haloMesh);

      // Energy Tether Line from Central Core to Agent Node
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const beamMat = new THREE.LineBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.16,
      });
      const beamLine = new THREE.Line(beamGeo, beamMat);
      masterGroup.add(beamLine);

      // Orbital Trajectory Math
      const orbitRadius = 2.45 + (index % 4) * 0.32;
      const angle = (index / agentKeys.length) * Math.PI * 2;
      const speed = 0.004 + (index % 3) * 0.0018;
      const inclination = ((index % 3) - 1) * 0.35;
      const yOffset = Math.sin(index * 1.5) * 0.45;

      satellites.push({
        group: agentGroup,
        crystalMesh: nodeMesh,
        haloMesh,
        beam: beamLine,
        angle,
        speed,
        orbitRadius,
        inclination,
        yOffset,
        agentId,
      });
    });

    // =========================================================================
    // 7. LIGHTING RIG (Cinematic Studio Illumination)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Primary Electric Blue Key Light
    const keyLight = new THREE.PointLight(0x0088ff, 6.0, 30);
    keyLight.position.set(4, 4, 6);
    scene.add(keyLight);

    // Secondary Cyan Rim Light
    const cyanRim = new THREE.PointLight(0x00f0ff, 4.0, 30);
    cyanRim.position.set(-5, -3, 4);
    scene.add(cyanRim);

    // Deep Magenta Specular Accent
    const magentaAccent = new THREE.PointLight(0xd946ef, 2.5, 25);
    magentaAccent.position.set(0, 5, -4);
    scene.add(magentaAccent);

    // =========================================================================
    // 8. MOUSE PARALLAX & SMOOTH INERTIA
    // =========================================================================
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.45;
      targetRotationX = -y * 0.35;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // =========================================================================
    // 9. ANIMATION LOOP (Silky 60fps Rotation & Dynamic Energy Pulsing)
    // =========================================================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Parallax Lerp
      masterGroup.rotation.y += (targetRotationY - masterGroup.rotation.y) * 0.05;
      masterGroup.rotation.x += (targetRotationX - masterGroup.rotation.x) * 0.05;

      if (!reducedMotion) {
        // Core Rotations
        crystalMesh.rotation.y = elapsedTime * 0.15;
        crystalMesh.rotation.x = elapsedTime * 0.08;
        cageMesh.rotation.y = -elapsedTime * 0.12;

        // Pulse Core Scale
        const pulse = 1 + Math.sin(elapsedTime * 2.2) * 0.035;
        innerEnergyMesh.scale.set(pulse, pulse, pulse);

        // Gyroscope Ring Rotations
        ring1.rotation.z = elapsedTime * 0.12;
        ring2.rotation.x = -elapsedTime * 0.16;
        ring3.rotation.y = elapsedTime * 0.22;

        // Particle System Slow Planetary Drift
        particleSystem.rotation.y = elapsedTime * 0.04;
        particleSystem.rotation.z = elapsedTime * 0.02;

        // Update Satellites along Orbital Trajectories
        const activeTarget = activeAgentRef.current;

        satellites.forEach((sat) => {
          sat.angle += sat.speed;
          const x = Math.cos(sat.angle) * sat.orbitRadius;
          const z = Math.sin(sat.angle) * sat.orbitRadius;
          const y = Math.sin(sat.angle + sat.inclination) * sat.yOffset * 1.5;

          sat.group.position.set(x, y, z);
          sat.crystalMesh.rotation.y += 0.025;
          sat.crystalMesh.rotation.x += 0.015;
          sat.haloMesh.rotation.z += 0.03;

          // Connect Energy Tether Line
          const positions = sat.beam.geometry.attributes.position;
          if (positions) {
            positions.setXYZ(0, 0, 0, 0);
            positions.setXYZ(1, x, y, z);
            positions.needsUpdate = true;
          }

          // Dynamic Highlight if Active Agent
          const isActive = activeTarget === sat.agentId;
          const isHovered = hoveredAgent === sat.agentId;

          if (isActive || isHovered) {
            sat.group.scale.set(1.7, 1.7, 1.7);
            (sat.beam.material as THREE.LineBasicMaterial).opacity = 0.75;
          } else {
            sat.group.scale.set(1.0, 1.0, 1.0);
            (sat.beam.material as THREE.LineBasicMaterial).opacity = 0.15;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      innerEnergyGeo.dispose();
      innerEnergyMat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      ringMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion, hoveredAgent]);

  const activeAgentDef = activeAgentId ? AGENT_REGISTRY[activeAgentId] : null;

  return (
    <div className="relative w-full h-[420px] md:h-[520px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing z-10" />

      {/* Cybernetic Radial Glow Aura */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/15 via-cyan-500/5 to-transparent blur-2xl" />

      {/* Background Holographic Grid Accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Top Left: System Telemetry Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-300 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white">YASHUVERSE AI CORE</span>
        <span className="text-slate-500">•</span>
        <span className="text-cyan-400">8 AGENTS ONLINE</span>
      </div>

      {/* Top Right: Live Model Specification */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-mono text-slate-300 shadow-lg">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span>DAG ENGINE</span>
        <span className="text-slate-500">•</span>
        <span className="text-emerald-400">CALIBRATED ML</span>
      </div>

      {/* Active Agent Telemetry Pill (when agent is working or selected) */}
      {activeAgentDef && (
        <div className="absolute top-16 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-blue-500/50 text-xs shadow-glow animate-fade-in">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: activeAgentDef.color }}
          />
          <span className="font-bold text-white">{activeAgentDef.name}</span>
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
            {activeAgentDef.shortRole}
          </span>
        </div>
      )}

      {/* Bottom Floating Interactive Agent Nodes Dock */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-x-auto max-w-full">
          {(Object.keys(AGENT_REGISTRY) as AgentId[]).map((agentId) => {
            const def = AGENT_REGISTRY[agentId];
            const isSelected = activeAgentId === agentId;
            const isHovered = hoveredAgent === agentId;

            return (
              <button
                key={agentId}
                type="button"
                onMouseEnter={() => setHoveredAgent(agentId)}
                onMouseLeave={() => setHoveredAgent(null)}
                onClick={() => onSelectAgent?.(agentId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono transition-all duration-200 whitespace-nowrap ${
                  isSelected || isHovered
                    ? "bg-slate-800 text-white border border-slate-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
                title={def.role}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: def.color }}
                />
                <span>{def.name.replace(" Agent", "")}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
