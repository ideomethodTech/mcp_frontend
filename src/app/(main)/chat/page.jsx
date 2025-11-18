"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import History from "@/components/ui/history";
import { useCreateChat, useGetUserChats, useGenerateContent, useGetDocuments } from "@/lib/api/queries";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { BookChapterForm } from "@/components/ui/BookChapterForm";
import { ChatInterface } from "./components/ChatInterface";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeaderBanner } from "@/components/ui/PageHeaderBanner";

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
      <PageHeaderBanner
        title="Chat with Book"
        description="Engage in real-time conversations with your learning materials."
        icon={MessageSquare}
      />

      {createChatMutation.isPending || generateMutation.isPending || isLoadingHistory || isLoadingDocs ? (
        <LoadingState title="Loading Chats..." description="Please wait while we load your chats." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
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
            isChat={true}
          />
          {selectedChat ? (
            <ChatInterface chatSession={selectedChat} />
          ) : (
            <BookChapterForm
              onGenerate={handleStartChat}
              pageHeaderTitle="Chat with Book"
              pageHeaderDescription="Engage in real-time conversations with your learning materials."
              pageHeaderIcon={MessageSquare}
              cardTitle="Start a New Chat"
              cardDescription="Select a book to begin your conversation."
              buttonText="Start Chat"
              includeChapters={false}
            />
          )}
        </div>
      )}
    </div>
  );
}
