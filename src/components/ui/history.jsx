import React from "react";
import { File, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useGetBook } from "@/lib/api/queries";

const HistoryItem = ({ index, item, selectedItem, setSelectedItem, isChat = false, booksData }) => {
  // ✅ Receive booksData as a prop instead of fetching
  const book = booksData?.content?.find((book) => book.id === item?.book_id);
  const bookName = book?.book_name || "Book";
  const chapterName = "Chapter";

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
        <p className="font-medium text-foreground text-sm mb-1">
          {isChat ? item.title || item.context_summary || "Untitled Chat" : bookName}
        </p>
        {!isChat && <p className="text-xs text-muted-foreground"> {chapterName} </p>}
      </button>
    </div>
  );
};

const History = ({ selectedItem, setSelectedItem, historyData, buttonText, isChat }) => {
  // ✅ Fetch books ONCE in the parent component
  const { data: booksData } = useGetBook();

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
              isChat={isChat}
              booksData={booksData} // ✅ Pass booksData as a prop
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
