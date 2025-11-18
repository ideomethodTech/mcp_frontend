"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import History from "@/components/ui/history";
import { useGenerateWorksheet, useGetWorksheets, useGetDocuments } from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import { WorksheetDetails } from "./components/WorksheetDetails";

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

      const selectedBookInForm = documents?.find((b) => b.document_id === values.book);
      const chapter = selectedBookInForm?.chapters?.find((ch) => ch.chapter_id === values.chapter);
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
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Worksheet Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Create diverse worksheets with various question types.{" "}
            </p>
          </div>
        </div>
      </div>

      {generateMutation.isPending || isLoadingHistory || isLoadingDocs ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium text-foreground">Loading Worksheets...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we load your worksheets.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* {History} */}
          <History
            historyData={worksheets?.worksheets}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            buttonText=" New Worksheet"
            documents={documents}
          />
          {/* Worksheet Content */}
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
