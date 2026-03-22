import { create } from 'zustand';
import { getPlanHeaders } from '../lib/subscriptionContext';
import { apiUrl } from '../lib/apiClient';

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
  deletedProjects: [],
  versions: [],
  activeVersionId: null,
  sliders: defaultSliders,
  packageData: null,
  loading: false,
  sectionLoading: {},
  autosaveState: 'idle',
  autosaveUpdatedAt: null,
  versionAction: {
    pending: false,
    type: null,
    versionId: null,
  },
  error: null,

  setProjectId: (projectId) => set({ projectId }),
  setActiveVersionId: (activeVersionId) => set({ activeVersionId }),
  setSlider: (key, value) => set((state) => ({ sliders: { ...state.sliders, [key]: value } })),
  clearError: () => set({ error: null }),

  listProjects: async () => {
    const url = apiUrl('/api/choreography/projects');
    const res = await fetch(url, {
      headers: { ...getPlanHeaders() },
      cache: 'no-store',
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load projects');
    set({ projects: data.projects || [] });
    return data.projects || [];
  },

  listDeletedProjects: async () => {
    const url = apiUrl('/api/choreography/projects-trash');
    const res = await fetch(url, {
      headers: { ...getPlanHeaders() },
      cache: 'no-store',
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load deleted projects');
    set({ deletedProjects: data.projects || [] });
    return data.projects || [];
  },

  fetchProject: async (projectId) => {
    const url = apiUrl(`/api/choreography/projects/${projectId}`);
    const res = await fetch(url, {
      headers: { ...getPlanHeaders() },
      cache: 'no-store',
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load project');
    return data;
  },

  initializeProject: async ({ title, generatedContent }) => {
    set({ loading: true, error: null });
    try {
      const url = apiUrl('/api/choreography/projects');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: JSON.stringify({ title, generatedContent }),
      });
      const data = await parseResponseJson(res, url);
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
    const url = apiUrl(`/api/choreography/projects/${projectId}/versions`);
    const res = await fetch(url, {
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, url);
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
    const currentAction = get().versionAction;
    if (currentAction?.pending) {
      throw new Error('Another version action is already running. Please wait a moment.');
    }
    set({ versionAction: { pending: true, type: 'create', versionId: null }, error: null });
    try {
      const url = apiUrl(`/api/choreography/projects/${projectId}/versions`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: JSON.stringify({ generatedContent, label }),
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to create version');
      set({
        versions: data.versions || [],
        activeVersionId: data.version?.id || null,
      });
      return data;
    } catch (error) {
      set({ error: error.message || 'Failed to create version' });
      throw error;
    } finally {
      set({ versionAction: { pending: false, type: null, versionId: null } });
    }
  },

  generateVariations: async () => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const currentAction = get().versionAction;
    if (currentAction?.pending) {
      throw new Error('Another version action is already running. Please wait a moment.');
    }
    set({ versionAction: { pending: true, type: 'generate', versionId: null }, error: null });
    try {
      const url = apiUrl(`/api/choreography/projects/${projectId}/variations`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: JSON.stringify({ projectId }),
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to generate variations');
      set({
        versions: data.versions || [],
        activeVersionId: data.variations?.[0]?.id || null,
      });
      return data;
    } catch (error) {
      set({ error: error.message || 'Failed to generate variations' });
      throw error;
    } finally {
      set({ versionAction: { pending: false, type: null, versionId: null } });
    }
  },

  regenerateSection: async (section, endpoint = '/api/choreography/regenerate-section') => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');

    set((state) => ({ sectionLoading: { ...state.sectionLoading, [section]: true }, error: null }));
    try {
      const url = apiUrl(endpoint);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: JSON.stringify({ projectId, section }),
      });
      const data = await parseResponseJson(res, url);
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
      const url = apiUrl('/api/choreography/tune');
      const res = await fetch(url, {
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
      const data = await parseResponseJson(res, url);
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
    const url = apiUrl(`/api/choreography/projects/${projectId}/full-package`);
    const res = await fetch(url, {
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to fetch package');
    set({ packageData: data.package });
    return data.package;
  },

  generatePPTForProject: async (targetProjectId) => {
    // 1. Fetch project data
    const url = apiUrl(`/api/choreography/projects/${targetProjectId}`);
    const res = await fetch(url, { headers: { ...getPlanHeaders() }, cache: 'no-store' });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load project');
    const project = data.project;

    // 2. Generate PPT via package endpoint
    const packageUrl = apiUrl('/api/export/package');
    const packageRes = await fetch(packageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getPlanHeaders() },
      body: JSON.stringify({ draftData: project.currentContent })
    });
    const packageData = await parseResponseJson(packageRes, packageUrl);
    if (!packageRes.ok || !packageData.ok) throw new Error(packageData?.error || 'Failed to generate package');
    
    // 3. Save it to project's currentContent
    const updatedContent = { ...project.currentContent, generatedPackage: packageData.packageContent };
    const updateUrl = apiUrl(`/api/choreography/projects/${targetProjectId}`);
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getPlanHeaders() },
      body: JSON.stringify({ currentContent: updatedContent })
    });
    const updateData = await parseResponseJson(updateRes, updateUrl);
    if (!updateRes.ok || !updateData.ok) throw new Error(updateData?.error || 'Failed to save project package');
    
    return true;
  },


  updateProject: async (updates) => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const url = apiUrl(`/api/choreography/projects/${projectId}`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
      body: JSON.stringify(updates || {}),
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to update project');
    return data.project;
  },

  deleteProject: async (projectId) => {
    const url = apiUrl(`/api/choreography/projects/${projectId}`);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to delete project');
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      projectId: state.projectId === projectId ? null : state.projectId,
    }));
    return true;
  },

  restoreProject: async (projectId) => {
    const url = apiUrl(`/api/choreography/projects/${projectId}/restore`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to restore project');
    set((state) => ({
      projects: [data.project, ...state.projects.filter((project) => project.id !== projectId)],
      deletedProjects: state.deletedProjects.filter((project) => project.id !== projectId),
    }));
    return data.project;
  },

  autosaveProject: async (autosaveData) => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    set({ autosaveState: 'saving' });
    const url = apiUrl(`/api/choreography/projects/${projectId}/autosave`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
      body: JSON.stringify({ autosaveData }),
      keepalive: true,
    });
    const data = await parseResponseJson(res, url);
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
    const url = apiUrl(`/api/choreography/projects/${projectId}/autosave`);
    const res = await fetch(url, {
      headers: { ...getPlanHeaders() },
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to load autosave');
    return data.autosave;
  },

  deleteVersion: async (versionId) => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const currentAction = get().versionAction;
    if (currentAction?.pending) {
      throw new Error('Another version action is already running. Please wait a moment.');
    }
    set({ versionAction: { pending: true, type: 'delete', versionId }, error: null });
    try {
      const url = apiUrl(`/api/choreography/projects/${projectId}/versions/${versionId}`);
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { ...getPlanHeaders() },
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to delete version');
      const { versions } = data;
      const currentActive = get().activeVersionId;
      const stillExists = versions.some((v) => v.id === currentActive);
      set({
        versions,
        activeVersionId: stillExists ? currentActive : versions[0]?.id || null,
      });
      return versions;
    } catch (error) {
      set({ error: error.message || 'Failed to delete version' });
      throw error;
    } finally {
      set({ versionAction: { pending: false, type: null, versionId: null } });
    }
  },

  duplicateVersion: async (versionId, label) => {
    const projectId = get().projectId;
    if (!projectId) throw new Error('Project is not initialized');
    const currentAction = get().versionAction;
    if (currentAction?.pending) {
      throw new Error('Another version action is already running. Please wait a moment.');
    }
    set({ versionAction: { pending: true, type: 'duplicate', versionId }, error: null });
    try {
      const url = apiUrl(`/api/choreography/projects/${projectId}/versions/${versionId}/duplicate`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getPlanHeaders(),
        },
        body: JSON.stringify({ label }),
      });
      const data = await parseResponseJson(res, url);
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to duplicate version');
      set({
        versions: data.versions || [],
        activeVersionId: data.version?.id || get().activeVersionId,
      });
      return data;
    } catch (error) {
      set({ error: error.message || 'Failed to duplicate version' });
      throw error;
    } finally {
      set({ versionAction: { pending: false, type: null, versionId: null } });
    }
  },

  generateTitle: async ({ genre, mood, theme, tone, count = 1 } = {}) => {
    const url = apiUrl('/api/choreography/generate-title');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getPlanHeaders(),
      },
      body: JSON.stringify({ genre, mood, theme, tone, count }),
    });
    const data = await parseResponseJson(res, url);
    if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed to generate title');
    return count > 1 ? (data.titles || [data.title].filter(Boolean)) : data.title;
  },
}));

export default useChoreographyStudioStore;
