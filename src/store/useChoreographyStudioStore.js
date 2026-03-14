import { create } from 'zustand';
import { getPlanHeaders } from '../lib/subscriptionContext';

const defaultSliders = {
  intensity: 50,
  emotion: 50,
  darkness: 50,
  speed: 50,
};

async function parseResponseJson(res, url) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const raw = await res.text();
    const preview = raw.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`NON_JSON:${res.status}:${url}:${preview}`);
  }
  return res.json();
}

const useChoreographyStudioStore = create((set, get) => ({
  projectId: null,
  projects: [],
  versions: [],
  activeVersionId: null,
  sliders: defaultSliders,
  packageData: null,
  loading: false,
  sectionLoading: {},
  autosaveState: 'idle',
  autosaveUpdatedAt: null,
  error: null,

  setProjectId: (projectId) => set({ projectId }),
  setActiveVersionId: (activeVersionId) => set({ activeVersionId }),
  setSlider: (key, value) => set((state) => ({ sliders: { ...state.sliders, [key]: value } })),

  listProjects: async () => {
    const res = await fetch('/api/choreography/projects', {
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, '/api/choreography/projects');
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load projects');
    set({ projects: data.projects || [] });
    return data.projects || [];
  },

  fetchProject: async (projectId) => {
    const res = await fetch(`/api/choreography/projects/${projectId}`, {
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}`);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load project');
    return data;
  },

  initializeProject: async ({ title, generatedContent }) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/choreography/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: JSON.stringify({ title, generatedContent }),
      });
      const data = await parseResponseJson(res, '/api/choreography/projects');
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to create project');
      set({
        loading: false,
        projectId: data.project.id,
        versions: data.version ? [data.version] : [],
        activeVersionId: data.version?.id || null,
      });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message || 'Failed to initialize project' });
      throw error;
    }
  },

  refreshVersions: async () => {
    const projectId = get().projectId;
    if (!projectId) return [];
    const res = await fetch(`/api/choreography/projects/${projectId}/versions`, {
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}/versions`);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load versions');
    set((state) => ({
      versions: data.versions || [],
      activeVersionId: state.activeVersionId || data.versions?.[0]?.id || null,
    }));
    return data.versions || [];
  },

  createVersion: async (generatedContent, label) => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const res = await fetch(`/api/choreography/projects/${projectId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
      body: JSON.stringify({ generatedContent, label }),
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}/versions`);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to create version');
    set({
      versions: data.versions || [],
      activeVersionId: data.version?.id || null,
    });
    return data;
  },

  generateVariations: async () => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const res = await fetch(`/api/choreography/projects/${projectId}/variations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
      body: JSON.stringify({ projectId }),
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}/variations`);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to generate variations');
    set({
      versions: data.versions || [],
      activeVersionId: data.variations?.[0]?.id || null,
    });
    return data;
  },

  regenerateSection: async (section, endpoint = '/api/choreography/regenerate-section') => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');

    set((state) => ({ sectionLoading: { ...state.sectionLoading, [section]: true }, error: null }));
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: JSON.stringify({ projectId, section }),
      });
      const data = await parseResponseJson(res, endpoint);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to regenerate section');
      return data;
    } finally {
      set((state) => ({ sectionLoading: { ...state.sectionLoading, [section]: false } }));
    }
  },

  rewriteSection: async (section) => get().regenerateSection(section, '/api/choreography/rewrite'),

  tuneBySliders: async () => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/choreography/tune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: JSON.stringify({
          projectId,
          sliders: get().sliders,
        }),
      });
      const data = await parseResponseJson(res, '/api/choreography/tune');
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to tune choreography');
      set({ loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message || 'Failed to tune choreography' });
      throw error;
    }
  },

  fetchFullPackage: async () => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const res = await fetch(`/api/choreography/projects/${projectId}/full-package`, {
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}/full-package`);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to fetch package');
    set({ packageData: data.package });
    return data.package;
  },

  updateProject: async (updates) => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const res = await fetch(`/api/choreography/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
      body: JSON.stringify(updates || {}),
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}`);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to update project');
    return data.project;
  },

  deleteProject: async (projectId) => {
    const res = await fetch(`/api/choreography/projects/${projectId}`, {
      method: 'DELETE',
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}`);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to delete project');
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      projectId: state.projectId === projectId ? null : state.projectId,
    }));
    return true;
  },

  autosaveProject: async (autosaveData) => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    set({ autosaveState: 'saving' });
    const res = await fetch(`/api/choreography/projects/${projectId}/autosave`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
      body: JSON.stringify({ autosaveData }),
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}/autosave`);
    if (!res.ok || !data.ok) {
      set({ autosaveState: 'failed' });
      throw new Error(data?.error || 'Failed to autosave project');
    }
    set({ autosaveState: 'saved', autosaveUpdatedAt: data.autosave?.updatedAt || new Date().toISOString() });
    return data.autosave;
  },

  getAutosave: async () => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const res = await fetch(`/api/choreography/projects/${projectId}/autosave`, {
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, `/api/choreography/projects/${projectId}/autosave`);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load autosave');
    return data.autosave;
  },
}));

export default useChoreographyStudioStore;
