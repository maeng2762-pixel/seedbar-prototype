import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('backend/**/*.js');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  const projectMethods = ['getProject', 'listProjectsByUser', 'countProjectsByUser', 'createProject', 'updateProject', 'updateProjectContent', 'deleteProject', 'listVersions', 'createVersion', 'saveAutosave', 'getAutosave'];
  for (const method of projectMethods) {
    const rx = new RegExp(`choreographyProjectModel\\.${method}\\(`, 'g');
    content = content.replace(rx, `await choreographyProjectModel.${method}(`);
  }

  const userMethods = ['createUser', 'getUserByEmail', 'getUserAuthByEmail', 'getUserById', 'verifyPassword', 'setUserPlan', 'setUserPlanByEmail', 'countUsers', 'listUsers', 'ensureUser'];
  for (const method of userMethods) {
    const rx = new RegExp(`(?<!await )\\b${method}\\(`, 'g');
    content = content.replace(rx, `await ${method}(`);
  }

  content = content.replace(/export function (\w+Controller)/g, 'export async function $1');
  
  if (content !== original) {
    content = content.replace(/await\s+await\s+/g, 'await ');
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
