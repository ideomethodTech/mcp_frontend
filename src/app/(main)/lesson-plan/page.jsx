"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import History from "@/components/ui/history";
import { useCreateLessonPlan, useGetLessonPlans } from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import { LessonPlanDetails } from "./components/LessonPlanDetails";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeaderBanner } from "@/components/ui/PageHeaderBanner";
import { useGetBook } from "@/lib/api/queries";

export default function LessonPlanPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const createLessonPlanMutation = useCreateLessonPlan();
  const uid = "nn170kZPMuWZlbzGbVps3YVyG9J3";
  const { data: lessonPlans, isLoading: isLoadingHistory, error: historyError } = useGetLessonPlans(uid);
  const { data: booksData } = useGetBook();
  const queryClient = useQueryClient();

  const handleGenerate = async (values) => {
    try {
      const result = await createLessonPlanMutation.mutateAsync({
        book_id: values.book,
        chapter: values.chapter,
        uid: uid,
        weeks: 1,
      });

      queryClient.invalidateQueries({ queryKey: ["lessonPlans", uid] });
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

      {createLessonPlanMutation.isPending || isLoadingHistory ? (
        <LoadingState title="Loading Lesson Plans..." description="Please wait while we load your lesson plans." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <History
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            historyData={lessonPlans?.content || []}
            buttonText="New Lesson Plan"
            isChat={false}
            booksData={booksData}
          />

          {selectedItem ? (
            <LessonPlanDetails item={selectedItem} />
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
