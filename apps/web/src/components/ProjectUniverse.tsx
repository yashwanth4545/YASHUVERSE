import React, { useState } from "react";
import { type ProjectItem, type ProjectGridSection } from "@yashuverse/portfolio-schema";
import { ProjectDetailModal } from "./ProjectDetailModal";
import {
  Github,
  Star,
  ShieldCheck,
  Layers,
  ArrowUpRight,
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
    { id: "all", label: "All Systems" },
    { id: "agents", label: "Multi-Agent Systems" },
    { id: "ml", label: "Applied ML & RAG" },
    { id: "web", label: "Distributed Web" },
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
    <section id="projects" className="py-16 md:py-24 border-t border-slate-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-tech font-semibold mb-3">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              VERIFIED REPOSITORY CATALOG
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-headings">
              Project Universe
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-body mt-1 max-w-2xl">
              Engineered production backends and interactive systems synthesized directly from GitHub repositories and verified against cryptographic evidence trails.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-tech transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
              className={`glass-panel rounded-3xl p-6 flex flex-col justify-between glass-panel-hover border transition-all duration-300 relative group ${
                project.featured
                  ? "border-blue-400/50 shadow-glass-hover ring-1 ring-blue-500/10"
                  : "border-slate-200/80"
              }`}
            >
              {project.featured && (
                <span className="absolute -top-3 right-6 text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-sm">
                  Flagship Architecture
                </span>
              )}

              <div>
                {/* Title & Star Counter */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3
                    onClick={() => setActiveModalProject(project)}
                    className="text-base sm:text-lg font-bold text-slate-900 font-headings group-hover:text-blue-600 transition-colors cursor-pointer leading-snug"
                  >
                    {project.title}
                  </h3>
                  {project.stars !== undefined && (
                    <span className="flex items-center gap-1 text-xs font-mono text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 shrink-0">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {project.stars}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/70"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 5 && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                      +{project.technologies.length - 5}
                    </span>
                  )}
                </div>
              </div>

              {/* Provenance Footer & Links */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-tech mt-auto">
                <button
                  type="button"
                  onClick={() => onInspectEvidence(project.evidenceIds[0] || "")}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors"
                  title="Inspect Cryptographic Evidence Trail"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{project.evidenceIds.length} Verified Evidence</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="View GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveModalProject(project)}
                    className="p-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
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
