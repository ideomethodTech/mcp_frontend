"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { MessageSquare, Send, Book, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-md rounded-lg p-3 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
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
        <Avatar className="h-8 w-8">
          <AvatarImage
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            alt="User"
          />
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
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
    <div className="space-y-6">
      <PageHeader
        title={`Chat with: ${chatSession.book}`}
        description="Engage in real-time conversations with your learning materials."
        icon={MessageSquare}
      />
      <Card>
        <CardContent className="p-6">
          <div
            className="space-y-6 mb-6"
            style={{
              minHeight: "400px",
              maxHeight: "600px",
              overflowY: "auto",
            }}
          >
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                />
              ))}
              {generateMutation.isPending && (
                <ChatMessage role="assistant" isLoading />
              )}
            </div>
          </div>
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 pt-4 border-t"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the book..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={generateMutation.isPending || !input.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
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
            <p className="text-sm text-muted-foreground text-center">
              Select a book to begin your conversation.
            </p>
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
            <Button
              onClick={handleStart}
              className="w-full"
              disabled={!selectedBook}
            >
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
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
      <div className="hidden md:flex flex-col border-r bg-muted/20 p-4 space-y-4">
        <Button variant="outline" onClick={() => setSelectedChat(null)}>
          <Plus className="mr-2" /> New Chat
        </Button>
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2 mb-2">
            Chat History
          </h3>
          <div className="space-y-2">
            {chatHistory?.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedChat(item)}
                className={cn(
                  "w-full text-left p-2 rounded-lg border",
                  selectedChat?.id === item.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span>
                    {item.created_at
                      ? format(new Date(item.created_at), "dd/MM/yyyy")
                      : "N/A"}
                  </span>
                </div>
                <p className="font-semibold text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.last_message || "No messages yet"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="p-6">
        {createChatMutation.isPending ||
        generateMutation.isPending ||
        isLoadingHistory ||
        isLoadingDocs ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                Starting new chat...
              </h3>
              <p className="text-sm text-muted-foreground">
                Please wait a moment.
              </p>
            </div>
          </div>
        ) : selectedChat ? (
          <ChatInterface chatSession={selectedChat} />
        ) : (
          <NewChatForm onStartChat={handleStartChat} documents={documents} />
        )}
      </main>
    </div>
  );
}
