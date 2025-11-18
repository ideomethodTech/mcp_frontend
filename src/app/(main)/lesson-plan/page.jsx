"use client";

import { useState } from "react";
import {  FileText, ClipboardList } from "lucide-react";
import History from "@/components/ui/history";
import { useGenerateLearning, useGetLearnings, useGetLearning } from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import { LessonPlanDetails } from "./components/LessonPlanDetails";
import { LoadingState } from "@/components/ui/LoadingState";

export default function LessonPlanPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const generateMutation = useGenerateLearning();
  const { data: learnings, isLoading: isLoadingHistory } = useGetLearnings();
  const { data: selectedLearningData } = useGetLearning(selectedItem?.learning_id);
  const queryClient = useQueryClient();

  const handleGenerate = async (values) => {
    try {
      const result = await generateMutation.mutateAsync({
        document_id: values.book,
        chapter_id: values.chapter,
      });
      queryClient.invalidateQueries({ queryKey: ["learnings"] });
      setSelectedItem(result);
      toast.success("Lesson plan generated successfully!");
    } catch (error) {
      console.error("Failed to generate lesson plan:", error);
      toast.error(error.response?.data?.message || "Failed to generate lesson plan.");
    }
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
              Lesson Plan Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Generate structured lesson plans for any topic or chapter
            </p>
          </div>
        </div>
      </div>

      {generateMutation.isPending || isLoadingHistory ? (
        <LoadingState title="Loading Lesson Plans..." description="Please wait while we load your lesson plans." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <History
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            historyData={learnings?.learnings || []}
            buttonText="New Lesson Plan"
            subtitleField="document_name"
          />
          {/* Lesson Plan Content */}
          {selectedItem ? (
            <LessonPlanDetails item={selectedLearningData || selectedItem} />
          ) : (
            <BookChapterForm
              onGenerate={handleGenerate}
              pageHeaderTitle="Lesson Plan Generator"
              pageHeaderDescription="Generate structured lesson plans for any topic or chapter"
              pageHeaderIcon={ClipboardList}
              cardTitle="Book & Chapter Selection"
              cardDescription="Choose the book and chapter for your lesson plan."
              buttonText="Generate Lesson Plan"
              includeChapters={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
