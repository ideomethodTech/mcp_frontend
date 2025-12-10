'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { MessageSquare, Send, Book, PlusCircle, Plus, Loader2, FileText, Input } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import History from '@/app/componentsV2/ui/history';
import { useChatDetails, useCreateChat, useDeleteChat, useDeleteChatMessage, useGenerateContent, useGetBook, useUserChats } from '@/lib/api/queries';
import { useAuth } from '@/contexts/auth-context';
import { getNavItemByUrl } from '@/app/utils';
import { useQueryClient } from '@tanstack/react-query';
import useApiStore from '@/store/useApiStore';
import { Trash2 } from 'lucide-react';

const ChatMessage = ({ isUser = false, content, isLoading = false }) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
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
          <p>{content ? content : null}</p>
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

function ChatInterface({ chatSession, setChatSession }) {
  const [messages, setMessages] = useState(chatSession?.messages || []);
  const [input, setInput] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const queryClient = useQueryClient();
  const { setChatStatus } = useApiStore();

  useEffect(() => {
    if (chatSession?.messages?.length) {
      setMessages(chatSession.messages);
    }
  }, [chatSession?.id]);

  const { mutate: createChatMutation, isPending: creatingChat } =
    useGenerateContent({
      onMutate: ({ prompt }) => {
        setChatStatus('loading');
        // Optimistically show the user prompt and mark response as loading
        setMessages((prev) => [
          ...prev,
          { prompt, response: '__LOADING__' },
        ]);
      },
      onSuccess: (data, variables) => {
        // Replace the loading response with real response
        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === prev.length - 1
              ? {
                ...m,
                response: data.response || 'No response',
                id: data.id, // ✅ THIS IS REQUIRED
              }
              : m
          )
        );

        // Refetch chat details from backend so switching back shows fresh messages
        queryClient.invalidateQueries({
          queryKey: ['chatDetails', chatSession.uid, chatSession.id],
        });
        setChatStatus('success');
      },
      onError: () => {
        setChatStatus('error');
      },
      onSettled: () => {
        setChatStatus('idle');
      },
    });

  const { mutate: deleteChatMessageMutation } = useDeleteChatMessage({
    onSuccess: (_, variables) => {
      setDeletingMessageId(null);
      queryClient.invalidateQueries({
        queryKey: ['chatDetails', chatSession.uid, chatSession.id],
      });
    },
    onError: () => {
      setDeletingMessageId(null);
    },
  });


  const handleSendMessage = (prompt) => {
    if (!prompt.trim()) return;

    createChatMutation({
      chat_id: chatSession.id,
      uid: chatSession.uid,
      prompt,
    });

    setInput("");
  };

  const handleDeleteMessage = (messageId) => {
    if (!chatSession?.id || !messageId) return;
    setDeletingMessageId(messageId);
    deleteChatMessageMutation({ uid: chatSession.uid, message_id: messageId });
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
            msg.prompt && msg.response ? (
              <div key={index} className="space-y-2">
                {msg.prompt && <ChatMessage isUser content={msg.prompt} />}
                {msg.response === '__LOADING__' && <ChatMessage isLoading />}
                {msg.response && msg.response !== '__LOADING__' && (
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <ChatMessage content={msg.response} />
                    </div>
                    {msg.id && (
                      <button
                        aria-label="Delete message"
                        className="p-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteMessage(msg.id)}
                        disabled={deletingMessageId === msg.id}
                      >
                        {deletingMessageId === msg.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : null
          ))}
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
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                  setInput("");
                }
              }}
            />
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-6">
              <Send className="h-4 w-4" onClick={() => handleSendMessage(input)} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewChatForm({ onStartChat, data }) {
  const [selectedBook, setSelectedBook] = useState(null);

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
            <Select onValueChange={(val) => setSelectedBook(JSON.parse(val))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a book" />
              </SelectTrigger>
              <SelectContent>
                {data?.map((book) => (
                  <SelectItem
                    key={book.book_id}
                    value={JSON.stringify(book)}
                  >
                    {book.book_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => onStartChat(selectedBook)} disabled={!selectedBook}>
              <MessageSquare className="mr-2 h-4 w-4" /> Start Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const pathname = usePathname();
  const navItem = getNavItemByUrl(pathname);
  const { user } = useAuth();   // ✅ dynamically fetched
  const uid = user?.user?.uid;
  const queryClient = useQueryClient();
  const { chatStatus, setChatStatus } = useApiStore();
  console.log("user", user);
  // All Chats
  const { data: userChats, isLoading: chatsLoading } = useUserChats(uid);

  // Selected chat
  const [selectedChat, setSelectedChat] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Chat Messages
  const {
    data: chatMessages,
    isLoading: messagesLoading,
    refetch: refetchChatDetails,
  } = useChatDetails(uid, selectedChat?.id);

  // Books
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  // Create chat
  const { mutate: createChatMutation, isPending: creatingChat } = useCreateChat({
    onSuccess: async (data) => {
      const newChat = {
        id: data.chat_id,
        chat_id: data.chat_id,
        chat_title: data.chat_title,
        uid: data.uid,
      };

      // ✅ 1️⃣ Instantly select the new chat
      setSelectedChat(newChat);

      // ✅ 2️⃣ Force refetch chat history immediately
      await queryClient.refetchQueries({
        queryKey: ['userChats', uid],
      });

      // ✅ 3️⃣ Also refetch chat details so UI is fresh
      queryClient.refetchQueries({
        queryKey: ['chatDetails', uid, data.chat_id],
      });

      setChatStatus('success');
    },

    onError: () => {
      setChatStatus('error');
    },
  });

  const { mutate: deleteChatMutation } = useDeleteChat({
    onSuccess: async (_, variables) => {
      if (selectedChat?.id === variables.chatId) {
        setSelectedChat(null);
      }
      await queryClient.refetchQueries({ queryKey: ['userChats', uid] });
      queryClient.refetchQueries({ queryKey: ['chatDetails', uid, variables.chatId] });
      setDeletingId(null);
      setChatStatus('success');
    },
    onError: () => {
      setDeletingId(null);
      setChatStatus('error');
    }
  });



  const handleStartChat = (book) => {
    console.log(uid);
    createChatMutation({
      uid,
      chat_title: book.book_name
    });
  };

  const handleDeleteChat = (item) => {
    if (!uid || !item?.id) return;
    setDeletingId(item.id);
    deleteChatMutation({ uid, chatId: item.id });
  };

  // FIX — Get selected chat object
  const selectedChatObj = userChats?.chats.find(c => c.id === selectedChat?.id);
  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-[var(--shadow-lg)]">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {navItem.title}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {navItem.description}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* {History} */}
        <History
          item={navItem.itemtype}
          selectedItem={selectedChat}
          setSelectedItem={setSelectedChat}
          historyData={userChats?.chats || []}
          isChat={true}
          onDelete={handleDeleteChat}
          deletingId={deletingId}
        />
        {/* Lesson Plan Content */}
        {creatingChat || messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">Starting new chat...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait a moment.
              </p>
            </div>
          </div>
        ) : selectedChat ? (
          <ChatInterface chatSession={{
            id: selectedChat.id,
            book: selectedChat?.chat_title,
            messages: chatMessages?.messages || [],
            uid: uid,
          }} setChatSession={setSelectedChat} />
        ) : bookLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <NewChatForm onStartChat={handleStartChat} data={bookData?.content} />)}
      </div>
    </div>
  )
}
