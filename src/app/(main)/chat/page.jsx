'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Book,
  Plus,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronsLeft,
  Search,
  ChevronDown,
  Zap,
  Trash2,
  Clock,
  Layout,
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChatDetails, useCreateChat, useDeleteChat, useDeleteChatMessage, useGenerateContent, useGetBook, useUserChats } from '@/lib/api/queries';
import { useAuth } from '@/contexts/auth-context';
import { getNavItemByUrl } from '@/app/utils';
import { useQueryClient } from '@tanstack/react-query';
import useApiStore from '@/store/useApiStore';
import { useHistoryDelete } from '@/hooks/use-history-delete';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Sub-components ---

const ChatMessage = ({ isUser = false, content, isLoading = false }) => {
  return (
    <div
      className={cn(
        'flex items-start gap-4 mb-6',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0",
        isUser ? "bg-indigo-100 text-indigo-600" : "bg-indigo-50 text-indigo-600"
      )}>
        {isUser ? <Avatar className="w-10 h-10 border-none shadow-sm"><AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" /><AvatarFallback>U</AvatarFallback></Avatar> : <MessageSquare className="w-5 h-5" />}
      </div>

      <div className={cn(
        "relative py-4 px-6 rounded-3xl max-w-[80%]",
        isUser
          ? "bg-indigo-600 text-white rounded-tr-none"
          : "bg-white text-gray-800 rounded-tl-none border border-gray-100/50 shadow-sm"
      )}>
        {isLoading ? (
          <div className="flex gap-1.5 items-center h-6 px-1">
            <span className="w-1.5 h-1.5 bg-current opacity-30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-current opacity-50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-sm font-medium">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-2 prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-ul:my-2 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1 prose-li:leading-relaxed prose-strong:text-indigo-600 prose-strong:font-bold prose-em:italic prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:text-gray-800 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-a:text-indigo-600 prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || ''}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

const SuggestionChip = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-6 py-3 bg-white border border-gray-100 rounded-full text-sm font-medium text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all shadow-sm"
  >
    {text}
  </button>
);

// --- Sidebar Component ---

const ChatSidebar = ({
  userChats,
  selectedChat,
  setSelectedChat,
  onDeleteChat,
  deletingId,
  isNavCollapsed,
  setIsNavCollapsed,
  onStartNewChat
}) => {
  return (
    <div className={cn(
      "flex flex-col border-r border-gray-100 bg-[#F9FAFB] transition-all duration-300 h-[calc(100vh-80px)]",
      isNavCollapsed ? "w-20" : "w-80"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isNavCollapsed && <h2 className="font-bold text-gray-700 tracking-tight">Chat with book</h2>}
        <button
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors"
        >
          {isNavCollapsed ? <Search className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="px-6 pb-6">
        <Button
          onClick={onStartNewChat}
          className={cn(
            "w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white rounded-xl py-6 shadow-lg shadow-indigo-100 transition-all font-bold gap-3",
            isNavCollapsed && "px-0 justify-center"
          )}
        >
          <div className="bg-white/20 rounded-full p-1 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          {!isNavCollapsed && "Start New Chat"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide pb-8 mt-4">
        {/* Active Chat Section */}
        {!isNavCollapsed && selectedChat && (
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Active Chat</p>
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm transition-all animate-in fade-in slide-in-from-left-2">
              <p className="font-bold text-indigo-900 text-sm line-clamp-1">
                {selectedChat.chat_title || selectedChat.title || "Unknown Chat"}
              </p>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            {!isNavCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chat History</p>}
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {(userChats?.chats || []).map((chat) => (
              <div key={chat.id} className="group relative flex items-center gap-2">
                <button
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "flex-1 text-left p-3 rounded-xl transition-all flex items-center gap-3",
                    selectedChat?.id === chat.id
                      ? "bg-white border border-gray-100 shadow-sm"
                      : "hover:bg-gray-100/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    selectedChat?.id === chat.id ? "bg-indigo-50 text-indigo-600" : "bg-gray-200 text-gray-500"
                  )}>
                    <FileText className="w-4 h-4" />
                  </div>
                  {!isNavCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-700 text-xs truncate mb-0.5">
                        {chat.chat_title || chat.title || chat.book_name || "Chat Session"}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-medium">
                        <span className="truncate max-w-[100px]">{chat.book_name || "Book"}</span>
                        <span className="bg-gray-100 px-1.5 rounded-full py-0.5 uppercase tracking-tighter whitespace-nowrap ml-1">{chat.created_at || "Recent"}</span>
                      </div>
                    </div>
                  )}
                </button>
                {!isNavCollapsed && selectedChat?.id === chat.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat);
                    }}
                    disabled={deletingId === chat.id}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {deletingId === chat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Chat Interface ---

function ChatInterface({ chatSession, setChatSession }) {
  const [messages, setMessages] = useState(chatSession?.messages || []);
  const [input, setInput] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const queryClient = useQueryClient();
  const { setChatStatus } = useApiStore();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatSession?.messages?.length) {
      setMessages(chatSession.messages);
    }
  }, [chatSession?.id, chatSession?.messages]);

  const { mutate: createChatMutation, isPending: creatingChat } =
    useGenerateContent({
      onMutate: ({ prompt }) => {
        setChatStatus('loading');
        setMessages((prev) => [
          ...prev,
          { prompt, response: '__LOADING__' },
        ]);
      },
      onSuccess: (data) => {
        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === prev.length - 1
              ? {
                ...m,
                response: typeof data === 'string' ? data : data?.response || 'No response',
                id: data?.id,
              }
              : m
          )
        );
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
    onSuccess: () => {
      setDeletingMessageId(null);
      queryClient.invalidateQueries({
        queryKey: ['chatDetails', chatSession.uid, chatSession.id],
      });
    },
    onError: () => {
      setDeletingMessageId(null);
    },
  });

  const handleSendMessage = useCallback((prompt) => {
    if (!prompt.trim()) return;
    createChatMutation({
      chat_id: chatSession.id,
      uid: chatSession.uid,
      prompt,
      book_id: chatSession.book_id,
    });
    setInput("");
  }, [chatSession.id, chatSession.uid, chatSession.book_id, createChatMutation]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] bg-white relative">
      {/* Upper Book Info Bar */}
      <div className="px-10 py-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
            <Book className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 tracking-tight uppercase text-sm">{chatSession.book_name || chatSession.book || "Book"}</h2>
            <p className="text-xs text-gray-400 font-bold italic">Reference Material</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all group">
          Change Book <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-10 pt-10 pb-32 scrollbar-hide space-y-6">

        {/* Suggestion Chips */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-4 justify-center mb-10 pt-10">
            <SuggestionChip text="Summarize this chapter" onClick={() => handleSendMessage("Summarize this chapter")} />
            <SuggestionChip text="What is the main conflict?" onClick={() => handleSendMessage("What is the main conflict?")} />
            <SuggestionChip text="Explain the key symbols" onClick={() => handleSendMessage("Explain the key symbols")} />
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full space-y-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="font-bold text-gray-700 text-sm">What would you like to discuss about "{chatSession.book_name || chatSession.book || "this book"}"?</p>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className="space-y-2">
              {msg.prompt && <ChatMessage isUser content={msg.prompt} />}
              {msg.response === '__LOADING__' && <ChatMessage isLoading />}
              {msg.response && msg.response !== '__LOADING__' && (
                <ChatMessage content={msg.response} />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Input Section */}
      <div className="absolute bottom-0 left-0 w-full px-10 pb-10 flex justify-center pointer-events-none">
        <div className="max-w-4xl w-full pointer-events-auto">
          <div className="relative group shadow-2xl shadow-indigo-100">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-white border-2 border-gray-100 rounded-[32px] pl-8 pr-32 py-6 text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all min-h-[80px] h-[80px] max-h-[80px] shadow-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest">Fast</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleSendMessage(input)}
                className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-200 transition-all hover:scale-110 active:scale-95 group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- New Chat Start Component ---

function NewChatForm({ onStartChat, data }) {
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <div className="flex-1 flex items-center justify-center h-[calc(100vh-80px)] bg-white p-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Book className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Start a New Chat</h2>
          <p className="text-gray-400 font-medium">Select a book from your library to begin your conversation.</p>
        </div>

        <div className="space-y-6">
          <Select onValueChange={(val) => setSelectedBook(JSON.parse(val))}>
            <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
              <SelectValue placeholder="Choose a book" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
              {data?.map((book, index) => (
                <SelectItem
                  key={book.id || book.book_id || index}
                  value={JSON.stringify(book)}
                  className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600"
                >
                  {book.book_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            disabled={!selectedBook}
            onClick={() => onStartChat(selectedBook)}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-base font-bold gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare className="w-5 h-5" />
            Start Chat
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Main Page Component ---

export default function ChatPage() {
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const queryClient = useQueryClient();
  const { setChatStatus } = useApiStore();

  const [selectedChat, setSelectedChat] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // API Queries
  const { data: userChats, isLoading: chatsLoading } = useUserChats(uid);
  const { data: chatMessages, isLoading: messagesLoading } = useChatDetails(uid, selectedChat?.id);
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  // Mutations
  const { mutate: createChatMutation, isPending: creatingChat } = useCreateChat({
    onSuccess: (data) => {
      const newChat = {
        id: data.chat_id,
        chat_id: data.chat_id,
        chat_title: data.chat_title,
        uid: data.uid,
        book_id: data.book_id,
      };
      setSelectedChat(newChat);
      queryClient.invalidateQueries({ queryKey: ['userChats', uid] });
      setChatStatus('success');
    },
    onError: () => setChatStatus('error'),
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteChat,
    queryKeyToInvalidate: ['userChats', uid],
    idPropertyName: 'chatId',
    onDeleteSuccess: (variables) => {
      setChatStatus('success');
      if (selectedChat?.id === variables.chatId) {
        setSelectedChat(null);
      }
    }
  });

  const handleStartChat = useCallback((book) => {
    if (!uid || !book) return;
    createChatMutation({
      uid,
      chat_title: book.book_name,
      book_id: book.id,
    });
  }, [uid, createChatMutation]);

  const handleDeleteChat = useCallback((item) => {
    handleHistoryDelete(item, { uid });
  }, [uid, handleHistoryDelete]);

  // Get book details for the selected chat
  const getBookDetailsForChat = useCallback(() => {
    if (!selectedChat && !chatMessages) return null;

    const bookId = selectedChat?.book_id || chatMessages?.book_id;
    const bookName = selectedChat?.book_name || chatMessages?.book_name || selectedChat?.chat_title;

    // Try to find the book in bookData by ID or name
    const matchingBook = bookData?.content?.find(
      book => book.id === bookId || book.book_name === bookName
    );

    return {
      book_id: bookId || matchingBook?.id,
      book_name: matchingBook?.book_name || bookName || 'Unknown Book',
    };
  }, [selectedChat, chatMessages, bookData]);

  const bookDetails = getBookDetailsForChat();

  return (
    <div className="flex bg-white h-[calc(100vh-80px)] overflow-hidden">
      <ChatSidebar
        userChats={userChats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        onDeleteChat={handleDeleteChat}
        deletingId={deletingId}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        onStartNewChat={() => setSelectedChat(null)}
      />

      <div className="flex-1 flex flex-col h-full bg-white">
        {creatingChat || messagesLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Syncing Brain...</h3>
              <p className="text-sm text-gray-400 font-medium">This usually takes a few seconds.</p>
            </div>
          </div>
        ) : selectedChat ? (
          <ChatInterface
            chatSession={{
              id: selectedChat.id,
              book: selectedChat?.chat_title,
              book_name: bookDetails?.book_name,
              messages: chatMessages?.messages || [],
              uid: uid,
              book_id: bookDetails?.book_id,
            }}
            setChatSession={setSelectedChat}
          />
        ) : bookLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : (
          <NewChatForm onStartChat={handleStartChat} data={bookData?.content} />
        )}
      </div>
    </div>
  )
}
