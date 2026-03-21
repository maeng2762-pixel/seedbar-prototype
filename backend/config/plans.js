export const PLAN_POLICIES = {
  free: {
    name: 'Free',
    monthlyGenerationLimit: 3,
    maxProjects: 2,
    maxVersions: 2,
    canUseCompetitionMode: false,
    canUseExternalMusic: true,
    canExportPDF: false,
    canExportPPT: false,
    canAdvancedAnalysis: false,
    canLongOutput: false,
    canRegenerateSections: false,
    canUseMoodSliders: false,
  },
  pro: {
    name: 'Pro',
    monthlyGenerationLimit: null,
    maxProjects: null,
    maxVersions: null,
    canUseCompetitionMode: false,
    canUseExternalMusic: true,
    canExportPDF: true,
    canExportPPT: false,
    canAdvancedAnalysis: true,
    canLongOutput: false,
    canRegenerateSections: true,
    canUseMoodSliders: true,
  },
  studio: {
    name: 'Studio',
    monthlyGenerationLimit: null,
    maxProjects: null,
    maxVersions: null,
    canUseCompetitionMode: true,
    canUseExternalMusic: true,
    canExportPDF: true,
    canExportPPT: true,
    canAdvancedAnalysis: true,
    canLongOutput: true,
    canRegenerateSections: true,
    canUseMoodSliders: true,
  },
};

export function normalizePlan(plan) {
  const key = String(plan || 'free').toLowerCase();
  if (key.includes('premium') || key.includes('studio') || key.includes('expert') || key.includes('team') || key.includes('school')) return 'studio';
  if (key.includes('pro')) return 'pro';
  return 'free';
}

export function getPlanPolicy(plan) {
  return PLAN_POLICIES[normalizePlan(plan)] || PLAN_POLICIES.free;
}
