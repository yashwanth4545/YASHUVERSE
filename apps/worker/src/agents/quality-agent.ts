import {
  validatePortfolioDocument,
  type PortfolioDocument,
} from "@yashuverse/portfolio-schema";

export interface QualityAuditResult {
  isCompliant: boolean;
  qualityScore: number; // 0.00 to 1.00
  errors: string[];
  warnings: string[];
  evidenceIdsChecked: number;
  auditTimestamp: string;
}

export class QualityAgent {
  /**
   * Audits a candidate portfolio document against schema rules, evidence completeness,
   * link standards, and skill deduplication.
   */
  public auditPortfolio(
    candidate: unknown,
    verifiedEvidenceStore: Record<string, unknown> = {}
  ): QualityAuditResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let evidenceIdsChecked = 0;

    // 1. Strict Schema Validation via Zod
    const schemaValidation = validatePortfolioDocument(candidate);
    if (!schemaValidation.success) {
      for (const issue of schemaValidation.errors?.issues || []) {
        errors.push(`Schema Error at path '${issue.path.join(".")}': ${issue.message}`);
      }
      return {
        isCompliant: false,
        qualityScore: 0.1,
        errors,
        warnings,
        evidenceIdsChecked: 0,
        auditTimestamp: new Date().toISOString(),
      };
    }

    const doc = schemaValidation.data as PortfolioDocument;

    // 2. Evidence Integrity Check
    const evidenceSet = new Set(Object.keys(verifiedEvidenceStore));

    for (const section of doc.sections) {
      if (section.type === "project-grid") {
        for (const proj of section.items) {
          if (!proj.evidenceIds || proj.evidenceIds.length === 0) {
            errors.push(`Project '${proj.title}' has no evidenceIds linked.`);
          } else {
            evidenceIdsChecked += proj.evidenceIds.length;
            if (evidenceSet.size > 0) {
              const missing = proj.evidenceIds.filter((id) => !evidenceSet.has(id));
              if (missing.length > 0) {
                warnings.push(
                  `Project '${proj.title}' references evidence IDs not in active store: [${missing.join(", ")}]`
                );
              }
            }
          }

          // Check URL validity
          if (proj.githubUrl && !proj.githubUrl.startsWith("http")) {
            errors.push(`Project '${proj.title}' has invalid githubUrl: ${proj.githubUrl}`);
          }
        }
      }

      if (section.type === "skill-cloud") {
        for (const group of section.groups) {
          const seenSkills = new Set<string>();
          for (const skill of group.skills) {
            const lower = skill.name.toLowerCase();
            if (seenSkills.has(lower)) {
              warnings.push(`Duplicate skill detected: '${skill.name}' in '${group.category}'`);
            }
            seenSkills.add(lower);
          }
        }
      }
    }

    // 3. Compute Quality Score
    let score = 1.0;
    score -= errors.length * 0.25;
    score -= warnings.length * 0.05;
    const finalScore = Math.max(0.0, Math.min(1.0, Number(score.toFixed(2))));

    return {
      isCompliant: errors.length === 0,
      qualityScore: finalScore,
      errors,
      warnings,
      evidenceIdsChecked,
      auditTimestamp: new Date().toISOString(),
    };
  }
}

export const defaultQualityAgent = new QualityAgent();
