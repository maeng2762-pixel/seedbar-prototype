import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { apiJson, startTestServer } from '../support/serverHarness.mjs';

let harness;

before(async () => {
  harness = await startTestServer('seedbar-smoke');
});

after(async () => {
  await harness?.cleanup?.();
});

test('Seedbar core smoke flow stays healthy across auth, generation, save, studio, music, and package APIs', async () => {
  const email = `smoke-${Date.now()}@seedbar.dev`;
  const password = 'seedbar1234';

  const signup = await apiJson(harness.baseUrl, '/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(signup.response.status, 201);
  assert.equal(signup.payload.ok, true);

  const setPlan = await apiJson(harness.baseUrl, '/api/auth/dev/set-plan', {
    method: 'POST',
    body: { email, plan: 'studio' },
  });
  assert.equal(setPlan.response.status, 200);
  assert.equal(setPlan.payload.user.plan, 'studio');

  const login = await apiJson(harness.baseUrl, '/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.payload.ok, true);
  const token = login.payload.accessToken;
  const refreshToken = login.payload.refreshToken;
  assert.ok(token);
  assert.ok(refreshToken);

  const refresh = await apiJson(harness.baseUrl, '/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
  assert.equal(refresh.response.status, 200);
  assert.equal(refresh.payload.ok, true);
  assert.ok(refresh.payload.accessToken);
  assert.ok(refresh.payload.refreshToken);

  const me = await apiJson(harness.baseUrl, '/api/auth/me', { token });
  assert.equal(me.response.status, 200);
  assert.equal(me.payload.user.plan, 'studio');

  const capabilities = await apiJson(harness.baseUrl, '/api/plans/capabilities', { token });
  assert.equal(capabilities.response.status, 200);
  assert.equal(capabilities.payload.currentPlan, 'studio');
  assert.equal(capabilities.payload.policy.canUseCompetitionMode, true);
  assert.equal(capabilities.payload.policy.canExportPPT, true);

  const draft = await apiJson(harness.baseUrl, '/api/pipeline/step1/draft', {
    method: 'POST',
    token,
    body: {
      genre: 'Contemporary Dance',
      teamSize: 4,
      mood: 'Fractured tension',
      keywords: ['glitch', 'suspension', 'floorwork'],
    },
  });
  assert.equal(draft.response.status, 200);
  assert.equal(draft.payload.ok, true);
  assert.ok(Array.isArray(draft.payload.result.concepts));
  assert.ok(draft.payload.result.concepts.length >= 2);

  const selectedConcept = draft.payload.result.concepts[0];

  const expand = await apiJson(harness.baseUrl, '/api/pipeline/step2/expand', {
    method: 'POST',
    token,
    body: {
      selectedConceptId: selectedConcept.id,
      selectedConceptTitle: selectedConcept.title,
      dancersCount: 4,
      teamSize: 4,
      duration: '03:00',
      competitionMode: true,
      theoryMode: true,
      genre: 'Contemporary Dance',
      mood: 'Fractured tension',
      keywords: ['glitch', 'suspension', 'floorwork'],
    },
  });
  assert.equal(expand.response.status, 200);
  assert.equal(expand.payload.ok, true);
  assert.ok(expand.payload.result?.data);
  assert.ok(Array.isArray(expand.payload.result.data.stageFlow));
  assert.ok(expand.payload.result.data.stageFlow.length > 0);

  const generatedContent = expand.payload.result.data;

  const createProject = await apiJson(harness.baseUrl, '/api/choreography/projects', {
    method: 'POST',
    token,
    body: {
      title: selectedConcept.title,
      generatedContent,
    },
  });
  assert.equal(createProject.response.status, 201);
  assert.equal(createProject.payload.ok, true);
  const projectId = createProject.payload.project.id;
  assert.ok(projectId);

  const listProjects = await apiJson(harness.baseUrl, '/api/choreography/projects', { token });
  assert.equal(listProjects.response.status, 200);
  assert.ok(listProjects.payload.projects.some((item) => item.id === projectId));

  const titleOptions = await apiJson(harness.baseUrl, '/api/choreography/generate-title', {
    method: 'POST',
    token,
    body: {
      genre: 'Contemporary Dance',
      mood: 'Fractured tension',
      theme: 'Gravity and rupture',
      tone: 'Poetic',
      count: 6,
    },
  });
  assert.equal(titleOptions.response.status, 200);
  assert.equal(titleOptions.payload.ok, true);
  assert.ok(Array.isArray(titleOptions.payload.titles));
  assert.ok(titleOptions.payload.titles.length >= 6);
  const chosenTitle = titleOptions.payload.titles[1] || titleOptions.payload.titles[0];

  const updateProject = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}`, {
    method: 'PUT',
    token,
    body: {
      title: chosenTitle,
      teamSize: 4,
      currentContent: {
        ...generatedContent,
        selectedTitle: chosenTitle,
        titles: {
          ...(generatedContent.titles || {}),
          selected: {
            en: chosenTitle,
            kr: chosenTitle,
          },
        },
      },
    },
  });
  assert.equal(updateProject.response.status, 200);
  assert.equal(updateProject.payload.project.title, chosenTitle);

  const autosave = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}/autosave`, {
    method: 'PUT',
    token,
    body: {
      autosaveData: {
        ...generatedContent,
        selectedTitle: chosenTitle,
        lastEdited: new Date().toISOString(),
      },
    },
  });
  assert.equal(autosave.response.status, 200);
  assert.equal(autosave.payload.ok, true);

  const autosaveRead = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}/autosave`, {
    token,
  });
  assert.equal(autosaveRead.response.status, 200);
  assert.equal(autosaveRead.payload.ok, true);
  assert.equal(autosaveRead.payload.autosave.autosaveData.selectedTitle, chosenTitle);

  const project = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}`, { token });
  assert.equal(project.response.status, 200);
  assert.equal(project.payload.ok, true);
  assert.ok(Array.isArray(project.payload.stageFlow));
  assert.ok(project.payload.snapshots.length >= 1);

  const versionCreate = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}/versions`, {
    method: 'POST',
    token,
    body: {
      label: 'v2 stress-safe',
      generatedContent: {
        ...generatedContent,
        selectedTitle: chosenTitle,
      },
    },
  });
  assert.equal(versionCreate.response.status, 201);
  assert.equal(versionCreate.payload.ok, true);
  const newVersionId = versionCreate.payload.version.id;

  const duplicateVersion = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}/versions/${newVersionId}/duplicate`, {
    method: 'POST',
    token,
    body: {
      label: 'v2 copy',
    },
  });
  assert.equal(duplicateVersion.response.status, 201);
  assert.equal(duplicateVersion.payload.ok, true);
  const duplicateVersionId = duplicateVersion.payload.version.id;

  const deleteDuplicate = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}/versions/${duplicateVersionId}`, {
    method: 'DELETE',
    token,
  });
  assert.equal(deleteDuplicate.response.status, 200);
  assert.equal(deleteDuplicate.payload.ok, true);

  const variations = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}/variations`, {
    method: 'POST',
    token,
    body: {
      projectId,
    },
  });
  assert.equal(variations.response.status, 201);
  assert.equal(variations.payload.ok, true);
  assert.ok(Array.isArray(variations.payload.variations));

  const rewriteMusic = await apiJson(harness.baseUrl, '/api/choreography/rewrite', {
    method: 'POST',
    token,
    body: {
      projectId,
      section: 'music',
    },
  });
  assert.equal(rewriteMusic.response.status, 200);
  assert.equal(rewriteMusic.payload.ok, true);

  const tune = await apiJson(harness.baseUrl, '/api/choreography/tune', {
    method: 'POST',
    token,
    body: {
      projectId,
      sliders: {
        intensity: 72,
        darkness: 68,
        speed: 41,
        emotion: 59,
      },
    },
  });
  assert.equal(tune.response.status, 200);
  assert.equal(tune.payload.ok, true);

  const music = await apiJson(harness.baseUrl, '/api/music/recommend', {
    method: 'POST',
    token,
    body: {
      genre: 'Contemporary Dance',
      mood: 'Fractured tension',
      keywords: ['glitch', 'suspension', 'floorwork'],
      duration: '03:00',
      competitionMode: true,
      language: 'KR',
    },
  });
  assert.equal(music.response.status, 200);
  assert.equal(music.payload.ok, true);
  assert.ok(music.payload.recommendations.trend.length >= 1);
  assert.ok(music.payload.recommendations.balanced.length >= 1);
  assert.ok(music.payload.recommendations.counterpoint.length >= 1);

  const image = await apiJson(harness.baseUrl, '/api/image/generate', {
    method: 'POST',
    token,
    body: {
      title: chosenTitle,
      genre: 'Contemporary Dance',
      mood: 'Elegant tension',
      concept: 'Stage poster',
      emotion: 'Structured contrast',
      style: 'Performance photography',
    },
  });
  assert.equal(image.response.status, 200);
  assert.ok(String(image.payload.promptUsed).includes('DO NOT create sexualized imagery'));

  const persistedArtwork = await apiJson(harness.baseUrl, '/api/image/persist', {
    method: 'POST',
    token,
    body: {
      imageUrl: image.payload.imageUrl,
      projectId,
    },
  });
  assert.equal(persistedArtwork.response.status, 200);
  assert.equal(persistedArtwork.payload.ok, true);
  assert.ok(persistedArtwork.payload.asset.storageKey);
  assert.ok(persistedArtwork.payload.asset.thumbnailKey);

  const storedMedia = await fetch(`${harness.baseUrl}${persistedArtwork.payload.asset.thumbnailUrl}`);
  assert.equal(storedMedia.status, 200);
  assert.ok((storedMedia.headers.get('content-type') || '').includes('image/'));

  const fullPackage = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}/full-package`, {
    token,
  });
  assert.equal(fullPackage.response.status, 200);
  assert.equal(fullPackage.payload.ok, true);
  assert.ok(fullPackage.payload.package.title);

  const exportPackage = await apiJson(harness.baseUrl, '/api/export/package', {
    method: 'POST',
    token,
    body: {
      draftData: {
        ...generatedContent,
        titles: {
          ...(generatedContent.titles || {}),
          selected: {
            en: chosenTitle,
            kr: chosenTitle,
          },
        },
      },
      options: {
        language: 'KR',
        exportType: 'full',
      },
    },
  });
  assert.equal(exportPackage.response.status, 200);
  assert.equal(exportPackage.payload.ok, true);
  assert.ok(exportPackage.payload.packageContent.pptSlides);

  const runtimeLog = await apiJson(harness.baseUrl, '/api/analytics/runtime-error', {
    method: 'POST',
    token,
    body: {
      category: 'react_render_error',
      message: 'Objects are not valid as a React child',
      lastAction: 'Pamphlet Viewer',
      page: '/ideation',
      meta: {
        component: 'PamphletFlipbook',
      },
    },
  });
  assert.equal(runtimeLog.response.status, 202);
  assert.equal(runtimeLog.payload.ok, true);

  const metrics = await apiJson(harness.baseUrl, '/api/analytics/metrics');
  assert.equal(metrics.response.status, 200);
  assert.ok(Array.isArray(metrics.payload.recentEvents));
  assert.ok(metrics.payload.recentEvents.some((event) => event.type === 'runtime_error'));

  const deleteProject = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}`, {
    method: 'DELETE',
    token,
  });
  assert.equal(deleteProject.response.status, 200);
  assert.equal(deleteProject.payload.softDeleted, true);

  const trash = await apiJson(harness.baseUrl, '/api/choreography/projects-trash', { token });
  assert.equal(trash.response.status, 200);
  assert.ok(trash.payload.projects.some((item) => item.id === projectId));

  const restoreProject = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}/restore`, {
    method: 'POST',
    token,
  });
  assert.equal(restoreProject.response.status, 200);
  assert.equal(restoreProject.payload.ok, true);

  const restoredProject = await apiJson(harness.baseUrl, `/api/choreography/projects/${projectId}`, { token });
  assert.equal(restoredProject.response.status, 200);
  assert.equal(restoredProject.payload.project.id, projectId);
});
