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
  }
];
export const implementedTools = tools.filter((t) => t.implemented);
export const categories = [...new Set(tools.map((t) => t.category))];
export function bySlug(slug: string) { return tools.find((t) => t.slug === slug); }
