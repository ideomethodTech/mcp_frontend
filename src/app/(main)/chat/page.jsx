'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import History from '@/app/componentsV2/ui/history';
import {
  useChatDetails,
  useCreateChat,
  useDeleteChat,
  useGetBook,
  useUserChats
} from '@/lib/api/queries';
import { useAuth } from '@/contexts/auth-context';
import { getNavItemByUrl } from '@/app/utils';
import useApiStore from '@/store/useApiStore';

// New Components
import { ChatInterface } from '@/components/chat/chat-interface';
import { NewChatForm } from '@/components/chat/new-chat-form';

export default function ChatPage() {
  const pathname = usePathname();
  const navItem = getNavItemByUrl(pathname);
  const { user } = useAuth();
  const uid = user?.user?.uid;
  const queryClient = useQueryClient();
  const { setChatStatus } = useApiStore();

  // State
  const [selectedChat, setSelectedChat] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Queries
  const { data: userChats, isLoading: chatsLoading } = useUserChats(uid);
  const { data: bookData, isLoading: bookLoading } = useGetBook();
  const {
    data: chatMessages,
    isLoading: messagesLoading
  } = useChatDetails(uid, selectedChat?.id);

  // Mutations
  const { mutate: createChatMutation, isPending: creatingChat } = useCreateChat({
    onSuccess: async (data) => {
      const newChat = {
        id: data.chat_id,
        chat_id: data.chat_id,
        chat_title: data.chat_title,
        uid: data.uid,
      };

      setSelectedChat(newChat);

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['userChats', uid] });
      queryClient.invalidateQueries({ queryKey: ['chatDetails', uid, data.chat_id] });

      setChatStatus('success');
    },
    onError: () => setChatStatus('error'),
  });

  const { mutate: deleteChatMutation } = useDeleteChat({
    onSuccess: async (_, variables) => {
      if (selectedChat?.id === variables.chatId) {
        setSelectedChat(null);
      }
      await queryClient.invalidateQueries({ queryKey: ['userChats', uid] });
      setDeletingId(null);
      setChatStatus('success');
    },
    onError: () => {
      setDeletingId(null);
      setChatStatus('error');
    }
  });

  const handleStartChat = (book) => {
    if (!uid) return;
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

  return (
    <div className="max-w-7xl mx-auto my-5 space-y-6 px-4">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-8 shadow-lg">
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {navItem?.title || 'Chat with Book'}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {navItem?.description || 'Engage in real-time conversations with your learning materials.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar History */}
        <History
          item={navItem?.itemtype || 'Chat'}
          selectedItem={selectedChat}
          setSelectedItem={setSelectedChat}
          historyData={userChats?.chats || []}
          isChat={true}
          onDelete={handleDeleteChat}
          deletingId={deletingId}
        />

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {creatingChat || messagesLoading ? (
            <div className="flex flex-col items-center justify-center h-[600px] bg-card rounded-2xl border border-border">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium">Loading conversation...</h3>
              <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </div>
          ) : selectedChat ? (
            <ChatInterface
              chatSession={{
                id: selectedChat.id,
                book: selectedChat?.chat_title,
                messages: chatMessages?.messages || [],
                uid: uid,
              }}
            />
          ) : bookLoading ? (
            <div className="flex items-center justify-center h-[600px]">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <NewChatForm
              onStartChat={handleStartChat}
              data={bookData?.content}
            />
          )}
        </div>
      </div>
    </div>
  );
}
