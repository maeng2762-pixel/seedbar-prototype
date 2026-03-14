import { getPlanPolicy } from '../config/plans.js';
import { choreographyProjectModel } from '../models/choreographyProjectModel.js';
import {
  buildFullChoreographyPackage,
  buildStudioMeta,
  generateProjectVariations,
  regenerateSectionWithContext,
  tuneProjectBySliders,
} from '../services/choreographyStudioService.js';
import { ensureStageFlow } from '../services/stageFlowService.js';

const ALLOWED_SECTIONS = ['story', 'movement', 'formation', 'music', 'stage', 'artist_note'];

function requireOwnedProject(projectId, userId) {
  const project = choreographyProjectModel.getProject(projectId);
  if (!project) return { error: 'Project not found.', status: 404 };
  if (project.userId !== userId) return { error: 'Forbidden project access.', status: 403 };
  return { project };
}

export function listProjectsController(req, res) {
  const { userId } = req.context;
  const projects = choreographyProjectModel.listProjectsByUser(userId);
  return res.json({ ok: true, projects });
}

export function createProjectController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);

  const projectCount = choreographyProjectModel.countProjectsByUser(userId);
  if (policy.maxProjects != null && projectCount >= policy.maxProjects) {
    return res.status(429).json({
      ok: false,
      error: 'Free plan supports up to 2 projects. Upgrade to Pro for unlimited projects.',
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

  choreographyProjectModel.deleteProject(projectId);
  return res.json({ ok: true, deleted: true });
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
      error: 'Free plan supports up to 2 versions. Upgrade to Pro for unlimited versions.',
      limit: policy.maxVersions,
      current: currentVersions.length,
    });
  }

  const generatedContent = req.body?.generatedContent || owned.project.currentContent || {};
  const label = req.body?.label || null;
  const version = choreographyProjectModel.createVersion(projectId, generatedContent, label);
  choreographyProjectModel.updateProjectContent(projectId, generatedContent);

  return res.status(201).json({ ok: true, version, versions: choreographyProjectModel.listVersions(projectId) });
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
    return res.status(403).json({ ok: false, error: 'Section regeneration is available on Pro/Studio plans only.' });
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
  return regenerateSectionController(req, res);
}

export async function generateVariationsController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);
  if (!policy.canRegenerateSections) {
    return res.status(403).json({ ok: false, error: 'Variation generation is available on Pro/Studio plans only.' });
  }

  const projectId = req.body?.projectId;
  const owned = requireOwnedProject(projectId, userId);
  if (!owned.project) return res.status(owned.status).json({ ok: false, error: owned.error });

  const currentVersions = choreographyProjectModel.listVersions(projectId);
  if (policy.maxVersions != null && currentVersions.length >= policy.maxVersions) {
    return res.status(429).json({
      ok: false,
      error: 'Free plan supports up to 2 versions. Upgrade to Pro for unlimited versions.',
    });
  }

  const variations = await generateProjectVariations({ project: owned.project, count: 3 });
  return res.status(201).json({
    ok: true,
    variations,
    versions: choreographyProjectModel.listVersions(projectId),
  });
}

export async function tuneChoreographyController(req, res) {
  const { userId, plan } = req.context;
  const policy = getPlanPolicy(plan);
  if (!policy.canUseMoodSliders) {
    return res.status(403).json({ ok: false, error: 'Mood sliders are available on Pro/Studio plans only.' });
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
