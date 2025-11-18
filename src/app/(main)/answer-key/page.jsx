"use client";

import { useState, useEffect } from "react";
import History from "@/components/ui/history";
import { useGetWorksheets, useGetWorksheet, useGetDocuments, useGetAnswerKey } from "@/lib/api/queries";
import { useSearchParams } from "next/navigation";
import { AnswerKeyDetails } from "./components/AnswerKeyDetails";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import { KeyRound } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeaderBanner } from "@/components/ui/PageHeaderBanner";

export default function AnswerKeyPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const searchParams = useSearchParams();
  const worksheetIdFromUrl = searchParams.get("worksheet_id");

  // API hooks
  const { data: worksheets, isLoading: isLoadingHistory } = useGetWorksheets();
  const { data: documents, isLoading: isLoadingDocs } = useGetDocuments();
  const { data: selectedWorksheetData } = useGetWorksheet(selectedItem?.worksheet_id || selectedItem?.id);
  const { data: answerKeyData, isLoading: isLoadingAnswerKey } = useGetAnswerKey(
    worksheetIdFromUrl || selectedItem?.worksheet_id
  );
  useEffect(() => {
    if (worksheetIdFromUrl && worksheets?.worksheets) {
      const worksheetFromUrl = worksheets.worksheets.find((w) => w.worksheet_id === worksheetIdFromUrl);
      if (worksheetFromUrl) setSelectedItem(worksheetFromUrl);
    }
    // Scroll to answer key section after a brief delay to ensure rendering
    setTimeout(() => {
      const answerKeySection = document.querySelector(".lg\\:col-span-7");
      if (answerKeySection) answerKeySection.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [worksheetIdFromUrl, worksheets]);

  const handleGenerate = (values) => {
    // Match worksheet using book + chapter IDs
    const worksheet = worksheets.worksheets?.find(
      (w) => w.document_id === values.book && (!values.chapter || w.chapter_id === values.chapter)
    );

    if (worksheet) {
      setSelectedItem(worksheet);
    } else {
      console.log("No worksheet found for selected book & chapter");
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <PageHeaderBanner
        title="Answer Key Generator"
        description="Automatically generate answer keys for your worksheets."
        icon={KeyRound}
      />

      {isLoadingHistory || isLoadingDocs ? (
        <LoadingState title="Loading Answer Key..." description="Please wait while we load your worksheets." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <History
            selectedItem={selectedItem}
            setSelectedItem={(item) => {
              // Remove the URL parameter when selecting from history
              window.history.replaceState(null, "", "/answer-key");
              setSelectedItem(item);
            }}
            historyData={worksheets?.worksheets || []}
            buttonText="New Answer Key"
         
          />

          {selectedItem ? (
            <AnswerKeyDetails
              item={answerKeyData}
              worksheetData={selectedWorksheetData}
              isLoading={isLoadingAnswerKey}
              selectedItem={selectedItem}
              documents={documents}
            />
          ) : (
            <BookChapterForm
              onGenerate={handleGenerate}
              pageHeaderTitle="Answer Key Generator"
              pageHeaderDescription="Automatically generate answer keys for your worksheets."
              pageHeaderIcon={KeyRound}
              cardTitle="Book & Chapter Selection"
              cardDescription="Choose the book and chapter for your Answer Key."
              buttonText="Generate Answer Key"
              includeChapters={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
