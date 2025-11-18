"use client";

import { useState, useEffect } from "react";
import { Loader2, FileText } from "lucide-react";
import History from "@/app/componentsV2/ui/history";
import { useGetWorksheets, useGetWorksheet, useGetDocuments, useGetAnswerKey } from "@/lib/api/queries";
import { useSearchParams } from "next/navigation";
import { AnswerKeyDetails } from "./components/AnswerKeyDetails";
import { NewAnswerKeyForm } from "./components/NewAnswerKeyForm";

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
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Answer Key Generator
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Automatically generate answer keys for your worksheets.
            </p>
          </div>
        </div>
      </div>

      {isLoadingHistory || isLoadingDocs ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium text-foreground">Loading Answer Key...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we load your worksheets.</p>
          </div>
        </div>
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
            subtitleField="document_name"
          />

          {/* RIGHT CONTENT */}
          {selectedItem ? (
            <AnswerKeyDetails
              item={answerKeyData}
              worksheetData={selectedWorksheetData}
              isLoading={isLoadingAnswerKey}
              selectedItem={selectedItem}
              documents={documents}
            />
          ) : (
            <NewAnswerKeyForm onGenerate={handleGenerate} documents={documents} />
          )}
        </div>
      )}
    </div>
  );
}
