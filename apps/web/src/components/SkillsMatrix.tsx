import React from "react";
import { type SkillCloudSection, type AchievementTimelineSection } from "@yashuverse/portfolio-schema";
import {
  Layers,
  Award,
  Calendar,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SkillsMatrixProps {
  skillsSection?: SkillCloudSection;
  achievementsSection?: AchievementTimelineSection;
  onInspectEvidence: (evidenceId: string) => void;
}

export const SkillsMatrix: React.FC<SkillsMatrixProps> = ({
  skillsSection,
  achievementsSection,
  onInspectEvidence,
}) => {
  return (
    <section id="skills" className="py-16 md:py-24 border-t border-white/10 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-tech font-bold mb-3 shadow-liquid-card">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            EVIDENCE-BOUNDED COMPETENCIES
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-headings">
            Skills & Verified Milestones
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-body mt-2 max-w-2xl leading-relaxed">
            Technical skills and verified achievements backed by repository commits, benchmark evaluations, and cryptographic audit hashes.
          </p>
        </div>

        {/* Skills Categories Grid */}
        {skillsSection && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {skillsSection.groups.map((group) => (
              <div
                key={group.category}
                className="glass-panel rounded-3xl p-6 border border-white/10 shadow-glass flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-white/10">
                    <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                    <h3 className="text-base font-bold text-white font-headings">
                      {group.category}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {group.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-cyan-400/50 transition-colors shadow-xs"
                      >
                        <span className="text-xs font-semibold text-slate-200 font-tech">
                          {skill.name}
                        </span>

                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[10px] text-slate-400">
                            {skill.evidenceCount} ev
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              skill.level === "Specialized"
                                ? "bg-blue-900/60 text-cyan-300 border border-cyan-400/50"
                                : skill.level === "Advanced"
                                ? "bg-purple-900/50 text-purple-300 border border-purple-400/40"
                                : "bg-slate-800 text-slate-300 border border-white/10"
                            }`}
                          >
                            {skill.level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-cyan-400/80">
                  <span>ML Extracted & Proven</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements & Milestones Sub-Section */}
        {achievementsSection && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white font-headings">
                  {achievementsSection.title}
                </h3>
                {achievementsSection.subtitle && (
                  <p className="text-xs text-slate-400 font-body mt-0.5">
                    {achievementsSection.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsSection.items.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel rounded-3xl p-6 border border-white/10 shadow-glass flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-950/60 text-amber-400 border border-amber-400/40 shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white font-headings">
                            {item.title}
                          </h4>
                          <span className="text-xs text-cyan-300 font-tech">{item.issuer}</span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-body mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-tech">
                    <button
                      type="button"
                      onClick={() => onInspectEvidence(item.evidenceIds[0] || "")}
                      className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 px-3 py-1 rounded-xl border border-emerald-400/50 flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Evidence: {item.evidenceIds[0]}</span>
                    </button>

                    {item.credentialUrl && (
                      <a
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
