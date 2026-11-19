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
    <section id="skills" className="py-16 md:py-24 border-t border-slate-200/80 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-tech font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            EVIDENCE-BOUNDED COMPETENCIES
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-headings">
            Skills & Verified Milestones
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-body mt-1 max-w-2xl">
            Technical skills and verified achievements backed by repository commits, benchmark evaluations, and cryptographic audit hashes.
          </p>
        </div>

        {/* Skills Categories Grid */}
        {skillsSection && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {skillsSection.groups.map((group) => (
              <div
                key={group.category}
                className="glass-panel rounded-3xl p-6 border border-slate-200/80 shadow-glass flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                    <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 font-headings">
                      {group.category}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {group.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/90 border border-slate-200/70 hover:border-blue-400/50 transition-colors shadow-xs"
                      >
                        <span className="text-xs font-medium text-slate-800 font-tech">
                          {skill.name}
                        </span>

                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[10px] text-slate-400">
                            {skill.evidenceCount} ev
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              skill.level === "Specialized"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : skill.level === "Advanced"
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : "bg-slate-50 text-slate-600"
                            }`}
                          >
                            {skill.level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>ML Extracted & Verified</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
                <h3 className="text-xl font-bold text-slate-900 font-headings">
                  {achievementsSection.title}
                </h3>
                {achievementsSection.subtitle && (
                  <p className="text-xs text-slate-500 font-body mt-0.5">
                    {achievementsSection.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsSection.items.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-200/80 shadow-glass flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 font-headings">
                            {item.title}
                          </h4>
                          <span className="text-xs text-slate-500 font-tech">{item.issuer}</span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-body mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-tech">
                    <button
                      type="button"
                      onClick={() => onInspectEvidence(item.evidenceIds[0] || "")}
                      className="text-[11px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Evidence: {item.evidenceIds[0]}</span>
                    </button>

                    {item.credentialUrl && (
                      <a
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-3 h-3" />
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
