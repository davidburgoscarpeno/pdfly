import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as any], { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
export function OrganizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [order, setOrder] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function load(f: File | null) {
    setFile(f); setCount(null); setErr('');
    if (f) try {
      const d = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      setCount(d.getPageCount());
    } catch { setErr('Could not read this PDF.'); }
  }
  async function run() {
    if (!file || count === null) return;
    const idxs: number[] = [];
    for (const part of order.split(',')) {
      const n = parseInt(part.trim());
      if (!Number.isInteger(n) || n < 1 || n > count) { setErr(`Invalid page "${part.trim()}" - use numbers 1-${count}, comma separated.`); return; }
      idxs.push(n - 1);
    }
    if (!idxs.length) { setErr('Enter at least one page.'); return; }
    setBusy(true); setErr('');
    try {
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, idxs);
      pages.forEach((p) => out.addPage(p));
      download(await out.save(), 'reorganized.pdf');
    } catch (e: any) { setErr('Could not reorganize: ' + (e?.message || 'unknown error')); }
    finally { setBusy(false); }
  }
  return (
    <div className="panel">
      <input type="file" accept="application/pdf" onChange={(e) => load(e.target.files?.[0] ?? null)} />
      {count !== null && <p>{count} pages. Current order: {Array.from({ length: count }, (_, i) => i + 1).join(', ')}</p>}
      <label>New page order (comma separated; omit pages to delete, repeat to duplicate)</label>
      <input type="text" value={order} onChange={(e) => setOrder(e.target.value)} placeholder={count === 3 ? '3, 1, 2' : '5, 3, 3, 1'} />
      <button onClick={run} disabled={!file || busy}>{busy ? 'Working...' : 'Reorganize'}</button>
      {err && <p style={{ color: '#c00' }}>{err}</p>}
    </div>
  );
}
export function MetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<Record<string, string> | null>(null);
  const [title, setTitle] = useState(''); const [author, setAuthor] = useState(''); const [subject, setSubject] = useState(''); const [keywords, setKeywords] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function load(f: File | null) {
    setFile(f); setMeta(null); setErr('');
    if (f) try {
      const d = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      const m: Record<string, string> = {
        Title: d.getTitle() || '', Author: d.getAuthor() || '', Subject: d.getSubject() || '',
        Keywords: d.getKeywords() || '', Creator: d.getCreator() || '', Producer: d.getProducer() || '',
        Created: d.getCreationDate()?.toLocaleString() || '', Modified: d.getModificationDate()?.toLocaleString() || '', Pages: String(d.getPageCount()),
      };
      setMeta(m);
      setTitle(m.Title); setAuthor(m.Author); setSubject(m.Subject); setKeywords(m.Keywords);
    } catch { setErr('Could not read this PDF.'); }
  }
  async function save() {
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const d = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      d.setTitle(title); d.setAuthor(author); d.setSubject(subject); d.setKeywords(keywords.split(',').map((k) => k.trim()).filter(Boolean));
      d.setModificationDate(new Date());
      download(await d.save(), 'metadata.pdf');
    } catch (e: any) { setErr('Could not save: ' + (e?.message || 'unknown error')); }
    finally { setBusy(false); }
  }
  return (
    <div className="panel">
      <input type="file" accept="application/pdf" onChange={(e) => load(e.target.files?.[0] ?? null)} />
      {meta && <>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table><tbody>{Object.entries(meta).map(([k, v]) => <tr key={k}><td><strong>{k}</strong></td><td>{v || <em>(empty)</em>}</td></tr>)}</tbody></table>
        </div>
        <h3 style={{ marginTop: 12 }}>Edit metadata</h3>
        <label>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Author</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <label>Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <label>Keywords (comma separated)</label><input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        <div style={{ marginTop: 8 }}><button onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save with new metadata'}</button></div>
      </>}
      {err && <p style={{ color: '#c00' }}>{err}</p>}
    </div>
  );
}
