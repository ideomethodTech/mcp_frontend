"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Book, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import History from "@/app/componentsV2/ui/history";
import {
  useCreateChat,
  useGetUserChats,
  useGetChatMessages,
  useGenerateContent,
  useGetDocuments,
} from "@/lib/api/queries";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const ChatMessage = ({ role, content, isLoading = false }) => {
  console.log(content);
  const isUser = role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          AI
        </div>
      )}
      <div className="bg-gradient-to-br from-primary to-accent rounded-2xl rounded-tr-sm p-4 max-w-[80%]">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <p>{content}</p>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-semibold flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
};

function ChatInterface({ chatSession }) {
  const [messages, setMessages] = useState(chatSession?.messages || []);
  const [input, setInput] = useState("");
  const generateMutation = useGenerateContent();
  const queryClient = useQueryClient();
  const { data: currentChatMessages } = useGetChatMessages(chatSession?.id);

  useEffect(() => {
    if (currentChatMessages) {
      setMessages(currentChatMessages);
    }
  }, [currentChatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await generateMutation.mutateAsync({
        chat_id: chatSession.id,
        query: input,
        llm_model_id: "gemini-2.5-flash",
      });

      const aiMessage = {
        role: "assistant",
        content: response.answer || response.response,
      };
      setMessages([...newMessages, aiMessage]);
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", chatSession.id],
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-md)] flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold text-lg">Chat with: {chatSession.book}</h2>
              <p className="text-sm text-muted-foreground">
                Engage in real-time conversations with your learning materials.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage key={index} role={msg.role} content={msg.content} />
          ))}
          {generateMutation.isPending && <ChatMessage role="assistant" isLoading />}
        </div>
        {/* Input Area */}
        <div className="p-6 border-t border-border">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the book..."
              // className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              disabled={generateMutation.isPending || !input.trim()}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewChatForm({ onStartChat, documents }) {
  const [selectedBook, setSelectedBook] = useState(null);

  const handleStart = () => {
    if (selectedBook) {
      onStartChat(selectedBook);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Book className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Start a New Chat</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">Select a book to begin your conversation.</p>
            <Select onValueChange={setSelectedBook}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a book" />
              </SelectTrigger>
              <SelectContent>
                {documents?.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name || doc.filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={handleStart} className="w-full" disabled={!selectedBook}>
              <MessageSquare className="mr-2 h-4 w-4" /> Start Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const createChatMutation = useCreateChat();
  const generateMutation = useGenerateContent();
  const { data: chatHistory, isLoading: isLoadingHistory } = useGetUserChats();
  const { data: documents, isLoading: isLoadingDocs } = useGetDocuments();
  const { data: currentChatMessages } = useGetChatMessages(selectedChat?.id);
  const queryClient = useQueryClient();
  const handleStartChat = async (bookId) => {
    try {
      const book = documents.find((d) => d.id === bookId);
      const result = await createChatMutation.mutateAsync({
        title: book?.name || "New Chat",
        llm_model_id: "gemini-2.5-flash",
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChat(result);
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
        <History
          selectedItem={selectedChat}
          setSelectedItem={setSelectedChat}
          historyData={chatHistory?.chats || []}
          buttonText="New Chat"
          subtitleField="last_message"
        />
        {/* Lesson Plan Content */}
        {createChatMutation.isPending || generateMutation.isPending || isLoadingHistory || isLoadingDocs ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Starting new chat...</h3>
              <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </div>
          </div>
        ) : selectedChat ? (
          <ChatInterface chatSession={selectedChat} />
        ) : (
          <NewChatForm onStartChat={handleStartChat} documents={documents} />
        )}
      </div>
    </div>
  );
}
