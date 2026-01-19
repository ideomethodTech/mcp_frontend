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
import { getNavItemByUrl } from "@/app/utils";
import { ToolPageLayout } from "@/components/layout/tool-page-layout";
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
    <ToolPageLayout
      title={navItem?.title || 'Chat with Book'}
      description={navItem?.description || 'Engage in real-time conversations with your learning materials.'}
      icon={FileText}
      isLoading={creatingChat || messagesLoading}
      loadingTitle="Loading conversation..."
      loadingDescription="Please wait a moment."
      historyProps={{
        item: navItem?.itemtype || 'Chat',
        selectedItem: selectedChat,
        setSelectedItem: setSelectedChat,
        historyData: userChats?.chats || [],
        isChat: true,
        onDelete: handleDeleteChat,
        deletingId: deletingId,
      }}
    >
      {selectedChat ? (
        <ChatInterface
          chatSession={{
            id: selectedChat.id,
            book: selectedChat?.chat_title,
            messages: chatMessages?.messages || [],
            uid: uid,
          }}
        />
      ) : (
        <NewChatForm onStartChat={handleStartChat} data={bookData?.content} />
      )}
    </ToolPageLayout>
  );
}
