import React from "react";
import { File, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useGetDocumentChapters } from "@/lib/api/queries";

const HistoryItem = ({ index, item, selectedItem, setSelectedItem, documents ,   }) => {
  // const book = documents?.find((doc) => doc.document_id === item.document_id);
  // const bookName = book?.name || book?.filename ||bookName || "Unknown Book";
  // const { data: chapters } = useGetDocumentChapters(item.document_id);
  // const chapter = chapters?.messages?.find((ch) => ch.chapter_id === item.chapter_id);
  // const chapterName = chapter?.chapter_name || chapterName || "Loading...";
   // ALWAYS get names from IDs, never rely on item.document_name/chapter_name
  const book = documents?.find((doc) => doc.document_id === item?.document_id);
  const bookName = book?.name || book?.filename || "Book";

  const { data: chapters } = useGetDocumentChapters(item?.document_id);
  const chapter = chapters?.messages?.find((ch) => ch.chapter_id === item?.chapter_id);
  const chapterName = chapter?.chapter_name || "Chapter";
  return (
    <div key={index}>
      <button
        onClick={() => setSelectedItem(item)}
        className={`w-full text-left p-2 rounded-lg border ${
          selectedItem?.id === item.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
        }`}
      >
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
          <File className="text-xs text-muted-foreground mt-1" />
          <span>{item.created_at ? format(new Date(item.created_at), "dd/MM/yyyy") : "N/A"}</span>
        </div>
        <p className="font-medium text-foreground text-sm mb-1">{bookName}</p>
        <p className="text-xs text-muted-foreground"> {chapterName} </p>
      </button>
    </div>
  );
};

const History = ({ selectedItem, setSelectedItem, historyData, buttonText, documents }) => {
  if (!historyData || historyData.length === 0) {
    return null;
  }
  

  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-md)]">
        <Button
          className="w-full mb-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          variant="outline"
          onClick={() => setSelectedItem(null)}
        >
          <Plus className="h-4 w-4 mr-2" /> {buttonText || "New Lesson Plan"}
        </Button>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">History</p>
          {historyData?.map((item, index) => (
            <HistoryItem
              key={index}
              item={item}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              documents={documents}
             
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
