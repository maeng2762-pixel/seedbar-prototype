import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getLocalizedText } from '../../shared/localizedText.js';
import { buildReferencePhotos } from '../../src/services/stageVisual3d.js';
import { apiJson, startTestServer } from '../../tests/support/serverHarness.mjs';

function assertHtmlResponse(response, body, route) {
  const contentType = response.headers.get('content-type') || '';
  assert.ok(contentType.includes('text/html'), `${route} should return HTML`);
  assert.ok(body.includes('<div id="root"></div>') || body.includes('<div id="root">'), `${route} should render the SPA root`);
}

async function verifyBuildAssets() {
  const distPath = path.join(process.cwd(), 'dist');
  const indexPath = path.join(distPath, 'index.html');
  const indexHtml = await fs.readFile(indexPath, 'utf-8');
  const assetPaths = [
    ...indexHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g),
  ].map((match) => match[1]);

  assert.ok(assetPaths.length > 0, 'Built index.html should reference hashed assets.');

  for (const assetPath of assetPaths) {
    const filePath = path.join(distPath, assetPath.replace(/^\//, ''));
    await fs.access(filePath);
  }
}

async function verifyFrontendRoutes(baseUrl) {
  const routes = [
    '/',
    '/login',
    '/home',
    '/explore',
    '/library',
    '/profile',
    '/ideation',
    '/editor',
    '/policies?tab=privacy',
  ];

  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`);
    const body = await response.text();
    assert.equal(response.status, 200, `${route} should respond with 200`);
    assertHtmlResponse(response, body, route);
  }
}

async function verifyApiAndRecoveryFlows(baseUrl) {
  const health = await apiJson(baseUrl, '/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.payload.ok, true);

  const email = `preflight-${Date.now()}@seedbar.dev`;
  const password = 'seedbar1234';

  const signup = await apiJson(baseUrl, '/api/auth/signup', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(signup.response.status, 201);

  await apiJson(baseUrl, '/api/auth/dev/set-plan', {
    method: 'POST',
    body: { email, plan: 'studio' },
  });

  const login = await apiJson(baseUrl, '/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(login.response.status, 200);
  const token = login.payload.accessToken;

  const capabilities = await apiJson(baseUrl, '/api/plans/capabilities', { token });
  assert.equal(capabilities.response.status, 200);
  assert.equal(capabilities.payload.currentPlan, 'studio');
  assert.equal(capabilities.payload.policy.canUseCompetitionMode, true);
  assert.equal(capabilities.payload.policy.canExportPPT, true);

  const musicHealth = await apiJson(baseUrl, '/api/music/health', { token });
  assert.equal(musicHealth.response.status, 200);
  assert.equal(musicHealth.payload.ok, true);

  const createProject = await apiJson(baseUrl, '/api/choreography/projects', {
    method: 'POST',
    token,
    body: {
      title: 'Preflight Project',
      generatedContent: {
        titles: {
          scientific: {
            en: 'Preflight Project',
            kr: '프리플라이트 프로젝트',
          },
        },
        pamphlet: {
          coverTitle: { en: 'Preflight Project', kr: '프리플라이트 프로젝트' },
          performanceDesc: { en: 'Build validation', kr: '빌드 검증' },
        },
        stageFlow: [],
      },
    },
  });
  assert.equal(createProject.response.status, 201);
  const projectId = createProject.payload.project.id;

  const autosave = await apiJson(baseUrl, `/api/choreography/projects/${projectId}/autosave`, {
    method: 'PUT',
    token,
    body: {
      autosaveData: {
        titles: {
          scientific: {
            en: 'Preflight Project',
            kr: '프리플라이트 프로젝트',
          },
        },
        selectedTitle: 'Preflight Project',
      },
    },
  });
  assert.equal(autosave.response.status, 200);

  const autosaveRead = await apiJson(baseUrl, `/api/choreography/projects/${projectId}/autosave`, { token });
  assert.equal(autosaveRead.response.status, 200);
  assert.equal(autosaveRead.payload.autosave.autosaveData.selectedTitle, 'Preflight Project');

  const exportPackage = await apiJson(baseUrl, '/api/export/package', {
    method: 'POST',
    token,
    body: {
      draftData: {
        titles: {
          selected: {
            en: 'Preflight Project',
            kr: '프리플라이트 프로젝트',
          },
        },
        selectedTitle: 'Preflight Project',
        pamphlet: {
          coverTitle: {
            en: 'Preflight Project',
            kr: '프리플라이트 프로젝트',
          },
        },
        stageFlow: [],
      },
      options: {
        language: 'KR',
        exportType: 'full',
      },
    },
  });
  assert.equal(exportPackage.response.status, 200);
  assert.equal(exportPackage.payload.ok, true);
  assert.ok(exportPackage.payload.packageContent?.pptSlides);

  const remove = await apiJson(baseUrl, `/api/choreography/projects/${projectId}`, {
    method: 'DELETE',
    token,
  });
  assert.equal(remove.response.status, 200);

  const restore = await apiJson(baseUrl, `/api/choreography/projects/${projectId}/restore`, {
    method: 'POST',
    token,
  });
  assert.equal(restore.response.status, 200);

  assert.equal(getLocalizedText({ en: 'Hello', kr: '안녕하세요' }, 'KR'), '안녕하세요');
  assert.equal(getLocalizedText({ en: 'Hello', kr: '안녕하세요' }, 'EN'), 'Hello');
}

async function verifyVisualReferenceAssets() {
  const projectContent = {
    seedbarInput: {
      genre: 'Contemporary Dance',
      keywords: ['dark', 'minimal', 'architectural'],
    },
    concept: {
      artisticStatement: {
        en: 'An architectural study of silence and pressure.',
        kr: '침묵과 압력을 건축적으로 탐구하는 작품.',
      },
    },
    stage: {
      lighting: {
        en: 'Focused sidelight with haze.',
        kr: '헤이즈가 있는 집중형 사이드 라이트.',
      },
      props: {
        en: 'Low platforms and open travel lanes.',
        kr: '낮은 플랫폼과 열린 이동 동선.',
      },
      costume: {
        en: 'Muted layered costume with soft motion.',
        kr: '부드러운 움직임의 절제된 레이어드 의상.',
      },
    },
    pamphlet: {
      coverTitle: {
        en: 'Reference Validation',
        kr: '레퍼런스 검증',
      },
    },
  };

  for (const assetType of ['lighting', 'props', 'costume']) {
    const photos = buildReferencePhotos({ assetType, projectContent, revision: 0 });
    assert.ok(photos.length >= 3, `${assetType} should provide at least three reference cards`);

    for (const photo of photos) {
      assert.ok(photo.thumbnailUrl, `${assetType} should include a thumbnail URL`);
      assert.ok(photo.detailImageUrl, `${assetType} should include a detail image URL`);
      assert.ok(photo.fallbackCoverUrl?.startsWith('data:image/svg+xml'), `${assetType} should include a stable fallback cover`);

      for (const localPath of [photo.thumbnailUrl, photo.detailImageUrl, ...(photo.fallbackImageUrls || [])].filter((value) => String(value).startsWith('/images/'))) {
        const filePath = path.join(process.cwd(), 'public', localPath.replace(/^\/images\//, 'images/'));
        await fs.access(filePath);
      }
    }
  }
}

async function main() {
  await verifyBuildAssets();
  await verifyVisualReferenceAssets();

  const harness = await startTestServer('seedbar-preflight');
  try {
    await verifyFrontendRoutes(harness.baseUrl);
    await verifyApiAndRecoveryFlows(harness.baseUrl);
    console.log('Seedbar preflight passed: routes, assets, API health, i18n, save/restore are healthy.');
  } finally {
    await harness.cleanup();
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error('[Seedbar preflight failed]', error);
    process.exitCode = 1;
  });
}
