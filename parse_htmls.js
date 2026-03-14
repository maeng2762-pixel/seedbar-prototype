import fs from 'fs';
import { globSync } from 'glob';
import { JSDOM } from 'jsdom';

const files = globSync('/Users/maengseul/.gemini/antigravity/brain/4c7185bd-1fcc-44fe-825a-454acbc70c44/stitch_assets/*.html');
files.forEach(file => {
  const html = fs.readFileSync(file, 'utf-8');
  if (html.includes('contribution.usercontent.com - Coming Soon')) return; // ignore placeholder
  try {
    const dom = new JSDOM(html);
    const text = dom.window.document.body.textContent.replace(/\s+/g, ' ').trim().substring(0, 300);
    console.log(`\n--- ${file.split('/').pop()} ---`);
    console.log(text);
  } catch (e) {
    console.log(`Error parsing ${file}`);
  }
});
