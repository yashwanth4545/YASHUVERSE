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
  const [isIntersecting, setIsIntersecting] = useState(true);

  // Ref to active agent to avoid remounting Three scene
  const activeAgentRef = useRef<AgentId | null>(activeAgentId || null);
  useEffect(() => {
    activeAgentRef.current = activeAgentId || null;
  }, [activeAgentId]);

  // Observer to pause rendering when scrolled out of view (saves battery/GPU)
  useEffect(() => {
    const el = mountRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    // 2. High-Precision WebGL Renderer with Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Master Group for Mouse Inertia Parallax
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // =========================================================================
    // 3. CENTRAL LIQUID CHROME & PLATINUM FUSION SCULPTURE
    // =========================================================================

    // Layer A: Inner Electric Core (Energy Singularity)
    const innerCoreGeo = new THREE.SphereGeometry(0.78, 36, 36);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x0066ff,
      transparent: true,
      opacity: 0.85,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    masterGroup.add(innerCoreMesh);

    // Layer B: Liquid Chrome Refraction Shell (Apple Metallic Aesthetic)
    const chromeShellGeo = new THREE.IcosahedronGeometry(1.22, 2);
    const chromeShellMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      emissive: 0x0044cc,
      emissiveIntensity: 0.25,
      metalness: 0.94,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transmission: 0.45,
      thickness: 1.5,
      transparent: true,
      opacity: 0.88,
      reflectivity: 0.95,
      wireframe: false,
    });
    const chromeShellMesh = new THREE.Mesh(chromeShellGeo, chromeShellMat);
    masterGroup.add(chromeShellMesh);

    // Layer C: Subtle Platinum Wireframe Geodesic Edge
    const edgeGeo = new THREE.IcosahedronGeometry(1.24, 2);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    masterGroup.add(edgeMesh);

    // =========================================================================
    // 4. PRECISION KINETIC GYROSCOPE RINGS (Brushed Titanium / Polished Chrome)
    // =========================================================================
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.96,
      roughness: 0.12,
      emissive: 0x0066ff,
      emissiveIntensity: 0.18,
    });

    // Ring 1 (Outer Gimbal)
    const ring1Geo = new THREE.TorusGeometry(2.25, 0.016, 16, 128);
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    ring1.rotation.x = Math.PI * 0.28;
    ring1.rotation.y = Math.PI * 0.15;
    masterGroup.add(ring1);

    // Ring 2 (Mid Inverted Gimbal)
    const ring2Geo = new THREE.TorusGeometry(1.88, 0.014, 16, 128);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.x = -Math.PI * 0.32;
    ring2.rotation.z = Math.PI * 0.22;
    masterGroup.add(ring2);

    // Ring 3 (Inner Fast Ring)
    const ring3Geo = new THREE.TorusGeometry(1.54, 0.012, 16, 100);
    const ring3 = new THREE.Mesh(ring3Geo, ringMat);
    ring3.rotation.y = Math.PI * 0.45;
    masterGroup.add(ring3);

    // =========================================================================
    // 5. QUANTUM PARTICLE SPHERE (Silver & Cyan Stardust)
    // =========================================================================
    const particleCount = 380;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00d8ff); // Electric cyan
    const c2 = new THREE.Color(0x0066ff); // Electric blue
    const c3 = new THREE.Color(0xffffff); // Pure white sparkle

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.4 + Math.random() * 2.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const r = Math.random();
      const col = r < 0.45 ? c1 : r < 0.8 ? c2 : c3;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particleSystem);

    // =========================================================================
    // 6. 7 SPECIALIZED AGENT SATELLITES (Precision Floating Diamonds)
    // =========================================================================
    // Filter to the 7 core Phase 4 agents:
    const activeAgentsList: AgentId[] = [
      "source_agent",       // Research Agent
      "project_agent",      // Developer Agent
      "ml_intelligence",   // ML Agent
      "verification_agent", // Verification Agent
      "content_agent",      // Portfolio Agent
      "security_agent",     // Security Agent
      "quality_agent",      // Quality Agent
    ];

    const satellites: Array<{
      group: THREE.Group;
      nodeMesh: THREE.Mesh;
      haloMesh: THREE.Mesh;
      beam: THREE.Line;
      angle: number;
      speed: number;
      orbitRadius: number;
      inclination: number;
      yOffset: number;
      agentId: AgentId;
    }> = [];

    activeAgentsList.forEach((agentId, index) => {
      const def = AGENT_REGISTRY[agentId] || {
        name: agentId,
        color: "#0066ff",
      };

      const agentGroup = new THREE.Group();
      masterGroup.add(agentGroup);

      const nodeColor = new THREE.Color(def.color);

      // Node Geometry: Refined Octahedron Crystal
      const nodeGeo = new THREE.OctahedronGeometry(0.14, 0);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.65,
        roughness: 0.18,
        metalness: 0.88,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      agentGroup.add(nodeMesh);

      // Node Halo Ring
      const haloGeo = new THREE.TorusGeometry(0.22, 0.012, 8, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.65,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI * 0.5;
      agentGroup.add(haloMesh);

      // Tether Beam connecting Core to Satellite
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const beamMat = new THREE.LineBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.18,
      });
      const beamLine = new THREE.Line(beamGeo, beamMat);
      masterGroup.add(beamLine);

      // Orbital parameters
      const orbitRadius = 2.4 + (index % 3) * 0.35;
      const angle = (index / activeAgentsList.length) * Math.PI * 2;
      const speed = 0.0035 + (index % 3) * 0.0014;
      const inclination = ((index % 3) - 1) * 0.4;
      const yOffset = Math.sin(index * 1.4) * 0.4;

      satellites.push({
        group: agentGroup,
        nodeMesh,
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
    // 7. CINEMATIC THREE-POINT STUDIO LIGHTING RIG
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key Light: Crisp Studio White
    const keyLight = new THREE.PointLight(0xffffff, 3.5, 30);
    keyLight.position.set(5, 5, 6);
    scene.add(keyLight);

    // Fill Light: Vivid Electric Blue
    const fillLight = new THREE.PointLight(0x0066ff, 5.0, 30);
    fillLight.position.set(-6, -4, 5);
    scene.add(fillLight);

    // Rim Light: Cyan Accent
    const rimLight = new THREE.PointLight(0x00d8ff, 3.5, 25);
    rimLight.position.set(0, 6, -5);
    scene.add(rimLight);

    // =========================================================================
    // 8. INTERACTIVE PARALLAX & RAYCASTING
    // =========================================================================
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.42;
      targetRotationX = -y * 0.32;
    };

    container.addEventListener("mousemove", handleMouseMove);

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
    // 9. ANIMATION LOOP WITH THROTTLING AND GPU CONSERVATION
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isIntersecting) {
        return; // Pause execution when off-screen
      }

      const elapsedTime = clock.getElapsedTime();

      // Smooth Parallax Lerp
      masterGroup.rotation.y += (targetRotationY - masterGroup.rotation.y) * 0.05;
      masterGroup.rotation.x += (targetRotationX - masterGroup.rotation.x) * 0.05;

      if (!reducedMotion) {
        // Core Rotations
        chromeShellMesh.rotation.y = elapsedTime * 0.12;
        chromeShellMesh.rotation.x = elapsedTime * 0.06;
        edgeMesh.rotation.y = -elapsedTime * 0.09;

        // Subtle Core Breathing
        const pulse = 1 + Math.sin(elapsedTime * 2.0) * 0.03;
        innerCoreMesh.scale.set(pulse, pulse, pulse);

        // Gyroscope Rotations
        ring1.rotation.z = elapsedTime * 0.10;
        ring2.rotation.x = -elapsedTime * 0.14;
        ring3.rotation.y = elapsedTime * 0.18;

        // Particle Drift
        particleSystem.rotation.y = elapsedTime * 0.03;
        particleSystem.rotation.z = elapsedTime * 0.015;

        // Orbit Satellites
        const currentActive = activeAgentRef.current;

        satellites.forEach((sat) => {
          sat.angle += sat.speed;
          const x = Math.cos(sat.angle) * sat.orbitRadius;
          const z = Math.sin(sat.angle) * sat.orbitRadius;
          const y = Math.sin(sat.angle + sat.inclination) * sat.yOffset * 1.4;

          sat.group.position.set(x, y, z);
          sat.nodeMesh.rotation.y += 0.02;
          sat.nodeMesh.rotation.x += 0.01;
          sat.haloMesh.rotation.z += 0.025;

          // Update Tether Beam
          const positions = sat.beam.geometry.attributes.position;
          if (positions) {
            positions.setXYZ(0, 0, 0, 0);
            positions.setXYZ(1, x, y, z);
            positions.needsUpdate = true;
          }

          const isActive = currentActive === sat.agentId;
          const isHovered = hoveredAgent === sat.agentId;

          if (isActive || isHovered) {
            sat.group.scale.set(1.65, 1.65, 1.65);
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
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      chromeShellGeo.dispose();
      chromeShellMat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion, hoveredAgent, isIntersecting]);

  const activeAgentDef = activeAgentId ? AGENT_REGISTRY[activeAgentId] : null;

  return (
    <div className="relative w-full h-[440px] md:h-[540px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-white/80 via-slate-50/90 to-white/80 border border-slate-200/90 shadow-glass-elevated">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing z-10" />

      {/* Luxury Metallic Radial Glow Aura */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-cyan-400/5 to-transparent blur-3xl" />

      {/* Precision Apple-Style Subtle Holographic Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Left: System Telemetry Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-xs font-tech text-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold tracking-wide">YASHUVERSE 3D CORE</span>
        <span className="text-slate-400">•</span>
        <span className="text-blue-600 font-mono text-[11px]">7 AGENTS ACTIVE</span>
      </div>

      {/* Top Right: Architecture Badge */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-xs font-mono text-slate-600">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span>PBR METALLIC ENGINE</span>
      </div>

      {/* Active Agent Telemetry Tag */}
      {activeAgentDef && (
        <div className="absolute top-16 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-blue-500/50 text-xs shadow-glow-subtle animate-fade-in">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: activeAgentDef.color }}
          />
          <span className="font-bold text-slate-900">{activeAgentDef.name}</span>
          <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
            {activeAgentDef.shortRole}
          </span>
        </div>
      )}

      {/* Bottom Floating Interactive Agent Nodes Dock */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-glass overflow-x-auto max-w-full">
          {[
            "source_agent",
            "project_agent",
            "ml_intelligence",
            "verification_agent",
            "content_agent",
            "security_agent",
            "quality_agent",
          ].map((agentKey) => {
            const agentId = agentKey as AgentId;
            const def = AGENT_REGISTRY[agentId];
            if (!def) return null;
            const isSelected = activeAgentId === agentId;
            const isHovered = hoveredAgent === agentId;

            return (
              <button
                key={agentId}
                type="button"
                onMouseEnter={() => setHoveredAgent(agentId)}
                onMouseLeave={() => setHoveredAgent(null)}
                onClick={() => onSelectAgent?.(agentId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-tech transition-all duration-200 whitespace-nowrap ${
                  isSelected || isHovered
                    ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
                title={def.role}
              >
                <span
                  className="w-2 h-2 rounded-full"
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
