"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Presentation, Loader2, Download, Layers, Palette, FileType, Sparkles, Zap, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import { ToolPageLayout } from "@/app/componentsV2/ui/tool-page-layout";
import * as z from "zod";

const pptFormSchema = z.object({
  book: z.string().nonempty("Please select a book."),
  chapter: z.string().nonempty("Please select a chapter."),
});

// --- Ppt Details Component (Matching Premium Style) ---

function PptDetails({ item }) {
  if (!item) return null;

  const handleDownload = () => {
    toast.info("Preparing your presentation...");

    // Create a dummy blob to simulate a real download to the local machine
    const dummyContent = "This is a placeholder for the generated PowerPoint presentation.";
    const blob = new Blob([dummyContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.details?.filename || "presentation.pptx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setTimeout(() => {
      toast.success("Presentation downloaded successfully!");
    }, 1500);
  };

  return (
    <div className="lg:col-span-3 animate-in fade-in duration-500">
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Presentation className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">{item.title}</h2>
              <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">{item.book} • {item.chapter}</p>
            </div>
          </div>
          <Button
            className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl shadow-xl shadow-indigo-100 text-sm font-bold gap-2 transition-all hover:scale-105 active:scale-95"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download PPTX
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="bg-muted/30 p-8 border-b border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center group hover:border-primary/30 transition-all">
              <Layers className="h-5 w-5 text-primary mx-auto mb-3" />
              <p className="text-2xl font-black text-foreground leading-none mb-1">{item.slides}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Slides</p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center group hover:border-accent/30 transition-all">
              <Palette className="h-5 w-5 text-accent mx-auto mb-3" />
              <p className="text-2xl font-black text-foreground leading-none mb-1">{item.details?.theme || "Modern"}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visual Theme</p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center group hover:border-emerald-500/30 transition-all">
              <FileType className="h-5 w-5 text-emerald-500 mx-auto mb-3" />
              <p className="text-2xl font-black text-foreground leading-none mb-1">PPTX</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Format</p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center group hover:border-orange-500/30 transition-all">
              <Clock className="h-5 w-5 text-orange-500 mx-auto mb-3" />
              <p className="text-2xl font-black text-foreground leading-none mb-1">Standard</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8">
          <div className="space-y-8">
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary fill-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Generated Details</span>
              </div>
              <p className="text-sm font-bold text-foreground opacity-70 mb-2">Created: {format(new Date(item.created_at), 'MMMM do, yyyy')}</p>
              <p className="text-sm font-bold text-foreground opacity-70">Filename: <span className="p-1 px-2 bg-background rounded-lg ml-1 font-mono text-xs border border-border">{item.details?.filename || "presentation.pptx"}</span></p>
            </div>

            <div>
              <h3 className="text-lg font-black text-foreground mb-6 uppercase tracking-tight">Presentation Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Introduction", desc: "Overview & Learning Objectives", icon: Presentation },
                  { title: "Key Concepts", desc: "Core terminology and definitions", icon: Layers },
                  { title: "Deep Dive", desc: "Detailed analysis and examples", icon: FileType },
                  { title: "Summary", desc: "Key takeaways and next steps", icon: Palette },
                ].map((preview, i) => (
                  <div key={i} className="group flex flex-col gap-4 p-5 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-card transition-all shadow-sm hover:shadow-md">
                    <div className="aspect-video bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors relative overflow-hidden">
                      <preview.icon className="h-12 w-12 text-primary/20 group-hover:text-primary transition-colors z-10" />
                      <span className="absolute top-3 left-3 bg-card text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-full z-20 border border-border">Slide {i + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{preview.title}</p>
                      <p className="text-xs text-muted-foreground font-medium">{preview.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function PptGeneratorPage() {
  const { user } = useAuth();
  const uid = user?.user?.uid || user?.uid;

  const [historyData, setHistoryData] = useState([]); // Removed mock history data
  const [selectedPpt, setSelectedPpt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleGenerate = useCallback((book, formData) => {
    setIsLoading(true);
    setSelectedPpt(null);

    // Simulate generation delay
    setTimeout(() => {
      const chapterName = formData.chapter;
      const newPpt = {
        id: Math.random().toString(36).substr(2, 9),
        title: `${chapterName} Presentation`,
        slides: Math.floor(Math.random() * 8) + 8,
        book: book.book_name,
        chapter: chapterName,
        created_at: new Date().toISOString(),
        details: {
          subtitle: `A comprehensive overview of ${chapterName}`,
          author: 'Epoch AI Generated Presentation',
          theme: Math.random() > 0.5 ? 'Dark' : 'Light',
          filename: `${chapterName.replace(/\s+/g, '_')}_${Date.now()}.pptx`,
        },
      };

      setHistoryData(prev => [newPpt, ...prev]);
      setSelectedPpt(newPpt);
      setIsLoading(false);
      toast.success("Presentation generated successfully!");
    }, 3000);
  }, []);

  const handleDeletePpt = useCallback((item) => {
    setDeletingId(item.id);

    // Simulate delete
    setTimeout(() => {
      setHistoryData(prev => prev.filter(ppt => ppt.id !== item.id));
      if (selectedPpt?.id === item.id) {
        setSelectedPpt(null);
      }
      setDeletingId(null);
      toast.success("Presentation deleted successfully");
    }, 500);
  }, [selectedPpt]);

  return (
    <ToolPageLayout
      historyData={historyData}
      selectedItem={selectedPpt}
      setSelectedItem={setSelectedPpt}
      onDelete={handleDeletePpt}
      isHistoryLoading={false}
      deletingId={deletingId}
      isProcessing={isLoading}
      processingText="Crafting Slides..."
    >
      {selectedPpt ? (
        <PptDetails item={selectedPpt} />
      ) : (
        <BookChapterForm
          onGenerate={handleGenerate}
          pageHeaderTitle="PowerPoint Generator"
          pageHeaderDescription="Create visually stunning presentations"
          pageHeaderIcon={Presentation}
          buttonText="Generate Presentation"
          isLoading={isLoading}
          formSchema={pptFormSchema}
        />
      )}
    </ToolPageLayout>
  );
}
