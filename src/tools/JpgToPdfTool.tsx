import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function JpgToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function create() {
    if (!files.length) return;
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        const img = f.type === 'image/png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const pdfBytes = await doc.save();
      setUrl(URL.createObjectURL(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })));
    } finally { setBusy(false); }
  }
  return (
    <div className="panel">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple style={{ display: 'none' }}
        onChange={(e) => { setFiles(Array.from(e.target.files ?? [])); setUrl(''); }} />
      <div className="btn-row">
        <button onClick={() => inputRef.current?.click()}>Choose JPG images</button>
        {files.length > 0 && <span style={{ color: 'var(--text-muted)' }}>{files.length} image(s) selected</span>}
      </div>
      {files.length > 0 && !url && <button onClick={create} disabled={busy}>{busy ? 'Building...' : 'Create PDF'}</button>}
      {url && <a className="btn" href={url} download="images.pdf" style={{ display: 'inline-block' }}>Download PDF</a>}
    </div>
  );
}
