"use client";

import { useState } from "react";
import {  ClipboardList } from "lucide-react";
import History from "@/components/ui/history";
import { useGenerateLearning, useGetLearnings, useGetLearning } from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import { LessonPlanDetails } from "./components/LessonPlanDetails";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeaderBanner } from "@/components/ui/PageHeaderBanner";

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
      <PageHeaderBanner
        title="Lesson Plan Generator"
        description="Generate structured lesson plans for any topic or chapter"
        icon={ClipboardList}
      />

      {generateMutation.isPending || isLoadingHistory ? (
        <LoadingState title="Loading Lesson Plans..." description="Please wait while we load your lesson plans." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <History
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            historyData={learnings?.learnings || []}
            buttonText="New Lesson Plan"
          />
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
