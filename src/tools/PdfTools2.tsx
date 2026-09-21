import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as any], { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
export function PageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pos, setPos] = useState<'bl' | 'bc' | 'br'>('bc');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function run() {
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      pages.forEach((p, i) => {
        const { width } = p.getSize();
        const text = `${i + 1} / ${pages.length}`;
        const tw = font.widthOfTextAtSize(text, 10);
        const x = pos === 'bl' ? 24 : pos === 'bc' ? (width - tw) / 2 : width - tw - 24;
        p.drawText(text, { x, y: 16, size: 10, font, color: rgb(0.35, 0.35, 0.35) });
      });
      download(await doc.save(), 'numbered.pdf');
    } catch (e: any) { setErr('Could not add numbers: ' + (e?.message || 'invalid PDF')); }
    finally { setBusy(false); }
  }
  return (
    <div className="panel">
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <label>Position<br />
        <select value={pos} onChange={(e) => setPos(e.target.value as any)} style={{ width: 'auto' }}>
          <option value="bl">Bottom left</option><option value="bc">Bottom center</option><option value="br">Bottom right</option>
        </select></label>
      <div style={{ marginTop: 8 }}><button onClick={run} disabled={!file || busy}>{busy ? 'Working...' : 'Add page numbers'}</button></div>
      <p style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Adds "N / total" at the bottom of every page.</p>
      {err && <p style={{ color: '#c00' }}>{err}</p>}
    </div>
  );
}
export function ExtractTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function run() {
    if (!file) return;
    setBusy(true); setErr(''); setText('');
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.mjs');
      const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const parts: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const s = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ');
        parts.push(`--- Page ${i} ---\n${s}`);
      }
      setText(parts.join('\n\n'));
    } catch (e: any) { setErr('Could not extract text: ' + (e?.message || 'invalid or scanned PDF')); }
    finally { setBusy(false); }
  }
  return (
    <div className="panel">
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div style={{ marginTop: 8 }}><button onClick={run} disabled={!file || busy}>{busy ? 'Extracting...' : 'Extract text'}</button></div>
      {text && <>
        <textarea rows={12} readOnly value={text} onFocus={(e) => e.target.select()} />
        <div className="btn-row"><button className="secondary" onClick={() => navigator.clipboard.writeText(text)}>Copy text</button></div>
      </>}
      {err && <p style={{ color: '#c00' }}>{err}</p>}
      <p style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Scanned PDFs (images of pages) have no text layer to extract - OCR is not included.</p>
    </div>
  );
}
