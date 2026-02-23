'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Book,
  Plus,
  Loader2,
  Trash2,
  Sparkles,
  Zap,
  ChevronsLeft,
  Search,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useChatDetails,
  useCreateChat,
  useDeleteChat,
  useDeleteChatMessage,
  useGenerateContent,
  useGetBook,
  useUserChats
} from '@/lib/api/queries';
import { useAuth } from '@/contexts/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import useApiStore from '@/store/useApiStore';
import { useHistoryDelete } from '@/hooks/use-history-delete';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify';

// --- Global UI Components ---

const ChatMessage = ({ isUser, content, isLoading }) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3 transition-all duration-200 mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-indigo-100">
          <MessageSquare className="w-4 h-4" />
        </div>
      )}
      <div className={cn(
        'rounded-2xl p-4 md:px-6 max-w-[90%] md:max-w-[80%] shadow-sm',
        isUser
          ? 'bg-gray-100 rounded-tr-sm text-gray-700'
          : 'bg-white border border-gray-100 rounded-tl-sm text-gray-800'
      )}>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none font-medium leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || ''}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sidebar Component (Matching Lesson Plan) ---

const ChatSidebar = ({
  userChats,
  selectedChat,
  setSelectedChat,
  onDeleteChat,
  deletingId,
  isNavCollapsed,
  setIsNavCollapsed,
  onStartNew
}) => {
  return (
    <div className={cn(
      "flex flex-col border-r border-gray-100 bg-[#F9FAFB] transition-all duration-300",
      "w-full md:h-[calc(100vh-80px)]",
      isNavCollapsed ? "md:w-20" : "md:w-80"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isNavCollapsed && <h2 className="font-bold text-gray-700 tracking-tight text-lg">Book Chats</h2>}
        <button
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors"
        >
          {isNavCollapsed ? <Search className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="px-6 pb-6">
        <Button
          onClick={onStartNew}
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
            <p className="text-[10px] font-bold text-gray-400 tracking-widest px-1">Active Chat</p>
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm transition-all animate-in fade-in slide-in-from-left-2">
              <p className="font-bold text-indigo-900 text-sm line-clamp-1">
                {selectedChat.chat_title || selectedChat.title || "Book Chat"}
              </p>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            {!isNavCollapsed && <p className="text-[10px] font-bold text-gray-400 tracking-widest">History</p>}
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {(userChats?.chats || userChats?.content || []).map((chat, index) => (
              <div key={chat.id || index} className="group relative flex items-center gap-2">
                <button
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "flex-1 text-left p-3 rounded-xl transition-all flex items-center gap-3",
                    (selectedChat?.id === chat.id || selectedChat === chat)
                      ? "bg-white border border-gray-100 shadow-sm"
                      : "hover:bg-gray-100/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    (selectedChat?.id === chat.id || selectedChat === chat) ? "bg-indigo-50 text-indigo-600" : "bg-gray-200 text-gray-500"
                  )}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  {!isNavCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-700 text-xs truncate mb-0.5">
                        {chat.chat_title || chat.title || "Book Chat"}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-medium">
                        <span className="truncate max-w-[100px]">{chat.book_name || chat.book || "Book"}</span>
                        <span className="bg-gray-100 px-1.5 rounded-full py-0.5 uppercase tracking-tighter whitespace-nowrap ml-1">
                          {chat.created_at ? new Date(chat.created_at).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
                {!isNavCollapsed && (selectedChat?.id === chat.id || selectedChat === chat) && (
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

            {(userChats?.chats || userChats?.content || []).length === 0 && !isNavCollapsed && (
              <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                <Clock className="w-5 h-5 text-gray-300 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 tracking-widest">No history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Chat Form Component ---

function NewChatForm({ onGenerate, data, isLoading }) {
  const [selectedBook, setSelectedBook] = useState(null);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-400px)] md:h-[calc(100vh-80px)] bg-white p-6 md:p-10">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Start Book Chat</h2>
          <p className="text-gray-400 font-medium">Choose a book to start an interactive learning session through AI conversation.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Select Book</label>
            <Select
              value={selectedBook ? JSON.stringify(selectedBook) : undefined}
              onValueChange={(val) => {
                const book = JSON.parse(val);
                setSelectedBook(book);
              }}
            >
              <SelectTrigger className="w-full h-14 bg-white border-2 border-gray-100 rounded-2xl px-6 text-base font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all">
                <SelectValue placeholder="Choose a book" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-2">
                {data?.map((book, index) => (
                  <SelectItem
                    key={book.id || index}
                    value={JSON.stringify(book)}
                    className="rounded-xl py-3 font-bold text-gray-600 focus:bg-indigo-50 focus:text-indigo-600"
                  >
                    {book.book_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={!selectedBook || isLoading}
            onClick={() => onGenerate(selectedBook)}
            className="w-full h-15 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black tracking-widest gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Start Learning Session
          </Button>
        </div>
      </div>
    </div >
  );
}

// --- Chat Interface Component ---

function ChatInterface({ chatSession, isGenerating, onSendMessage, messages = [], onDeleteMessage, deletingMessageId }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const { data: chatDetails } = useChatDetails(uid, chatSession.id || chatSession.chat_id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, chatDetails?.messages]);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const suggestions = [
    "Summarize this book",
    "What are the main themes?",
    "Explain the key characters"
  ];

  const displayMessages = useMemo(() => {
    if (messages && messages.length > 0) return messages;
    return chatDetails?.messages || [];
  }, [messages, chatDetails?.messages]);

  return (
    <div className="flex-1 flex flex-col min-h-[500px] md:h-[calc(100vh-80px)] bg-white relative">
      {/* Upper Info Bar */}
      <div className="px-6 md:px-10 py-4 md:py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-50 rounded-xl flex-shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 tracking-tight text-xs md:text-sm">
              {chatSession.book_name || chatSession.chat_title || chatSession.title || "Book Chat"}
            </h2>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold italic">Interactive Conversation</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-6 md:pt-10 pb-32 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {displayMessages.length === 0 && !isGenerating && (
            <div className="text-center py-10 md:py-20 animate-in fade-in duration-700">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-indigo-500">
                <Zap className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4">How can I help you today?</h3>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => onSendMessage(s)}
                    className="px-4 md:px-6 py-2 md:py-3 rounded-xl border-2 border-gray-100 hover:border-indigo-100 hover:bg-indigo-50 text-xs md:text-sm font-bold text-gray-600 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {displayMessages.map((msg, idx) => (
            <div key={idx} className="group relative">
              <ChatMessage isUser content={msg.prompt} />
              {msg.response === '__LOADING__' ? (
                <ChatMessage isLoading />
              ) : (
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <ChatMessage content={msg.response} />
                  </div>
                  {msg.id && (
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      disabled={deletingMessageId === msg.id}
                      className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 pt-0 bg-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="bg-white border-2 border-gray-100 rounded-3xl md:rounded-[2rem] p-2 md:p-4 pl-4 md:pl-8 shadow-2xl flex items-center gap-2 md:gap-4 transition-all focus-within:border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-50">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none py-2 text-sm md:text-base font-bold text-gray-700 min-h-[40px] md:min-h-[50px] max-h-[150px] placeholder:text-gray-300"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 flex-shrink-0 transition-transform active:scale-90 flex items-center justify-center"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 md:w-6 md:h-6 animate-spin" /> : <Send className="w-4 h-4 md:w-6 md:h-6" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function ChatPage() {
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const [selectedChat, setSelectedChat] = useState(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const queryClient = useQueryClient();
  const { setChatStatus } = useApiStore();

  // API Hooks
  const { data: userChats, isLoading: chatsLoading } = useUserChats(uid);
  const { data: bookData, isLoading: bookLoading } = useGetBook();

  const { data: chatDetails } = useChatDetails(uid, selectedChat?.id || selectedChat?.chat_id);

  useEffect(() => {
    if (chatDetails?.messages) {
      setMessages(chatDetails.messages);
    } else {
      setMessages([]);
    }
  }, [chatDetails]);

  const { mutate: createChat, isPending: creatingChat } = useCreateChat({
    onSuccess: (data) => {
      setSelectedChat({
        id: data.chat_id,
        chat_title: data.chat_title,
        uid: data.uid,
        book_id: data.book_id,
        book_name: data.chat_title,
      });
      queryClient.invalidateQueries({ queryKey: ['userChats', uid] });
      setChatStatus('success');
      toast.success("Chat started successfully!");
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to start chat.";
      toast.error(msg);
    }
  });

  const { mutate: sendMessageMutation, isPending: isGenerating } = useGenerateContent({
    onMutate: ({ prompt }) => {
      setChatStatus('loading');
      setMessages(prev => [...prev, { prompt, response: '__LOADING__' }]);
    },
    onSuccess: (data) => {
      setMessages(prev => prev.map((m, idx) =>
        idx === prev.length - 1 ? { ...m, response: data?.response || data || 'No response', id: data?.id } : m
      ));
      queryClient.invalidateQueries({ queryKey: ['chatDetails', uid, selectedChat?.id || selectedChat?.chat_id] });
      setChatStatus('success');
    },
    onError: (err) => {
      setChatStatus('error');
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to send message.";
      toast.error(msg);
      setMessages(prev => prev.filter(m => m.response !== '__LOADING__'));
    }
  });

  const { mutate: deleteChatMessageMutation } = useDeleteChatMessage({
    onSuccess: () => {
      setDeletingMessageId(null);
      queryClient.invalidateQueries({ queryKey: ['chatDetails', uid, selectedChat?.id || selectedChat?.chat_id] });
      toast.success("Message deleted.");
    },
    onError: () => {
      setDeletingMessageId(null);
      toast.error("Failed to delete message.");
    }
  });

  const { handleDelete: handleHistoryDelete, deletingId } = useHistoryDelete({
    useMutation: useDeleteChat,
    queryKeyToInvalidate: ['userChats', uid],
    idPropertyName: 'chatId',
    onDeleteSuccess: (vars) => {
      if ((selectedChat?.id || selectedChat?.chat_id) === vars.chatId) setSelectedChat(null);
    }
  });

  const handleSendMessage = useCallback((prompt) => {
    if (!prompt.trim() || !selectedChat) return;
    sendMessageMutation({
      chat_id: selectedChat.id || selectedChat.chat_id,
      uid: uid,
      prompt: prompt.trim(),
      book_id: selectedChat.book_id,
    });
  }, [selectedChat, uid, sendMessageMutation]);

  const handleDeleteMessage = useCallback((messageId) => {
    if (!selectedChat?.id || !messageId) return;
    setDeletingMessageId(messageId);
    deleteChatMessageMutation({ uid, message_id: messageId });
  }, [selectedChat, uid, deleteChatMessageMutation]);

  const handleNewChat = useCallback((book) => {
    createChat({ uid, chat_title: book.book_name, book_id: book.id });
  }, [uid, createChat]);

  return (
    <div className="flex flex-col md:flex-row bg-white md:h-[calc(100vh-80px)] md:overflow-hidden overflow-y-auto">
      <ChatSidebar
        userChats={userChats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        onDeleteChat={(item) => handleHistoryDelete(item, { uid })}
        deletingId={deletingId}
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
        onStartNew={() => setSelectedChat(null)}
      />

      <div className="flex-1 flex flex-col h-full bg-white transition-all duration-300">
        {selectedChat ? (
          <ChatInterface
            chatSession={selectedChat}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
            messages={messages}
            onDeleteMessage={handleDeleteMessage}
            deletingMessageId={deletingMessageId}
          />
        ) : (chatsLoading && (!userChats?.chats && !userChats?.content)) ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : (
          <NewChatForm
            onGenerate={handleNewChat}
            data={bookData?.content}
            isLoading={creatingChat}
          />
        )}
      </div>
    </div>
  );
}
