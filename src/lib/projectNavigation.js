export const EMPTY_PROJECT_ROUTE_STATE = {
  mode: 'planning',
  projectName: '',
  genre: '',
  peopleCount: '',
  duration: '',
  moodKeywords: [],
  keywordInput: '',
  titleTone: '',
};

export function buildNewProjectRouteState(overrides = {}) {
  return {
    ...EMPTY_PROJECT_ROUTE_STATE,
    ...(overrides || {}),
    mode: overrides?.mode || 'planning',
    moodKeywords: Array.isArray(overrides?.moodKeywords) ? overrides.moodKeywords : [],
  };
}

export function navigateToNewProject(navigate, overrides = {}) {
  return navigate('/ideation', {
    state: buildNewProjectRouteState(overrides),
  });
}

export function navigateToDraftProject(navigate, projectId) {
  if (!projectId) {
    return navigateToNewProject(navigate);
  }

  return navigate(`/ideation?projectId=${projectId}`, {
    state: {
      mode: 'draft',
      projectId,
    },
  });
}

