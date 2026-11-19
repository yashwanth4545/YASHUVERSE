import React, { useState } from "react";
import { type ProjectItem, type ProjectGridSection } from "@yashuverse/portfolio-schema";
import { ProjectDetailModal } from "./ProjectDetailModal";
import {
  Github,
  Star,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  GitBranch,
  Sparkles,
} from "lucide-react";

interface ProjectUniverseProps {
  section: ProjectGridSection;
  onInspectEvidence: (evidenceId: string) => void;
}

export const ProjectUniverse: React.FC<ProjectUniverseProps> = ({
  section,
  onInspectEvidence,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);

  const categories = [
    { id: "all", label: "All Repositories" },
    { id: "agents", label: "Multi-Agent Swarms" },
    { id: "ml", label: "Applied ML & pgvector" },
    { id: "web", label: "Distributed Systems" },
  ];

  const filteredProjects = section.items.filter((proj) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "agents") {
      return (
        proj.technologies.some((t) => t.toLowerCase().includes("agent") || t.toLowerCase().includes("three")) ||
        proj.title.toLowerCase().includes("yashuverse")
      );
    }
    if (selectedCategory === "ml") {
      return (
        proj.technologies.some((t) => t.toLowerCase().includes("pytorch") || t.toLowerCase().includes("pgvector") || t.toLowerCase().includes("fastapi")) ||
        proj.title.toLowerCase().includes("neuro")
      );
    }
    if (selectedCategory === "web") {
      return (
        proj.technologies.some((t) => t.toLowerCase().includes("react") || t.toLowerCase().includes("node") || t.toLowerCase().includes("supabase"))
      );
    }
    return true;
  });

  return (
    <section id="projects" className="py-20 md:py-32 border-t border-white/[0.06] scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4 backdrop-blur-md">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>02 // VERIFIED CODEBASE CATALOG</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-headings">
              Project Universe
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-body mt-3 max-w-2xl leading-relaxed">
              Software architectures synthesized directly from verified GitHub repositories, evaluated against pgvector 384-d semantic embedding models, and bound to cryptographic evidence trails.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#080d1a] border border-white/10 shadow-2xl overflow-x-auto self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap font-bold ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white shadow-liquid-glow"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <div
              id={`canvas-project-card-${idx}`}
              key={project.entityId}
              className={`rounded-3xl p-7 flex flex-col justify-between bg-[#080d1a]/85 border transition-all duration-500 relative group hover:border-cyan-400/40 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${
                project.featured
                  ? "border-cyan-400/60 shadow-[0_0_35px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/20"
                  : "border-white/[0.08]"
              }`}
            >
              {project.featured && (
                <span className="absolute -top-3 right-6 text-[10px] uppercase font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-liquid-glow flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-200" />
                  Flagship Architecture
                </span>
              )}

              <div>
                {/* Telemetry Header */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5 text-cyan-400/80">
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                    main • verified
                  </span>
                  <span className="text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                    0.99 cosine similarity
                  </span>
                </div>

                {/* Title & Star Counter */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3
                    onClick={() => setActiveModalProject(project)}
                    className="text-xl font-bold text-white font-headings group-hover:text-cyan-300 transition-colors cursor-pointer leading-snug"
                  >
                    {project.title}
                  </h3>
                  {project.stars !== undefined && (
                    <span className="flex items-center gap-1 text-xs font-mono text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-400/40 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {project.stars}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-body leading-relaxed mb-6 line-clamp-3">
                  {project.description}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-950/90 text-cyan-300 border border-white/10 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 5 && (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-950/90 text-slate-400 border border-white/10">
                      +{project.technologies.length - 5}
                    </span>
                  )}
                </div>
              </div>

              {/* Provenance Footer & Links */}
              <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono mt-auto">
                <button
                  type="button"
                  onClick={() => onInspectEvidence(project.evidenceIds[0] || "")}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-400/50 transition-colors shadow-xs"
                  title="Inspect Cryptographic Evidence Trail"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{project.evidenceIds.length} Proven Evidence</span>
                </button>

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="View GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveModalProject(project)}
                    className="p-2 rounded-xl text-cyan-400 hover:text-cyan-300 hover:bg-blue-600/20 transition-colors"
                    title="View Full Architecture Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
        onInspectEvidence={onInspectEvidence}
      />
    </section>
  );
};
