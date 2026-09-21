import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';

function kb(b: number) { return b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`; }
function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as any], { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
export function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function merge() {
    setBusy(true); setErr('');
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      download(await out.save(), 'merged.pdf');
    } catch (e: any) { setErr('Could not merge: ' + (e?.message || 'invalid or password-protected PDF')); }
    finally { setBusy(false); }
  }
  return (
    <div className="panel">
      <input type="file" accept="application/pdf" multiple onChange={(e) => setFiles([...(e.target.files || [])])} />
      {files.length > 0 && <ol>{files.map((f, i) => <li key={i}>{f.name} ({kb(f.size)})</li>)}</ol>}
      <p style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Files merge in the order listed. Re-select in the order you want them.</p>
      <button onClick={merge} disabled={files.length < 2 || busy}>{busy ? 'Merging...' : 'Merge PDFs'}</button>
      {err && <p style={{ color: '#c00' }}>{err}</p>}
    </div>
  );
}
export function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState('');
  const [pages, setPages] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function load(f: File | null) {
    setFile(f); setPages(null); setErr('');
    if (f) try {
      const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      setPages(doc.getPageCount());
    } catch { setErr('Could not read this PDF (encrypted or invalid).'); }
  }
  function parseRanges(input: string, max: number): number[] | null {
    const out = new Set<number>();
    for (const part of input.split(',')) {
      const t = part.trim();
      if (!t) continue;
      const m = t.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) return null;
      const a = parseInt(m[1]), b = m[2] ? parseInt(m[2]) : a;
      if (a < 1 || b > max || a > b) return null;
      for (let i = a; i <= b; i++) out.add(i - 1);
    }
    return out.size ? [...out].sort((x, y) => x - y) : null;
  }
  async function split() {
    if (!file || pages === null) return;
    const idxs = parseRanges(ranges, pages);
    if (!idxs) { setErr(`Invalid ranges. Use formats like 1-3,5 within 1-${pages}.`); return; }
    setBusy(true); setErr('');
    try {
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, idxs);
      copied.forEach((p) => out.addPage(p));
      download(await out.save(), 'split.pdf');
    } catch (e: any) { setErr('Could not split: ' + (e?.message || 'unknown error')); }
    finally { setBusy(false); }
  }
  return (
    <div className="panel">
      <input type="file" accept="application/pdf" onChange={(e) => load(e.target.files?.[0] ?? null)} />
      {pages !== null && <p>{pages} pages detected.</p>}
      <label>Pages to extract (e.g. 1-3, 5, 8-10)</label>
      <input type="text" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3, 5" />
      <button onClick={split} disabled={!file || busy}>{busy ? 'Splitting...' : 'Extract pages'}</button>
      {err && <p style={{ color: '#c00' }}>{err}</p>}
    </div>
  );
}
export function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function rotate() {
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      doc.getPages().forEach((p) => p.setRotation(degrees((p.getRotation().angle + angle) % 360)));
      download(await doc.save(), 'rotated.pdf');
    } catch (e: any) { setErr('Could not rotate: ' + (e?.message || 'invalid PDF')); }
    finally { setBusy(false); }
  }
  return (
    <div className="panel">
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div className="btn-row">{[90, 180, 270].map((a) => <button key={a} className={angle === a ? '' : 'secondary'} onClick={() => setAngle(a)}>{a}°</button>)}</div>
      <button onClick={rotate} disabled={!file || busy}>{busy ? 'Rotating...' : 'Rotate all pages'}</button>
      {err && <p style={{ color: '#c00' }}>{err}</p>}
    </div>
  );
}
