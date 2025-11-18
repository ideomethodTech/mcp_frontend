import { useState } from "react";
import { Book, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export  function NewChatForm({ onStartChat, documents }) {
  const [selectedBook, setSelectedBook] = useState("");

  const handleStart = () => {
    if (selectedBook) {
      onStartChat(selectedBook);
    }
  };

  return (
    <div className="flex flex-col  min-h-[500px] lg:col-span-7">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Book className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Start a New Chat</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">Select a book to begin your conversation.</p>
            <Select
              onValueChange={(value) => {
                console.log("Selected:", value); // Debug line
                setSelectedBook(value);
              }}
              value={selectedBook}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a book">
                  {selectedBook && documents.find((d) => d.document_id === selectedBook)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {documents && documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <SelectItem key={index} value={doc.document_id}>
                      {doc.name || doc.filename}
                    </SelectItem>
                  ))
                ) : (
                  <p className="text-gray-500">No books available</p>
                )}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={handleStart} className="w-full" disabled={!selectedBook || selectedBook === ""}>
              <MessageSquare className="mr-2 h-4 w-4" /> Start Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}