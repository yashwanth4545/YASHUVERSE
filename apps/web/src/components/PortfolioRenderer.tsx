import React from "react";
import {
  type PortfolioDocument,
  type ProjectGridSection,
  type SkillCloudSection,
  type ExperienceListSection,
  type AchievementTimelineSection,
  type ActivityFeedSection,
} from "@yashuverse/portfolio-schema";
import {
  ShieldCheck,
  ExternalLink,
  Github,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Terminal,
  Clock,
  History,
} from "lucide-react";

interface PortfolioRendererProps {
  portfolio: PortfolioDocument;
  onInspectEvidence: (evidenceId: string) => void;
  onViewVersions?: () => void;
}

// 1. Project Grid Component
const ProjectGridComponent: React.FC<{
  section: ProjectGridSection;
  onInspectEvidence: (evidenceId: string) => void;
}> = ({ section, onInspectEvidence }) => {
  return (
    <section id="canvas-project-grid" className="py-8 scroll-mt-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{section.title}</h2>
          {section.subtitle && <p className="text-sm text-slate-500 mt-1">{section.subtitle}</p>}
        </div>
        <span className="text-xs font-mono text-slate-400">
          Component: <span className="font-semibold text-slate-600">project-grid</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {section.items.map((project, idx) => (
          <div
            id={`canvas-project-card-${idx}`}
            key={project.entityId}
            className={`glass-panel rounded-2xl p-6 flex flex-col justify-between glass-panel-hover border transition-all duration-300 relative ${
              project.featured ? "border-electric-500/40 ring-1 ring-electric-500/10 shadow-glow-subtle" : "border-slate-200/80"
            }`}
          >
            {project.featured && (
              <span className="absolute -top-2.5 right-6 text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-electric-600 text-white shadow-sm">
                Featured System
              </span>
            )}

            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{project.title}</h3>
                {project.stars !== undefined && (
                  <span className="flex items-center gap-1 text-xs font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 shrink-0">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {project.stars}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">{project.description}</p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Evidence & Links Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
              <button
                type="button"
                onClick={() => onInspectEvidence(project.evidenceIds[0] || "")}
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition-colors"
                title="Inspect cryptographic evidence trail"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Provenance ({project.evidenceIds.length})
              </button>

              <div className="flex items-center gap-2">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="View GitHub Repository"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-electric-600 hover:text-electric-700 hover:bg-blue-50 transition-colors"
                    title="Open Live Deployment"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// 2. Skill Cloud Component
const SkillCloudComponent: React.FC<{ section: SkillCloudSection }> = ({ section }) => {
  return (
    <section id="canvas-skill-cloud" className="py-8 scroll-mt-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{section.title}</h2>
          {section.subtitle && <p className="text-sm text-slate-500 mt-1">{section.subtitle}</p>}
        </div>
        <span className="text-xs font-mono text-slate-400">
          Component: <span className="font-semibold text-slate-600">skill-cloud</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {section.groups.map((group) => (
          <div
            key={group.category}
            className="glass-panel rounded-2xl p-5 border border-slate-200/80 shadow-glass"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-electric-600" />
              <h3 className="text-sm font-bold text-slate-900">{group.category}</h3>
            </div>
            <div className="space-y-2.5">
              {group.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-slate-200/60 hover:bg-white transition-colors"
                >
                  <span className="text-xs font-medium text-slate-800">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      {skill.evidenceCount} ev
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {skill.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// 3. Experience List Component
const ExperienceListComponent: React.FC<{
  section: ExperienceListSection;
  onInspectEvidence: (evidenceId: string) => void;
}> = ({ section, onInspectEvidence }) => {
  return (
    <section id="canvas-experience-list" className="py-8 scroll-mt-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{section.title}</h2>
          {section.subtitle && <p className="text-sm text-slate-500 mt-1">{section.subtitle}</p>}
        </div>
        <span className="text-xs font-mono text-slate-400">
          Component: <span className="font-semibold text-slate-600">experience-list</span>
        </span>
      </div>

      <div className="space-y-4">
        {section.items.map((item) => (
          <div
            key={item.id}
            className="glass-panel rounded-2xl p-6 border border-slate-200/80 shadow-glass"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{item.role}</h3>
                <div className="text-xs font-semibold text-electric-600">{item.company}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {item.period}
                </span>
                {item.current && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                    Active
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.summary}</p>

            <ul className="space-y-1.5 mb-4">
              {item.highlights.map((hl, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-electric-600 mt-0.5 shrink-0" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onInspectEvidence(item.evidenceIds[0] || "")}
                className="text-[11px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Experience Evidence ({item.evidenceIds.length})
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// 4. Achievement Timeline Component
const AchievementTimelineComponent: React.FC<{
  section: AchievementTimelineSection;
  onInspectEvidence: (evidenceId: string) => void;
}> = ({ section, onInspectEvidence }) => {
  return (
    <section id="canvas-achievement-timeline" className="py-8 scroll-mt-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{section.title}</h2>
          {section.subtitle && <p className="text-sm text-slate-500 mt-1">{section.subtitle}</p>}
        </div>
        <span className="text-xs font-mono text-slate-400">
          Component: <span className="font-semibold text-slate-600">achievement-timeline</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.items.map((item) => (
          <div
            key={item.id}
            className="glass-panel rounded-2xl p-5 border border-slate-200/80 shadow-glass flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <div className="text-xs text-slate-500">{item.issuer}</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onInspectEvidence(item.evidenceIds[0] || "")}
                className="text-[11px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Evidence {item.evidenceIds[0]}
              </button>
              {item.credentialUrl && (
                <a
                  href={item.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-electric-600 hover:underline flex items-center gap-1 font-medium"
                >
                  Verify Online <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// 5. Activity Feed Component
const ActivityFeedComponent: React.FC<{ section: ActivityFeedSection }> = ({ section }) => {
  return (
    <section id="canvas-activity-feed" className="py-8 scroll-mt-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{section.title}</h2>
          {section.subtitle && <p className="text-sm text-slate-500 mt-1">{section.subtitle}</p>}
        </div>
        <span className="text-xs font-mono text-slate-400">
          Component: <span className="font-semibold text-slate-600">activity-feed</span>
        </span>
      </div>

      <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 shadow-glass divide-y divide-slate-100">
        {section.items.map((item) => (
          <div key={item.id} className="py-3.5 first:pt-1 last:pb-1 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900">{item.type}</span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
                <span className="capitalize">Source: {item.source}</span>
                <span>Evidence: {item.evidenceId}</span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-electric-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    View commit <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Approved Component Whitelist Registry
const COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
  "project-grid": ProjectGridComponent,
  "skill-cloud": SkillCloudComponent,
  "experience-list": ExperienceListComponent,
  "achievement-timeline": AchievementTimelineComponent,
  "activity-feed": ActivityFeedComponent,
};

export const PortfolioRenderer: React.FC<PortfolioRendererProps> = ({
  portfolio,
  onInspectEvidence,
  onViewVersions,
}) => {
  const { profile, sections } = portfolio;

  return (
    <div className="w-full">
      {/* Top Immutable Version Bar */}
      <div className="glass-panel rounded-2xl p-4 mb-8 border border-slate-200/90 shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-gradient-to-r from-white/90 via-slate-50/80 to-white/90">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-electric-50 border border-electric-200 text-electric-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 font-mono">
                Active Version v{portfolio.version}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                IMMUTABLE SNAPSHOT
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Checksum: {portfolio.versionHash} • Audit Hash: {profile.auditHash}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-mono">
            Published: {new Date(portfolio.publishedAt).toLocaleTimeString()}
          </span>
          <button
            type="button"
            onClick={onViewVersions}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Version History & Rollback
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div id="canvas-profile-header" className="glass-panel rounded-3xl p-8 mb-12 border border-slate-200/80 shadow-glass relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-50 border border-electric-200/60 text-electric-700 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-electric-600 animate-pulse" />
            {profile.status}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            {profile.name}
          </h1>

          <p className="text-lg md:text-xl font-medium text-electric-700 mb-4 leading-relaxed">
            {profile.tagline}
          </p>

          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6 max-w-2xl">
            {profile.summary}
          </p>

          {/* Social Links & Claims Audit Indicator */}
          <div className="flex items-center gap-4 flex-wrap text-xs">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Github className="w-4 h-4" />
                GitHub Profile
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Verified Profile
              </a>
            )}
            <div className="flex items-center gap-1.5 text-slate-500 font-mono px-3 py-2 rounded-xl bg-slate-100 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{profile.verifiedClaimsCount} Public Claims Proven</span>
            </div>
          </div>
        </div>

        {/* Apple-minimal background glow accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-electric-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Render Dynamic Sections through Component Whitelist Registry */}
      <div id="canvas-layout-grid" className="space-y-12">
        {sections.map((section) => {
          if (!section.visible) return null;
          const Component = COMPONENT_REGISTRY[section.type];
          if (!Component) {
            console.warn(`[YASHUVERSE] Unapproved component type rejected: ${section.type}`);
            return null;
          }
          return (
            <Component
              key={section.id}
              section={section}
              onInspectEvidence={onInspectEvidence}
            />
          );
        })}
      </div>
    </div>
  );
};
