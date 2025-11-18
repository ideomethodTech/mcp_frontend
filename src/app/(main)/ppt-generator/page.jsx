"use client";

import { useState } from "react";
import { Presentation, Loader2, Download, Palette, Layers, FileText, FileType } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import History from "@/components/ui/history";
import { BookChapterForm } from "@/components/ui/BookChapterForm";

const mockHistory = [
  {
    id: "1",
    title: "The Brahmin and the Disciple",
    slides: 11,
    date: new Date("2025-10-13"),
    details: {
      subtitle: "A Tale of Greed, Magic, and Unexpected Consequences",
      author: "Epoch AI Generated Presentation",
      theme: "Dark",
      filename: "The_Brahmin_and_the_Disciple_1760352312808.pptx",
    },
  },
  {
    id: "2",
    title: "Introduction to Photosynthesis",
    slides: 15,
    date: new Date("2025-10-11"),
    details: {
      subtitle: "Understanding how plants create food.",
      author: "Epoch AI Generated Presentation",
      theme: "Light",
      filename: "Intro_to_Photosynthesis_1759992312808.pptx",
    },
  },
];

function PptDetails({ item }) {
  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)]">
        {/* Header with Actions */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Presentation className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold text-foreground">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.details.subtitle}</p>
              </div>
            </div>
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Download className="h-4 w-4" />
              Download PPT
            </Button>
          </div>
        </div>

        {/* Presentation Stats */}
        <div className="p-6 border-b border-border">
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-4 text-center">
              <Layers className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{item.slides}</p>
              <p className="text-xs text-muted-foreground">Slides</p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-purple-500/5 to-purple-600/5 p-4 text-center">
              <Palette className="h-5 w-5 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{item.details.theme}</p>
              <p className="text-xs text-muted-foreground">Theme</p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-green-500/5 to-green-600/5 p-4 text-center">
              <FileType className="h-5 w-5 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">PPTX</p>
              <p className="text-xs text-muted-foreground">Format</p>
            </div>
            <div className="rounded-xl border border-border bg-gradient-to-br from-orange-500/5 to-orange-600/5 p-4 text-center">
              <Presentation className="h-5 w-5 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">Standard</p>
              <p className="text-xs text-muted-foreground">Aspect Ratio</p>
            </div>
          </div>
        </div>

        {/* Presentation Details */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 border border-primary/10">
              <p className="text-sm text-muted-foreground mb-2">
                Generated on: {item?.date ? format(new Date(item.date), "dd/MM/yyyy") : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Filename: {item.details.filename}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Presentation Preview</h3>
              <p className="text-muted-foreground mb-4">
                This presentation has been automatically generated based on your selected content. It includes engaging
                visuals, clear structure, and comprehensive coverage of the topic.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4 bg-muted/30">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
                    <Presentation className="h-12 w-12 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Slide 1: Title Slide</p>
                  <p className="text-xs text-muted-foreground">Introduction & overview</p>
                </div>

                <div className="rounded-xl border border-border p-4 bg-muted/30">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
                    <Layers className="h-12 w-12 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Slide 2: Characters</p>
                  <p className="text-xs text-muted-foreground">Main characters overview</p>
                </div>

                <div className="rounded-xl border border-border p-4 bg-muted/30">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
                    <FileType className="h-12 w-12 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Slide 3: Plot Summary</p>
                  <p className="text-xs text-muted-foreground">Story progression</p>
                </div>

                <div className="rounded-xl border border-border p-4 bg-muted/30">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-3 flex items-center justify-center">
                    <Palette className="h-12 w-12 text-primary/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Slide 4: Key Themes</p>
                  <p className="text-xs text-muted-foreground">Analysis & insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PptGeneratorPage() {
  const [selectedPpt, setSelectedPpt] = useState(mockHistory[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setSelectedPpt(null);
    setTimeout(() => {
      const newPpt = {
        id: "3",
        title: "New Presentation",
        slides: 12,
        date: new Date(),
        details: {
          subtitle: "Generated from selected chapter.",
          author: "Epoch AI Generated Presentation",
          theme: "Dark",
          filename: "New_Presentation.pptx",
        },
      };
      mockHistory.unshift(newPpt);
      setSelectedPpt(newPpt);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PPT Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Transform book chapters into engaging presentations. </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* {History} */}
        <History selectedItem={selectedPpt} setSelectedItem={setSelectedPpt} historyData={mockHistory} />

        {/* PPT generator Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Generating Presentation...</h3>
              <p className="text-sm text-muted-foreground">Please wait while the AI crafts your slides.</p>
            </div>
          </div>
        ) : selectedPpt ? (
          <PptDetails item={selectedPpt} />
        ) : (
          <BookChapterForm
            onGenerate={handleGenerate}
            pageHeaderTitle="PPT Generator"
            pageHeaderDescription="Transform book chapters into engaging presentations."
            pageHeaderIcon={FileText}
            cardTitle="Generate a New Presentation"
            cardDescription="Choose a book and chapter to automatically create a PowerPoint presentation."
            buttonText="Generate Presentation"
            includeChapters={true}
          />
        )}
      </div>
    </div>
  );
}
