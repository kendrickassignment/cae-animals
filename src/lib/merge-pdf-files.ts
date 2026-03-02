import { PDFDocument } from "pdf-lib";

const sanitizeFilePart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "analysis";

export async function mergePdfFiles(files: File[], companyName: string, reportYear: number): Promise<File> {
  if (files.length === 1) return files[0];

  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const mergedBytes = await merged.save();
  const mergedArrayBuffer = mergedBytes.buffer.slice(
    mergedBytes.byteOffset,
    mergedBytes.byteOffset + mergedBytes.byteLength,
  ) as ArrayBuffer;
  const safeCompany = sanitizeFilePart(companyName || "company");
  const filename = `${safeCompany}-${reportYear}-merged.pdf`;

  return new File([mergedArrayBuffer], filename, {
    type: "application/pdf",
    lastModified: Date.now(),
  });
}
