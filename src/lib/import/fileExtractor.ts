/**
 * Client-Side Resume File Extractor
 * 
 * Extracts selectable text directly in the browser to protect candidate privacy.
 * Supports PDF (via pdfjs-dist), DOCX (via mammoth), and plain-text (.txt).
 * Detects scanned/image-only PDFs and password-protected files with clear errors.
 */

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ExtractedFileResult {
  text: string;
  filename: string;
  fileType: "pdf" | "docx" | "txt";
  pageCount?: number;
  isScanned?: boolean;
}

/**
 * Validates file size and format constraints.
 */
export function validateResumeFile(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`);
  }

  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf");
  const isDocx = name.endsWith(".docx");
  const isTxt = name.endsWith(".txt");

  if (!isPdf && !isDocx && !isTxt) {
    throw new Error(
      "Unsupported file format. Please upload a PDF (.pdf), Microsoft Word (.docx), or plain text (.txt) resume."
    );
  }
}

/**
 * Extracts selectable vector text from PDF using pdfjs-dist.
 * Throws explicit errors for scanned/image-only PDFs or password protection.
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  try {
    const pdfjs = await import("pdfjs-dist");

    // Configure worker
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];
    let totalChars = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageStrings = content.items
        .map((item: any) => item.str || "")
        .filter(Boolean);

      const pageText = pageStrings.join(" ");
      totalChars += pageText.replace(/\s/g, "").length;
      pageTexts.push(pageText);
    }

    const fullText = pageTexts.join("\n\n").trim();

    // Scanned / Image-Only PDF Guard:
    // If the PDF has pages but fewer than 50 text characters, it is an image/scanned document.
    if (totalChars < 50) {
      throw new Error(
        "Scanned or image-only PDF detected. This file contains no selectable text for ATS parsing. Please upload a PDF generated with selectable text, or paste your resume text."
      );
    }

    return {
      text: fullText,
      pageCount: numPages,
    };
  } catch (err: any) {
    const errorMsg = err.message || "";

    // Password protection check
    if (
      err.name === "PasswordException" ||
      errorMsg.toLowerCase().includes("password") ||
      errorMsg.toLowerCase().includes("encrypted")
    ) {
      throw new Error(
        "Password-protected PDF detected. Please remove password encryption from your document before uploading."
      );
    }

    // Re-throw our scanned error directly
    if (errorMsg.includes("Scanned or image-only")) {
      throw err;
    }

    throw new Error(`Failed to parse PDF: ${errorMsg || "Unsupported layout or corrupted file."}`);
  }
}

/**
 * Extracts raw text from Microsoft Word (.docx) using mammoth.
 */
export async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = (result.value || "").trim();

    if (!text || text.length < 30) {
      throw new Error(
        "Could not extract readable text from this DOCX file. Please ensure it is not empty or corrupted."
      );
    }

    return text;
  } catch (err: any) {
    if (err.message.includes("Could not extract")) throw err;
    throw new Error(`Failed to parse Word (.docx) file: ${err.message || "Unknown error."}`);
  }
}

/**
 * High-level browser file ingestion wrapper.
 */
export async function extractTextFromFile(file: File): Promise<ExtractedFileResult> {
  validateResumeFile(file);

  const filename = file.name;
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const buffer = await file.arrayBuffer();
    const { text, pageCount } = await extractTextFromPdf(buffer);
    return {
      text,
      filename,
      fileType: "pdf",
      pageCount,
    };
  }

  if (lower.endsWith(".docx")) {
    const buffer = await file.arrayBuffer();
    const text = await extractTextFromDocx(buffer);
    return {
      text,
      filename,
      fileType: "docx",
      pageCount: 1,
    };
  }

  // Plain text (.txt)
  const text = await file.text();
  if (!text.trim() || text.trim().length < 20) {
    throw new Error("Uploaded text file is empty or too short.");
  }

  return {
    text: text.trim(),
    filename,
    fileType: "txt",
    pageCount: 1,
  };
}
