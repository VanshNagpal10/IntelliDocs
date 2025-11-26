import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { docIds, question } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const idsToProcess = Array.isArray(docIds) ? docIds : (docIds ? [docIds] : []);

    if (idsToProcess.length === 0) {
      return NextResponse.json({ error: "No documents uploaded. Please upload documents first." }, { status: 400 });
    }

    // Fetch documents from Supabase
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .in('id', idsToProcess);

    if (fetchError || !documents) {
      console.error("Error fetching documents:", fetchError);
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    let combinedText = "";
    const documentInfo: { id: string; fileName: string; wordCount: number; lineCount: number }[] = [];

    for (const doc of documents) {
      combinedText += `\n\n=== Document: ${doc.original_name} ===\n${doc.extracted_text}`;
      documentInfo.push({
        id: doc.id,
        fileName: doc.original_name,
        wordCount: doc.word_count,
        lineCount: doc.lines_count
      });
    }

    if (!combinedText.trim()) {
      return NextResponse.json({ error: "No valid documents found" }, { status: 404 });
    }

    console.log(`Processing question for ${documentInfo.length} document(s):`, question);

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({
        error: "AI service not configured. Please set GITHUB_TOKEN in .env.local"
      }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: process.env.GITHUB_TOKEN
    });

    const systemPrompt = `You are an intelligent document analysis assistant. You have access to the full text content of uploaded documents.

Your task is to answer questions about these documents accurately and precisely. When answering:
- For counting questions (e.g., "how many times does X appear"), provide exact counts
- For location questions (e.g., "which line"), provide specific line numbers when possible
- For summarization, be concise and accurate
- If the answer cannot be found in the documents, say so clearly
- Always base your answers on the actual document content provided

Documents provided:
${documentInfo.map(d => `- ${d.fileName} (${d.lineCount} lines, ${d.wordCount} words)`).join('\n')}`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the full content of all documents:\n${combinedText}\n\nQuestion: ${question}`
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const answer = resp.choices?.[0]?.message?.content ?? "No response generated";

    console.log(`Answer generated successfully`);

    return NextResponse.json({
      answer,
      documents: documentInfo,
      question
    });

  } catch (err) {
    console.error("Ask error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to process question";
    return NextResponse.json({
      error: errorMessage
    }, { status: 500 });
  }
}