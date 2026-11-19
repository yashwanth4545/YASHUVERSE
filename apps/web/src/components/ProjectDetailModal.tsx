import React from "react";
import { type ProjectItem } from "@yashuverse/portfolio-schema";
import {
  X,
  ExternalLink,
  Github,
  Star,
  ShieldCheck,
  GitCommit,
} from "lucide-react";

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onInspectEvidence: (evidenceId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onInspectEvidence,
}) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Top Close Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {project.status}
              </span>
              {project.featured && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold">
                  Featured Architecture
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-headings">
              {project.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Description */}
        <p className="text-sm text-slate-600 font-body leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Technologies Grid */}
        <div className="mb-6">
          <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Core Technologies & Tooling
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200/80 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Cryptographic Evidence & Verification Trail */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 mb-6">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-900 font-tech">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Provenance ({project.evidenceIds.length} Verified Records)</span>
          </div>
          <p className="text-xs text-emerald-800/90 font-tech mb-3 leading-relaxed">
            Every feature and claim in this project is verified against immutable Git commits and repository releases.
          </p>

          <div className="flex flex-wrap gap-2">
            {project.evidenceIds.map((evId) => (
              <button
                key={evId}
                type="button"
                onClick={() => {
                  onClose();
                  onInspectEvidence(evId);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-mono hover:bg-emerald-50 transition-colors shadow-xs"
              >
                <GitCommit className="w-3 h-3 text-emerald-600" />
                <span>{evId}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-tech">
          {project.stars !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-600 font-mono">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{project.stars} Stars</span>
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Github className="w-4 h-4" />
                <span>View Repository</span>
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span>Live Deployment</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
