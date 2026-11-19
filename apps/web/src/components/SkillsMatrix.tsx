import React from "react";
import { type SkillCloudSection, type AchievementTimelineSection } from "@yashuverse/portfolio-schema";
import {
  Award,
  Calendar,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Cpu,
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
    <section id="skills" className="py-20 md:py-32 border-t border-white/[0.06] scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>03 // EVIDENCE-BOUNDED COMPETENCIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-headings">
            Skills & Verified Milestones
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-body mt-3 max-w-2xl leading-relaxed">
            Technical competencies and verified production achievements extracted from Git AST trees, benchmark evaluations, and cryptographic audit ledgers.
          </p>
        </div>

        {/* Skills Categories Bento Grid */}
        {skillsSection && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {skillsSection.groups.map((group) => (
              <div
                key={group.category}
                className="rounded-3xl p-7 bg-[#080d1a]/85 border border-white/[0.08] hover:border-cyan-400/30 transition-all duration-500 shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-headings">
                      {group.category}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {group.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-white/[0.06] hover:border-cyan-400/40 transition-colors shadow-xs"
                      >
                        <span className="text-xs font-semibold text-slate-200 font-tech">
                          {skill.name}
                        </span>

                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[10px] text-slate-500">
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

                <div className="pt-5 mt-6 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-cyan-400/80">
                  <span>ML Extracted & Tested</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements & Milestones Sub-Section */}
        {achievementsSection && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white font-headings">
                  Chronological Proven Milestones
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Immutable milestones authenticated with git commit cryptographic hashes
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 border border-cyan-500/30 bg-cyan-950/60 px-3 py-1 rounded-full">
                {achievementsSection.items.length} Milestones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsSection.items.map((item) => {
                const primaryEvidence = item.evidenceIds?.[0] || item.id;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#080d1a]/70 border border-white/[0.08] hover:border-emerald-500/40 transition-all flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-headings mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-300 font-body leading-relaxed mb-2">{item.description}</p>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {item.date}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">Evidence: {primaryEvidence}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onInspectEvidence(primaryEvidence)}
                      className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors shrink-0"
                      title="Inspect Cryptographic Evidence"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
