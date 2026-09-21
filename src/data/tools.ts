export interface ToolFaq { q: string; a: string }
export interface ToolExample { title: string; input?: string; output?: string; note?: string }
export interface Tool {
  slug: string; name: string; category: string; description: string;
  seoTitle: string; metaDescription: string; intro: string;
  howTo: string[]; examples: ToolExample[]; faqs: ToolFaq[];
  related: string[]; component: string; mode?: string; implemented: boolean; popular?: boolean;
}
export const tools: Tool[] = [
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    category: 'Convert',
    description: 'Turn JPG images into a single PDF, in order, without uploading anything.',
    seoTitle: 'JPG to PDF Converter - Free, Private, In-Browser | PDFly',
    metaDescription: 'Free JPG to PDF converter. Combine multiple JPG images into one PDF entirely in your browser - no uploads, no watermarks, no sign-up.',
    intro: 'Combine one or more JPG images into a single PDF. Everything happens locally in your browser, which matters when the images are scans of private documents.',
    howTo: ['Pick one or more JPG images.', 'They are added as pages in the order you selected them.', 'Click Create PDF and download the result.'],
    examples: [{ title: 'Scanning a receipt', output: 'Three photographed receipts become a tidy 3-page PDF ready to email.' }],
    faqs: [
      { q: 'Are my images uploaded?', a: 'No. The PDF is built on your device with pdf-lib, an in-browser library. Nothing is sent to a server.' },
      { q: 'Is there a page limit?', a: 'No hard limit - dozens of images work fine. Very large batches depend on your device memory.' }
    ],
    related: [],
    component: 'JpgToPdfTool',
    implemented: true,
    popular: true
  },
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    category: 'Organize',
    description: 'Combine multiple PDFs into one file, in your order.',
    seoTitle: 'Merge PDF Online Free - Combine PDFs | PDFly',
    metaDescription: 'Free PDF merger. Combine multiple PDF files into one, in your browser. No upload - files never leave your device.',
    intro: 'Combine as many PDFs as you need into a single file. Everything runs in your browser: the files never leave your device.',
    howTo: ['Select the PDFs in the order you want them.', 'Click Merge.', 'Download the combined file.'],
    examples: [{ title: 'Contract + annexes', output: 'One merged.pdf ready to send.' }],
    faqs: [{ q: 'Password-protected PDFs?', a: 'Encrypted files that require a password to open cannot be merged - remove protection first.' }],
    related: ['split-pdf', 'rotate-pdf', 'jpg-to-pdf'],
    component: 'MergeTool', implemented: true, popular: true
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    category: 'Organize',
    description: 'Extract page ranges into a new PDF.',
    seoTitle: 'Split PDF Online Free - Extract Pages | PDFly',
    metaDescription: 'Free PDF splitter. Extract any page range (1-3, 5, 8-10) into a new PDF, in your browser. No upload, no signup.',
    intro: 'Pull out exactly the pages you need: enter ranges like 1-3, 5 and get a new PDF with just those pages.',
    howTo: ['Choose a PDF.', 'Enter the page ranges to keep.', 'Download the extracted pages.'],
    examples: [{ title: 'Pages 2 and 7-9 of a 40-page report', output: 'split.pdf with 4 pages.' }],
    faqs: [{ q: 'Can I reorder pages?', a: 'Ranges are output in ascending page order. To reorder, merge several extracted files in your order with Merge PDF.' }],
    related: ['merge-pdf', 'rotate-pdf'],
    component: 'SplitTool', implemented: true, popular: true
  },
  {
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    category: 'Fix',
    description: 'Rotate all pages 90, 180 or 270 degrees.',
    seoTitle: 'Rotate PDF Online Free - Fix Page Orientation | PDFly',
    metaDescription: 'Free PDF rotator. Rotate all pages of a PDF by 90, 180 or 270 degrees in your browser. No upload, instant download.',
    intro: 'Scanned documents often arrive sideways. Rotate every page 90, 180 or 270 degrees in one click.',
    howTo: ['Choose the PDF.', 'Pick the rotation angle.', 'Download the fixed file.'],
    examples: [{ title: 'Landscape scan shown as portrait', output: 'Rotate 90 degrees and it reads correctly.' }],
    faqs: [{ q: 'Single pages?', a: 'This rotates the whole document. To fix one page, split it out, rotate, then merge back.' }],
    related: ['split-pdf', 'merge-pdf'],
    component: 'RotateTool', implemented: true
  },
  {
    slug: 'add-page-numbers',
    name: 'Add Page Numbers to PDF',
    category: 'Fix',
    description: 'Stamp "N / total" page numbers at the bottom of every page.',
    seoTitle: 'Add Page Numbers to PDF Online Free | PDFly',
    metaDescription: 'Free PDF page numbering tool. Add page numbers to any PDF in your browser - bottom left, center or right. No upload, no signup.',
    intro: 'Add clean page numbers to any PDF: choose the position and every page gets stamped with its number and the total.',
    howTo: ['Choose the PDF.', 'Pick bottom left, center or right.', 'Download the numbered file.'],
    examples: [{ title: '25-page report', output: 'Every page stamped "1 / 25" style at the bottom.' }],
    faqs: [{ q: 'Will it cover content?', a: 'Numbers are placed 16pt from the bottom edge in small gray type, below almost all document margins.' }],
    related: ['merge-pdf', 'split-pdf', 'rotate-pdf'],
    component: 'PageNumbersTool', implemented: true
  },
  {
    slug: 'extract-text-from-pdf',
    name: 'Extract Text from PDF',
    category: 'Convert',
    description: 'Pull the full text out of any PDF, page by page.',
    seoTitle: 'Extract Text from PDF Online Free | PDFly',
    metaDescription: 'Free PDF text extractor. Pull all text from any PDF, page by page, in your browser. No upload - files stay on your device.',
    intro: 'Get the text out of a PDF without copy-pasting page by page. Extraction runs entirely in your browser.',
    howTo: ['Choose the PDF.', 'Click Extract text.', 'Copy the full text, organized by page.'],
    examples: [{ title: 'Research paper', output: 'Full text with --- Page N --- markers, ready to paste anywhere.' }],
    faqs: [{ q: 'Scanned PDFs?', a: 'A scan is an image - there is no text layer to extract. This tool works on PDFs with real (selectable) text.' }],
    related: ['jpg-to-pdf', 'split-pdf'],
    component: 'ExtractTextTool', implemented: true, popular: true
  }
];
export const implementedTools = tools.filter((t) => t.implemented);
export const categories = [...new Set(tools.map((t) => t.category))];
export function bySlug(slug: string) { return tools.find((t) => t.slug === slug); }
