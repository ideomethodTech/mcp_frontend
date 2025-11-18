"use client";

import { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import History from "@/app/componentsV2/ui/history";
import { useCreateChat, useGetUserChats, useGenerateContent, useGetDocuments } from "@/lib/api/queries";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { NewChatForm } from "./components/NewChatForm";
import { ChatInterface } from "./components/ChatInterface";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const createChatMutation = useCreateChat();
  const generateMutation = useGenerateContent();
  const { data: chatHistory, isLoading: isLoadingHistory } = useGetUserChats();
  const { data: documents, isLoading: isLoadingDocs } = useGetDocuments();
  const queryClient = useQueryClient();
  const handleStartChat = async (bookId) => {
    try {
      const book = documents.find((d) => d.document_id === bookId);
      const result = await createChatMutation.mutateAsync({
        title: book?.name || "New Chat",
        llm_model_id: "gemini-2.5-flash",
      });
      result.document_id = bookId;
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChat(result);
      localStorage.setItem(`chat_${result.chat_id}_document`, bookId);
      toast.success("Chat created successfully!");
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to create chat. Please try again.");
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
              Chat with Book
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Engage in real-time conversations with your learning materials.
            </p>
          </div>
        </div>
      </div>

      {createChatMutation.isPending || generateMutation.isPending || isLoadingHistory || isLoadingDocs ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium text-foreground">Loading Chats...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we load your chats.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* {History} */}
          <History
            selectedItem={selectedChat}
            setSelectedItem={(chat) => {
              if (chat) {
                const storedDocId = localStorage.getItem(`chat_${chat.chat_id}_document`);
                chat.document_id = storedDocId;
              }
              setSelectedChat(chat);
            }}
            historyData={chatHistory?.chats || []}
            buttonText="New Chat"
            subtitleField="last_message"
          />
          {/* Chat Content */}
          {selectedChat ? (
            <ChatInterface chatSession={selectedChat} />
          ) : (
            <NewChatForm onStartChat={handleStartChat} documents={documents} />
          )}
        </div>
      )}
    </div>
  );
}
