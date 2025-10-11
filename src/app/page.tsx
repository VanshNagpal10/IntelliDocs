"use client";

import HeroSection from "./components/HeroSection";
import { DocumentUploader } from "./components/DocumentUploader";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";




export default function Home() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    
    // Reset query after submission
    setQuery("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Intelligent Document Analyzer
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your documents and ask AI-powered questions to extract
              insights, count occurrences, and analyze content instantly.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Upload Documents
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload PDFs, images, or scanned documents
              </p>
            </div>
            <DocumentUploader />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Ask Questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Ask any question about your uploaded documents
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ask a Question</label>
                <p className="text-xs text-muted-foreground">
                  Example: "How many times does the word 'AI' appear?" or "Count
                  the total number of words"
                </p>
              </div>
              <div className="relative">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question here..."
                  className="min-h-[120px] pr-12 resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!query.trim() || isLoading}
                  size="icon"
                  className="absolute bottom-3 right-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press{" "}
                <kbd className="px-1.5 py-0.5 text-xs border rounded">
                  Enter
                </kbd>{" "}
                to send or{" "}
                <kbd className="px-1.5 py-0.5 text-xs border rounded">
                  Shift+Enter
                </kbd>{" "}
                for new line
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
