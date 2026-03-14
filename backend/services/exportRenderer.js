import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import pptxgen from 'pptxgenjs';
import AdmZip from 'adm-zip';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function renderExportBundle({ draftData, language = 'EN' }) {
  const isKr = language === 'KR';
  const t = (v) => (typeof v === 'object' && v ? (isKr ? v.kr || v.en : v.en || v.kr) : v || '');

  const tmpDir = path.join(process.cwd(), 'temp_exports');
  ensureDir(tmpDir);
  const ts = Date.now();

  const pptxPath = path.join(tmpDir, `Seedbar_Blueprint_${ts}.pptx`);
  const pdfPath = path.join(tmpDir, `Seedbar_Pamphlet_${ts}.pdf`);
  const scriptPath = path.join(tmpDir, `Seedbar_Script_${ts}.txt`);
  const zipPath = path.join(tmpDir, `Seedbar_Bundle_${ts}.zip`);

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  let s = pptx.addSlide();
  s.addText(t(draftData?.titles?.scientific) || 'Seedbar', { x: 0.7, y: 1.5, w: 11, h: 1, fontSize: 36, bold: true, color: '2E1065' });
  s = pptx.addSlide();
  s.addText('Narrative', { x: 0.7, y: 0.6, w: 5, h: 0.5, fontSize: 22, bold: true });
  s.addText(`${t(draftData?.narrative?.intro)}\n\n${t(draftData?.narrative?.development)}\n\n${t(draftData?.narrative?.climax)}`, { x: 0.7, y: 1.3, w: 12, h: 4.5, fontSize: 13 });
  await pptx.writeFile({ fileName: pptxPath });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);
  doc.fontSize(22).text(t(draftData?.titles?.scientific) || 'Seedbar', { underline: true });
  doc.moveDown();
  doc.fontSize(11).text(t(draftData?.concept?.artisticStatement));
  doc.moveDown();
  doc.text(`Music: ${draftData?.music?.style || '-'}`);
  doc.text(`Credits: ${draftData?.pamphlet?.musicCredits || '-'}`);
  doc.end();
  await new Promise((resolve) => stream.on('finish', resolve));

  const script = [
    'SEEDBAR SCRIPT',
    `Title: ${t(draftData?.titles?.scientific)}`,
    '',
    ...(draftData?.timing?.timeline || []).map((x) => `[${x.time}] ${t(x.stage)} | ${t(x.action)} :: ${t(x.description)}`),
  ].join('\n');
  fs.writeFileSync(scriptPath, script);

  const zip = new AdmZip();
  zip.addLocalFile(pptxPath);
  zip.addLocalFile(pdfPath);
  zip.addLocalFile(scriptPath);
  zip.writeZip(zipPath);

  return {
    zipPath,
    filename: path.basename(zipPath),
    files: { pptxPath, pdfPath, scriptPath },
  };
}
