import { getPlanPolicy } from '../config/plans.js';
import { choreographyProjectModel } from '../models/choreographyProjectModel.js';
import {
  buildFullChoreographyPackage,
  buildStudioMeta,
  generateProjectVariations,
  regenerateSectionWithContext,
  rewriteSectionFast,
  tuneProjectBySliders,
  generateUniqueTitle,
} from '../services/choreographyStudioService.js';
import { ensureStageFlow } from '../services/stageFlowService.js';

const ALLOWED_SECTIONS = ['story', 'movement', 'formation', 'music', 'stage', 'artist_note'];
const activeVersionActionProjects = new Set();

function requireOwnedProject(projectId, userId) {
  const project = choreographyProjectModel.getProject(projectId);
  if (!project) return { error: 'Project not found.', status: 404 };
  if (project.userId !== userId) return { error: 'Forbidden project access.', status: 403 };
  return { project };
}

async function withVersionActionLock(projectId, res, handler) {
  if (activeVersionActionProjects.has(projectId)) {
    return res.status(409).json({
      ok: false,
      error: 'Another version action is already in progress. Please wait a moment.',
    });
  }

  activeVersionActionProjects.add(projectId);
  try {
    return await handler();
  } catch (error) {
    const message = error?.message || 'Version action failed.';
    const status = /not found|minimum_version|limit/i.test(message) ? 400 : 500;
    return res.status(status).json({ ok: false, error: message });
  } finally {
    activeVersionActionProjects.delete(projectId);
  }
}

export function listProjectsController(req, res) {
  const { userId } = req.context;
  const projects = choreographyProjectModel.listProjectsByUser(userId);
  return res.json({ ok: true, projects });
}

export function listDeletedProjectsController(req, res) {
  const { userId } = req.context;
  const projects = choreographyProjectModel.listDeletedProjectsByUser(userId);
  return res.json({ ok: true, projects });
}

export function createProjectController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);

  const projectCount = choreographyProjectModel.countProjectsByUser(userId);
  if (policy.maxProjects != null && projectCount >= policy.maxProjects) {
    return res.status(429).json({
      ok: false,
      error: 'Free plan supports up to 2 projects. Upgrade to a paid plan for more projects.',
      limit: policy.maxProjects,
      current: projectCount,
    });
  }

  const title = req.body?.title || 'Untitled Project';
  const generatedContent = req.body?.generatedContent || {};
  const created = choreographyProjectModel.createProject({ userId, title, generatedContent });
  return res.status(201).json({ ok: true, project: created.project, version: created.version });
}

export function updateProjectController(req, res) {
  const { userId } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const updated = choreographyProjectModel.updateProject(projectId, {
    title: req.body?.title,
    currentContent: req.body?.currentContent,
    teamSize: req.body?.teamSize,
  });

  return res.json({ ok: true, project: updated });
}

export function deleteProjectController(req, res) {
  const { userId } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  choreographyProjectModel.softDeleteProject(projectId);
  return res.json({ ok: true, deleted: true, softDeleted: true });
}

export function restoreProjectController(req, res) {
  const { userId } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const restored = choreographyProjectModel.restoreProject(projectId);
  return res.json({ ok: true, project: restored });
}

export function createProjectVersionController(req, res) {
  const { userId, plan } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const policy = getPlanPolicy(plan);
  const currentVersions = choreographyProjectModel.listVersions(projectId);
  if (policy.maxVersions != null && currentVersions.length >= policy.maxVersions) {
    return res.status(429).json({
      ok: false,
      error: 'Free plan supports up to 2 versions. Upgrade to a paid plan for more versions.',
      limit: policy.maxVersions,
      current: currentVersions.length,
    });
  }

  return withVersionActionLock(projectId, res, async () => {
    const generatedContent = req.body?.generatedContent || owned.project.currentContent || {};
    const label = req.body?.label || null;
    const version = choreographyProjectModel.createVersion(projectId, generatedContent, label);
    choreographyProjectModel.updateProjectContent(projectId, generatedContent);

    return res.status(201).json({ ok: true, version, versions: choreographyProjectModel.listVersions(projectId) });
  });
}

export function deleteVersionController(req, res) {
  const { userId } = req.context;
  const { projectId, versionId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  return withVersionActionLock(projectId, res, async () => {
    const versions = choreographyProjectModel.deleteVersion(projectId, versionId);
    return res.json({ ok: true, deleted: true, versions });
  });
}

export function duplicateVersionController(req, res) {
  const { userId, plan } = req.context;
  const { projectId, versionId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const policy = getPlanPolicy(plan);
  const currentVersions = choreographyProjectModel.listVersions(projectId);
  if (policy.maxVersions != null && currentVersions.length >= policy.maxVersions) {
    return res.status(429).json({
      ok: false,
      error: 'Version limit reached. Upgrade to a paid plan for more versions.',
    });
  }

  return withVersionActionLock(projectId, res, async () => {
    const newLabel = req.body?.label || null;
    const version = choreographyProjectModel.duplicateVersion(projectId, versionId, newLabel);
    return res.status(201).json({ ok: true, version, versions: choreographyProjectModel.listVersions(projectId) });
  });
}

export function listProjectVersionsController(req, res) {
  const { userId } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  return res.json({ ok: true, versions: choreographyProjectModel.listVersions(projectId) });
}

export function getProjectController(req, res) {
  const { userId } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const content = owned.project.currentContent || {};
  const teamSize = Number(content?.teamSize || content?.seedbarInput?.teamSize || 1);
  const timeline = content?.timing?.timeline || [];
  const formationDesign = content?.flow?.flow_pattern || [];
  const stageFlow = ensureStageFlow({
    stageFlow: content?.stageFlow,
    flowPattern: formationDesign,
    timeline,
    teamSize,
    durationLabel: content?.timing?.totalDuration || content?.seedbarInput?.duration || '03:00',
  });

  return res.json({
    ok: true,
    project: owned.project,
    projectId: owned.project.id,
    teamSize,
    timeline,
    formationDesign,
    stageFlow,
    snapshots: choreographyProjectModel.listSnapshots(projectId, 6),
    ...buildStudioMeta(owned.project),
  });
}

export function saveAutosaveController(req, res) {
  const { userId } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const autosaveData = req.body?.autosaveData || req.body?.currentContent || req.body || {};
  const autosave = choreographyProjectModel.saveAutosave(projectId, autosaveData);
  choreographyProjectModel.updateProjectContent(projectId, autosaveData);

  return res.json({ ok: true, autosave });
}

export function getAutosaveController(req, res) {
  const { userId } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const autosave = choreographyProjectModel.getAutosave(projectId);
  return res.json({ ok: true, autosave });
}

export async function regenerateSectionController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);
  if (!policy.canRegenerateSections) {
    return res.status(403).json({ ok: false, error: 'Section regeneration is available on paid plans only.' });
  }

  const projectId = req.body?.projectId;
  const section = req.body?.section;
  if (!ALLOWED_SECTIONS.includes(section)) {
    return res.status(400).json({ ok: false, error: 'Invalid section. Use story | movement | formation | music | stage | artist_note.' });
  }

  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const result = await regenerateSectionWithContext({ project: owned.project, section, context: req.context });
  return res.json({ ok: true, section: result.section, content: result.content, project: result.project });
}

export async function rewriteSectionController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);
  if (!policy.canRegenerateSections) {
    return res.status(403).json({ ok: false, error: 'Rewrite is available on paid plans only.' });
  }

  const projectId = req.body?.projectId;
  const section = req.body?.section;
  if (!ALLOWED_SECTIONS.includes(section)) {
    return res.status(400).json({ ok: false, error: 'Invalid section.' });
  }

  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const result = await rewriteSectionFast({ project: owned.project, section, context: req.context });
  return res.json({ ok: true, section: result.section, content: result.content, project: result.project });
}

export async function generateTitleController(req, res) {
  const { userId } = req.context;
  const { genre, mood, theme } = req.body || {};
  const count = Math.max(1, Math.min(6, Number(req.body?.count || 1)));
  const existingTitles = choreographyProjectModel.findSimilarTitles('', userId, 20);
  const titles = [];
  for (let index = 0; index < count; index += 1) {
    const nextTitle = await generateUniqueTitle({
      genre,
      mood,
      theme: index === 0 ? theme : `${theme || ''} variation ${index + 1}`,
      existingTitles: [...existingTitles, ...titles],
    });
    titles.push(nextTitle);
  }
  return res.json({ ok: true, title: titles[0], titles });
}

export async function generateVariationsController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);
  if (!policy.canRegenerateSections) {
    return res.status(403).json({ ok: false, error: 'Variation generation is available on paid plans only.' });
  }

  const projectId = req.body?.projectId;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const currentVersions = choreographyProjectModel.listVersions(projectId);
  if (policy.maxVersions != null && currentVersions.length >= policy.maxVersions) {
    return res.status(429).json({
      ok: false,
      error: 'Free plan supports up to 2 versions. Upgrade to a paid plan for more versions.',
    });
  }

  return withVersionActionLock(projectId, res, async () => {
    const variations = await generateProjectVariations({ project: owned.project, count: 3 });
    return res.status(201).json({
      ok: true,
      variations,
      versions: choreographyProjectModel.listVersions(projectId),
    });
  });
}

export async function tuneChoreographyController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);
  if (!policy.canUseMoodSliders) {
    return res.status(403).json({ ok: false, error: 'Mood sliders are available on paid plans only.' });
  }

  const projectId = req.body?.projectId;
  const sliders = req.body?.sliders || {};
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const updated = await tuneProjectBySliders({ project: owned.project, sliders });
  return res.json({ ok: true, sliders, updatedSections: updated, project: updated.project });
}

export function getFullPackageController(req, res) {
  const { userId, plan } = req.context;
  const { projectId } = req.params;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const pkg = buildFullChoreographyPackage(owned.project, plan);
  return res.json({ ok: true, package: pkg, plan });
}
