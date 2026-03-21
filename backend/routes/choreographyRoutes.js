import { Router } from 'express';
import {
  createProjectController,
  createProjectVersionController,
  deleteProjectController,
  listDeletedProjectsController,
  deleteVersionController,
  duplicateVersionController,
  generateTitleController,
  generateVariationsController,
  getAutosaveController,
  getProjectController,
  getFullPackageController,
  listProjectsController,
  listProjectVersionsController,
  regenerateSectionController,
  rewriteSectionController,
  restoreProjectController,
  saveAutosaveController,
  tuneChoreographyController,
  updateProjectController,
} from '../controllers/choreographyController.js';

const router = Router();

router.get('/projects', listProjectsController);
router.get('/projects-trash', listDeletedProjectsController);
router.post('/projects', createProjectController);
router.get('/projects/:projectId', getProjectController);
router.put('/projects/:projectId', updateProjectController);
router.delete('/projects/:projectId', deleteProjectController);
router.post('/projects/:projectId/restore', restoreProjectController);
router.post('/projects/:projectId/versions', createProjectVersionController);
router.get('/projects/:projectId/versions', listProjectVersionsController);
router.delete('/projects/:projectId/versions/:versionId', deleteVersionController);
router.post('/projects/:projectId/versions/:versionId/duplicate', duplicateVersionController);
router.post('/projects/:projectId/variations', generateVariationsController);
router.put('/projects/:projectId/autosave', saveAutosaveController);
router.get('/projects/:projectId/autosave', getAutosaveController);
router.post('/regenerate-section', regenerateSectionController);
router.post('/rewrite', rewriteSectionController);
router.post('/tune', tuneChoreographyController);
router.post('/generate-title', generateTitleController);
router.get('/projects/:projectId/full-package', getFullPackageController);

export default router;
