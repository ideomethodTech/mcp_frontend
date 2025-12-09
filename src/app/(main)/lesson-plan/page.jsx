"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import History from "@/components/ui/history";
import { useCreateLessonPlan, useGetBook, useUserLessonPlan } from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import LessonPlanItem from "./components/LessonPlanItem";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeaderBanner } from "@/components/ui/PageHeaderBanner";
import { useAuth } from "@/contexts/auth-context";

export default function LessonPlanPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const uid = user?.user?.uid;

  const queryClient = useQueryClient();

  // Get user's lesson plans
  const { data: lessonPlans, isLoading: isLoadingHistory } = useUserLessonPlan(uid);

  // Get books for the form
  const { data: booksData, isLoading: isLoadingBooks } = useGetBook();

  // Create lesson plan mutation
  const generateMutation = useCreateLessonPlan({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-plans"] });
      setSelectedItem(data);
      toast({
        title: "Success",
        description: "Lesson plan generated successfully!",
      });
    },
    onError: (error) => {
      console.error("Failed to generate lesson plan:", error);
      let errorMessage = "Failed to generate lesson plan";

      if (error.code === "ERR_NETWORK") {
        errorMessage = "Cannot connect to server. Please check backend.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // const handleGenerate = async (values) => {
  //   if (!uid) {
  //     toast({
  //       title: "Authentication Error",
  //       description: "Please log in to generate lesson plans.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   if (!values.book || !values.chapter) {
  //     toast({
  //       title: "Missing Information",
  //       description: "Please select both a book and a chapter.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     generateMutation.mutate({
  //       book_id: values.book.id,
  //       chapter: values.chapter,
  //       uid: uid,
  //       weeks: values.duration || 2,
  //     });
  //   } catch (error) {
  //     console.error("Failed to generate lesson plan:", error);
  //   }
  // };
  const handleGenerate = async (values) => {
    console.log("Form values:", values); // Debug

    if (!uid) {
      toast({
        title: "Authentication Error",
        description: "Please log in to generate lesson plans.",
        variant: "destructive",
      });
      return;
    }

    if (!values.book || !values.chapter) {
      toast({
        title: "Missing Information",
        description: "Please select both a book and a chapter.",
        variant: "destructive",
      });
      return;
    }

    // values.book is already the ID string, no need for .id
    try {
      generateMutation.mutate({
        book_id: values.book, // <-- Just use values.book directly
        chapter: values.chapter,
        uid: uid,
        weeks: values.duration || 2,
      });
    } catch (error) {
      console.error("Failed to generate lesson plan:", error);
    }
  };

  const books = booksData?.content || [];

  const isLoading = generateMutation.isPending || isLoadingHistory || isLoadingBooks;

  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <PageHeaderBanner
        title="Lesson Plan Generator"
        description="Generate structured lesson plans for any topic or chapter"
        icon={ClipboardList}
      />

      {isLoading ? (
        <LoadingState title="Loading Lesson Plans..." description="Please wait while we load your lesson plans." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <History
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            historyData={lessonPlans?.content || []}
            buttonText="New Lesson Plan"
          />

          {selectedItem ? (
            <div className="lg:col-span-7">
              <LessonPlanItem item={selectedItem} isgenrated={false} />
            </div>
          ) : (
            <div className="lg:col-span-7">
              <BookChapterForm
                onGenerate={handleGenerate}
                books={books}
                cardTitle="Book & Chapter Selection"
                cardDescription="Choose the book and chapter for your lesson plan."
                buttonText="Generate Lesson Plan"
                includeDuration={true}
                isLoading={generateMutation.isPending}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
