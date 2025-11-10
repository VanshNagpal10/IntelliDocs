export const runtime = "nodejs";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import tesseract from "node-tesseract-ocr";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText } from "unpdf";

// import { PDFParse } from 'pdf-parse';

// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');

const TMP_DIR = path.join(process.cwd(), "tmp_uploads");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const STORE_PATH = path.join(TMP_DIR, "store.json");
let STORE = {};
if (fs.existsSync(STORE_PATH)) STORE = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));

function saveStore() {
  fs.writeFileSync(STORE_PATH, JSON.stringify(STORE, null, 2));
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const { text } = await extractText(uint8Array, { mergePages: true });
    console.log(text);
    return text || "";
  } catch (err) {
    console.error("PDF extraction failed:", err);
    throw new Error("Failed to extract text from PDF");
  }
}




async function extractTextFromImage(filePath: string): Promise<string> {
  const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
  };
  
  try {
    const text = await tesseract.recognize(filePath, config);
    return text;
  } catch (error) {
    console.error("OCR error:", error);
    return "";
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return "";
  }
}

async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error("TXT extraction error:", error);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const docId = uuid();
    const fileName = `${docId}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(TMP_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`Processing file: ${file.name}, type: ${file.type}`);

    let text = "";
    let extractionMethod = "";
    
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        text  = await extractTextFromPDF(buffer);
        
        if (!text || text.trim().length < 10) {
          return NextResponse.json({ 
            error: "No text could be extracted from this PDF." 
          }, { status: 400 });
        }
      } catch (error: any) {
        return NextResponse.json({ 
          error: `Failed to extract text from PDF: ${error.message}` 
        }, { status: 500 });
      }
    } else if (file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)) {
      try {
        text = await extractTextFromImage(filePath);
        extractionMethod = "OCR (image)";
      } catch (ocrError) {
        console.error("OCR failed:", ocrError);
        return NextResponse.json({ 
          error: "Failed to perform OCR. Make sure Tesseract is installed on your system." 
        }, { status: 500 });
      }
    } 
    else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      try {
        text = await extractTextFromDOCX(buffer);
        extractionMethod = "DOCX text extraction";
      } catch (e) {
        console.error("DOCX extraction failed:", e);
        return NextResponse.json({ 
          error: "Failed to extract text from DOCX file" 
        }, { status: 500 });
      }
    }
    else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      try {
        text = await extractTextFromTXT(buffer);
        extractionMethod = "Plain text";
      } catch (e) {
        console.error("TXT extraction failed:", e);
        return NextResponse.json({ 
          error: "Failed to read text file" 
        }, { status: 500 });
      }
    }
    else {
      return NextResponse.json({ 
        error: "Unsupported file type. Please upload PDF or image files." 
      }, { status: 400 });
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ 
        error: "No text could be extracted from the file" 
      }, { status: 400 });
    }

    const rawLines = text.split(/\r?\n/);
    const lines = rawLines.map((line, idx) => ({ 
      lineNo: idx + 1, 
      text: line 
    }));


    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;

    STORE[docId] = {
      id: docId,
      fileName: file.name,
      storedPath: filePath,
      extractedText: text,
      lines,
      wordCount,
      charCount,
      extractionMethod,
      createdAt: new Date().toISOString(),
    };
    saveStore();

    console.log(`Successfully processed ${file.name}: ${lines.length} lines, ${wordCount} words`);

    return NextResponse.json({ 
      success: true, 
      docId, 
      fileName: file.name, 
      linesCount: lines.length,
      wordCount,
      charCount,
      extractionMethod
    });
  } catch (err: any) {
    console.error("Upload/OCR error:", err);
    return NextResponse.json({ 
      error: err.message || "Failed to process file" 
    }, { status: 500 });
  }
}