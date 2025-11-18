"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import History from "@/components/ui/history";
import { useGenerateWorksheet, useGetWorksheets, useGetDocuments } from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import { WorksheetDetails } from "./components/WorksheetDetails";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeaderBanner } from "@/components/ui/PageHeaderBanner";

export default function WorksheetPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const generateMutation = useGenerateWorksheet();
  const { data: worksheets, isLoading: isLoadingHistory } = useGetWorksheets();
  const { data: documents, isLoading: isLoadingDocs } = useGetDocuments();
  const queryClient = useQueryClient();
  const handleGenerate = async (values) => {
    try {
      const result = await generateMutation.mutateAsync({
        document_id: values.book,
        chapter_id: values.chapter,
        difficulty: 1,
        mcq_num: 10,
        fill_ups_num: 5,
        brief_qa_num: 5,
        true_false_num: 5,
        match_following_num: 5,
      });

      const selectedBook = documents?.find((doc) => doc.document_id === values.book);
      const bookName = selectedBook?.name || selectedBook?.filename;

      const chapter = selectedBook?.chapters?.find((ch) => ch.chapter_id === values.chapter);
      const chapterName = chapter?.chapter_name;

      const resultWithNames = {
        ...result,
        document_name: bookName,
        chapter_name: chapterName,
        title: bookName,
      };

      queryClient.invalidateQueries({ queryKey: ["worksheets"] });
      setSelectedItem(resultWithNames);
    } catch (error) {
      console.error("Failed to generate worksheet:", error);
      toast.error(error.response?.data?.message || "Failed to generate worksheet. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <PageHeaderBanner
        title="Worksheet Generator"
        description="Create diverse worksheets with various question types."
        icon={FileText}
      />

      {generateMutation.isPending || isLoadingHistory || isLoadingDocs ? (
        <LoadingState title="Loading Worksheets..." description="Please wait while we load your worksheets." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <History
            historyData={worksheets?.worksheets}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            buttonText=" New Worksheet"
          />
          {selectedItem ? (
            <WorksheetDetails item={selectedItem} documents={documents} />
          ) : (
            <BookChapterForm
              onGenerate={handleGenerate}
              pageHeaderTitle="Worksheet Generator"
              pageHeaderDescription="Create diverse worksheets with various question types."
              pageHeaderIcon={FileText}
              cardTitle="Book & Chapter Selection"
              cardDescription="Choose the book and chapter to generate a worksheet."
              buttonText="Generate Worksheet"
              includeChapters={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
