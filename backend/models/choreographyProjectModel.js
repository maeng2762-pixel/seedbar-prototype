import crypto from 'crypto';
import { db } from '../db/database.js';

function nowIso() {
  return new Date().toISOString();
}

function parseJson(text, fallback = {}) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function mapProject(row) {
  if (!row) return null;
  const currentContent = parseJson(row.current_content, {});
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    status: row.status || currentContent?.projectStatus || 'draft',
    teamSize: Number(row.team_size || 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    currentContent,
  };
}

function mapVersion(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    versionNumber: row.version_number,
    createdAt: row.created_at,
    generatedContent: parseJson(row.generated_content, {}),
    label: row.label || `v${row.version_number}`,
  };
}

class ChoreographyProjectModel {
  createProject({ userId, title, generatedContent }) {
    const id = `proj_${crypto.randomUUID()}`;
    const versionId = `ver_${crypto.randomUUID()}`;
    const now = nowIso();
    const content = generatedContent || {};
    const teamSize = Number(content?.teamSize || content?.seedbarInput?.teamSize || 1);
    const status = content?.projectStatus || 'draft';

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO projects (id, user_id, title, status, team_size, current_content, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, title || 'Untitled Project', status, teamSize, JSON.stringify(content), now, now);

      db.prepare(`
        INSERT INTO project_versions (id, project_id, version_number, generated_content, label, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(versionId, id, 1, JSON.stringify(content), 'v1', now);
    });

    tx();

    return {
      project: this.getProject(id),
      version: this.getVersion(versionId),
    };
  }

  getProject(projectId) {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    return mapProject(row);
  }

  listProjectsByUser(userId) {
    const rows = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
    return rows.map(mapProject);
  }

  countProjectsByUser(userId) {
    const row = db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?').get(userId);
    return Number(row?.count || 0);
  }

  updateProject(projectId, updates = {}) {
    const existing = this.getProject(projectId);
    if (!existing) return null;

    const nextContent = updates.currentContent ?? existing.currentContent;
    const nextTitle = updates.title ?? existing.title;
    const nextStatus = updates.status ?? nextContent?.projectStatus ?? existing.status ?? 'draft';
    const nextTeamSize = Number(
      updates.teamSize
      ?? nextContent?.teamSize
      ?? nextContent?.seedbarInput?.teamSize
      ?? existing.teamSize
      ?? 1,
    );

    db.prepare(`
      UPDATE projects
      SET title = ?, status = ?, team_size = ?, current_content = ?, updated_at = ?
      WHERE id = ?
    `).run(nextTitle, nextStatus, nextTeamSize, JSON.stringify(nextContent), nowIso(), projectId);

    return this.getProject(projectId);
  }

  updateProjectContent(projectId, nextContent) {
    return this.updateProject(projectId, { currentContent: nextContent });
  }

  deleteProject(projectId) {
    const found = this.getProject(projectId);
    if (!found) return false;
    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    return true;
  }

  getVersion(versionId) {
    const row = db.prepare('SELECT * FROM project_versions WHERE id = ?').get(versionId);
    return mapVersion(row);
  }

  listVersions(projectId) {
    const rows = db
      .prepare('SELECT * FROM project_versions WHERE project_id = ? ORDER BY version_number ASC')
      .all(projectId);
    return rows.map(mapVersion);
  }

  createVersion(projectId, generatedContent, label = null) {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM project_versions WHERE project_id = ?').get(projectId);
    const versionNumber = Number(countRow?.count || 0) + 1;
    const id = `ver_${crypto.randomUUID()}`;
    const createdAt = nowIso();

    db.prepare(`
      INSERT INTO project_versions (id, project_id, version_number, generated_content, label, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, projectId, versionNumber, JSON.stringify(generatedContent || {}), label || `v${versionNumber}`, createdAt);

    return this.getVersion(id);
  }

  saveAutosave(projectId, autosaveData) {
    const updatedAt = nowIso();
    db.prepare(`
      INSERT INTO project_autosaves (project_id, autosave_data, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(project_id)
      DO UPDATE SET autosave_data = excluded.autosave_data, updated_at = excluded.updated_at
    `).run(projectId, JSON.stringify(autosaveData || {}), updatedAt);

    return this.getAutosave(projectId);
  }

  getAutosave(projectId) {
    const row = db.prepare('SELECT * FROM project_autosaves WHERE project_id = ?').get(projectId);
    if (!row) return null;
    return {
      projectId: row.project_id,
      autosaveData: parseJson(row.autosave_data, {}),
      updatedAt: row.updated_at,
    };
  }
}

export const choreographyProjectModel = new ChoreographyProjectModel();
