export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { createWorker } from "tesseract.js";
import mammoth from "mammoth";
import { extractText } from "unpdf";
import path from "path";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const { text } = await extractText(uint8Array, { mergePages: true });
    return text || "";
  } catch (err) {
    console.error("PDF extraction failed:", err);
    throw new Error("Failed to extract text from PDF");
  }
}

async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    const worker = await createWorker("eng", 1, {
      workerPath: path.join(process.cwd(), "node_modules", "tesseract.js", "src", "worker-script", "node", "index.js"),
    });
    const ret = await worker.recognize(buffer);
    await worker.terminate();
    return ret.data.text;
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Processing file: ${file.name}, type: ${file.type}`);

    let text = "";
    let extractionMethod = "";

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        text = await extractTextFromPDF(buffer);
        extractionMethod = "unpdf";
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: `Failed to extract text from PDF: ${errorMessage}` }, { status: 500 });
      }
    } else if (file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)) {
      try {
        text = await extractTextFromImage(buffer);
        extractionMethod = "OCR (Tesseract.js)";
      } catch {
        return NextResponse.json({ error: "Failed to perform OCR." }, { status: 500 });
      }
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      try {
        text = await extractTextFromDOCX(buffer);
        extractionMethod = "mammoth DOCX extraction";
      } catch {
        return NextResponse.json({ error: "Failed to extract text from DOCX file" }, { status: 500 });
      }
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      try {
        text = await extractTextFromTXT(buffer);
        extractionMethod = "Plain text";
      } catch {
        return NextResponse.json({ error: "Failed to read text file" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text could be extracted from the file" }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      // We continue even if storage fails? No, we should probably fail.
      // But for now let's log it. Ideally we want the file stored.
      throw new Error("Failed to upload file to storage");
    }

    const storagePath = uploadData?.path;

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const linesCount = text.split(/\r?\n/).length;

    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert({
        original_name: file.name,
        storage_path: storagePath,
        extracted_text: text,
        file_type: file.type,
        file_size: file.size,
        lines_count: linesCount,
        word_count: wordCount
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase DB Insert Error:", dbError);
      throw new Error("Failed to save document metadata");
    }

    return NextResponse.json({
      success: true,
      docId: dbData.id,
      fileName: file.name,
      linesCount,
      wordCount,
      extractionMethod
    });

  } catch (err) {
    console.error("Upload/Processing error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to process file";
    return NextResponse.json({
      error: errorMessage
    }, { status: 500 });
  }
}