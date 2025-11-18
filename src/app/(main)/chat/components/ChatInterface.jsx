import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateContent, useGetChatMessages } from "@/lib/api/queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {ChatMessage} from "./ChatMessage"; // Assuming this is in the same directory

export function ChatInterface({ chatSession }) {
  // CHANGE THIS: Initialize properly
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const generateMutation = useGenerateContent();
  const queryClient = useQueryClient();
  const { data: currentChatMessages } = useGetChatMessages(chatSession?.chat_id);

  console.log("Chat Session:", chatSession);
  console.log("Current Chat Messages:", currentChatMessages); // ADD THIS TO SEE STRUCTURE

  useEffect(() => {
    if (currentChatMessages) {
      if (Array.isArray(currentChatMessages)) {
        setMessages(currentChatMessages);
      } else if (currentChatMessages.messages && Array.isArray(currentChatMessages.messages)) {
        setMessages(currentChatMessages.messages);
      }
    } else {
      // ADD THIS: Reset messages when switching chats
      setMessages([]);
    }
  }, [currentChatMessages, chatSession?.chat_id]); // ADD chatSession?.chat_id to dependencies

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // ADD THIS CHECK
    if (!chatSession.document_id) {
      toast.error("No document associated with this chat. Please start a new chat.");
      return;
    }

    // CHANGE THIS: messages is already an array
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    console.log("Sending request:", {
      chat_id: chatSession.chat_id,
      query: input,
      document_list: [chatSession.document_id],
    });

    try {
      const response = await generateMutation.mutateAsync({
        chat_id: chatSession.chat_id,
        query: input,
        llm_model_id: "gemini-2.5-flash",
        document_list: [chatSession.document_id],
        reranker: false,
      });
      console.log(chatSession.document_id + "thisis a id ");
      const aiMessage = {
        role: "assistant",
        content: response.answer || response.response,
      };
      setMessages([...newMessages, aiMessage]);
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", chatSession.chat_id],
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    } catch (error) {
      console.error("Failed to send message:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error detail:", error.response?.data?.detail); // ADD THIS LINE
      toast.error("Failed to send message. Please try again.");
    }
  };
  console.log("Messages state:", messages); // CHANGE THIS
  return (
    <div className="lg:col-span-7">
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
              onClick={handleSendMessage}
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