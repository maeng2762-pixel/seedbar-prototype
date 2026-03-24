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
  team: {
    name: 'Team Starter',
    monthlyGenerationLimit: null,
    maxProjects: null,
    maxVersions: null,
    canUseCompetitionMode: true,
    canUseExternalMusic: true,
    canExportPDF: true,
    canExportPPT: false,
    canAdvancedAnalysis: true,
    canLongOutput: true,
    canRegenerateSections: true,
    canUseMoodSliders: true,
    canInviteMembers: true,
    canShareProjects: true,
  },
};

export function normalizePlan(plan) {
  const key = String(plan || 'free').toLowerCase();
  if (key.includes('team') || key.includes('starter') || key.includes('enterprise')) return 'team';
  if (key.includes('pro') || key.includes('studio') || key.includes('premium')) return 'studio';
  return 'free';
}

export function getPlanPolicy(plan) {
  return PLAN_POLICIES[normalizePlan(plan)] || PLAN_POLICIES.free;
}
